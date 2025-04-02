
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ChooseAccountType = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar hideAuthButtons={true} />
      <main className="flex-1 bg-blue-600 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-medivault-blue">
            Choose How You Want to Use MediVault
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Patient Option */}
            <div className="bg-medivault-blue text-white rounded-lg p-6 flex flex-col items-center text-center">
              <div className="bg-white rounded-full p-4 mb-4">
                <User className="h-12 w-12 text-medivault-blue" />
              </div>
              <h2 className="text-xl font-bold mb-3">I'm a Patient</h2>
              <p>
                Access and manage your health reports from various diagnostic centers in one place.
              </p>
            </div>
            
            {/* Diagnostic Center Option */}
            <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="bg-white rounded-full p-4 mb-4 border border-gray-200">
                <Building2 className="h-12 w-12 text-gray-500" />
              </div>
              <h2 className="text-xl font-bold mb-3">I'm a Diagnostic Center</h2>
              <p>
                Upload and manage patient reports, making them easily accessible to your patients.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <Link to="/signup" className="w-full max-w-md">
              <Button className="w-full bg-medivault-blue hover:bg-medivault-darkBlue text-white py-6 text-lg">
                Create a Free Account
              </Button>
            </Link>
            <p className="text-medivault-darkGray">
              Already have an account?{" "}
              <Link to="/login" className="text-medivault-blue hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChooseAccountType;
