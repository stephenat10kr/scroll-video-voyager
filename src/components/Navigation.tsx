
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 w-full h-[80px] bg-transparent z-50 flex items-center justify-end px-8">
      <Button 
        variant="default" 
        className="h-[48px] rounded-full bg-white text-black hover:bg-white/90"
      >
        JOIN <Plus className="ml-1" />
      </Button>
    </nav>
  );
};

export default Navigation;
