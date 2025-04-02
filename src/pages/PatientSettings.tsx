
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/authUtils";

const PatientSettings = () => {
  const { toast } = useToast();
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    phoneNumber: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setPersonalInfo({
        fullName: currentUser.fullName || "Jane Doe",
        phoneNumber: currentUser.phone || "+1 (555) 123-4567"
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Update user in localStorage
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('medivault_users') || '{}');
      
      // Update the current user's phone number and fullName
      if (users[currentUser.phone]) {
        // Create the updated user object
        const updatedUser = {
          ...currentUser,
          phone: personalInfo.phoneNumber,
          fullName: personalInfo.fullName
        };
        
        // Remove the old phone entry and add the new one
        delete users[currentUser.phone];
        users[personalInfo.phoneNumber] = updatedUser;
        
        // Save updated users back to localStorage
        localStorage.setItem('medivault_users', JSON.stringify(users));
        
        // Update current user in session
        localStorage.setItem('medivault_current_user', JSON.stringify(updatedUser));
        
        toast({
          title: "Success",
          description: "Profile information updated successfully"
        });
      }
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
