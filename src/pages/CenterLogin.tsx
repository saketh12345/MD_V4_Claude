
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, User } from "lucide-react";
import { loginUser } from "@/utils/authUtils";

export default function CenterLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (loginData.phone && loginData.password) {
      // Attempt to login the user
      const result = await loginUser(loginData.phone, loginData.password);
      
      if (result.success) {
        if (result.userType === 'center') {
          toast({
            title: "Success",
            description: "Logged in successfully",
          });
          navigate("/diagnostic-dashboard");
        } else {
          toast({
            title: "Error",
            description: "This account is registered as a patient",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8 rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Login to MediVault</h1>
          <p className="text-gray-500">Enter your credentials to access your account</p>
        </div>

        <div className="flex justify-center mb-8">
          <Link to="/patient-login" className="w-1/2 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="rounded-full p-5 bg-white border border-gray-200">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <span className="mt-2 text-gray-400">Patient</span>
            </div>
          </Link>
          <Link to="/center-login" className="w-1/2 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="rounded-full p-5 bg-blue-500 text-white">
                <Building2 className="h-8 w-8" />
              </div>
              <span className="mt-2 text-blue-500 font-medium">Diagnostic Center</span>
            </div>
          </Link>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-lg font-medium mb-2">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={loginData.phone}
              onChange={handleChange}
              className="w-full p-3 text-lg"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-lg font-medium">
                Password
              </label>
              <Link to="#" className="text-blue-500 hover:text-blue-600">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="•••••••"
              value={loginData.password}
              onChange={handleChange}
              className="w-full p-3 text-lg"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login as Diagnostic Center"}
          </Button>

          <div className="text-center mt-6">
            <span className="text-gray-700">Don't have an account? </span>
            <Link to="/center-signup" className="text-blue-500 hover:text-blue-600 font-medium">
              Register here
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
