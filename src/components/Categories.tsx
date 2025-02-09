
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryTab from "./CategoryTab";

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

  return (
    <Tabs defaultValue={categories[0]?.key} className="w-full">
      <TabsList className="grid w-full" style={{ 
        gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` 
      }}>
        {categories.map(({ key, label }) => (
          <TabsTrigger key={key} value={key}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map(({ key, label }) => (
        <TabsContent key={key} value={key}>
          <CategoryTab
            title={label}
            items={categoryItems[key] || []}
            onItemsChange={(newItems) => handleItemsChange(key, newItems)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default Categories;
