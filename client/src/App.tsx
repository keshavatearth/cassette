import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import EntryPage from "@/pages/EntryPage";
import LibraryPage from "@/pages/LibraryPage";
import ReflectionsPage from "@/pages/ReflectionsPage";
import DiscoverPage from "@/pages/DiscoverPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Don't render anything while checking auth status
  if (isLoading) {
    return null;
  }

  // If user is not authenticated and not on login/signup page, redirect to login
  if (!isAuthenticated && !location.startsWith("/login") && !location.startsWith("/signup")) {
    window.location.href = "/login";
    return null;
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignUpPage} />

      {/* Protected routes wrapped in Layout */}
      {isAuthenticated && (
        <>
          <Route path="/">
            {() => <Layout><HomePage /></Layout>}
          </Route>
          <Route path="/entry/:slug">
            {({ slug }) => <Layout><EntryPage slug={slug} /></Layout>}
          </Route>
          <Route path="/library">
            {() => <Layout><LibraryPage /></Layout>}
          </Route>
          <Route path="/reflections">
            {() => <Layout><ReflectionsPage /></Layout>}
          </Route>
          <Route path="/discover">
            {() => <Layout><DiscoverPage /></Layout>}
          </Route>
          <Route path="/notifications">
            {() => <Layout><NotificationsPage /></Layout>}
          </Route>
          <Route path="/settings">
            {() => <Layout><SettingsPage /></Layout>}
          </Route>
        </>
      )}

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
