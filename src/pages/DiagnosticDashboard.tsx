
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";
import ReportUpload from "@/components/ReportUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientUploadPanel from "@/components/PatientUploadPanel";
import { Loader2 } from "lucide-react";

const DiagnosticDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [centerName, setCenterName] = useState<string>("");
  const [refreshReports, setRefreshReports] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
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
        
        setCenterName(currentUser.centerName || "Your Center");
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast({
          title: "Authentication Error",
          description: "There was a problem verifying your credentials",
          variant: "destructive"
        });
        navigate("/center-login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleUploadSuccess = () => {
    setRefreshReports(prev => prev + 1);
    toast({
      title: "Upload Successful",
      description: "Patient report has been uploaded successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <span className="ml-3 text-lg font-medium">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title={`Welcome, ${centerName}`}
      subtitle="Diagnostic Center Dashboard"
    >
      <div className="grid gap-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload Report</TabsTrigger>
            <TabsTrigger value="patients">Patient Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Patient Report</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportUpload onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
              </CardHeader>
              <CardContent>
                <PatientUploadPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticDashboard;
