
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import SignUpForm from "@/components/SignUpForm";
import LoginForm from "@/components/LoginForm";

interface PayPeriod {
  id: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  createdAt: Date;
}

const PayPeriods = () => {
  const navigate = useNavigate();
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);
  const [user, setUser] = React.useState<{ fullName: string } | null>(null);
  const [periods, setPeriods] = React.useState<PayPeriod[]>(() => {
    const savedPeriods = localStorage.getItem("payPeriods");
    return savedPeriods
      ? JSON.parse(savedPeriods, (key, value) => {
          if (key === "startDate" || key === "endDate" || key === "createdAt") {
            return value ? new Date(value) : undefined;
          }
          return value;
        })
      : [];
  });

  const createNewPeriod = () => {
    const newPeriod: PayPeriod = {
      id: Math.random().toString(36).substr(2, 9),
      startDate: undefined,
      endDate: undefined,
      createdAt: new Date(),
    };

    const updatedPeriods = [...periods, newPeriod];
    setPeriods(updatedPeriods);
    localStorage.setItem("payPeriods", JSON.stringify(updatedPeriods));
    navigate(`/period/${newPeriod.id}`);
  };

  const handleSignUpSuccess = (fullName: string) => {
    setUser({ fullName });
  };

  const handleLogout = () => {
    setUser(null);
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
          <Button onClick={createNewPeriod}>
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
              className="block p-4 rounded-lg border hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {period.startDate && period.endDate
                      ? `${format(period.startDate, "PPP")} - ${format(
                          period.endDate,
                          "PPP"
                        )}`
                      : "Dates not set"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created {format(period.createdAt, "PPP")}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View Details →
                </Button>
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
    </div>
  );
};

export default PayPeriods;
