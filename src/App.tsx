
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Rankings from "./pages/Rankings";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const FloatingRankingsLink = () => {
  const location = useLocation();
  const show = location.pathname !== "/rankings";
  if (!show) return null;
  return (
    <Link
      to="/rankings"
      className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow hover:opacity-90 transition-opacity"
    >
      Rankings
    </Link>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FloatingRankingsLink />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/rankings" element={<Rankings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
