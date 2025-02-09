
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define form validation rules using Zod schema
// This ensures data quality before saving
const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")  // Budget must have a name
    .max(50, "Name must be less than 50 characters"),  // Keep names reasonably short
  description: z
    .string()
    .max(250, "Description must be less than 250 characters"),  // Optional but limited description
});

// Props interface defines what data the modal component needs
interface CreateBudgetModalProps {
  open: boolean;                // Controls modal visibility
  onOpenChange: (open: boolean) => void;  // Handler for opening/closing
  onSubmit: (data: z.infer<typeof formSchema>) => void;  // Submit handler
  initialData?: {              // Optional data for editing existing budgets
    name: string;
    description: string;
  } | null;
}

const CreateBudgetModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: CreateBudgetModalProps) => {
  const { toast } = useToast();
  
  // Initialize form with validation and default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),  // Add Zod validation
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  // Reset form when modal opens/closes or when editing different budget
  React.useEffect(() => {
    if (open && initialData) {
      // If editing, populate form with existing data
      form.reset({
        name: initialData.name,
        description: initialData.description,
      });
    } else if (!open) {
      // Clear form when closing
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [open, initialData, form]);

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    form.reset();  // Clear form after successful submission
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent 
        onPointerDownOutside={(e) => e.preventDefault()} 
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Budget" : "Create New Budget"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Budget name input field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter budget name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Budget description input field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter budget description"
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Form action buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Update" : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBudgetModal;

