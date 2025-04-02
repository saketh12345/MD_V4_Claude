
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Home, MessageCircle, Mail } from "lucide-react";

interface NavbarProps {
  hideAuthButtons?: boolean;
}

const Navbar = ({ hideAuthButtons = false }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-6 fixed w-full top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-medivault-blue" />
          <span className="text-medivault-blue font-bold text-2xl">MediVault</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="text-medivault-darkGray hover:text-medivault-blue transition-colors flex items-center space-x-1">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link to="/about" className="text-medivault-darkGray hover:text-medivault-blue transition-colors flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>About</span>
          </Link>
          <Link to="#contact" className="text-medivault-darkGray hover:text-medivault-blue transition-colors flex items-center space-x-1">
            <Mail className="h-4 w-4" />
            <span>Contact</span>
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
            <Link to="/" className="text-medivault-darkGray hover:text-medivault-blue py-2 flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link to="/about" className="text-medivault-darkGray hover:text-medivault-blue py-2 flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>About</span>
            </Link>
            <Link to="#contact" className="text-medivault-darkGray hover:text-medivault-blue py-2 flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Contact</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
