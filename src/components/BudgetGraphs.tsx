
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DollarSign } from "lucide-react";

interface BudgetGraphsProps {
  totalIncome: number;
  totalBudgeted: number;
  totalActual: number;
}

const BudgetGraphs = ({ totalIncome, totalBudgeted, totalActual }: BudgetGraphsProps) => {
  const leftToBudget = Math.max(0, totalIncome - totalBudgeted);
  const leftToSpend = Math.max(0, totalBudgeted - totalActual);
  const budgetPercentage = totalIncome > 0 ? (leftToBudget / totalIncome) * 100 : 0;
  const spendPercentage = totalBudgeted > 0 ? (leftToSpend / totalBudgeted) * 100 : 0;

  const renderGraph = (title: string, amount: number, percentage: number, color: string) => {
    const data = [
      { value: percentage },
      { value: 100 - percentage },
    ];

    return (
      <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-[#1A1F2C]">{title}</h3>
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={70}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                <Cell fill={color} />
                <Cell fill={title === "LEFT TO BUDGET" ? "#F2FCE2" : "#F1F0FB"} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <DollarSign className="w-6 h-6 mb-1 text-gray-600" />
            <span className="text-2xl font-bold text-[#222222]">
              {amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
            <span className="text-sm text-gray-600">
              {title.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
      {renderGraph("LEFT TO BUDGET", leftToBudget, budgetPercentage, "#1EAEDB")}
      {renderGraph("LEFT TO SPEND", leftToSpend, spendPercentage, "#F97316")}
    </div>
  );
};

export default BudgetGraphs;
