
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";

const DiagnosticDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      
      setCenterName(currentUser.centerName || "Your Center");
    };
    
    checkAuth();
  }, [navigate, toast]);

  return (
    <DashboardLayout 
      title={`Welcome, ${centerName}`}
      subtitle="Manage your diagnostic center"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to your Dashboard</h2>
            <p className="text-gray-600">
              This is your diagnostic center dashboard. The file upload and patient lookup 
              features have been removed from this application.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticDashboard;
