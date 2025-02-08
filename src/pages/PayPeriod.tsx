import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BudgetSection from "@/components/BudgetSection";
import DateRangePicker from "@/components/DateRangePicker";
import BudgetSummary from "@/components/BudgetSummary";
import Categories from "@/components/Categories";
import BudgetGraphs from "@/components/BudgetGraphs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CategoryItem {
  id: string;
  label: string;
  budget: number;
  actual: number;
}

interface PeriodData {
  startDate: Date | undefined;
  endDate: Date | undefined;
  summaryData: {
    rollover: { budget: number; actual: number };
    income: { budget: number; actual: number };
    savings: { budget: number; actual: number };
    bills: { budget: number; actual: number };
    expenses: { budget: number; actual: number };
    debt: { budget: number; actual: number };
  };
  categoryItems: {
    income: CategoryItem[];
    savings: CategoryItem[];
    bills: CategoryItem[];
    expenses: CategoryItem[];
    debt: CategoryItem[];
  };
  rollover: boolean;
}

const PayPeriod = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [periodData, setPeriodData] = useState<PeriodData>(() => {
    const savedData = localStorage.getItem(`period_${id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData, (key, value) => {
        if (key === "startDate" || key === "endDate") {
          return value ? new Date(value) : undefined;
        }
        return value;
      });
      return parsed;
    }
    return {
      startDate: undefined,
      endDate: undefined,
      summaryData: {
        rollover: { budget: 0, actual: 0 },
        income: { budget: 0, actual: 0 },
        savings: { budget: 0, actual: 0 },
        bills: { budget: 0, actual: 0 },
        expenses: { budget: 0, actual: 0 },
        debt: { budget: 0, actual: 0 },
      },
      categoryItems: {
        income: [],
        savings: [],
        bills: [],
        expenses: [],
        debt: [],
      },
      rollover: false,
    };
  });

  useEffect(() => {
    localStorage.setItem(`period_${id}`, JSON.stringify(periodData));
  }, [periodData, id]);

  const calculateTotals = () => {
    const income = periodData.summaryData.income;
    const totalIncome = income.budget;
    
    const totalBudgeted = Object.entries(periodData.summaryData)
      .filter(([key]) => key !== 'income' && key !== 'rollover')
      .reduce((sum, [_, value]) => sum + value.budget, 0);
    
    const totalActual = Object.entries(periodData.summaryData)
      .filter(([key]) => key !== 'income' && key !== 'rollover')
      .reduce((sum, [_, value]) => sum + value.actual, 0);

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

      <BudgetSection title="PAYCHECK PERIOD">
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
          summaryData={periodData.summaryData}
          setSummaryData={(newData) =>
            setPeriodData({ ...periodData, summaryData: newData })
          }
          rollover={periodData.rollover}
          setRollover={(value) =>
            setPeriodData({ ...periodData, rollover: value })
          }
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
        />
      </BudgetSection>
    </div>
  );
};

export default PayPeriod;
