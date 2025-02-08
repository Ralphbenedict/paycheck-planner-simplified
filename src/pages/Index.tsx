import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BudgetSection from "@/components/BudgetSection";
import BudgetRow from "@/components/BudgetRow";
import CategoryTab from "@/components/CategoryTab";
import { useToast } from "@/components/ui/use-toast";

interface CategoryItem {
  id: string;
  label: string;
  budget: number;
  actual: number;
}

const Index = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [rollover, setRollover] = useState(false);
  const [summaryData, setSummaryData] = useState({
    rollover: { budget: 0, actual: 0 },
    income: { budget: 0, actual: 0 },
    savings: { budget: 0, actual: 0 },
    bills: { budget: 0, actual: 0 },
    expenses: { budget: 0, actual: 0 },
    debt: { budget: 0, actual: 0 },
  });

  const [categoryItems, setCategoryItems] = useState({
    income: [] as CategoryItem[],
    savings: [] as CategoryItem[],
    bills: [] as CategoryItem[],
    expenses: [] as CategoryItem[],
    debt: [] as CategoryItem[],
  });

  const handleEndDateSelect = (date: Date) => {
    if (startDate && date < startDate) {
      toast({
        title: "Invalid Date Selection",
        description: "End date cannot be before start date",
        variant: "destructive",
      });
      return;
    }
    setEndDate(date);
  };

  const calculateSummaryTotals = () => {
    const budget =
      (rollover ? summaryData.rollover.budget : 0) +
      summaryData.income.budget -
      summaryData.savings.budget -
      summaryData.bills.budget -
      summaryData.expenses.budget -
      summaryData.debt.budget;

    const actual =
      (rollover ? summaryData.rollover.actual : 0) +
      summaryData.income.actual -
      summaryData.savings.actual -
      summaryData.bills.actual -
      summaryData.expenses.actual -
      summaryData.debt.actual;

    return { budget, actual };
  };

  return (
    <div className="container py-8 max-w-4xl">
      <BudgetSection title="PAYCHECK PERIOD">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </BudgetSection>

      <BudgetSection title="SUMMARY">
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-4"></div>
            <h3 className="col-span-4 text-right font-semibold">BUDGET</h3>
            <h3 className="col-span-4 text-right font-semibold">ACTUAL</h3>
          </div>

          <BudgetRow
            label="Rollover"
            budgetValue={summaryData.rollover.budget}
            actualValue={summaryData.rollover.actual}
            onBudgetChange={(value) =>
              setSummaryData({
                ...summaryData,
                rollover: { ...summaryData.rollover, budget: value },
              })
            }
            onActualChange={(value) =>
              setSummaryData({
                ...summaryData,
                rollover: { ...summaryData.rollover, actual: value },
              })
            }
            isCheckbox
            checked={rollover}
            onCheckChange={setRollover}
          />

          {Object.entries(summaryData)
            .filter(([key]) => key !== "rollover")
            .map(([key, value]) => (
              <BudgetRow
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                budgetValue={value.budget}
                actualValue={value.actual}
                onBudgetChange={(newValue) =>
                  setSummaryData({
                    ...summaryData,
                    [key]: { ...value, budget: newValue },
                  })
                }
                onActualChange={(newValue) =>
                  setSummaryData({
                    ...summaryData,
                    [key]: { ...value, actual: newValue },
                  })
                }
              />
            ))}

          <div className="border-t pt-4">
            <BudgetRow
              label="BALANCE"
              budgetValue={calculateSummaryTotals().budget}
              actualValue={calculateSummaryTotals().actual}
              onBudgetChange={() => {}}
              onActualChange={() => {}}
            />
          </div>
        </div>
      </BudgetSection>

      <BudgetSection title="CATEGORIES">
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
      </BudgetSection>
    </div>
  );
};

export default Index;