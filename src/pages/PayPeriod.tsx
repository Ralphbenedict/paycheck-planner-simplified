import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BudgetSection from "@/components/BudgetSection";
import DateRangePicker from "@/components/DateRangePicker";
import BudgetSummary from "@/components/BudgetSummary";
import Categories from "@/components/Categories";
import BudgetGraphs from "@/components/BudgetGraphs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Pencil, Check, X } from "lucide-react";

interface CategoryItem {
  id: string;
  label: string;
  budget: number;
  actual: number;
}

interface SummaryItem {
  key: string;
  label: string;
  budget: number;
  actual: number;
  isRemovable: boolean;
}

interface PeriodData {
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  summaryItems: SummaryItem[];
  categoryItems: {
    [key: string]: CategoryItem[];
  };
  rollover: boolean;
}

const DEFAULT_SUMMARY_ITEMS: SummaryItem[] = [
  { key: 'rollover', label: 'Rollover', budget: 0, actual: 0, isRemovable: false },
  { key: 'income', label: 'Income', budget: 0, actual: 0, isRemovable: true },
  { key: 'savings', label: 'Savings', budget: 0, actual: 0, isRemovable: true },
  { key: 'investments', label: 'Investments', budget: 0, actual: 0, isRemovable: true },
  { key: 'bills', label: 'Bills', budget: 0, actual: 0, isRemovable: true },
  { key: 'expenses', label: 'Expenses', budget: 0, actual: 0, isRemovable: true },
  { key: 'debt', label: 'Debt', budget: 0, actual: 0, isRemovable: true },
];

const DEFAULT_CATEGORIES = ['income', 'savings', 'investments', 'bills', 'expenses', 'debt'];

const PayPeriod = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [periodData, setPeriodData] = useState<PeriodData>(() => {
    const savedData = localStorage.getItem(`period_${id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.startDate) {
        parsed.startDate = new Date(parsed.startDate);
      }
      if (parsed.endDate) {
        parsed.endDate = new Date(parsed.endDate);
      }
      setEditedName(parsed.name || "");
      setEditedDescription(parsed.description || "");
      
      // Ensure all default categories exist
      const summaryItems = parsed.summaryItems || DEFAULT_SUMMARY_ITEMS;
      const categoryItems = parsed.categoryItems || {};
      DEFAULT_CATEGORIES.forEach(category => {
        if (!categoryItems[category]) {
          categoryItems[category] = [];
        }
      });
      
      return {
        ...parsed,
        summaryItems,
        categoryItems
      };
    }
    return {
      name: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      summaryItems: DEFAULT_SUMMARY_ITEMS,
      categoryItems: DEFAULT_CATEGORIES.reduce((acc, category) => {
        acc[category] = [];
        return acc;
      }, {} as { [key: string]: CategoryItem[] }),
      rollover: false,
    };
  });

  useEffect(() => {
    localStorage.setItem(`period_${id}`, JSON.stringify(periodData));
  }, [periodData, id]);

  const handleSaveEdit = () => {
    setPeriodData({
      ...periodData,
      name: editedName,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const calculateTotals = () => {
    const income = periodData.summaryItems.find(item => item.key === 'income')?.budget || 0;
    const totalIncome = income;
    
    const totalBudgeted = periodData.summaryItems
      .filter(item => item.key !== 'income' && item.key !== 'rollover')
      .reduce((sum, item) => sum + item.budget, 0);
    
    const totalActual = periodData.summaryItems
      .filter(item => item.key !== 'income' && item.key !== 'rollover')
      .reduce((sum, item) => sum + item.actual, 0);

    return { totalIncome, totalBudgeted, totalActual };
  };

  return (
    <div className="container py-8 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/periods")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Pay Periods
      </Button>

      <div className="mb-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Budget Name"
                maxLength={50}
              />
            </div>
            <div>
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Budget Description"
                maxLength={250}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} size="sm">
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(periodData.name);
                  setEditedDescription(periodData.description);
                }}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{periodData.name || "Untitled Budget"}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            {periodData.description && (
              <p className="text-gray-500">{periodData.description}</p>
            )}
          </div>
        )}
      </div>

      <BudgetSection title="PAYCHECK PERIOD" hideTitle>
        <DateRangePicker
          startDate={periodData.startDate}
          endDate={periodData.endDate}
          onStartDateChange={(date) =>
            setPeriodData({ ...periodData, startDate: date })
          }
          onEndDateChange={(date) =>
            setPeriodData({ ...periodData, endDate: date })
          }
        />
      </BudgetSection>

      <BudgetSection title="SUMMARY">
        <BudgetSummary
          summaryItems={periodData.summaryItems}
          onSummaryItemsChange={(newItems) => {
            setPeriodData({ ...periodData, summaryItems: newItems });
          }}
          rollover={periodData.rollover}
          onRolloverChange={(value) =>
            setPeriodData({ ...periodData, rollover: value })
          }
          onAddItem={(newItem) => {
            const newItems = [...periodData.summaryItems, newItem];
            setPeriodData({
              ...periodData,
              summaryItems: newItems,
              categoryItems: {
                ...periodData.categoryItems,
                [newItem.key]: []
              }
            });
          }}
          onRemoveItem={(key) => {
            setPeriodData({
              ...periodData,
              summaryItems: periodData.summaryItems.filter(item => item.key !== key),
              categoryItems: Object.fromEntries(
                Object.entries(periodData.categoryItems).filter(([k]) => k !== key)
              )
            });
          }}
        />
      </BudgetSection>

      <BudgetSection title="BUDGET OVERVIEW">
        <BudgetGraphs {...calculateTotals()} />
      </BudgetSection>

      <BudgetSection title="CATEGORIES">
        <Categories
          categoryItems={periodData.categoryItems}
          setCategoryItems={(newItems) =>
            setPeriodData({ ...periodData, categoryItems: newItems })
          }
          availableCategories={periodData.summaryItems.map(item => ({
            key: item.key,
            label: item.label
          }))}
        />
      </BudgetSection>
    </div>
  );
};

export default PayPeriod;
