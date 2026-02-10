import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StoreDetails from "./pages/StoreDetails";
import StorePickup from "./pages/StorePickup";
import MobileNav from "./components/MobileNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Index />} />
            <Route path="/stores/:storeId" element={<StoreDetails />} />
            <Route path="/stores/:storeId/pickup" element={<StorePickup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <MobileNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
