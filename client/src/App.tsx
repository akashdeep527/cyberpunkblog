import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";
import { AdsenseProvider } from "./hooks/use-adsense";
import NotFound from "./pages/not-found";
import DashboardPage from "./pages/DashboardPage";
import PostsPage from "./pages/PostsPage";
import EditPostPage from "./pages/EditPostPage";
import BlogPage from "./pages/BlogPage";
import SinglePostPage from "./pages/SinglePostPage";
import CategoryPage from "./pages/CategoryPage";
import AuthPage from "./pages/auth-page";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import MediaPage from "./pages/MediaPage";
import PagesPage from "./pages/PagesPage";
import CommentsPage from "./pages/CommentsPage";
import PluginsPage from "./pages/PluginsPage";
import AppearancePage from "./pages/AppearancePage";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={BlogPage} />
      <Route path="/post/:slug" component={SinglePostPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes - Protected */}
      <ProtectedRoute path="/admin" component={DashboardPage} />
      <ProtectedRoute path="/admin/posts" component={PostsPage} />
      <ProtectedRoute path="/admin/posts/new" component={EditPostPage} />
      <ProtectedRoute path="/admin/posts/:id/edit" component={EditPostPage} />
      <ProtectedRoute path="/admin/settings" component={SettingsPage} />
      <ProtectedRoute path="/admin/users" component={UsersPage} />
      <ProtectedRoute path="/admin/media" component={MediaPage} />
      <ProtectedRoute path="/admin/pages" component={PagesPage} />
      <ProtectedRoute path="/admin/comments" component={CommentsPage} />
      <ProtectedRoute path="/admin/plugins" component={PluginsPage} />
      <ProtectedRoute path="/admin/appearance" component={AppearancePage} />
      
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
