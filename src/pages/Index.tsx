
import React, { useState } from "react";
import BudgetSection from "@/components/BudgetSection";
import DateRangePicker from "@/components/DateRangePicker";
import BudgetSummary from "@/components/BudgetSummary";
import Categories from "@/components/Categories";

interface CategoryItem {
  id: string;
  label: string;
  budget: number;
  actual: number;
}

const Index = () => {
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

  return (
    <div className="container py-8 max-w-4xl">
      <BudgetSection title="PAYCHECK PERIOD">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </BudgetSection>

      <BudgetSection title="SUMMARY">
        <BudgetSummary
          summaryData={summaryData}
          setSummaryData={setSummaryData}
          rollover={rollover}
          setRollover={setRollover}
        />
      </BudgetSection>

      <BudgetSection title="CATEGORIES">
        <Categories
          categoryItems={categoryItems}
          setCategoryItems={setCategoryItems}
        />
      </BudgetSection>
    </div>
  );
};

export default Index;
