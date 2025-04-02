
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-6 fixed w-full top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-medivault-blue font-bold text-2xl">MediVault</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="text-medivault-darkGray hover:text-medivault-blue transition-colors">
            Home
          </Link>
          <Link to="/features" className="text-medivault-darkGray hover:text-medivault-blue transition-colors">
            Features
          </Link>
          <Link to="/about" className="text-medivault-darkGray hover:text-medivault-blue transition-colors">
            About
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-medivault-blue text-medivault-blue hover:bg-medivault-blue hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-medivault-blue hover:bg-medivault-darkBlue text-white">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-medivault-darkGray hover:text-medivault-blue"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md py-4 px-6 z-20">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-medivault-darkGray hover:text-medivault-blue py-2">
              Home
            </Link>
            <Link to="/features" className="text-medivault-darkGray hover:text-medivault-blue py-2">
              Features
            </Link>
            <Link to="/about" className="text-medivault-darkGray hover:text-medivault-blue py-2">
              About
            </Link>
            <Link to="/login" className="py-2">
              <Button variant="outline" className="w-full border-medivault-blue text-medivault-blue hover:bg-medivault-blue hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link to="/signup" className="py-2">
              <Button className="w-full bg-medivault-blue hover:bg-medivault-darkBlue text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
