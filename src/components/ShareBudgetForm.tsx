
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ShareBudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string;
  budgetName: string;
}

export default function ShareBudgetForm({
  open,
  onOpenChange,
  budgetId,
  budgetName,
}: ShareBudgetFormProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"read" | "write">("read");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to share a budget");
      }

      // Call the share-budget edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-budget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          budgetId,
          userEmail: email,
          permission,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to share budget");
      }

      toast({
        title: "Budget shared successfully",
        description: `An invitation has been sent to ${email}.`,
      });

      setEmail("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sharing budget:", error);
      toast({
        title: "Error sharing budget",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Budget</DialogTitle>
          <DialogDescription>
            Share "{budgetName}" with others by email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Permission</Label>
              <RadioGroup value={permission} onValueChange={(value) => setPermission(value as "read" | "write")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="read" id="read" />
                  <Label htmlFor="read">Can view</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="write" id="write" />
                  <Label htmlFor="write">Can edit</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
