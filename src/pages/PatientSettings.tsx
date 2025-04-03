
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, updateUserData } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";

const PatientSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [personalInfo, setPersonalInfo] = useState({
    id: "",
    fullName: "",
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
        navigate("/patient-login");
        return;
      }
      
      // If not a patient, redirect to appropriate dashboard
      if (currentUser.userType !== 'patient') {
        navigate("/diagnostic-dashboard");
        return;
      }
      
      console.log("Current patient data:", currentUser);
      setPersonalInfo({
        id: currentUser.id,
        fullName: currentUser.fullName || "",
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
        filter: `id=eq.${personalInfo.id}`
      }, (payload) => {
        const profile = payload.new;
        setPersonalInfo({
          id: profile.id,
          fullName: profile.full_name || "",
          phoneNumber: profile.phone
        });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [navigate, toast, personalInfo.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log("Updating patient profile with:", personalInfo);

    // Validate phone number before updating
    if (!personalInfo.phoneNumber.trim()) {
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
      id: personalInfo.id,
      fullName: personalInfo.fullName,
      phone: personalInfo.phoneNumber.trim(),
      userType: 'patient'
    });
    
    if (updated) {
      toast({
        title: "Success",
        description: "Profile information updated successfully"
      });
      console.log("Patient profile updated successfully");
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile information",
        variant: "destructive"
      });
      console.error("Failed to update patient profile");
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
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <p className="text-gray-600">Update your personal details and contact information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={personalInfo.fullName}
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
                    value={personalInfo.phoneNumber}
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

export default PatientSettings;
