
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LogIn, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SignUpFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignUpSuccess: (fullName: string) => void;
}

const SignUpForm = ({ open, onOpenChange, onSignUpSuccess }: SignUpFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    password: "",
    acceptTerms: false,
  });

  const [passwordError, setPasswordError] = React.useState<string>("");
  const [passwordStrength, setPasswordStrength] = React.useState<"weak" | "strong" | null>(null);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return "";
  };

  const calculatePasswordStrength = (password: string) => {
    const hasLength = password.length >= 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*]/.test(password);
    
    const strongPassword = hasLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
    return strongPassword ? "strong" : "weak";
  };

  const generateStrongPassword = () => {
    const length = 16;
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*'
    };

    let password = '';
    
    // Ensure at least one character from each set
    password += charset.uppercase.charAt(Math.floor(Math.random() * charset.uppercase.length));
    password += charset.lowercase.charAt(Math.floor(Math.random() * charset.lowercase.length));
    password += charset.numbers.charAt(Math.floor(Math.random() * charset.numbers.length));
    password += charset.symbols.charAt(Math.floor(Math.random() * charset.symbols.length));

    // Fill the rest with random characters
    const allChars = Object.values(charset).join('');
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({ ...prev, password }));
    setPasswordError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    setPasswordError(validatePassword(newPassword));
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    // TODO: Implement signup logic after Supabase integration
    console.log("Form submitted:", formData);
    toast({
      title: "Account created",
      description: "Your account has been created successfully. You can now log in.",
    });
    onSignUpSuccess(formData.fullName);
    onOpenChange(false);
    setFormData({
      fullName: "",
      email: "",
      password: "",
      acceptTerms: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sign Up</DialogTitle>
          <DialogDescription>
            Create an account to start managing your budgets.
          </DialogDescription>
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
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={generateStrongPassword}
              >
                Suggest Strong Password
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handlePasswordChange}
                required
                className={`${passwordError ? "border-red-500" : ""} ${
                  passwordStrength === "strong" ? "border-green-500" : ""
                }`}
              />
              {passwordStrength && !passwordError && (
                <div className="absolute right-3 top-2.5">
                  {passwordStrength === "strong" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              )}
            </div>
            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}
            {passwordStrength && !passwordError && (
              <p className={`text-sm ${
                passwordStrength === "strong" ? "text-green-500" : "text-yellow-500"
              }`}>
                {passwordStrength === "strong" ? "Strong password" : "Weak password"}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Password must be at least 8 characters long and contain at least one uppercase letter,
              one lowercase letter, one number, and one special character (!@#$%^&*).
            </p>
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
