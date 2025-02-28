
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

interface CategoriesProps {
  categoryItems: CategoryItems;
  setCategoryItems: React.Dispatch<React.SetStateAction<CategoryItems>>;
  availableCategories?: Array<{ key: string; label: string }>;
}

const Categories = ({ 
  categoryItems = {}, // Provide default empty object
  setCategoryItems,
  availableCategories = [] // Provide default empty array
}: CategoriesProps) => {
  // Ensure we have valid categories, defaulting to an empty array if needed
  const categories = availableCategories.length > 0 
    ? availableCategories 
    : Object.keys(categoryItems || {}).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1)
      }));

  const [activeCategory, setActiveCategory] = useState(categories[0]?.key || "");

  const handleItemsChange = (category: string, newItems: CategoryItem[]) => {
    setCategoryItems(prev => ({
      ...prev,
      [category]: newItems,
    }));
  };

  // Only render if we have categories
  if (categories.length === 0) {
    return null;
  }

  const activeLabel = categories.find(cat => cat.key === activeCategory)?.label || "";

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end">
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={activeLabel || "Select category"} />
          </SelectTrigger>
          <SelectContent>
            {categories.map(({ key, label }) => (
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
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Categories;
