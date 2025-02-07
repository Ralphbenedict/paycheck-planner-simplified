import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface BudgetRowProps {
  label: string;
  budgetValue: number;
  actualValue: number;
  onBudgetChange: (value: number) => void;
  onActualChange: (value: number) => void;
  isCheckbox?: boolean;
  checked?: boolean;
  onCheckChange?: (checked: boolean) => void;
}

const BudgetRow = ({
  label,
  budgetValue,
  actualValue,
  onBudgetChange,
  onActualChange,
  isCheckbox = false,
  checked,
  onCheckChange,
}: BudgetRowProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="grid grid-cols-12 gap-4 mb-2 items-center">
      <div className="col-span-4 flex items-center gap-2">
        {isCheckbox && (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckChange?.(e.target.checked)}
            className="w-4 h-4"
          />
        )}
        <Label>{label}</Label>
      </div>
      <div className="col-span-4">
        <Input
          type="number"
          value={budgetValue}
          onChange={(e) => onBudgetChange(parseFloat(e.target.value) || 0)}
          className="text-right"
          step="0.01"
        />
      </div>
      <div className="col-span-4">
        <Input
          type="number"
          value={actualValue}
          onChange={(e) => onActualChange(parseFloat(e.target.value) || 0)}
          className="text-right"
          step="0.01"
        />
      </div>
    </div>
  );
};

export default BudgetRow;