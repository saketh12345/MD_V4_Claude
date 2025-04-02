
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

const Hero = () => {
  return (
    <div className="bg-blue-600 py-32 px-6 text-white text-center">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-8">
          Your health records are convenient
        </h1>
        <p className="text-xl mb-12 max-w-3xl mx-auto">
          Access, track, and share your medical reports anytime secure & hassle-free health management.
        </p>
        <Link to="/choose-account">
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 rounded-full text-lg"
          >
            <Lock className="mr-2 h-5 w-5" /> Unlock Your Vault for Free
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
