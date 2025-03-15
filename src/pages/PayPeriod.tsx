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

interface CategoryItems {
  [key: string]: CategoryItem[];
}

interface SummaryData {
  [key: string]: { budget: number; actual: number };
}

interface PeriodData {
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  summaryData: SummaryData;
  categoryItems: CategoryItems;
  rollover: boolean;
}

// Only include rollover as default
const DEFAULT_SUMMARY_DATA: SummaryData = {
  rollover: { budget: 0, actual: 0 }
};

// Empty array for default categories
const DEFAULT_CATEGORIES: string[] = [];

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
      
      // Ensure rollover exists
      const summaryData = parsed.summaryData || { rollover: { budget: 0, actual: 0 } };
      
      // Create empty categories object if not present
      const categoryItems = parsed.categoryItems || {};
      
      return {
        ...parsed,
        summaryData,
        categoryItems
      };
    }
    return {
      name: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      summaryData: DEFAULT_SUMMARY_DATA,
      categoryItems: {},
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
    // Find income in the summaryData if it exists
    const income = periodData.summaryData.income?.budget || 0;
    const totalIncome = income;
    
    const totalBudgeted = Object.entries(periodData.summaryData)
      .filter(([key]) => key !== 'income' && key !== 'rollover')
      .reduce((sum, [_, item]) => sum + item.budget, 0);
    
    const totalActual = Object.entries(periodData.summaryData)
      .filter(([key]) => key !== 'income' && key !== 'rollover')
      .reduce((sum, [_, item]) => sum + item.actual, 0);

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
        Back to Home
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

      {/* 1. DATE RANGE SECTION */}
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

      {/* 2. BUDGET OVERVIEW SECTION */}
      <BudgetSection title="BUDGET OVERVIEW">
        <BudgetGraphs {...calculateTotals()} />
      </BudgetSection>

      {/* 3 & 4. SUMMARY AND CATEGORIES SECTIONS - SIDE BY SIDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BudgetSection title="SUMMARY">
          <BudgetSummary
            summaryData={periodData.summaryData}
            setSummaryData={(newData) => {
              setPeriodData(prev => ({
                ...prev,
                summaryData: typeof newData === 'function' ? newData(prev.summaryData) : newData
              }));
            }}
            rollover={periodData.rollover}
            setRollover={(checked: boolean) => 
              setPeriodData(prev => ({ ...prev, rollover: checked }))
            }
          />
        </BudgetSection>

        <BudgetSection title="CATEGORIES">
          <Categories
            categoryItems={periodData.categoryItems}
            setCategoryItems={(newItems) =>
              setPeriodData(prev => ({
                ...prev,
                categoryItems: typeof newItems === 'function' ? newItems(prev.categoryItems) : newItems
              }))
            }
            availableCategories={Object.keys(periodData.summaryData).map(key => ({
              key,
              label: key.charAt(0).toUpperCase() + key.slice(1)
            }))}
          />
        </BudgetSection>
      </div>
    </div>
  );
};

export default PayPeriod;
