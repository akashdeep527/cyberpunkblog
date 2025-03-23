import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { AdsenseProvider } from "@/hooks/use-adsense";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/DashboardPage";
import PostsPage from "@/pages/PostsPage";
import EditPostPage from "@/pages/EditPostPage";
import BlogPage from "@/pages/BlogPage";
import SinglePostPage from "@/pages/SinglePostPage";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={BlogPage} />
      <Route path="/post/:slug" component={SinglePostPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes - Protected */}
      <ProtectedRoute path="/admin" component={DashboardPage} />
      <ProtectedRoute path="/admin/posts" component={PostsPage} />
      <ProtectedRoute path="/admin/posts/new" component={EditPostPage} />
      <ProtectedRoute path="/admin/posts/:id/edit" component={EditPostPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AdsenseProvider>
            <Router />
            <Toaster />
          </AdsenseProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
