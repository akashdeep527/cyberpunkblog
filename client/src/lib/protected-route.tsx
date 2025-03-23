import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading, refreshUser } = useAuth();
  const [, navigate] = useLocation();

  // Force refetch user data when navigating to protected routes
  useEffect(() => {
    console.log("Protected route mounted:", path);
    refreshUser();
  }, [path, refreshUser]);
  
  // Debug authentication status
  useEffect(() => {
    if (!isLoading) {
      console.log(`Protected route ${path}: User authenticated:`, !!user, 
                  user ? `Admin: ${user.isAdmin}` : '');
    }
  }, [user, isLoading, path]);
  
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-darkBg">
          <Loader2 className="h-8 w-8 animate-spin text-neonBlue" />
        </div>
      </Route>
    );
  }

  if (!user) {
    console.log(`Access denied to ${path}: Not logged in`);
    // Store the current path to redirect back after login
    sessionStorage.setItem('lastAdminPage', path);
    
    return (
      <Route path={path}>
        <Redirect to="/auth?redirect=true" />
      </Route>
    );
  }
  
  // Check if user is admin for admin routes
  if (path.startsWith("/admin") && !user.isAdmin) {
    console.log(`Access denied to ${path}: Not admin`);
    
    return (
      <Route path={path}>
        <AccessDeniedPage />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}

// Separate component for access denied message
function AccessDeniedPage() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-darkBg">
      <h1 className="text-xl text-dangerRed mb-4">Access Denied</h1>
      <p className="text-mutedText mb-4">You don't have permission to access this area.</p>
      <p className="text-mutedText">Redirecting to home page...</p>
    </div>
  );
}
