
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency, CurrencyCode, CURRENCY_SYMBOLS } from "@/contexts/CurrencyContext";

interface BudgetGraphsProps {
  totalIncome: number;
  totalBudgeted: number;
  totalActual: number;
}

const BudgetGraphs = ({ totalIncome, totalBudgeted, totalActual }: BudgetGraphsProps) => {
  const { currency, setCurrency, convertAmount, getCurrencySymbol } = useCurrency();

  const leftToBudget = Math.max(0, totalIncome - totalBudgeted);
  const leftToSpend = Math.max(0, totalBudgeted - totalActual);
  const budgetPercentage = totalIncome > 0 ? (leftToBudget / totalIncome) * 100 : 0;
  const spendPercentage = totalBudgeted > 0 ? (leftToSpend / totalBudgeted) * 100 : 0;

  // Convert amounts based on selected currency
  const convertedLeftToBudget = convertAmount(leftToBudget);
  const convertedLeftToSpend = convertAmount(leftToSpend);

  const renderGraph = (title: string, amount: number, percentage: number, color: string, remainingColor: string) => {
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
                <Cell fill={remainingColor} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[#222222]">
              {getCurrencySymbol()}{amount.toLocaleString('en-US', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: true
              })}
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
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <Select 
          value={currency} 
          onValueChange={(value) => setCurrency(value as CurrencyCode)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {/* North American & European currencies */}
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="GBP">GBP (£)</SelectItem>
            <SelectItem value="CAD">CAD (C$)</SelectItem>
            <SelectItem value="JPY">JPY (¥)</SelectItem>
            
            {/* Southeast Asian currencies */}
            <SelectItem value="PHP">PHP (₱)</SelectItem>
            <SelectItem value="SGD">SGD (S$)</SelectItem>
            <SelectItem value="MYR">MYR (RM)</SelectItem>
            <SelectItem value="THB">THB (฿)</SelectItem>
            <SelectItem value="IDR">IDR (Rp)</SelectItem>
            <SelectItem value="VND">VND (₫)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 relative">
        {renderGraph("LEFT TO BUDGET", convertedLeftToBudget, budgetPercentage, "#1EAEDB", "#FDE1D3")}
        <div className="hidden md:block absolute left-1/2 top-8 bottom-8 -translate-x-1/2">
          <Separator orientation="vertical" />
        </div>
        {renderGraph("LEFT TO SPEND", convertedLeftToSpend, spendPercentage, "#F97316", "#D3E4FD")}
      </div>
    </div>
  );
};

export default BudgetGraphs;
