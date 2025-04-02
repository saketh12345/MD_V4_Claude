
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-20 px-6">
      <div className="container mx-auto flex flex-col-reverse md:flex-row items-center">
        <div className="md:w-1/2 mt-10 md:mt-0 md:pr-10">
          <h1 className="text-4xl md:text-5xl font-bold text-medivault-darkGray mb-6">
            Your Medical Records, <span className="text-medivault-blue">Secured</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            MediVault provides a secure, convenient way to store and access your medical records anytime, anywhere. Take control of your health information with our encrypted platform.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup">
              <Button size="lg" className="bg-medivault-blue hover:bg-medivault-darkBlue text-white w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="border-medivault-blue text-medivault-blue hover:bg-medivault-blue hover:text-white w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="relative">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <img
                src="https://img.freepik.com/free-vector/online-doctor-concept_23-2148513637.jpg?w=740&t=st=1704294843~exp=1704295443~hmac=b0a2c2fbce6b3bed7502c3b7bd9987ea9ac66cba70d7fa59e99ff4a15ec4c0f8"
                alt="Medical Records Management"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-medivault-blue text-white p-4 rounded-lg shadow-md hidden md:block">
              <p className="font-semibold">256-bit Encryption</p>
              <p className="text-sm">Hospital-grade security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
