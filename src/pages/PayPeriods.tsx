
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, LogOut, Share2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import CreateBudgetModal from "@/components/CreateBudgetModal";
import ShareBudgetForm from "@/components/ShareBudgetForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Define our data structure for a budget period
interface PayPeriod {
  id: string;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  created_by: string;
  isOwner: boolean;
}

// Define the structure for individual budget items within categories
interface CategoryItem {
  id: string;
  label: string;
  budget: number;
  actual: number;
}

// Organize budget items by category (e.g., bills, expenses, etc.)
interface CategoryItems {
  [key: string]: CategoryItem[];
}

// Track total budgeted and actual amounts for each main category
interface SummaryData {
  [key: string]: { budget: number; actual: number };
}

// Default summary data with zero values for all categories
const DEFAULT_SUMMARY_DATA: SummaryData = {
  rollover: { budget: 0, actual: 0 },
  income: { budget: 0, actual: 0 },
  savings: { budget: 0, actual: 0 },
  investments: { budget: 0, actual: 0 },
  bills: { budget: 0, actual: 0 },
  expenses: { budget: 0, actual: 0 },
  debt: { budget: 0, actual: 0 }
};

// Main categories available for budget planning
const DEFAULT_CATEGORIES = ['income', 'savings', 'investments', 'bills', 'expenses', 'debt'];

const PayPeriods = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  // State management for UI modals and dialogs
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // State for managing budget period operations
  const [periodToDelete, setPeriodToDelete] = useState<string | null>(null);
  const [periodToEdit, setPeriodToEdit] = useState<PayPeriod | null>(null);
  const [periodToShare, setPeriodToShare] = useState<PayPeriod | null>(null);
  const [periods, setPeriods] = useState<PayPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch budgets from Supabase
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setIsLoading(true);
        // Fetch owned budgets
        const { data: ownedBudgets, error: ownedError } = await supabase
          .from("budgets")
          .select("*")
          .order("created_at", { ascending: false });

        if (ownedError) throw ownedError;

        // Fetch shared budgets
        const { data: sharedData, error: sharedError } = await supabase
          .from("collaborators")
          .select(`
            budget_id,
            budgets:budget_id (*)
          `)
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false });

        if (sharedError) throw sharedError;

        // Process owned budgets
        const ownedProcessed = ownedBudgets.map((budget) => ({
          ...budget,
          isOwner: true
        }));

        // Process shared budgets
        const sharedProcessed = sharedData
          .filter(item => item.budgets) // Filter out any null budgets
          .map(item => ({
            ...item.budgets,
            isOwner: false
          }));

        // Combine and remove duplicates
        const allBudgets = [...ownedProcessed];
        
        // Add shared budgets that aren't already in owned
        sharedProcessed.forEach(shared => {
          if (!allBudgets.some(budget => budget.id === shared.id)) {
            allBudgets.push(shared);
          }
        });

        setPeriods(allBudgets);
      } catch (error) {
        console.error("Error fetching budgets:", error);
        toast({
          title: "Error fetching budgets",
          description: "Failed to load your budgets. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchBudgets();
    }
  }, [user, toast]);

  // Handler for creating or updating budget periods
  const createNewPeriod = async (data: {
    name: string;
    description: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    try {
      if (periodToEdit) {
        // Update existing budget logic
        const { error } = await supabase
          .from("budgets")
          .update({
            name: data.name,
            description: data.description,
            start_date: data.startDate?.toISOString() || null,
            end_date: data.endDate?.toISOString() || null,
          })
          .eq("id", periodToEdit.id);

        if (error) throw error;

        toast({
          title: "Budget updated",
          description: "The budget has been successfully updated.",
        });

        // Refresh budgets
        const { data: updatedBudget, error: fetchError } = await supabase
          .from("budgets")
          .select("*")
          .eq("id", periodToEdit.id)
          .single();

        if (fetchError) throw fetchError;

        setPeriods(prev => prev.map(p => 
          p.id === periodToEdit.id 
            ? { ...updatedBudget, isOwner: true }
            : p
        ));
      } else {
        // Create new budget logic
        const { data: newBudget, error } = await supabase
          .from("budgets")
          .insert({
            name: data.name,
            description: data.description,
            start_date: data.startDate?.toISOString() || null,
            end_date: data.endDate?.toISOString() || null,
            created_by: user?.id,
          })
          .select()
          .single();

        if (error) throw error;

        // Create the initial budget data
        const { error: dataError } = await supabase
          .from("budget_data")
          .insert({
            budget_id: newBudget.id,
            data: {
              summaryData: DEFAULT_SUMMARY_DATA,
              categoryItems: DEFAULT_CATEGORIES.reduce((acc, category) => {
                acc[category] = [];
                return acc;
              }, {} as CategoryItems),
              rollover: false,
            }
          });

        if (dataError) throw dataError;

        toast({
          title: "Budget created",
          description: "Your new budget has been created successfully.",
        });

        setPeriods(prev => [{ ...newBudget, isOwner: true }, ...prev]);
        
        // Navigate to the new budget's detail page
        navigate(`/period/${newBudget.id}`);
      }
    } catch (error: any) {
      console.error("Error creating/updating budget:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create/update budget",
        variant: "destructive",
      });
    }

    setShowCreateModal(false);
    setPeriodToEdit(null);
  };

  // Budget deletion handlers
  const handleDeleteClick = (periodId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPeriodToDelete(periodId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (periodToDelete) {
      try {
        const { error } = await supabase
          .from("budgets")
          .delete()
          .eq("id", periodToDelete);

        if (error) throw error;

        setPeriods(prev => prev.filter(p => p.id !== periodToDelete));
        toast({
          title: "Budget deleted",
          description: "The budget has been successfully deleted.",
        });
      } catch (error: any) {
        console.error("Error deleting budget:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete budget",
          variant: "destructive",
        });
      }

      setShowDeleteDialog(false);
      setPeriodToDelete(null);
    }
  };

  // Budget edit handler
  const handleEditClick = (period: PayPeriod, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPeriodToEdit(period);
    setShowCreateModal(true);
  };

  // Budget share handler
  const handleShareClick = (period: PayPeriod, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPeriodToShare(period);
    setShowShareDialog(true);
  };

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header section with title and user actions */}
      <div className="flex flex-col mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Budgets</h1>
          <div className="flex gap-2 items-center">
            {user && (
              <>
                <span className="text-sm mr-4">Hi, {user.email}!</span>
                <Button variant="outline" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
        {/* New Budget button */}
        <Button 
          onClick={() => {
            setPeriodToEdit(null);
            setShowCreateModal(true);
          }}
          className="self-start"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      {/* List of budget periods */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : periods.length === 0 ? (
          // Show message when no budgets exist
          <div className="text-center py-8 text-gray-500">
            No budgets yet. Create your first one!
          </div>
        ) : (
          // Display each budget period as a card
          periods.map((period) => (
            <Link
              key={period.id}
              to={`/period/${period.id}`}
              className="block p-4 rounded-lg border hover:border-primary transition-colors relative group"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{period.name}</h3>
                    {!period.isOwner && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Shared with you
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{period.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {period.start_date && period.end_date
                      ? `${format(new Date(period.start_date), "PPP")} - ${format(
                          new Date(period.end_date),
                          "PPP"
                        )}`
                      : "Dates not set"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created {format(new Date(period.created_at), "PPP")}
                  </p>
                </div>
                {/* Action buttons for editing and deleting budgets */}
                <div className="flex items-center gap-2">
                  {period.isOwner && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => handleShareClick(period, e)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={(e) => handleEditClick(period, e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={(e) => handleDeleteClick(period.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    View Details →
                  </Button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Modal components for user interactions */}
      <CreateBudgetModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={createNewPeriod}
        initialData={periodToEdit ? {
          name: periodToEdit.name,
          description: periodToEdit.description,
          startDate: periodToEdit.start_date ? new Date(periodToEdit.start_date) : undefined,
          endDate: periodToEdit.end_date ? new Date(periodToEdit.end_date) : undefined,
        } : undefined}
      />

      {/* Share budget dialog */}
      {periodToShare && (
        <ShareBudgetForm
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          budgetId={periodToShare.id}
          budgetName={periodToShare.name}
        />
      )}

      {/* Confirmation dialog for deleting budgets */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PayPeriods;
