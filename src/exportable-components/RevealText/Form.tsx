import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";

interface FormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hubspotPortalId?: string;
  hubspotFormId?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  onSubmit?: (data: FormData) => Promise<boolean>;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ExportableForm({
  open,
  onClose,
  title,
  hubspotPortalId,
  hubspotFormId,
  backgroundColor = "#203435",
  textColor = "#FFF4F1",
  accentColor = "#FFB577",
  onSubmit: customOnSubmit
}: FormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitToHubspot = async (data: FormData) => {
    if (!hubspotPortalId || !hubspotFormId) {
      console.error("HubSpot portal ID or form ID is missing");
      return false;
    }
    
    try {
      // Get the current domain
      const domain = window.location.hostname;
      console.log("Submitting to HubSpot with domain:", domain);
      
      const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${hubspotPortalId}/${hubspotFormId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: [
            {
              name: "firstname",
              value: data.firstName
            },
            {
              name: "lastname",
              value: data.lastName
            },
            {
              name: "email",
              value: data.email
            }
          ],
          context: {
            pageUri: window.location.href,
            pageName: document.title,
            hutk: document.cookie.replace(/(?:(?:^|.*;\s*)hubspotutk\s*\=\s*([^;]*).*$)|^.*$/, "$1") || undefined
          },
          legalConsentOptions: {
            consent: {
              consentToProcess: true,
              text: "I agree to allow the site to store and process my personal data."
            }
          }
        })
      });
      
      const result = await response.json();
      console.log("HubSpot response:", result);
      return response.ok;
    } catch (error) {
      console.error("Error submitting to HubSpot:", error);
      return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    let success = false;

    // If a custom onSubmit handler is provided, use it
    if (customOnSubmit) {
      success = await customOnSubmit(data);
    } 
    // Otherwise, if HubSpot IDs are provided, submit to HubSpot
    else if (hubspotPortalId && hubspotFormId) {
      success = await submitToHubspot(data);
    } 
    // Fallback to console log and toast success
    else {
      console.log("Form data:", data);
      success = true;
    }
    
    if (success) {
      toast.success("Thank you for your submission!");
      reset();
      onClose();
    } else {
      toast.error("There was a problem submitting your form. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[540px] border-none" style={{ backgroundColor }}>
        <div className="relative">
          <Button 
            variant="default" 
            className="absolute left-0 top-0 p-0 w-[48px] h-[48px] rounded-full flex items-center justify-center" 
            style={{ backgroundColor: accentColor, color: backgroundColor }}
            onClick={onClose}
          >
            <X className="h-6 w-6" style={{ stroke: backgroundColor }} />
          </Button>
        </div>
        <SheetHeader className="mb-12">
          <h2 
            className="mt-16 text-2xl font-gt-super" 
            style={{ color: textColor }} 
            dangerouslySetInnerHTML={{ __html: title }} 
          />
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm" style={{ color: textColor }}>First name</label>
            <Input {...register("firstName", { required: true })} className="border-roseWhite bg-transparent" style={{ borderColor: textColor, color: textColor }} />
            {errors.firstName && <p className="text-xs" style={{ color: accentColor }}>First name is required</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm" style={{ color: textColor }}>Last name</label>
            <Input {...register("lastName", { required: true })} className="border-roseWhite bg-transparent" style={{ borderColor: textColor, color: textColor }} />
            {errors.lastName && <p className="text-xs" style={{ color: accentColor }}>Last name is required</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm" style={{ color: textColor }}>Email</label>
            <Input 
              type="email" 
              {...register("email", { 
                required: true, 
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i 
              })} 
              className="border-roseWhite bg-transparent" 
              style={{ borderColor: textColor, color: textColor }}
            />
            {errors.email && errors.email.type === "required" && (
              <p className="text-xs" style={{ color: accentColor }}>Email is required</p>
            )}
            {errors.email && errors.email.type === "pattern" && (
              <p className="text-xs" style={{ color: accentColor }}>Please enter a valid email address</p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="rounded-full px-8"
            style={{ backgroundColor: accentColor, color: backgroundColor }}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
