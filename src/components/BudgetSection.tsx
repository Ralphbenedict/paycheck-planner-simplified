import React from "react";
import { cn } from "@/lib/utils";

interface BudgetSectionProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

const BudgetSection = ({ title, className, children }: BudgetSectionProps) => {
  return (
    <div className={cn("mb-8 p-6 bg-white rounded-lg shadow-sm", className)}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      {children}
    </div>
  );
};

export default BudgetSection;