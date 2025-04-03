
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import ReportUpload from "@/components/ReportUpload";
import { Button } from "@/components/ui/button";
import { FileIcon, RefreshCw } from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: string;
  lab: string;
  date: string;
  created_at: string;
  file_url?: string;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientName, setPatientName] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userType, setUserType] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  const getReports = async (patientId: string) => {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('patient_id', patientId);

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
    
    return reports as Report[];
  };

  const refreshReports = async () => {
    if (patientId) {
      setIsRefreshing(true);
      const patientReports = await getReports(patientId);
      setReports(patientReports);
      setIsRefreshing(false);
      
      toast({
        title: "Reports refreshed",
        description: `${patientReports.length} reports loaded`,
      });
    }
  };
  
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
        navigate("/patient-login");
        return;
      }
      
      setUserType(currentUser.userType);
      
      if (currentUser.userType === 'patient') {
        // Set patient information
        setPatientName(currentUser.fullName || "Patient");
        setPatientId(currentUser.id);
        
        // Fetch patient reports
        if (currentUser.id) {
          const patientReports = await getReports(currentUser.id);
          setReports(patientReports);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate, toast]);

  // Function to view report
  const viewReport = async (fileUrl: string | undefined) => {
    if (!fileUrl) {
      toast({
        title: "Error",
        description: "No file available for this report",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a signed URL with longer expiration (60 seconds)
      const { data, error } = await supabase.storage
        .from('reports')
        .createSignedUrl(fileUrl, 60);
      
      if (error) {
        console.error("Error getting signed URL:", error);
        throw new Error("Could not generate access link for this report");
      }
      
      if (!data || !data.signedUrl) {
        throw new Error("No valid URL generated for this report");
      }
      
      // Open the signed URL in a new tab
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error getting report file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not retrieve the report file",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout
      title={`Hello, ${patientName}`}
      subtitle="Welcome to your patient dashboard"
    >
      <div className="grid gap-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Medical Reports</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshReports} 
                disabled={isRefreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Securely access and manage your medical reports. All your health information in one place.
            </p>
            
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading reports...</p>
            ) : reports.length > 0 ? (
              <div className="mt-4 overflow-hidden border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Lab</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.lab}</TableCell>
                        <TableCell>{format(new Date(report.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Button 
                            onClick={() => viewReport(report.file_url)}
                            variant="ghost" 
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <FileIcon className="h-4 w-4" />
                            View Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8 border rounded-lg bg-gray-50">
                <p className="text-gray-500 mb-2">No medical reports found.</p>
                {userType === 'patient' && (
                  <p className="text-sm text-gray-400">
                    Your medical reports will appear here once added by your healthcare provider.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {userType === 'center' && (
          <ReportUpload onUploadSuccess={refreshReports} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
