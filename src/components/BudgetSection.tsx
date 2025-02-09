
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface BudgetSectionProps {
  title: string;
  className?: string;
  children: React.ReactNode;
  onEdit?: () => void;
  editable?: boolean;
  hideTitle?: boolean;
}

const BudgetSection = ({ 
  title, 
  className, 
  children,
  onEdit,
  editable = false,
  hideTitle = false
}: BudgetSectionProps) => {
  return (
    <div className={cn(
      "mb-8 p-6 bg-white rounded-lg shadow-sm border-l-4 transition-colors",
      {
        "border-l-blue-500": title === "PAYCHECK PERIOD",
        "border-l-purple-500": title === "SUMMARY",
        "border-l-gray-500": !["PAYCHECK PERIOD", "SUMMARY"].includes(title),
      },
      className
    )}>
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {editable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default BudgetSection;
