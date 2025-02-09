
import React, { useState } from "react";
import BudgetRow from "./BudgetRow";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Trash2 } from "lucide-react";

interface SummaryData {
  [key: string]: { budget: number; actual: number };
}

interface BudgetSummaryProps {
  summaryData: SummaryData;
  setSummaryData: React.Dispatch<React.SetStateAction<SummaryData>>;
  rollover: boolean;
  setRollover: (value: boolean) => void;
}

const BudgetSummary = ({
  summaryData,
  setSummaryData,
  rollover,
  setRollover,
}: BudgetSummaryProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState("");

  const handleAddNewItem = () => {
    if (!newItemLabel.trim()) return;
    
    const key = newItemLabel.toLowerCase().replace(/\s+/g, '_');
    setSummaryData(prev => ({
      ...prev,
      [key]: { budget: 0, actual: 0 }
    }));
    setNewItemLabel("");
    setIsAddingNew(false);
  };

  const calculateTotal = () => {
    return Object.entries(summaryData).reduce((acc, [key, value]) => {
      if (!rollover && key === 'rollover') return acc;
      const multiplier = ['income', 'rollover'].includes(key) ? 1 : -1;
      return {
        budget: acc.budget + (value.budget * multiplier),
        actual: acc.actual + (value.actual * multiplier)
      };
    }, { budget: 0, actual: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-4"></div>
        <h3 className="col-span-3 text-right font-semibold">BUDGET</h3>
        <h3 className="col-span-3 text-right font-semibold">ACTUAL</h3>
        <div className="col-span-2"></div>
      </div>

      {Object.entries(summaryData).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <div className="flex-1">
            <BudgetRow
              label={key.toUpperCase()}
              budgetValue={value.budget}
              actualValue={value.actual}
              onBudgetChange={(newValue) => {
                setSummaryData(prev => ({
                  ...prev,
                  [key]: { ...prev[key], budget: newValue }
                }));
              }}
              onActualChange={(newValue) => {
                setSummaryData(prev => ({
                  ...prev,
                  [key]: { ...prev[key], actual: newValue }
                }));
              }}
              isCheckbox={key === 'rollover'}
              checked={key === 'rollover' ? rollover : undefined}
              onCheckChange={
                key === 'rollover' 
                  ? (checked: boolean) => setRollover(checked)
                  : undefined
              }
            />
          </div>
          {key !== 'rollover' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const { [key]: removed, ...rest } = summaryData;
                setSummaryData(rest);
              }}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      {isAddingNew ? (
        <div className="flex items-center gap-2">
          <Input
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            placeholder="Enter item name"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddNewItem();
              if (e.key === 'Escape') setIsAddingNew(false);
            }}
          />
          <Button onClick={handleAddNewItem} size="sm">Add</Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setIsAddingNew(false);
              setNewItemLabel("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingNew(true)}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Item
        </Button>
      )}

      <div className="border-t pt-4">
        <BudgetRow
          label="TOTAL"
          budgetValue={calculateTotal().budget}
          actualValue={calculateTotal().actual}
          onBudgetChange={() => {}}
          onActualChange={() => {}}
        />
      </div>
    </div>
  );
};

export default BudgetSummary;
