
import React from "react";
import BudgetRow from "./BudgetRow";

interface SummaryData {
  rollover: { budget: number; actual: number };
  income: { budget: number; actual: number };
  savings: { budget: number; actual: number };
  bills: { budget: number; actual: number };
  expenses: { budget: number; actual: number };
  debt: { budget: number; actual: number };
}

interface BudgetSummaryProps {
  summaryData: SummaryData;
  setSummaryData: (data: SummaryData) => void;
  rollover: boolean;
  setRollover: (value: boolean) => void;
}

const BudgetSummary = ({
  summaryData,
  setSummaryData,
  rollover,
  setRollover,
}: BudgetSummaryProps) => {
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
  );
};

export default BudgetSummary;
