
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { colors } from "@/lib/theme";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer 
      className="w-full py-8 px-8" 
      style={{ backgroundColor: colors.darkGreen }}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo section */}
        <div className="w-[150px] md:w-[180px]">
          <Logo />
        </div>
        
        {/* Right container with icons and copyright */}
        <div className="flex flex-col items-center md:items-end gap-4">
          {/* Social icons */}
          <div className="flex gap-6">
            <Link to="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Facebook size={24} color="white" />
            </Link>
            <Link to="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Instagram size={24} color="white" />
            </Link>
            <Link to="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <Linkedin size={24} color="white" />
            </Link>
          </div>
          
          {/* Copyright text */}
          <span className="text-body-sm-mobile md:text-body-sm text-[#FFF4F1]">
            © Lightning Society 2025
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
