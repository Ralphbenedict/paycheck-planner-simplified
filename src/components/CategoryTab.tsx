
import React from "react";
import BudgetRow from "./BudgetRow";
import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  summaryBudget?: number; // Add summary budget value from parent
  summaryActual?: number; // Add summary actual value from parent
}

const CategoryTab = ({ 
  title, 
  items, 
  onItemsChange, 
  summaryBudget, 
  summaryActual 
}: CategoryTabProps) => {
  const { getCurrencySymbol } = useCurrency();
  
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

  // Use summary values if provided, otherwise calculate from items
  const totalBudget = summaryBudget !== undefined ? summaryBudget : items.reduce((sum, item) => sum + item.budget, 0);
  const totalActual = summaryActual !== undefined ? summaryActual : items.reduce((sum, item) => sum + item.actual, 0);
  const currencySymbol = getCurrencySymbol();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-4"></div>
        <div className="col-span-4 text-center font-semibold">
          <h3>BUDGET</h3>
        </div>
        <div className="col-span-4 text-center font-semibold">
          <h3>ACTUAL</h3>
        </div>
      </div>

      {/* Add Item button */}
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="mb-4"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </Button>

      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <div className="flex-grow">
            <BudgetRow
              label={item.label}
              budgetValue={item.budget}
              actualValue={item.actual}
              onBudgetChange={(value) => updateItem(item.id, { budget: value })}
              onActualChange={(value) => updateItem(item.id, { actual: value })}
              onLabelChange={(value) => updateItem(item.id, { label: value })}
              index={index}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(item.id)}
            className="h-8 w-8 ml-1 flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center">
          <div className="flex-grow">
            <BudgetRow
              label="TOTAL"
              budgetValue={totalBudget}
              actualValue={totalActual}
              onBudgetChange={() => {}}
              onActualChange={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTab;
