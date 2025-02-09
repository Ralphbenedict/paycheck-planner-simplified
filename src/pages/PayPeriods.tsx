
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

interface PayPeriod {
  id: string;
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  createdAt: Date;
}

const PayPeriods = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [periodToDelete, setPeriodToDelete] = React.useState<string | null>(null);
  const [periodToEdit, setPeriodToEdit] = React.useState<PayPeriod | null>(null);
  const [user, setUser] = React.useState<{ fullName: string } | null>(null);
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

  const createNewPeriod = (data: {
    name: string;
    description: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) => {
    if (periodToEdit) {
      // Update existing period
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
      // Create new period
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
      localStorage.setItem("payPeriods", JSON.stringify(updatedPeriods));
      navigate(`/period/${newPeriod.id}`);
    }
    setShowCreateModal(false);
  };

  const handleSignUpSuccess = (fullName: string) => {
    setUser({ fullName });
  };

  const handleLogout = () => {
    setUser(null);
  };

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

  const handleEditClick = (period: PayPeriod, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPeriodToEdit(period);
    setShowCreateModal(true);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Budgets</h1>
        <div className="flex gap-2 items-center">
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
