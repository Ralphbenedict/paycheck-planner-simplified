import React, { useState, useEffect } from "react";
import BudgetRow from "./BudgetRow";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Trash2 } from "lucide-react";
import AddBudgetItemDialog from "./AddBudgetItemDialog";

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
  onTotalChange?: (total: number) => void; // Callback to notify parent of total change
}

const BudgetSummary = ({
  summaryData,
  setSummaryData,
  rollover,
  setRollover,
  onTotalChange,
}: BudgetSummaryProps) => {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  
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

  // Notify parent component when total changes
  useEffect(() => {
    const total = calculateTotal();
    if (onTotalChange) {
      onTotalChange(total.budget);
    }
  }, [summaryData, rollover]);

  // Handler for adding new budget item with allocations
  const handleAddBudgetItem = (item: { 
    label: string, 
    budget: number, 
    allocations: {[key: string]: number} 
  }) => {
    const { label, budget, allocations } = item;
    const itemKey = label.toLowerCase().replace(/\s+/g, '_');
    
    // Update summary with new item
    setSummaryData(prev => ({
      ...prev,
      [itemKey]: { budget, actual: 0 }
    }));
    
    // Apply allocations to existing categories
    Object.entries(allocations).forEach(([category, percentage]) => {
      const categoryKey = category.toLowerCase().replace(/\s+/g, '_');
      const allocationAmount = (budget * percentage) / 100;
      
      if (categoryKey in summaryData) {
        setSummaryData(prev => ({
          ...prev,
          [categoryKey]: {
            ...prev[categoryKey],
            budget: prev[categoryKey].budget + allocationAmount
          }
        }));
      } else if (percentage > 0) {
        // Create new category if it doesn't exist but has allocation
        setSummaryData(prev => ({
          ...prev,
          [categoryKey]: { budget: allocationAmount, actual: 0 }
        }));
      }
    });
  };

  // Get total income for percentage calculations
  const totalBudget = summaryData.income?.budget || 0;

  // Create a clean displayData object with ONLY rollover guaranteed
  const displayData: SummaryData = {};
  
  // Only add rollover if it doesn't exist
  if (!summaryData.rollover) {
    displayData.rollover = { budget: 0, actual: 0 };
  }
  
  // Add all existing items from summaryData
  Object.entries(summaryData).forEach(([key, value]) => {
    displayData[key] = value;
  });

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
      
      {/* Add New Item button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="mb-4"
      >
        <Plus className="h-4 w-4 mr-2" /> Add New Item
      </Button>

      {/* Budget rows for each category */}
      {Object.entries(displayData).map(([key, value], index) => (
        <div key={key} className="flex items-center gap-2">
          <div className="flex-grow">
            <BudgetRow
              label={key === 'rollover' ? 'ROLLOVER' : key.replace(/_/g, ' ').toUpperCase()}
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
                key !== 'rollover' && key !== 'total'
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
          {key !== 'rollover' && key !== 'total' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSummaryData(prev => {
                  const { [key]: removed, ...rest } = prev;
                  return rest;
                });
              }}
              className="h-8 w-8 ml-1 flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {/* Add an empty div with the same width as the button to maintain alignment */}
          {(key === 'rollover' || key === 'total') && (
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

      {/* Add Budget Item Dialog */}
      <AddBudgetItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAddBudgetItem}
        totalBudget={totalBudget}
      />
    </div>
  );
};

export default BudgetSummary;
