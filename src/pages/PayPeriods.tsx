
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface PayPeriod {
  id: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  createdAt: Date;
}

const PayPeriods = () => {
  const navigate = useNavigate();
  const [periods, setPeriods] = React.useState<PayPeriod[]>(() => {
    const savedPeriods = localStorage.getItem("payPeriods");
    return savedPeriods ? JSON.parse(savedPeriods, (key, value) => {
      if (key === "startDate" || key === "endDate" || key === "createdAt") {
        return value ? new Date(value) : undefined;
      }
      return value;
    }) : [];
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

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Pay Periods</h1>
        <Button onClick={createNewPeriod}>
          <Plus className="h-4 w-4 mr-2" />
          New Period
        </Button>
      </div>

      <div className="space-y-4">
        {periods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pay periods yet. Create your first one!
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
    </div>
  );
};

export default PayPeriods;
