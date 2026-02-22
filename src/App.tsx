import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ErrorBoundary from "@/components/ErrorBoundary";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

/* ── Lazy-loaded pages (route-level code splitting) ── */
const Index = lazy(() => import("./pages/Index"));
const Registration = lazy(() => import("./pages/Registration"));
const Members = lazy(() => import("./pages/Members"));
const Board = lazy(() => import("./pages/Board"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Auth = lazy(() => import("./pages/Auth"));
const News = lazy(() => import("./pages/News"));
const CheckStatus = lazy(() => import("./pages/CheckStatus"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const AdminAnnouncements = lazy(() => import("./pages/AdminAnnouncements"));
const AdminMembers = lazy(() => import("./pages/AdminMembers"));
const AdminBoard = lazy(() => import("./pages/AdminBoard"));
const AdminSchedule = lazy(() => import("./pages/AdminSchedule"));
const AdminGallery = lazy(() => import("./pages/AdminGallery"));
const AdminContacts = lazy(() => import("./pages/AdminContacts"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const Statutes = lazy(() => import("./pages/Statutes"));
const FunZone = lazy(() => import("./pages/FunZone"));
const CricketLive = lazy(() => import("./pages/CricketLive"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, refetchOnWindowFocus: false },
  },
});

const PageSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<PageSpinner />}>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/members" element={<Members />} />
                    <Route path="/board" element={<Board />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/check-status" element={<CheckStatus />} />
                    <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
                    <Route path="/admin/announcements" element={<ProtectedRoute requireAdmin><AdminAnnouncements /></ProtectedRoute>} />
                    <Route path="/admin/members" element={<ProtectedRoute requireAdmin><AdminMembers /></ProtectedRoute>} />
                    <Route path="/admin/board" element={<ProtectedRoute requireAdmin><AdminBoard /></ProtectedRoute>} />
                    <Route path="/admin/schedule" element={<ProtectedRoute requireAdmin><AdminSchedule /></ProtectedRoute>} />
                    <Route path="/admin/gallery" element={<ProtectedRoute requireAdmin><AdminGallery /></ProtectedRoute>} />
                    <Route path="/admin/contacts" element={<ProtectedRoute requireAdmin><AdminContacts /></ProtectedRoute>} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/statutes" element={<Statutes />} />
                    <Route path="/fun" element={<FunZone />} />
                    <Route path="/cricket-live" element={<CricketLive />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
