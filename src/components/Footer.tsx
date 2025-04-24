
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="h-[128px] bg-black w-full flex justify-between items-center px-8">
      <div className="text-white font-sans text-[72px]">
        LOGO
      </div>
      <div className="flex flex-col items-end gap-4">
        <div className="flex gap-6">
          <Link to="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <Facebook className="w-6 h-6 text-white hover:text-gray-300 transition-colors" />
          </Link>
          <Link to="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <Instagram className="w-6 h-6 text-white hover:text-gray-300 transition-colors" />
          </Link>
          <Link to="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-6 h-6 text-white hover:text-gray-300 transition-colors" />
          </Link>
        </div>
        <span className="text-white text-base font-sans">
          © Lightning Society 2025
        </span>
      </div>
    </footer>
  );
};

export default Footer;
