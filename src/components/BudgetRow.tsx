
import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  const { getCurrencySymbol, convertAmount } = useCurrency();
  const [budgetInput, setBudgetInput] = useState(budgetValue.toString());
  const [actualInput, setActualInput] = useState(actualValue.toString());

  // Update local state when prop values change
  useEffect(() => {
    setBudgetInput(budgetValue.toString());
    setActualInput(actualValue.toString());
  }, [budgetValue, actualValue]);

  const handleInputBlur = (value: string, onChange: (value: number) => void) => {
    const numericValue = parseFloat(value) || 0;
    onChange(numericValue);
  };

  const handleInputChange = (
    value: string,
    setInput: (value: string) => void
  ) => {
    // Allow empty string, numbers, and a single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInput(value);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Clear the field if it's "0"
    if (e.target.value === "0") {
      e.target.value = "";
    }
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
          "bg-gray-50": label === "TOTAL",
          "bg-gradient-to-r from-[#fdfcfb] to-[#e2d1c3]/20": isEven && label !== "TOTAL",
          "bg-gradient-to-r from-[#e6e9f0] to-[#eef1f5]/20": !isEven && label !== "TOTAL",
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
  const currencySymbol = getCurrencySymbol();

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
        <Label className={label === "TOTAL" ? "font-semibold" : ""}>{label}</Label>
      </div>
      <div className={cn("col-span-4", styles.budget)}>
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          {currencySymbol}
        </span>
        <Input
          type="text"
          value={budgetInput}
          onChange={(e) => handleInputChange(e.target.value, setBudgetInput)}
          onFocus={handleFocus}
          onBlur={() => handleInputBlur(budgetInput, onBudgetChange)}
          className={cn("text-right pl-6", {
            "font-semibold": label === "TOTAL",
          })}
          readOnly={label === "TOTAL"}
        />
      </div>
      <div className={cn("col-span-4", styles.actual)}>
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          {currencySymbol}
        </span>
        <Input
          type="text"
          value={actualInput}
          onChange={(e) => handleInputChange(e.target.value, setActualInput)}
          onFocus={handleFocus}
          onBlur={() => handleInputBlur(actualInput, onActualChange)}
          className={cn("text-right pl-6", {
            "font-semibold": label === "TOTAL",
          })}
          readOnly={label === "TOTAL"}
        />
      </div>
    </div>
  );
};

export default BudgetRow;
