
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";

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

export default function Form({ open, onClose, title }: FormProps) {
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[540px] bg-white">
        <SheetHeader className="relative mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-2 top-0"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
          <h2 className="text-2xl font-gt-super">{title}</h2>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-base">First name</label>
            <Input {...register("firstName")} />
          </div>
          <div className="space-y-2">
            <label className="text-base">Last name</label>
            <Input {...register("lastName")} />
          </div>
          <div className="space-y-2">
            <label className="text-base">Email</label>
            <Input type="email" {...register("email")} />
          </div>
          <Button type="submit" className="rounded-full px-8">
            SUBMIT
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
