
import React, { useState } from "react";
import BudgetRow from "./BudgetRow";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Trash2 } from "lucide-react";

// Interface for tracking budget and actual amounts by category
interface SummaryData {
  [key: string]: { budget: number; actual: number };
}

// Props interface defines required data and callbacks
interface BudgetSummaryProps {
  summaryData: SummaryData;     // Current budget data by category
  setSummaryData: React.Dispatch<React.SetStateAction<SummaryData>>;  // Update handler
  rollover: boolean;            // Whether to include previous period's balance
  setRollover: (value: boolean) => void;  // Toggle rollover setting
}

const BudgetSummary = ({
  summaryData,
  setSummaryData,
  rollover,
  setRollover,
}: BudgetSummaryProps) => {
  // State for adding new budget categories
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState("");

  // Handler for adding new budget categories
  const handleAddNewItem = () => {
    if (!newItemLabel.trim()) return;
    
    // Convert category name to snake_case for consistency
    const key = newItemLabel.toLowerCase().replace(/\s+/g, '_');
    setSummaryData(prev => ({
      ...prev,
      [key]: { budget: 0, actual: 0 }  // Initialize with zero values
    }));
    setNewItemLabel("");
    setIsAddingNew(false);
  };

  // Handler for renaming categories
  const handleLabelChange = (oldKey: string, newLabel: string) => {
    // Don't allow changing the label for rollover
    if (oldKey === 'rollover') return;
    
    // Convert new label to key format
    const newKey = newLabel.toLowerCase().replace(/\s+/g, '_');
    
    // Skip if key already exists or if nothing changed
    if (newKey === oldKey || (newKey !== oldKey && summaryData[newKey])) return;
    
    setSummaryData(prev => {
      const { [oldKey]: oldValue, ...rest } = prev;
      return {
        ...rest,
        [newKey]: oldValue
      };
    });
  };

  // Calculate total budget and actual amounts
  const calculateTotal = () => {
    return Object.entries(summaryData).reduce((acc, [key, value]) => {
      // Skip rollover if disabled
      if (!rollover && key === 'rollover') return acc;
      
      // Income and rollover add to total, expenses subtract
      const multiplier = ['income', 'rollover'].includes(key) ? 1 : -1;
      return {
        budget: acc.budget + (value.budget * multiplier),
        actual: acc.actual + (value.actual * multiplier)
      };
    }, { budget: 0, actual: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Column headers */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-4"></div>
        <div className="col-span-4 text-center font-semibold">
          <h3>BUDGET</h3>
        </div>
        <div className="col-span-4 text-center font-semibold">
          <h3>ACTUAL</h3>
        </div>
      </div>
      
      {/* Add New Item button - MOVED HERE */}
      {isAddingNew ? (
        <div className="flex items-center gap-2 mb-4">
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
          className="mb-4"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Item
        </Button>
      )}

      {/* Budget rows for each category */}
      {Object.entries(summaryData).map(([key, value], index) => (
        <div key={key} className="flex items-center gap-2">
          <div className="flex-grow">
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
              onLabelChange={
                key !== 'rollover' 
                  ? (newLabel) => handleLabelChange(key, newLabel)
                  : undefined
              }
              isCheckbox={key === 'rollover'}
              checked={key === 'rollover' ? rollover : undefined}
              onCheckChange={
                key === 'rollover' 
                  ? (checked: boolean) => setRollover(checked)
                  : undefined
              }
              index={index}
            />
          </div>
          {/* Allow deletion of custom categories */}
          {key !== 'rollover' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const { [key]: removed, ...rest } = summaryData;
                setSummaryData(rest);
              }}
              className="h-8 w-8 ml-1 flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {/* Add an empty div with the same width as the button to maintain alignment */}
          {key === 'rollover' && (
            <div className="w-8 h-8 ml-1 flex-shrink-0"></div>
          )}
        </div>
      ))}

      {/* Total summary row */}
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
