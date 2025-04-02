
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="py-16 px-6 bg-gradient-to-r from-medivault-blue to-blue-600 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Secure Your Medical Records?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of users who trust MediVault for their medical records management. 
          Get started today with our secure, easy-to-use platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/signup">
            <Button size="lg" className="bg-white text-medivault-blue hover:bg-gray-100 w-full sm:w-auto">
              Sign Up Free
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
