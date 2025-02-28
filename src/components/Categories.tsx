
import React, { useRef, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryTab from "./CategoryTab";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

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

  const tabsListRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [activeTab, setActiveTab] = useState(categories[0]?.key || "");

  const handleItemsChange = (category: string, newItems: CategoryItem[]) => {
    setCategoryItems(prev => ({
      ...prev,
      [category]: newItems,
    }));
  };

  // Check scroll overflow and update arrow visibility
  const checkScrollOverflow = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5); // Small buffer
    }
  };

  // Initialize scroll check
  useEffect(() => {
    checkScrollOverflow();
    // Add resize listener to recheck when window size changes
    window.addEventListener('resize', checkScrollOverflow);
    return () => window.removeEventListener('resize', checkScrollOverflow);
  }, []);

  // Update arrows when scroll position changes
  useEffect(() => {
    checkScrollOverflow();
  }, [scrollPosition]);

  // Scroll handlers
  const scrollLeft = () => {
    if (tabsListRef.current) {
      const scrollAmount = tabsListRef.current.clientWidth / 3;
      tabsListRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      // Update scroll position after animation
      setTimeout(() => {
        if (tabsListRef.current) {
          setScrollPosition(tabsListRef.current.scrollLeft);
        }
      }, 300);
    }
  };

  const scrollRight = () => {
    if (tabsListRef.current) {
      const scrollAmount = tabsListRef.current.clientWidth / 3;
      tabsListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      // Update scroll position after animation
      setTimeout(() => {
        if (tabsListRef.current) {
          setScrollPosition(tabsListRef.current.scrollLeft);
        }
      }, 300);
    }
  };

  // Handle scroll event
  const handleScroll = () => {
    if (tabsListRef.current) {
      setScrollPosition(tabsListRef.current.scrollLeft);
    }
  };

  // Only render if we have categories
  if (categories.length === 0) {
    return null;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="relative">
        {/* Left scroll button */}
        {showLeftArrow && (
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background shadow-md"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Tabs list with overflow */}
        <TabsList 
          ref={tabsListRef}
          className="flex w-full overflow-x-hidden mx-auto px-8"
          style={{ scrollbarWidth: 'none' }}
          onScroll={handleScroll}
        >
          {categories.map(({ key, label }) => (
            <TabsTrigger 
              key={key} 
              value={key}
              className="flex-shrink-0 min-w-fit px-4" // Changed to min-w-fit with explicit padding
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Right scroll button */}
        {showRightArrow && (
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background shadow-md"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tab content - remains the same */}
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
