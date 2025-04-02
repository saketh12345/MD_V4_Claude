
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex items-center justify-center bg-gray-50 px-6 py-24">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-medivault-blue mb-4">404</h1>
          <p className="text-2xl font-semibold text-medivault-darkGray mb-6">Page Not Found</p>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We couldn't find the page you're looking for. The page may have been moved or doesn't exist.
          </p>
          <Link to="/">
            <Button className="bg-medivault-blue hover:bg-medivault-darkBlue text-white">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
