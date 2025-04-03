
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, updateUserData } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";

const DiagnosticSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [centerInfo, setCenterInfo] = useState({
    id: "",
    centerName: "",
    phoneNumber: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load user data on component mount
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
      
      console.log("Current center data:", currentUser);
      setCenterInfo({
        id: currentUser.id,
        centerName: currentUser.centerName || "",
        phoneNumber: currentUser.phone
      });
    };
    
    checkAuth();
    
    // Set up realtime subscription for profile updates
    const profileSubscription = supabase
      .channel('profiles-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${centerInfo.id}`
      }, (payload) => {
        const profile = payload.new;
        setCenterInfo({
          id: profile.id,
          centerName: profile.center_name || "",
          phoneNumber: profile.phone
        });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [navigate, toast, centerInfo.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCenterInfo({
      ...centerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log("Updating center profile with:", centerInfo);

    // Validate phone number before updating
    if (!centerInfo.phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Phone number cannot be empty",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Update user in Supabase
    const updated = await updateUserData({
      id: centerInfo.id,
      centerName: centerInfo.centerName,
      phone: centerInfo.phoneNumber.trim(),
      userType: 'center'
    });
    
    if (updated) {
      toast({
        title: "Success",
        description: "Center information updated successfully"
      });
      console.log("Center profile updated successfully");
    } else {
      toast({
        title: "Error",
        description: "Failed to update center information",
        variant: "destructive"
      });
      console.error("Failed to update center profile");
    }
    
    setIsLoading(false);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl mx-auto">
        <div className="my-6">
          <Button className="w-full md:w-auto bg-white text-gray-800 border border-gray-200 hover:bg-gray-50">
            Profile & Account
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Center Information</h2>
              <p className="text-gray-600">Update your center details and contact information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="centerName" className="block text-sm font-medium mb-1">
                    Center Name
                  </label>
                  <Input
                    id="centerName"
                    name="centerName"
                    value={centerInfo.centerName}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={centerInfo.phoneNumber}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DiagnosticSettings;
