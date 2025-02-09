
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
  setCategoryItems: (items: CategoryItems) => void;
  availableCategories: Array<{ key: string; label: string }>;
}

const Categories = ({ 
  categoryItems, 
  setCategoryItems,
  availableCategories 
}: CategoriesProps) => {
  const handleItemsChange = (category: string, newItems: CategoryItem[]) => {
    setCategoryItems({
      ...categoryItems,
      [category]: newItems,
    });
  };

  return (
    <Tabs defaultValue={availableCategories[0]?.key} className="w-full">
      <TabsList className="grid w-full" style={{ 
        gridTemplateColumns: `repeat(${availableCategories.length}, minmax(0, 1fr))` 
      }}>
        {availableCategories.map(({ key, label }) => (
          <TabsTrigger key={key} value={key}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {availableCategories.map(({ key, label }) => (
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
