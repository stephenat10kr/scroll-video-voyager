
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { colors } from "@/lib/theme";

interface FormProps {
  open: boolean;
  onClose: () => void;
  title: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function Form({
  open,
  onClose,
  title
}: FormProps) {
  const {
    register,
    handleSubmit
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    onClose();
  };

  return <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[540px] bg-darkGreen">
        <div className="relative">
          <Button 
            variant="default" 
            className="absolute left-0 top-0 p-0 w-[48px] h-[48px] bg-coral text-darkGreen rounded-full flex items-center justify-center" 
            onClick={onClose}
          >
            <X className="h-6 w-6 stroke-darkGreen" />
          </Button>
        </div>
        <SheetHeader className="mb-12">
          <h2 className="mt-16 text-2xl font-gt-super text-roseWhite" dangerouslySetInnerHTML={{ __html: title }} />
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-roseWhite">First name</label>
            <Input {...register("firstName")} className="border-roseWhite bg-transparent text-roseWhite" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-roseWhite">Last name</label>
            <Input {...register("lastName")} className="border-roseWhite bg-transparent text-roseWhite" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-roseWhite">Email</label>
            <Input type="email" {...register("email")} className="border-roseWhite bg-transparent text-roseWhite" />
          </div>
          <Button type="submit" className="rounded-full px-8 bg-coral text-darkGreen hover:bg-coral/90">
            SUBMIT
          </Button>
        </form>
      </SheetContent>
    </Sheet>;
}
