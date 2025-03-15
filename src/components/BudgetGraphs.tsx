
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/contexts/CurrencyContext";

interface BudgetGraphsProps {
  totalIncome: number;
  totalBudgeted: number;
  totalActual: number;
  totalSavings: number; // New prop to receive the total savings from BudgetSummary
}

const BudgetGraphs = ({ 
  totalIncome, 
  totalBudgeted, 
  totalActual, 
  totalSavings 
}: BudgetGraphsProps) => {
  const { convertAmount, getCurrencySymbol } = useCurrency();

  // Use the totalSavings passed from BudgetSummary for left to budget
  const leftToBudget = Math.max(0, totalSavings);
  
  // Calculate leftToSpend - this is the total budgeted amount minus actual spending
  const leftToSpend = Math.max(0, totalBudgeted - totalActual);

  // Calculate percentages
  const budgetPercentage = totalIncome > 0 
    ? Math.min(100, Math.round((leftToBudget / totalIncome) * 100)) 
    : 0;
    
  const spendPercentage = totalBudgeted > 0 
    ? Math.min(100, Math.round((leftToSpend / totalBudgeted) * 100)) 
    : 0;

  const convertedLeftToBudget = convertAmount(leftToBudget);
  const convertedLeftToSpend = convertAmount(leftToSpend);

  const renderGraph = (title: string, amount: number, percentage: number, color: string, remainingColor: string) => {
    const data = [
      { value: 100 - percentage },
      { value: percentage },
    ];

    return (
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-5 text-[#1A1F2C]">{title}</h3>
        <div className="relative w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={70}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                <Cell fill={remainingColor} />
                <Cell fill={color} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#222222]">
              {getCurrencySymbol()}{amount.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: true
              })}
            </span>
            <span className="text-sm text-gray-600 mt-2">
              {title.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {renderGraph("LEFT TO BUDGET", convertedLeftToBudget, budgetPercentage, "#1EAEDB", "#FDE1D3")}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2">
          <Separator orientation="vertical" />
        </div>
        {renderGraph("LEFT TO SPEND", convertedLeftToSpend, spendPercentage, "#F97316", "#D3E4FD")}
      </div>
    </div>
  );
};

export default BudgetGraphs;
