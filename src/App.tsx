import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Registration from "./pages/Registration";
import Members from "./pages/Members";
import Board from "./pages/Board";
import Schedule from "./pages/Schedule";
import Gallery from "./pages/Gallery";
import Auth from "./pages/Auth";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminMembers from "./pages/AdminMembers";
import AdminBoard from "./pages/AdminBoard";
import AdminSchedule from "./pages/AdminSchedule";
import AdminGallery from "./pages/AdminGallery";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Statutes from "./pages/Statutes";
import FunZone from "./pages/FunZone";
import CricketLive from "./pages/CricketLive";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/registration" element={<Registration />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/board" element={<Board />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin/announcements" element={<ProtectedRoute requireAdmin><AdminAnnouncements /></ProtectedRoute>} />
                  <Route path="/admin/members" element={<ProtectedRoute requireAdmin><AdminMembers /></ProtectedRoute>} />
                  <Route path="/admin/board" element={<ProtectedRoute requireAdmin><AdminBoard /></ProtectedRoute>} />
                  <Route path="/admin/schedule" element={<ProtectedRoute requireAdmin><AdminSchedule /></ProtectedRoute>} />
                  <Route path="/admin/gallery" element={<ProtectedRoute requireAdmin><AdminGallery /></ProtectedRoute>} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/statutes" element={<Statutes />} />
                  <Route path="/fun" element={<FunZone />} />
                  <Route path="/cricket-live" element={<CricketLive />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
