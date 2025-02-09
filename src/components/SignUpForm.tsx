
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogIn } from "lucide-react";

interface SignUpFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignUpForm = ({ open, onOpenChange }: SignUpFormProps) => {
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    password: "",
    acceptTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup logic after Supabase integration
    console.log("Form submitted:", formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sign Up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, acceptTerms: checked as boolean })
              }
              required
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the Terms of Service and Privacy Policy regarding data
              privacy
            </Label>
          </div>
          <div className="space-y-4 pt-4">
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => console.log("Google sign up clicked")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpForm;
