
import React, { useState } from "react";
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
}

const CategoryTab = ({ title, items, onItemsChange }: CategoryTabProps) => {
  const { getCurrencySymbol, convertAmount } = useCurrency();
  
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

      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </Button>

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center">
          <div className="flex-grow">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <h3 className="font-semibold">BALANCE</h3>
              </div>
              <div className="col-span-4">
                <div className="bg-gray-50 rounded-md relative">
                  <input
                    type="text"
                    value={`${currencySymbol}${totalBudget.toFixed(2)}`}
                    readOnly
                    className="w-full px-3 py-2 text-right bg-transparent font-semibold"
                  />
                </div>
              </div>
              <div className="col-span-4">
                <div className="bg-gray-50 rounded-md relative">
                  <input
                    type="text"
                    value={`${currencySymbol}${totalActual.toFixed(2)}`}
                    readOnly
                    className="w-full px-3 py-2 text-right bg-transparent font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTab;
