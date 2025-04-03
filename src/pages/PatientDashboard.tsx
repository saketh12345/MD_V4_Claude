
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Download, Share2, FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";

interface PatientData {
  id: string;
  name: string;
}

interface Report {
  id: string;
  name: string;
  date: string;
  lab: string;
  type: string;
  file_url: string | null;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

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
      
      // If not a patient, redirect to appropriate dashboard
      if (currentUser.userType !== 'patient') {
        navigate("/diagnostic-dashboard");
        return;
      }
      
      setUserId(currentUser.id);
      
      // Try to find the patient record via a custom RPC
      try {
        // Use type assertion to bypass TypeScript's strict checking for custom RPC functions
        const { data: patientData, error: patientError } = await supabase
          .rpc('get_patient_by_phone', { phone: currentUser.phone } as any)
          .maybeSingle();
          
        if (patientError) {
          console.error("Error finding patient record:", patientError);
          toast({
            title: "Error",
            description: "Could not find your patient record",
            variant: "destructive"
          });
          return;
        }
        
        if (patientData) {
          // TypeScript needs the explicit cast here
          const patient = patientData as unknown as PatientData;
          setPatientId(patient.id);
          fetchReports(patient.id);
        } else {
          // No patient record found for this user
          toast({
            title: "No Patient Record",
            description: "No patient record found for your account. Please contact support.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error with patient lookup:", error);
        toast({
          title: "Error",
          description: "An error occurred finding your patient record",
          variant: "destructive"
        });
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    if (!patientId) return;
    
    // Set up realtime subscription for reports
    const reportsSubscription = supabase
      .channel('reports-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reports',
        filter: `patient_id=eq.${patientId}`
      }, () => {
        // Refetch reports when a new one is added
        fetchReports(patientId);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(reportsSubscription);
    };
  }, [patientId]);

  const fetchReports = async (patientId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedReports = data.map((report) => ({
          id: report.id,
          name: report.name,
          date: new Date(report.created_at).toLocaleDateString(),
          lab: report.lab,
          type: report.type,
          file_url: report.file_url
        }));
        
        setReports(formattedReports);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to load your reports",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view report
  const handleViewReport = (report: Report) => {
    if (report.file_url) {
      window.open(report.file_url, '_blank');
    } else {
      toast({
        title: "Viewing Report",
        description: `Opening ${report.name}`
      });
    }
  };

  // Handle download report
  const handleDownloadReport = (report: Report) => {
    if (report.file_url) {
      const link = document.createElement('a');
      link.href = report.file_url;
      link.download = report.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Downloading Report",
        description: `Downloading ${report.name}`
      });
    }
  };

  // Handle share report
  const handleShareReport = (report: Report) => {
    if (navigator.share && report.file_url) {
      navigator.share({
        title: report.name,
        text: `Check out my medical report from ${report.lab}`,
        url: report.file_url
      }).catch(error => {
        console.error("Share error:", error);
      });
    } else {
      toast({
        title: "Share Report",
        description: `Sharing options for ${report.name}`
      });
    }
  };

  return (
    <DashboardLayout 
      title="Patient Dashboard" 
      subtitle="Here's an overview of your health reports and records"
    >
      <div className="space-y-6">
        {/* Reports Button */}
        <div>
          <Button 
            variant="outline" 
            className="bg-white hover:bg-gray-50 text-gray-800 border-gray-200"
          >
            <FileText className="mr-2 h-5 w-5" />
            My Reports
          </Button>
        </div>

        {/* Reports Timeline */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold">Reports Timeline</h2>
            </div>
            <p className="text-gray-600 mb-6">View all your reports in chronological order</p>
            
            {isLoading ? (
              <div className="text-center py-8">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reports found. Your medical reports will appear here when available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-3 px-4 font-medium">Report Name</th>
                      <th className="py-3 px-4 font-medium">Date</th>
                      <th className="py-3 px-4 font-medium">Lab</th>
                      <th className="py-3 px-4 font-medium">Type</th>
                      <th className="py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td className="py-4 px-4">{report.name}</td>
                        <td className="py-4 px-4 text-gray-500">
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-1">◷</span>
                            {report.date}
                          </div>
                        </td>
                        <td className="py-4 px-4">{report.lab}</td>
                        <td className="py-4 px-4">{report.type}</td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 w-8 h-8" 
                              title="View"
                              onClick={() => {
                                if (report.file_url) {
                                  window.open(report.file_url, '_blank');
                                } else {
                                  toast({
                                    title: "Viewing Report",
                                    description: `Opening ${report.name}`
                                  });
                                }
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 w-8 h-8" 
                              title="Download"
                              onClick={() => {
                                if (report.file_url) {
                                  const link = document.createElement('a');
                                  link.href = report.file_url;
                                  link.download = report.name;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                } else {
                                  toast({
                                    title: "Downloading Report",
                                    description: `Downloading ${report.name}`
                                  });
                                }
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 w-8 h-8" 
                              title="Share"
                              onClick={() => {
                                if (navigator.share && report.file_url) {
                                  navigator.share({
                                    title: report.name,
                                    text: `Check out my medical report from ${report.lab}`,
                                    url: report.file_url
                                  }).catch(error => {
                                    console.error("Share error:", error);
                                  });
                                } else {
                                  toast({
                                    title: "Share Report",
                                    description: `Sharing options for ${report.name}`
                                  });
                                }
                              }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
