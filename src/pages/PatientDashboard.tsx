
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { GetPatientByPhoneParams } from "@/types/supabase-rpc";
import PatientReportsList from "@/components/PatientReportsList";

type ReportRow = Database['public']['Tables']['reports']['Row'];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  
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
      
      fetchPatientData(currentUser);
    };
    
    checkAuth();
  }, [navigate, toast]);

  const fetchPatientData = async (currentUser: any) => {
    try {
      setLoading(true);
    
      if (currentUser && currentUser.phone) {
        // Create parameter object
        const params: GetPatientByPhoneParams = { phone: currentUser.phone };
        
        // Use as any for the RPC call
        const { data: patientData, error: patientError } = await supabase
          .rpc('get_patient_by_phone', params as any)
          .maybeSingle();
          
        if (patientError) {
          console.error("Error finding patient record:", patientError);
          return;
        }
        
        if (patientData) {
          setPatientId(patientData.id);
          setPatientName(patientData.name || "Patient");
          fetchReports(patientData.id);
        }
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!patientId) return;
    
    // Set up realtime subscription for reports
    const reportsSubscription = supabase
      .channel('patient-reports-changes')
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
    setLoading(true);
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

  return (
    <DashboardLayout 
      title={`Good Morning, ${patientName}`}
      subtitle="View your medical reports and history"
    >
      <div className="grid gap-6">
        {/* Recent Reports Card */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold">Your Recent Reports</h2>
            </div>
            
            <PatientReportsList 
              reports={reports}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
