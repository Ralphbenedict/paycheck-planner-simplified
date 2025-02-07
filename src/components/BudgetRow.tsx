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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleValueChange = (value: string, onChange: (value: number) => void) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const sanitizedValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
    
    // Convert to number and update
    const numberValue = parseFloat(sanitizedValue) || 0;
    onChange(numberValue);
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
      <div className="col-span-4 relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          $
        </span>
        <Input
          type="text"
          value={budgetValue.toFixed(2)}
          onChange={(e) => handleValueChange(e.target.value, onBudgetChange)}
          className="text-right pl-6"
        />
      </div>
      <div className="col-span-4 relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          $
        </span>
        <Input
          type="text"
          value={actualValue.toFixed(2)}
          onChange={(e) => handleValueChange(e.target.value, onActualChange)}
          className="text-right pl-6"
        />
      </div>
    </div>
  );
};

export default BudgetRow;