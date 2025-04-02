
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";

const DiagnosticDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reportForm, setReportForm] = useState({
    reportType: "",
    reportName: "",
    patientPhone: "",
    file: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [centerName, setCenterName] = useState("");

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
      
      // If not a center, redirect to appropriate dashboard
      if (currentUser.userType !== 'center') {
        navigate("/patient-dashboard");
        return;
      }
      
      setCenterName(currentUser.centerName || "Diagnostic Center");
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReportForm({
        ...reportForm,
        file: e.target.files[0]
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setReportForm({
      ...reportForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.reportType || !reportForm.patientPhone || !reportForm.reportName) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Find patient by phone number
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('phone', reportForm.patientPhone)
        .eq('user_type', 'patient')
        .limit(1);
      
      if (profileError) throw profileError;
      
      if (!profiles || profiles.length === 0) {
        toast({
          title: "Error",
          description: "No patient found with this phone number",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const patientId = profiles[0].id;
      
      // 2. Upload file if available
      let fileUrl = null;
      if (reportForm.file) {
        // Create a storage bucket if it doesn't exist
        const { data: bucketData, error: bucketError } = await supabase
          .storage
          .getBucket('reports');
          
        if (bucketError && bucketError.message.includes('The resource was not found')) {
          await supabase
            .storage
            .createBucket('reports', {
              public: false,
              fileSizeLimit: 10485760, // 10MB
            });
        }
        
        // Upload file
        const fileExt = reportForm.file.name.split('.').pop();
        const fileName = `${patientId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase
          .storage
          .from('reports')
          .upload(fileName, reportForm.file);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = await supabase
          .storage
          .from('reports')
          .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days validity
          
        if (urlData) {
          fileUrl = urlData.signedUrl;
        }
      }
      
      // 3. Insert report record
      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          name: reportForm.reportName,
          type: reportForm.reportType,
          lab: centerName,
          patient_id: patientId,
          file_url: fileUrl
        });
        
      if (insertError) throw insertError;
      
      // Success
      toast({
        title: "Success",
        description: "Report uploaded successfully"
      });
      
      // Reset form
      setReportForm({
        reportType: "",
        reportName: "",
        patientPhone: "",
        file: null
      });
      
    } catch (error) {
      console.error("Error uploading report:", error);
      toast({
        title: "Error",
        description: "Failed to upload report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout 
      title="Diagnostic Lab Dashboard" 
      subtitle="Upload and manage your patient reports"
    >
      <div className="flex justify-center">
        <Card className="max-w-2xl w-full bg-white shadow-sm">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold">Upload Medical Report</h2>
              <p className="text-gray-600">Upload a new medical report for a patient</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reportName" className="text-center block font-medium">
                  Report Name
                </Label>
                <Input
                  id="reportName"
                  name="reportName"
                  value={reportForm.reportName}
                  onChange={handleChange}
                  placeholder="Enter report name"
                  className="w-full"
                />
              </div>
            
              <div className="space-y-2">
                <Label htmlFor="reportType" className="text-center block font-medium">
                  Report Type
                </Label>
                <select
                  id="reportType"
                  name="reportType"
                  value={reportForm.reportType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select report type</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pathology">Pathology</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientPhone" className="text-center block font-medium">
                  Patient Phone Number
                </Label>
                <Input
                  id="patientPhone"
                  name="patientPhone"
                  value={reportForm.patientPhone}
                  onChange={handleChange}
                  placeholder="Enter patient phone number"
                  className="w-full"
                />
                <p className="text-center text-sm text-gray-600">
                  Enter the patient's phone number to link the report to their account
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file" className="text-center block font-medium">
                  File
                </Label>
                <div className="border border-gray-300 rounded-md p-3">
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      {reportForm.file ? reportForm.file.name : "No file selected."}
                    </span>
                    <label
                      htmlFor="file"
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                    >
                      Browse...
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Upload Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticDashboard;
