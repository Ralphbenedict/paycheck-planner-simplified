
import React, { useState, useEffect } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { X, User, Check } from "lucide-react";

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
  collaborators: z.array(z.object({
    email: z.string().email(),
    fullName: z.string().optional(),
  })).optional(),
});

// Props interface defines what data the modal component needs
interface CreateBudgetModalProps {
  open: boolean;                // Controls modal visibility
  onOpenChange: (open: boolean) => void;  // Handler for opening/closing
  onSubmit: (data: z.infer<typeof formSchema>) => void;  // Submit handler
  initialData?: {              // Optional data for editing existing budgets
    name: string;
    description: string;
    collaborators?: { email: string; fullName?: string }[];
  } | null;
}

// Mock user data for demonstration
const mockUsers = [
  { email: "john.doe@example.com", fullName: "John Doe" },
  { email: "jane.smith@example.com", fullName: "Jane Smith" },
  { email: "robert.johnson@example.com", fullName: "Robert Johnson" },
  { email: "emily.williams@example.com", fullName: "Emily Williams" }
];

const CreateBudgetModal = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: CreateBudgetModalProps) => {
  const { toast } = useToast();
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [suggestions, setSuggestions] = useState<{ email: string; fullName: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Initialize form with validation and default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),  // Add Zod validation
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      collaborators: initialData?.collaborators || [],
    },
  });

  const collaborators = form.watch("collaborators") || [];

  // Reset form when modal opens/closes or when editing different budget
  React.useEffect(() => {
    if (open && initialData) {
      // If editing, populate form with existing data
      form.reset({
        name: initialData.name,
        description: initialData.description,
        collaborators: initialData.collaborators || [],
      });
    } else if (!open) {
      // Clear form when closing
      form.reset({
        name: "",
        description: "",
        collaborators: [],
      });
    }
  }, [open, initialData, form]);

  // Filter suggestions based on input
  useEffect(() => {
    if (collaboratorEmail.length > 0) {
      const filteredSuggestions = mockUsers.filter(user => 
        user.email.toLowerCase().includes(collaboratorEmail.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [collaboratorEmail]);

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    form.reset();  // Clear form after successful submission
  };

  // Add collaborator to the form
  const addCollaborator = (email: string, fullName?: string) => {
    const currentCollaborators = form.getValues("collaborators") || [];
    
    // Check if email already exists
    if (currentCollaborators.some(c => c.email === email)) {
      toast({
        title: "Duplicate email",
        description: "This collaborator has already been added.",
        variant: "destructive"
      });
      return;
    }
    
    form.setValue("collaborators", [
      ...currentCollaborators,
      { email, fullName }
    ]);
    setCollaboratorEmail("");
    setShowSuggestions(false);
  };

  // Remove collaborator from the form
  const removeCollaborator = (emailToRemove: string) => {
    const currentCollaborators = form.getValues("collaborators") || [];
    form.setValue(
      "collaborators",
      currentCollaborators.filter(c => c.email !== emailToRemove)
    );
  };

  // Find a user by email in the mock data
  const findUserByEmail = (email: string) => {
    return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
  };

  // Handle email input and check if it's a valid email when user presses Enter
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && collaboratorEmail) {
      e.preventDefault();
      
      // Check if it's a valid email
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(collaboratorEmail)) {
        const existingUser = findUserByEmail(collaboratorEmail);
        addCollaborator(
          collaboratorEmail, 
          existingUser ? existingUser.fullName : undefined
        );
      } else {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
      }
    }
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
            {/* Collaborators field */}
            <FormField
              control={form.control}
              name="collaborators"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collaborators</FormLabel>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        value={collaboratorEmail}
                        onChange={(e) => setCollaboratorEmail(e.target.value)}
                        placeholder="Add collaborator by email"
                        onKeyDown={handleEmailKeyDown}
                        onFocus={() => collaboratorEmail.length > 0 && setShowSuggestions(true)}
                        onBlur={() => {
                          // Delay hiding suggestions to allow clicking on them
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                      />
                      {showSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {suggestions.map((user) => (
                            <div
                              key={user.email}
                              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => {
                                addCollaborator(user.email, user.fullName);
                              }}
                            >
                              <User className="h-4 w-4 mr-2 text-gray-500" />
                              <div>
                                <div className="font-medium">{user.fullName}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {collaborators.map((collaborator) => (
                        <div
                          key={collaborator.email}
                          className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                        >
                          {collaborator.fullName ? (
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1 text-gray-500" />
                              {collaborator.fullName}
                            </span>
                          ) : (
                            collaborator.email
                          )}
                          <button
                            type="button"
                            className="ml-1 text-gray-500 hover:text-gray-700"
                            onClick={() => removeCollaborator(collaborator.email)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <FormDescription>
                      Add people who you'd like to collaborate with on this budget.
                    </FormDescription>
                  </div>
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
