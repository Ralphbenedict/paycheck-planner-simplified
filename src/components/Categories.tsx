
import React, { useState } from "react";
import CategoryTab from "./CategoryTab";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryItem {
  id: string;
  label: string;
  budget: number;
  actual: number;
}

interface CategoryItems {
  [key: string]: CategoryItem[];
}

interface SummaryData {
  [key: string]: { budget: number; actual: number };
}

interface CategoriesProps {
  categoryItems: CategoryItems;
  setCategoryItems: React.Dispatch<React.SetStateAction<CategoryItems>>;
  availableCategories?: Array<{ key: string; label: string }>;
  summaryData?: SummaryData; // Add summaryData prop
}

const Categories = ({ 
  categoryItems = {}, // Provide default empty object
  setCategoryItems,
  availableCategories = [], // Provide default empty array
  summaryData = {} // Provide default empty object for summaryData
}: CategoriesProps) => {
  // Ensure we have valid categories, defaulting to an empty array if needed
  const categories = availableCategories.length > 0 
    ? availableCategories 
    : Object.keys(categoryItems || {}).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1)
      }));
  
  // Filter out "rollover" from the displayed categories
  const displayCategories = categories.filter(({ key }) => key !== 'rollover');

  // Set the initial active category to the first non-rollover category
  const [activeCategory, setActiveCategory] = useState(displayCategories[0]?.key || "");

  const handleItemsChange = (category: string, newItems: CategoryItem[]) => {
    setCategoryItems(prev => ({
      ...prev,
      [category]: newItems,
    }));
  };

  // Only render if we have categories
  if (displayCategories.length === 0) {
    return null;
  }

  const activeLabel = displayCategories.find(cat => cat.key === activeCategory)?.label || "";
  
  // Get budget and actual totals from summaryData for the active category
  const activeCategoryData = summaryData[activeCategory] || { budget: 0, actual: 0 };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={activeLabel || "Select category"} />
          </SelectTrigger>
          <SelectContent>
            {displayCategories.map(({ key, label }) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Display the active category */}
      <div className="pt-2">
        {categories
          .filter(({ key }) => key === activeCategory)
          .map(({ key, label }) => (
            <div key={key}>
              <CategoryTab
                title={label}
                items={categoryItems[key] || []}
                onItemsChange={(newItems) => handleItemsChange(key, newItems)}
                summaryBudget={activeCategoryData.budget}
                summaryActual={activeCategoryData.actual}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Categories;
