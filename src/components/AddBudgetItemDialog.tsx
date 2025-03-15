
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, X } from "lucide-react";

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
  
  // State for custom allocations
  const [customAllocations, setCustomAllocations] = useState<Array<{name: string, percentage: string}>>([]);

  const handleSave = () => {
    // Convert string values to numbers
    const budget = parseFloat(itemBudget) || 0;
    
    // Convert all allocations to numeric values
    const allAllocations: {[key: string]: number} = {};
    
    // Add custom allocations to the allocation object
    customAllocations.forEach(allocation => {
      if (allocation.name.trim()) {
        allAllocations[allocation.name.trim()] = parseFloat(allocation.percentage) || 0;
      }
    });
    
    onSave({
      label: itemName,
      budget,
      allocations: allAllocations
    });
    
    // Reset form
    setItemName("");
    setItemBudget("");
    setCustomAllocations([]);
    
    // Close dialog
    onOpenChange(false);
  };
  
  const handleCustomAllocationChange = (index: number, field: 'name' | 'percentage', value: string) => {
    const updatedAllocations = [...customAllocations];
    
    if (field === 'percentage' && value !== '' && !/^\d*\.?\d*$/.test(value)) {
      return; // Don't update if not a valid number
    }
    
    updatedAllocations[index] = {
      ...updatedAllocations[index],
      [field]: value
    };
    
    setCustomAllocations(updatedAllocations);
  };
  
  const addCustomAllocation = () => {
    setCustomAllocations([...customAllocations, { name: '', percentage: '' }]);
  };
  
  const removeCustomAllocation = (index: number) => {
    const updatedAllocations = [...customAllocations];
    updatedAllocations.splice(index, 1);
    setCustomAllocations(updatedAllocations);
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
          
          {/* Custom allocations section */}
          <div className="mt-4 border-t pt-4">
            <Label className="mb-2 block">Allocations</Label>
            
            {customAllocations.map((allocation, index) => (
              <div key={index} className="grid grid-cols-[1fr,120px,auto] gap-2 mb-2 items-center">
                <Input
                  value={allocation.name}
                  onChange={(e) => handleCustomAllocationChange(index, 'name', e.target.value)}
                  placeholder="Category name"
                />
                <div className="relative">
                  <Input
                    value={allocation.percentage}
                    onChange={(e) => handleCustomAllocationChange(index, 'percentage', e.target.value)}
                    placeholder="0"
                    className="pr-6"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => removeCustomAllocation(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {/* Add allocation button - left aligned */}
            <div className="flex justify-start mt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={addCustomAllocation}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Allocation
              </Button>
            </div>
          </div>
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
