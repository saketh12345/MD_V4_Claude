
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Building2 } from "lucide-react";
import { registerUser } from "@/utils/authUtils";

const CenterSignup = () => {
  const navigate = useNavigate();
  const [centerName, setCenterName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Register the diagnostic center
    const result = await registerUser(
      phoneNumber,
      password,
      'center',
      undefined,
      centerName,
      licenseNumber
    );

    if (result.success) {
      toast({
        title: "Account created successfully",
        description: "Welcome to MediVault! You can now sign in to your account.",
      });
      
      // Navigate to login page after successful registration
      setTimeout(() => {
        navigate("/center-login");
      }, 1500);
    } else {
      toast({
        title: "Registration failed",
        description: result.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black">Create an Account</h2>
          <p className="mt-2 text-gray-500">Register to start managing your health reports</p>
        </div>

        <div className="flex mb-8">
          <Link to="/patient-signup" className="w-1/2">
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-full p-5 mb-2 border border-gray-200">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <span className="text-gray-400">Patient</span>
            </div>
          </Link>
          <Link to="/center-signup" className="w-1/2">
            <div className="flex flex-col items-center">
              <div className="bg-blue-500 text-white rounded-full p-5 mb-2">
                <Building2 className="h-8 w-8" />
              </div>
              <span className="text-blue-500 font-medium">Diagnostic Center</span>
            </div>
          </Link>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="centerName" className="block text-sm font-medium text-gray-700">
                Center Name
              </label>
              <Input
                id="centerName"
                type="text"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                placeholder="ABC Diagnostics"
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                License Number
              </label>
              <Input
                id="licenseNumber"
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="License Number"
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            {isLoading ? "Creating account..." : "Register as Diagnostic Center"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/center-login" className="text-blue-500 hover:text-blue-600 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CenterSignup;
