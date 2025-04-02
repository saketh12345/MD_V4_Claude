
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.patient_phone || !reportForm.name || !reportForm.type) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // 1. Get patient ID from phone number
      const { data: patients, error: patientError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', reportForm.patient_phone)
        .eq('user_type', 'patient')
        .single();
        
      if (patientError || !patients) {
        toast({
          title: "Error",
          description: "Patient not found with the given phone number",
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
          patient_id: patients.id,
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
                <Input 
                  id="patient_phone" 
                  name="patient_phone"
                  placeholder="Enter patient's phone number" 
                  value={reportForm.patient_phone}
                  onChange={handleChange}
                  required
                />
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
                disabled={uploading}
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
                        {new Date(report.date).toLocaleDateString()} • {report.type}
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
