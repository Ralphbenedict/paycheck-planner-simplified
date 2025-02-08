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
  income: CategoryItem[];
  savings: CategoryItem[];
  bills: CategoryItem[];
  expenses: CategoryItem[];
  debt: CategoryItem[];
}

interface CategoriesProps {
  categoryItems: CategoryItems;
  setCategoryItems: (items: CategoryItems) => void;
}

const Categories = ({ categoryItems, setCategoryItems }: CategoriesProps) => {
  return (
    <Tabs defaultValue="income" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="income">Income</TabsTrigger>
        <TabsTrigger value="savings">Savings</TabsTrigger>
        <TabsTrigger value="bills">Bills</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="debt">Debt</TabsTrigger>
      </TabsList>

      {Object.entries(categoryItems).map(([category, items]) => (
        <TabsContent key={category} value={category}>
          <CategoryTab
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            items={items}
            onItemsChange={(newItems) =>
              setCategoryItems({
                ...categoryItems,
                [category]: newItems,
              })
            }
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default Categories;
