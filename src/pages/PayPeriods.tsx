
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

// Define the structure for a pay period
interface PayPeriod {
  id: string;
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  createdAt: Date;
}

// Define the structure for budget category items
interface CategoryItem {
  id: string;
  label: string;
  budget: number;
  actual: number;
}

// Map of category names to their respective items
interface CategoryItems {
  [key: string]: CategoryItem[];
}

// Structure for summary data of budget categories
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

// List of default budget categories
const DEFAULT_CATEGORIES = ['income', 'savings', 'investments', 'bills', 'expenses', 'debt'];

const PayPeriods = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management for modal visibility
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  
  // State for managing period operations
  const [periodToDelete, setPeriodToDelete] = React.useState<string | null>(null);
  const [periodToEdit, setPeriodToEdit] = React.useState<PayPeriod | null>(null);
  const [user, setUser] = React.useState<{ fullName: string } | null>(null);
  
  // Initialize periods from localStorage with proper date parsing
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

  // Handler for creating or updating a budget period
  const createNewPeriod = (data: {
    name: string;
    description: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) => {
    if (periodToEdit) {
      // Update existing period logic
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
      // Create new period logic
      const newPeriod: PayPeriod = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        createdAt: new Date(),
      };

      const updatedPeriods = [...periods, newPeriod];
      setPeriods(updatedPeriods);
      
      // Save both the periods list and individual period data
      localStorage.setItem("payPeriods", JSON.stringify(updatedPeriods));
      localStorage.setItem(`period_${newPeriod.id}`, JSON.stringify({
        name: data.name,
        description: data.description,
        startDate: undefined,
        endDate: undefined,
        summaryData: DEFAULT_SUMMARY_DATA,
        categoryItems: DEFAULT_CATEGORIES.reduce((acc, category) => {
          acc[category] = [];
          return acc;
        }, {} as CategoryItems),
        rollover: false,
      }));
      
      navigate(`/period/${newPeriod.id}`);
    }
    setShowCreateModal(false);
  };

  // Authentication handlers
  const handleSignUpSuccess = (fullName: string) => {
    setUser({ fullName });
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Delete period handlers
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

  // Edit period handler
  const handleEditClick = (period: PayPeriod, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPeriodToEdit(period);
    setShowCreateModal(true);
  };

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header section with title and action buttons */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Budgets</h1>
        <div className="flex gap-2 items-center">
          {/* Conditional rendering of auth buttons based on user state */}
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
          <Button onClick={() => {
            setPeriodToEdit(null);
            setShowCreateModal(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Budget list section */}
      <div className="space-y-4">
        {periods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No budgets yet. Create your first one!
          </div>
        ) : (
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
                </div>
                {/* Action buttons for each budget */}
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

      {/* Modal components */}
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

      {/* Delete confirmation dialog */}
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
