import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

interface BudgetRowProps {
  label: string;
  budgetValue: number;
  actualValue: number;
  onBudgetChange: (value: number) => void;
  onActualChange: (value: number) => void;
  isCheckbox?: boolean;
  checked?: boolean;
  onCheckChange?: (checked: boolean) => void;
  index?: number;
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
  index = 0,
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

  const getValueState = (value: number) => {
    if (value === 0) return "null";
    if (value < 0) return "negative";
    return "success";
  };

  const getRowStyles = () => {
    const budgetState = getValueState(budgetValue);
    const actualState = getValueState(actualValue);
    
    const isEven = index % 2 === 0;
    
    return {
      row: cn(
        "grid grid-cols-12 gap-4 mb-2 items-center p-2 rounded-lg transition-colors",
        {
          "hover:bg-gray-50": true,
          "bg-gray-50": label === "BALANCE",
          "bg-gradient-to-r from-[#fdfcfb] to-[#e2d1c3]/20": isEven && label !== "BALANCE",
          "bg-gradient-to-r from-[#e6e9f0] to-[#eef1f5]/20": !isEven && label !== "BALANCE",
        }
      ),
      budget: cn("relative", {
        "bg-gray-100": budgetState === "null",
        "bg-blue-50": budgetState !== "null" && budgetState !== "success",
        "bg-green-50": budgetState === "success",
      }),
      actual: cn("relative", {
        "bg-gray-100": actualState === "null",
        "bg-blue-50": actualState !== "null" && actualState !== "success",
        "bg-green-50": actualState === "success",
      })
    };
  };

  const styles = getRowStyles();

  return (
    <div className={styles.row}>
      <div className="col-span-4 flex items-center gap-2">
        {isCheckbox && (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckChange?.(e.target.checked)}
            className="w-4 h-4"
          />
        )}
        <Label className={label === "BALANCE" ? "font-semibold" : ""}>{label}</Label>
      </div>
      <div className={cn("col-span-4", styles.budget)}>
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          $
        </span>
        <Input
          type="text"
          value={budgetValue.toFixed(2)}
          onChange={(e) => handleValueChange(e.target.value, onBudgetChange)}
          className={cn("text-right pl-6", {
            "font-semibold": label === "BALANCE",
          })}
        />
      </div>
      <div className={cn("col-span-4", styles.actual)}>
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          $
        </span>
        <Input
          type="text"
          value={actualValue.toFixed(2)}
          onChange={(e) => handleValueChange(e.target.value, onActualChange)}
          className={cn("text-right pl-6", {
            "font-semibold": label === "BALANCE",
          })}
        />
      </div>
    </div>
  );
};

export default BudgetRow;