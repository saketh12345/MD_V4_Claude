
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import ReportUploadForm from "@/components/ReportUploadForm";
import RecentReportsList from "@/components/RecentReportsList";

type ReportRow = Database['public']['Tables']['reports']['Row'];

const DiagnosticDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [centerId, setCenterId] = useState<string | null>(null);
  const [centerName, setCenterName] = useState<string>("");
  
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

  const handleReportUploaded = () => {
    if (centerId) {
      fetchReports(centerId);
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
            
            {centerId && (
              <ReportUploadForm 
                centerName={centerName}
                centerId={centerId}
                onSuccess={handleReportUploaded}
              />
            )}
          </CardContent>
        </Card>
        
        {/* Recent Uploads Card */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold">Recent Uploads</h2>
            </div>
            
            <RecentReportsList 
              reports={reports}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticDashboard;
