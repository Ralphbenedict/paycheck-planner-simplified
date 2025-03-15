
import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Pencil, Check } from "lucide-react";

interface BudgetRowProps {
  label: string;
  budgetValue: number;
  actualValue: number;
  onBudgetChange: (value: number) => void;
  onActualChange: (value: number) => void;
  onLabelChange?: (value: string) => void; // New prop for label change
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
  onLabelChange,
  isCheckbox = false,
  checked,
  onCheckChange,
  index = 0,
}: BudgetRowProps) => {
  const { getCurrencySymbol, convertAmount } = useCurrency();
  const [budgetInput, setBudgetInput] = useState(budgetValue.toString());
  const [actualInput, setActualInput] = useState(actualValue.toString());
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState(label);
  
  // Generate unique IDs for each input to associate with labels
  const budgetInputId = `budget-input-${label.replace(/\s+/g, '-').toLowerCase()}-${index}`;
  const actualInputId = `actual-input-${label.replace(/\s+/g, '-').toLowerCase()}-${index}`;
  const labelId = `row-label-${label.replace(/\s+/g, '-').toLowerCase()}-${index}`;

  // Update local state when prop values change
  useEffect(() => {
    setBudgetInput(budgetValue.toString());
    setActualInput(actualValue.toString());
    setLabelInput(label);
  }, [budgetValue, actualValue, label]);

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

  const handleLabelChange = () => {
    if (onLabelChange && labelInput !== label) {
      onLabelChange(labelInput);
    }
    setIsEditingLabel(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLabelChange();
    } else if (e.key === 'Escape') {
      setLabelInput(label);
      setIsEditingLabel(false);
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
            id={`checkbox-${labelId}`}
            aria-labelledby={labelId}
          />
        )}
        {isEditingLabel && onLabelChange ? (
          <div className="flex items-center gap-1 w-full">
            <Input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onBlur={handleLabelChange}
              onKeyDown={handleLabelKeyDown}
              className="h-8 py-1"
              autoFocus
              id={labelId}
            />
            <button 
              onClick={handleLabelChange}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Save label changes"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 w-full">
            <Label 
              className={label === "TOTAL" ? "font-semibold" : ""}
              id={labelId}
              htmlFor={isCheckbox ? `checkbox-${labelId}` : budgetInputId}
            >
              {label}
            </Label>
            {onLabelChange && label !== "TOTAL" && (
              <button 
                onClick={() => setIsEditingLabel(true)} 
                className="text-gray-400 hover:text-gray-600 ml-1"
                aria-label={`Edit ${label} label`}
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
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
          id={budgetInputId}
          aria-labelledby={labelId}
          aria-label={`Budget for ${label}`}
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
          id={actualInputId}
          aria-labelledby={labelId}
          aria-label={`Actual spending for ${label}`}
        />
      </div>
    </div>
  );
};

export default BudgetRow;
