import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import BudgetSummary from "@/components/BudgetSummary";
import BudgetGraphs from "@/components/BudgetGraphs";
import Categories from "@/components/Categories";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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

interface BudgetData {
  summaryData: SummaryData;
  categoryItems: CategoryItems;
  rollover: boolean;
}

interface Budget {
  id: string;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  created_by: string;
}

const PayPeriod = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData>({});
  const [categoryItems, setCategoryItems] = useState<CategoryItems>({});
  const [rollover, setRollover] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [permission, setPermission] = useState<"read" | "write">("read");
  
  // Load budget data from Supabase
  useEffect(() => {
    const fetchBudget = async () => {
      if (!id) return;
      setIsLoading(true);
      
      try {
        // Fetch budget details
        const { data: budgetData, error: budgetError } = await supabase
          .from("budgets")
          .select("*")
          .eq("id", id)
          .single();

        if (budgetError) throw budgetError;
        
        setBudget(budgetData);
        setIsOwner(budgetData.created_by === user?.id);
        
        // If not the owner, check permissions
        if (budgetData.created_by !== user?.id) {
          const { data: collabData, error: collabError } = await supabase
            .from("collaborators")
            .select("permission")
            .eq("budget_id", id)
            .eq("user_id", user?.id)
            .single();
            
          if (collabError) {
            // If not a collaborator, redirect to home
            navigate("/");
            return;
          }
          
          setPermission(collabData.permission as "read" | "write");
        } else {
          setPermission("write"); // Owner has write permission
        }

        // Fetch budget data (categories, summary, etc)
        const { data, error } = await supabase
          .from("budget_data")
          .select("data")
          .eq("budget_id", id)
          .single();

        if (error) {
          // If no data exists yet, create initial data
          const initialData: BudgetData = {
            summaryData: {
              rollover: { budget: 0, actual: 0 },
              income: { budget: 0, actual: 0 },
              savings: { budget: 0, actual: 0 },
              investments: { budget: 0, actual: 0 },
              bills: { budget: 0, actual: 0 },
              expenses: { budget: 0, actual: 0 },
              debt: { budget: 0, actual: 0 }
            },
            categoryItems: {
              income: [],
              savings: [],
              investments: [],
              bills: [],
              expenses: [],
              debt: []
            },
            rollover: false
          };
          
          const { error: insertError } = await supabase
            .from("budget_data")
            .insert({
              budget_id: id,
              data: initialData
            });
            
          if (insertError) throw insertError;
          
          setSummaryData(initialData.summaryData);
          setCategoryItems(initialData.categoryItems);
          setRollover(initialData.rollover);
        } else {
          // Use existing data
          const budgetData: BudgetData = data.data;
          setSummaryData(budgetData.summaryData || {});
          setCategoryItems(budgetData.categoryItems || {});
          setRollover(budgetData.rollover || false);
        }
      } catch (error) {
        console.error("Error fetching budget:", error);
        toast({
          title: "Error loading budget",
          description: "Could not load the budget data. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudget();
  }, [id, navigate, toast, user?.id]);

  // Save data to Supabase whenever it changes
  useEffect(() => {
    const saveBudgetData = async () => {
      if (!id || isLoading || permission === "read") return;
      
      try {
        const { error } = await supabase
          .from("budget_data")
          .update({
            data: {
              summaryData,
              categoryItems,
              rollover
            },
            updated_at: new Date().toISOString()
          })
          .eq("budget_id", id);
          
        if (error) throw error;
      } catch (error) {
        console.error("Error saving budget data:", error);
      }
    };
    
    // Debounce the save to reduce API calls
    const timeoutId = setTimeout(saveBudgetData, 1000);
    return () => clearTimeout(timeoutId);
  }, [summaryData, categoryItems, rollover, id, isLoading, permission]);

  // Calculate totals for graphs
  const totalIncome = summaryData.income?.budget || 0;
  const totalBudgeted = Object.entries(summaryData)
    .filter(([key]) => key !== "income" && key !== "rollover")
    .reduce((sum, [_, value]) => sum + value.budget, 0);
  const totalActual = Object.entries(summaryData)
    .filter(([key]) => key !== "income" && key !== "rollover")
    .reduce((sum, [_, value]) => sum + value.actual, 0);

  // Available categories for the Categories component
  const availableCategories = [
    { key: "income", label: "Income" },
    { key: "savings", label: "Savings" },
    { key: "investments", label: "Investments" },
    { key: "bills", label: "Bills" },
    { key: "expenses", label: "Expenses" },
    { key: "debt", label: "Debt" },
  ];

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Budgets
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{budget?.name}</h1>
          <p className="text-muted-foreground">{budget?.description}</p>
        </div>
        {permission === "read" && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            View only
          </div>
        )}
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="graphs">Graphs</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardContent className="pt-6">
              <BudgetSummary
                summaryData={summaryData}
                setSummaryData={permission === "write" ? setSummaryData : () => {}}
                rollover={rollover}
                setRollover={permission === "write" ? setRollover : () => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardContent className="pt-6">
              <Categories
                categoryItems={categoryItems}
                setCategoryItems={permission === "write" ? setCategoryItems : () => {}}
                availableCategories={availableCategories}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graphs">
          <Card>
            <CardContent className="pt-6">
              <BudgetGraphs
                totalIncome={totalIncome}
                totalBudgeted={totalBudgeted}
                totalActual={totalActual}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayPeriod;
