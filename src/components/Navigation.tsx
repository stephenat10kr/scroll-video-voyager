
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Form from "./Form";

const Navigation = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-[80px] bg-transparent z-50 flex items-center justify-between px-8">
        <div></div> {/* Empty div to maintain flexbox spacing */}
        <Button 
          variant="default" 
          className="h-[48px] rounded-full bg-coral text-darkGreen hover:bg-coral/90"
          onClick={() => setIsFormOpen(true)}
        >
          JOIN <Plus className="ml-1" />
        </Button>
      </nav>
      <Form 
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Curious?<br>Sign up to hear about upcoming events and membership offerings."
      />
    </>
  );
};

export default Navigation;
