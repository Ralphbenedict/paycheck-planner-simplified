import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, LogIn, LogOut, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import SignUpForm from "@/components/SignUpForm";
import LoginForm from "@/components/LoginForm";
import CreateBudgetModal from "@/components/CreateBudgetModal";
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

// Define our data structure for a budget period
// This helps TypeScript understand what properties a budget period should have
interface PayPeriod {
  id: string;          // Unique identifier for each budget
  name: string;        // User-friendly name for the budget
  description: string; // Optional description to provide more context
  startDate: Date | undefined;  // When this budget period begins
  endDate: Date | undefined;    // When this budget period ends
  createdAt: Date;     // Timestamp of when this budget was created
  collaborators?: { email: string; fullName?: string }[]; // People who can access this budget
}

// Define the structure for individual budget items within categories
interface CategoryItem {
  id: string;     // Unique identifier for each budget item
  label: string;  // Name of the budget item (e.g., "Rent", "Groceries")
  budget: number; // Planned amount for this item
  actual: number; // Actual spent amount for this item
}

// Organize budget items by category (e.g., bills, expenses, etc.)
interface CategoryItems {
  [key: string]: CategoryItem[];
}

// Track total budgeted and actual amounts for each main category
interface SummaryData {
  [key: string]: { budget: number; actual: number };
}

// Initialize with only rollover
const DEFAULT_SUMMARY_DATA: SummaryData = {
  rollover: { budget: 0, actual: 0 }
};

// Main component for displaying and managing budget periods
const PayPeriods = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management for UI modals and dialogs
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  
  // State for managing budget period operations
  const [periodToDelete, setPeriodToDelete] = React.useState<string | null>(null);
  const [periodToEdit, setPeriodToEdit] = React.useState<PayPeriod | null>(null);
  const [user, setUser] = React.useState<{ fullName: string } | null>(null);
  
  // Load saved budget periods from localStorage
  // We parse dates properly since JSON.parse doesn't handle Date objects
  const [periods, setPeriods] = React.useState<PayPeriod[]>(() => {
    const savedPeriods = localStorage.getItem("payPeriods");
    return savedPeriods
      ? JSON.parse(savedPeriods, (key, value) => {
          if (
            key === "startDate" ||
            key === "endDate" ||
            key === "createdAt"
          ) {
            return value ? new Date(value) : undefined;
          }
          return value;
        })
      : [];
  });

  // Handler for creating or updating budget periods
  const createNewPeriod = (data: {
    name: string;
    description: string;
    startDate?: Date;
    endDate?: Date;
    collaborators?: { email: string; fullName?: string }[];
  }) => {
    if (periodToEdit) {
      // Update existing budget logic
      const updatedPeriods = periods.map((p) =>
        p.id === periodToEdit.id
          ? { ...p, ...data }
          : p
      );
      setPeriods(updatedPeriods);
      localStorage.setItem("payPeriods", JSON.stringify(updatedPeriods));
      setPeriodToEdit(null);
      toast({
        title: "Budget updated",
        description: "The budget has been successfully updated.",
      });
    } else {
      // Create new budget logic
      const newPeriod: PayPeriod = {
        id: Math.random().toString(36).substr(2, 9), // Generate unique ID
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        createdAt: new Date(),
        collaborators: data.collaborators || [],
      };

      const updatedPeriods = [...periods, newPeriod];
      setPeriods(updatedPeriods);
      
      // Save both the list of periods and individual period data
      localStorage.setItem("payPeriods", JSON.stringify(updatedPeriods));
      localStorage.setItem(`period_${newPeriod.id}`, JSON.stringify({
        name: data.name,
        description: data.description,
        startDate: undefined,
        endDate: undefined,
        summaryData: DEFAULT_SUMMARY_DATA,
        categoryItems: {},
        rollover: false,
        collaborators: data.collaborators || [],
      }));
      
      // Navigate to the new budget's detail page
      navigate(`/period/${newPeriod.id}`);
    }
    setShowCreateModal(false);
  };

  // Authentication success handler
  const handleSignUpSuccess = (fullName: string) => {
    setUser({ fullName });
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
  };

  // Budget deletion handlers
  const handleDeleteClick = (periodId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPeriodToDelete(periodId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (periodToDelete) {
      const updatedPeriods = periods.filter((p) => p.id !== periodToDelete);
      setPeriods(updatedPeriods);
      localStorage.setItem("payPeriods", JSON.stringify(updatedPeriods));
      setShowDeleteDialog(false);
      setPeriodToDelete(null);
      toast({
        title: "Budget deleted",
        description: "The budget has been successfully deleted.",
      });
    }
  };

  // Budget edit handler
  const handleEditClick = (period: PayPeriod, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPeriodToEdit(period);
    setShowCreateModal(true);
  };

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header section with title and user actions */}
      <div className="flex flex-col mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Budgets</h1>
          <div className="flex gap-2 items-center">
            {/* Show different buttons based on user authentication status */}
            {!user ? (
              <>
                <Button variant="outline" onClick={() => setShowSignUp(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
                <Button variant="outline" onClick={() => setShowLogin(true)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm mr-4">Hi, {user.fullName}!</span>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
        {/* New Budget button moved below the title */}
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
        {periods.length === 0 ? (
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
                  </div>
                  <p className="text-sm text-gray-500">{period.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {period.startDate && period.endDate
                      ? `${format(period.startDate, "PPP")} - ${format(
                          period.endDate,
                          "PPP"
                        )}`
                      : "Dates not set"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created {format(period.createdAt, "PPP")}
                  </p>
                  {/* Display collaborators if any */}
                  {period.collaborators && period.collaborators.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-gray-500">Collaborators:</span>
                      <div className="flex flex-wrap gap-1">
                        {period.collaborators.map((collaborator) => (
                          <span key={collaborator.email} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {collaborator.fullName || collaborator.email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Action buttons for editing and deleting budgets */}
                <div className="flex items-center gap-2">
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
      <SignUpForm
        open={showSignUp}
        onOpenChange={setShowSignUp}
        onSignUpSuccess={handleSignUpSuccess}
      />
      <LoginForm open={showLogin} onOpenChange={setShowLogin} />
      <CreateBudgetModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={createNewPeriod}
        initialData={periodToEdit}
      />

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
