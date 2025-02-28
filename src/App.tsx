
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PayPeriods from "./pages/PayPeriods";
import PayPeriod from "./pages/PayPeriod";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { CurrencyProvider } from "./contexts/CurrencyContext";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CurrencyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/periods" replace />} />
              <Route path="/periods" element={<PayPeriods />} />
              <Route path="/period/:id" element={<PayPeriod />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CurrencyProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
