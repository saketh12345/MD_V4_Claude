
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { format } from "date-fns";

interface Report {
  id: string;
  name: string;
  type: string;
  lab: string;
  date: string;
  created_at: string;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientName, setPatientName] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
      
      setPatientName(currentUser.fullName || "Patient");
      setPatientId(currentUser.id);
      
      // Fetch patient reports
      if (currentUser.id) {
        const patientReports = await getReports(currentUser.id);
        setReports(patientReports);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate, toast]);

  return (
    <DashboardLayout
      title={`Hello, ${patientName}`}
      subtitle="Welcome to your patient dashboard"
    >
      <div className="grid gap-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to MediVault</h2>
            <p className="text-gray-600 mb-4">
              This simplified application provides basic user authentication and profile management.
              Your medical reports are listed below if available.
            </p>
            
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading reports...</p>
            ) : reports.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Your Medical Reports</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Lab</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.lab}</TableCell>
                        <TableCell>{format(new Date(report.date), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-4">No medical reports found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
