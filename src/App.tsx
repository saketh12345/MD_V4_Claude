
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FeaturesPage from "./pages/FeaturesPage";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ChooseAccountType from "./pages/ChooseAccountType";
import PatientLogin from "./pages/PatientLogin";
import CenterLogin from "./pages/CenterLogin";
import PatientSignup from "./pages/PatientSignup";
import CenterSignup from "./pages/CenterSignup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/choose-account" element={<ChooseAccountType />} />
          <Route path="/patient-login" element={<PatientLogin />} />
          <Route path="/center-login" element={<CenterLogin />} />
          <Route path="/patient-signup" element={<PatientSignup />} />
          <Route path="/center-signup" element={<CenterSignup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
