
import React, { useState } from "react";
import BudgetRow from "./BudgetRow";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Trash2 } from "lucide-react";

interface SummaryItem {
  key: string;
  label: string;
  budget: number;
  actual: number;
  isRemovable: boolean;
}

interface BudgetSummaryProps {
  summaryItems: SummaryItem[];
  onSummaryItemsChange: (items: SummaryItem[]) => void;
  rollover: boolean;
  onRolloverChange: (value: boolean) => void;
  onAddItem: (item: SummaryItem) => void;
  onRemoveItem: (key: string) => void;
}

const BudgetSummary = ({
  summaryItems,
  onSummaryItemsChange,
  rollover,
  onRolloverChange,
  onAddItem,
  onRemoveItem,
}: BudgetSummaryProps) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState("");

  const handleAddNewItem = () => {
    if (!newItemLabel.trim()) return;
    
    const key = newItemLabel.toLowerCase().replace(/\s+/g, '_');
    onAddItem({
      key,
      label: newItemLabel,
      budget: 0,
      actual: 0,
      isRemovable: true
    });
    setNewItemLabel("");
    setIsAddingNew(false);
  };

  const calculateTotal = () => {
    const total = summaryItems.reduce((acc, item) => {
      if (!rollover && item.key === 'rollover') return acc;
      const multiplier = ['income', 'rollover'].includes(item.key) ? 1 : -1;
      return {
        budget: acc.budget + (item.budget * multiplier),
        actual: acc.actual + (item.actual * multiplier)
      };
    }, { budget: 0, actual: 0 });

    return total;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-4"></div>
        <h3 className="col-span-3 text-right font-semibold">BUDGET</h3>
        <h3 className="col-span-3 text-right font-semibold">ACTUAL</h3>
        <div className="col-span-2"></div>
      </div>

      {summaryItems.map((item) => (
        <div key={item.key} className="flex items-center gap-2">
          <div className="flex-1">
            <BudgetRow
              label={item.label}
              budgetValue={item.budget}
              actualValue={item.actual}
              onBudgetChange={(value) => {
                const newItems = summaryItems.map((i) =>
                  i.key === item.key ? { ...i, budget: value } : i
                );
                onSummaryItemsChange(newItems);
              }}
              onActualChange={(value) => {
                const newItems = summaryItems.map((i) =>
                  i.key === item.key ? { ...i, actual: value } : i
                );
                onSummaryItemsChange(newItems);
              }}
              isCheckbox={item.key === 'rollover'}
              checked={item.key === 'rollover' ? rollover : undefined}
              onCheckChange={
                item.key === 'rollover' ? onRolloverChange : undefined
              }
            />
          </div>
          {item.isRemovable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveItem(item.key)}
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
