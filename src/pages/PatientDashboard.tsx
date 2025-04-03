
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      
      setPatientName(currentUser.fullName || "Patient");
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
            <p className="text-gray-600">
              This simplified application provides basic user authentication and profile management.
              All file upload and retrieval features have been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
