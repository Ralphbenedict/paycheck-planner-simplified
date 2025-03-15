
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";

interface AddBudgetItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: { label: string, budget: number, allocations: {[key: string]: number} }) => void;
  totalBudget: number;
}

const AddBudgetItemDialog = ({ 
  open, 
  onOpenChange, 
  onSave, 
  totalBudget 
}: AddBudgetItemDialogProps) => {
  const [itemName, setItemName] = useState("");
  const [itemBudget, setItemBudget] = useState("");
  
  // Default allocation categories
  const defaultCategories = ["Saving", "Investments", "Expenses"];
  const [allocations, setAllocations] = useState<{[key: string]: string}>(
    defaultCategories.reduce((acc, category) => ({...acc, [category]: ""}), {})
  );

  const handleSave = () => {
    // Convert string values to numbers
    const budget = parseFloat(itemBudget) || 0;
    
    // Convert allocation percentages to numeric values
    const numericAllocations = Object.entries(allocations).reduce((acc, [key, value]) => {
      const percentage = parseFloat(value) || 0;
      return {...acc, [key.toLowerCase()]: percentage};
    }, {});
    
    onSave({
      label: itemName,
      budget,
      allocations: numericAllocations
    });
    
    // Reset form
    setItemName("");
    setItemBudget("");
    setAllocations(defaultCategories.reduce((acc, category) => ({...acc, [category]: ""}), {}));
    
    // Close dialog
    onOpenChange(false);
  };

  const handleAllocationChange = (category: string, value: string) => {
    // Only allow numbers and decimal points
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAllocations(prev => ({...prev, [category]: value}));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Budget Item</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name of Item</Label>
            <Input
              id="name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Income, Rent, Groceries"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="budget">$ Total Budget</Label>
            <Input
              id="budget"
              value={itemBudget}
              onChange={(e) => {
                // Only allow numbers and decimal points
                if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                  setItemBudget(e.target.value);
                }
              }}
              placeholder="0.00"
            />
          </div>
          
          <div className="flex items-center justify-center my-2">
            <div className="bg-gray-200 rounded-full p-1">
              <Plus className="h-4 w-4" />
            </div>
          </div>
          
          {defaultCategories.map((category) => (
            <div key={category} className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  value={category}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="relative">
                <Input
                  value={allocations[category]}
                  onChange={(e) => handleAllocationChange(category, e.target.value)}
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  % from Total Budget
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBudgetItemDialog;
