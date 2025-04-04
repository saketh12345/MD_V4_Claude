
import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "./DashboardSidebar";
import { logoutUser, getCurrentUser } from "@/utils/authUtils";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userName, setUserName] = useState("");
  
  // Determine if this is a patient or diagnostic dashboard
  const userType = location.pathname.includes("patient") ? "patient" : "diagnostic";

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getCurrentUser();
      if (user) {
        const name = userType === "patient" ? user.fullName : user.centerName;
        setUserName(name || "User");
      } else {
        // Redirect to login if not authenticated
        const loginPath = userType === "patient" ? "/patient-login" : "/center-login";
        navigate(loginPath);
      }
    };
    
    fetchUserData();
  }, [navigate, userType]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar userType={userType} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm flex justify-between items-center p-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {title.includes("Good Morning") ? `Good Morning, ${userName}` : title}
            </h1>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            className="flex items-center text-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
