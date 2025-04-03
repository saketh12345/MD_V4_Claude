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
import { FileIcon, RefreshCw, Download } from "lucide-react";

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
  const [viewError, setViewError] = useState<string>("");
  
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
      setViewError("");
      const patientReports = await getReports(patientId);
      setReports(patientReports);
      setIsRefreshing(false);
      
      toast({
        title: "Reports refreshed",
        description: `${patientReports.length} reports loaded`,
      });
    }
  };

  // Check if the reports bucket exists, or create it if needed
  const ensureReportsBucketExists = async () => {
    try {
      // First check if the bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error listing buckets:", listError);
        throw new Error(`Failed to check storage buckets: ${listError.message}`);
      }
      
      const reportsBucketExists = buckets?.some(bucket => bucket.name === 'reports');
      
      if (!reportsBucketExists) {
        console.log("Reports bucket does not exist, creating it now...");
        try {
          // First try with public access
          const { error: createError } = await supabase.storage.createBucket('reports', {
            public: true,
            fileSizeLimit: 50000000 // 50MB limit
          });
          
          if (createError) {
            console.error("Error creating public bucket:", createError);
            
            // If the first attempt fails, try without specifying public
            const { error: retryError } = await supabase.storage.createBucket('reports');
            
            if (retryError) {
              console.error("Error creating bucket with default settings:", retryError);
              
              if (!retryError.message.includes("already exists")) {
                throw new Error(`Failed to create reports bucket: ${retryError.message}`);
              }
            }
          }
        } catch (bucketCreateError) {
          console.error("Bucket creation exception:", bucketCreateError);
          throw bucketCreateError;
        }
        
        console.log("Reports bucket created successfully");
      } else {
        console.log("Reports bucket exists");
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
      return false;
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
        
        // Ensure storage bucket exists
        await ensureReportsBucketExists();
        
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

    setViewError("");
    
    try {
      console.log("Attempting to access file:", fileUrl);
      
      // Ensure the bucket exists before trying to access the file
      const bucketExists = await ensureReportsBucketExists();
      if (!bucketExists) {
        throw new Error("Could not access the reports storage. Please try again later.");
      }

      // Try to get a signed URL - file path is already correct from the database
      const { data, error } = await supabase.storage
        .from('reports')
        .createSignedUrl(fileUrl, 60);
      
      if (error) {
        console.error("Error getting signed URL:", error);
        
        // Try to get public URL as a fallback
        const { data: publicUrlData } = supabase.storage
          .from('reports')
          .getPublicUrl(fileUrl);
          
        if (publicUrlData && publicUrlData.publicUrl) {
          console.log("Using public URL instead:", publicUrlData.publicUrl);
          window.open(publicUrlData.publicUrl, '_blank');
          return;
        }
        
        // If we get here, both methods failed
        throw new Error(`Could not generate access link for this report: ${error.message}`);
      }
      
      if (!data || !data.signedUrl) {
        throw new Error("No valid URL generated for this report");
      }
      
      // Open the signed URL in a new tab
      console.log("Opening signed URL:", data.signedUrl);
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error getting report file:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Could not retrieve the report file";
      setViewError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Function to download report
  const downloadReport = async (fileUrl: string | undefined, reportName: string) => {
    if (!fileUrl) {
      toast({
        title: "Error",
        description: "No file available for this report",
        variant: "destructive"
      });
      return;
    }

    setViewError("");
    
    try {
      console.log("Attempting to download file:", fileUrl);
      
      // Ensure the bucket exists before trying to access the file
      const bucketExists = await ensureReportsBucketExists();
      if (!bucketExists) {
        throw new Error("Could not access the reports storage. Please try again later.");
      }

      // Try to get a signed URL for downloading
      const { data, error } = await supabase.storage
        .from('reports')
        .createSignedUrl(fileUrl, 60);
      
      if (error) {
        console.error("Error getting signed URL for download:", error);
        
        // Try to get public URL as a fallback
        const { data: publicUrlData } = supabase.storage
          .from('reports')
          .getPublicUrl(fileUrl);
          
        if (publicUrlData && publicUrlData.publicUrl) {
          console.log("Using public URL for download instead:", publicUrlData.publicUrl);
          
          // Create a link element and initiate download
          const link = document.createElement('a');
          link.href = publicUrlData.publicUrl;
          link.download = `${reportName}.pdf`; // Assuming PDF, adjust if needed
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          return;
        }
        
        // If we get here, both methods failed
        throw new Error(`Could not generate download link for this report: ${error.message}`);
      }
      
      if (!data || !data.signedUrl) {
        throw new Error("No valid URL generated for this report");
      }
      
      // Create a link element and initiate download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = `${reportName}.pdf`; // Assuming PDF, adjust if needed
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your report is being downloaded",
      });
    } catch (error) {
      console.error('Error downloading report file:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Could not download the report file";
      setViewError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
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
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => viewReport(report.file_url)}
                              variant="ghost" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <FileIcon className="h-4 w-4" />
                              View
                            </Button>
                            <Button 
                              onClick={() => downloadReport(report.file_url, report.name)}
                              variant="ghost" 
                              size="sm"
                              className="text-green-600 hover:text-green-800 flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
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
