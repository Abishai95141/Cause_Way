import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Product UI imports
import { ThemeProvider } from "@/product-ui/lib/theme";
import { AppLayout } from "@/product-ui/components/layout/app-layout";
import { DashboardPage } from "@/product-ui/pages/dashboard";
import { DocumentsPage } from "@/product-ui/pages/documents";
import { WorldModelBuilderPage } from "@/product-ui/pages/world-model-builder";
import { ModelExplorerPage } from "@/product-ui/pages/model-explorer";
import { DecisionSupportPage } from "@/product-ui/pages/decision-support";
import { ApprovalReviewPage } from "@/product-ui/pages/approval-review";
import { SettingsPage } from "@/product-ui/pages/settings";
import { BridgesPage } from "@/product-ui/pages/bridges";
import { AdminPage } from "@/product-ui/pages/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<Index />} />
            
            {/* Product UI routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="builder" element={<WorldModelBuilderPage />} />
              <Route path="explorer" element={<ModelExplorerPage />} />
              <Route path="decisions" element={<DecisionSupportPage />} />
              <Route path="bridges" element={<BridgesPage />} />
              <Route path="approval" element={<ApprovalReviewPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
