import React, { useState } from "react";
import BudgetRow from "./BudgetRow";
import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";

interface CategoryItem {
  id: string;
  label: string;
  budget: number;
  actual: number;
}

interface CategoryTabProps {
  title: string;
  items: CategoryItem[];
  onItemsChange: (items: CategoryItem[]) => void;
}

const CategoryTab = ({ title, items, onItemsChange }: CategoryTabProps) => {
  const addItem = () => {
    const newItem: CategoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      label: "New Item",
      budget: 0,
      actual: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<CategoryItem>) => {
    onItemsChange(
      items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const totalBudget = items.reduce((sum, item) => sum + item.budget, 0);
  const totalActual = items.reduce((sum, item) => sum + item.actual, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-4"></div>
        <h3 className="col-span-4 text-right font-semibold">BUDGET</h3>
        <h3 className="col-span-4 text-right font-semibold">ACTUAL</h3>
      </div>

      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <BudgetRow
            label={item.label}
            budgetValue={item.budget}
            actualValue={item.actual}
            onBudgetChange={(value) => updateItem(item.id, { budget: value })}
            onActualChange={(value) => updateItem(item.id, { actual: value })}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(item.id)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </Button>

      <div className="border-t pt-4 mt-4">
        <BudgetRow
          label="BALANCE"
          budgetValue={totalBudget}
          actualValue={totalActual}
          onBudgetChange={() => {}}
          onActualChange={() => {}}
        />
      </div>
    </div>
  );
};

export default CategoryTab;