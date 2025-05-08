
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import colors from "@/lib/theme";

const Footer = () => {
  return (
    <footer className="h-[128px] bg-[#203435] w-full flex justify-between items-center px-8">
      <div className="w-auto h-14">
        <Logo />
      </div>
      <div className="flex flex-col items-end gap-4">
        <div className="flex gap-6">
          <Link to="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <Facebook className="w-6 h-6 text-[#FFF4F1] hover:text-[#FFF4F1]/80 transition-colors" />
          </Link>
          <Link to="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <Instagram className="w-6 h-6 text-[#FFF4F1] hover:text-[#FFF4F1]/80 transition-colors" />
          </Link>
          <Link to="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-6 h-6 text-[#FFF4F1] hover:text-[#FFF4F1]/80 transition-colors" />
          </Link>
        </div>
        <span className="text-[#FFF4F1] text-sm font-sans">
          © Lightning Society 2025
        </span>
      </div>
    </footer>
  );
};

export default Footer;
