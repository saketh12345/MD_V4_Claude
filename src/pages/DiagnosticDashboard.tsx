import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, File, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ReportRow = Database['public']['Tables']['reports']['Row'];

const DiagnosticDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [centerId, setCenterId] = useState<string | null>(null);
  const [centerName, setCenterName] = useState<string>("");
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState<string | null>(null);
  
  // Form state
  const [reportForm, setReportForm] = useState({
    patient_phone: "",
    name: "",
    type: "Blood Test",
    file: null as File | null
  });

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      
      // If not logged in, redirect to login
      if (!currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please login to access this page",
          variant: "destructive"
        });
        navigate("/center-login");
        return;
      }
      
      // If not a diagnostic center, redirect to appropriate dashboard
      if (currentUser.userType !== 'center') {
        navigate("/patient-dashboard");
        return;
      }
      
      setCenterId(currentUser.id);
      setCenterName(currentUser.centerName || "Your Center");
      fetchReports(currentUser.id);
    };
    
    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    if (!centerId) return;
    
    // Set up realtime subscription for reports
    const reportsSubscription = supabase
      .channel('center-reports-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reports',
        filter: `lab=eq.${centerName}`
      }, () => {
        // Refetch reports when a new one is added
        fetchReports(centerId);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(reportsSubscription);
    };
  }, [centerId, centerName]);

  const fetchReports = async (centerId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('lab', centerName)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'patient_phone') {
      // Reset verification status when phone changes
      setPhoneVerificationStatus(null);
    }
    
    setReportForm({ ...reportForm, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReportForm({ ...reportForm, file: e.target.files[0] });
    }
  };

  const handleTypeChange = (value: string) => {
    setReportForm({ ...reportForm, type: value });
  };

  // Updated patient verification function
  const verifyPatientPhone = async () => {
    if (!reportForm.patient_phone) {
      console.log("Phone number is empty");
      setPhoneVerificationStatus("empty");
      return false;
    }
    
    try {
      console.log("Verifying patient phone:", reportForm.patient_phone);
      
      // First, attempt to get the exact profile with this phone number
      const { data: exactMatch, error: exactMatchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', reportForm.patient_phone)
        .eq('user_type', 'patient')
        .maybeSingle();
      
      if (exactMatchError) {
        console.error("Exact match query error:", exactMatchError);
        setPhoneVerificationStatus("error");
        return false;
      }
      
      if (exactMatch) {
        console.log("Found exact patient match:", exactMatch);
        setPhoneVerificationStatus("verified");
        return exactMatch.id;
      }
      
      // If no exact match, try to find partial matches (e.g., with different formatting)
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'patient');
      
      if (profilesError) {
        console.error("Retrieving all patient profiles error:", profilesError);
        setPhoneVerificationStatus("error");
        return false;
      }
      
      console.log("Retrieved patient profiles:", allProfiles?.length || 0);
      
      // Normalize phone numbers for comparison (remove spaces, dashes, etc.)
      const normalizedSearchPhone = reportForm.patient_phone.replace(/\D/g, '');
      
      const matchingProfile = allProfiles?.find(profile => {
        const normalizedProfilePhone = profile.phone.replace(/\D/g, '');
        return normalizedProfilePhone === normalizedSearchPhone;
      });
      
      if (matchingProfile) {
        console.log("Found patient with normalized phone match:", matchingProfile);
        setPhoneVerificationStatus("verified");
        return matchingProfile.id;
      }
      
      console.log("No patient found with phone:", reportForm.patient_phone);
      setPhoneVerificationStatus("not_found");
      return false;
    } catch (error) {
      console.error("Patient verification error:", error);
      setPhoneVerificationStatus("error");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.name || !reportForm.type) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // 1. Verify patient phone and get patient ID
      const patientId = await verifyPatientPhone();
      
      if (!patientId) {
        toast({
          title: "Invalid Patient",
          description: phoneVerificationStatus === "not_found" 
            ? "No patient found with this phone number. Please check the phone number or ask the patient to register." 
            : "Failed to verify patient. Please check the phone number and try again.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
      
      // 2. Upload file if exists
      let fileUrl = null;
      if (reportForm.file) {
        const fileName = `${Date.now()}-${reportForm.file.name}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from('reports')
          .upload(fileName, reportForm.file);
          
        if (fileError) {
          console.error("File upload error:", fileError);
          // Continue without file
        } else if (fileData) {
          const { data: urlData } = await supabase.storage
            .from('reports')
            .getPublicUrl(fileName);
            
          fileUrl = urlData.publicUrl;
        }
      }
      
      // 3. Create report record
      const { error: reportError } = await supabase
        .from('reports')
        .insert({
          name: reportForm.name,
          type: reportForm.type,
          lab: centerName,
          patient_id: patientId as string,
          file_url: fileUrl
        });
        
      if (reportError) {
        throw reportError;
      }
      
      // 4. Reset form and show success message
      setReportForm({
        patient_phone: "",
        name: "",
        type: "Blood Test",
        file: null
      });
      
      setPhoneVerificationStatus(null);
      
      toast({
        title: "Success",
        description: "Report uploaded successfully"
      });
      
    } catch (error) {
      console.error("Report upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getPhoneVerificationMessage = () => {
    switch (phoneVerificationStatus) {
      case "verified":
        return <p className="text-green-600 text-xs mt-1">✓ Patient verified</p>;
      case "not_found":
        return <p className="text-red-600 text-xs mt-1">No patient found with this phone number</p>;
      case "error":
        return <p className="text-red-600 text-xs mt-1">Error verifying patient</p>;
      case "empty":
        return <p className="text-red-600 text-xs mt-1">Phone number is required</p>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout 
      title={`Welcome, ${centerName}`}
      subtitle="Manage patient reports and diagnostic services"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Report Card */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Upload className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold">Upload New Report</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patient_phone">Patient Phone Number</Label>
                <div className="flex gap-2">
                  <Input 
                    id="patient_phone" 
                    name="patient_phone"
                    placeholder="Enter patient's phone number" 
                    value={reportForm.patient_phone}
                    onChange={handleChange}
                    required
                    className={`flex-1 ${phoneVerificationStatus === "not_found" || phoneVerificationStatus === "error" || phoneVerificationStatus === "empty" 
                      ? "border-red-500" 
                      : phoneVerificationStatus === "verified" 
                        ? "border-green-500" 
                        : ""}`}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={verifyPatientPhone}
                    disabled={!reportForm.patient_phone}
                  >
                    Verify
                  </Button>
                </div>
                {getPhoneVerificationMessage()}
              </div>
              
              <div>
                <Label htmlFor="name">Report Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g. Complete Blood Count" 
                  value={reportForm.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Report Type</Label>
                <Select 
                  value={reportForm.type} 
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blood Test">Blood Test</SelectItem>
                    <SelectItem value="Urine Test">Urine Test</SelectItem>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                    <SelectItem value="CT Scan">CT Scan</SelectItem>
                    <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="file">Report File (Optional)</Label>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500 mt-1">Upload PDF or image files (max 10MB)</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={uploading || phoneVerificationStatus !== "verified"}
              >
                {uploading ? "Uploading..." : "Upload Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Recent Uploads Card */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold">Recent Uploads</h2>
            </div>
            
            {loading ? (
              <div className="text-center py-8">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reports uploaded yet. Your uploaded reports will appear here.
              </div>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center p-3 border rounded-lg">
                    <div className="p-2 bg-blue-50 rounded mr-3">
                      <File className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()} • {report.type}
                      </p>
                    </div>
                    {report.file_url && (
                      <a 
                        href={report.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                ))}
                
                {reports.length > 5 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => {
                      toast({
                        title: "View All Reports",
                        description: "This feature is coming soon"
                      });
                    }}
                  >
                    View All Reports
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticDashboard;
