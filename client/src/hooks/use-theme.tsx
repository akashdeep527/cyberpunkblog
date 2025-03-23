import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Theme, InsertTheme } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface ThemeContextType {
  theme: Theme | undefined;
  allThemes: Theme[] | undefined;
  isLoading: boolean;
  error: Error | null;
  createTheme: (theme: InsertTheme) => Promise<Theme>;
  updateTheme: (id: number, theme: Partial<InsertTheme>) => Promise<Theme>;
  deleteTheme: (id: number) => Promise<void>;
  activateTheme: (id: number) => Promise<Theme>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch active theme
  const { 
    data: theme, 
    isLoading: isLoadingTheme, 
    error: themeError 
  } = useQuery<Theme>({
    queryKey: ["/api/theme"],
  });
  
  // Fetch all themes (admin only)
  const { 
    data: allThemes, 
    isLoading: isLoadingAllThemes, 
    error: allThemesError 
  } = useQuery<Theme[]>({
    queryKey: ["/api/admin/themes"],
    enabled: !!user?.isAdmin,
  });
  
  // Create theme mutation (admin only)
  const createThemeMutation = useMutation({
    mutationFn: async (theme: InsertTheme) => {
      const res = await apiRequest("POST", "/api/admin/themes", theme);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/themes"] });
      toast({
        title: "Theme created",
        description: "The theme has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create theme: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update theme mutation (admin only)
  const updateThemeMutation = useMutation({
    mutationFn: async ({ id, theme }: { id: number; theme: Partial<InsertTheme> }) => {
      const res = await apiRequest("PUT", `/api/admin/themes/${id}`, theme);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/themes"] });
      toast({
        title: "Theme updated",
        description: "The theme has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update theme: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete theme mutation (admin only)
  const deleteThemeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/themes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/themes"] });
      toast({
        title: "Theme deleted",
        description: "The theme has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete theme: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Activate theme mutation (admin only)
  const activateThemeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/admin/themes/${id}/activate`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/themes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/theme"] });
      toast({
        title: "Theme activated",
        description: "The theme has been activated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to activate theme: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Create theme
  const createTheme = async (theme: InsertTheme): Promise<Theme> => {
    return await createThemeMutation.mutateAsync(theme);
  };
  
  // Update theme
  const updateTheme = async (id: number, theme: Partial<InsertTheme>): Promise<Theme> => {
    return await updateThemeMutation.mutateAsync({ id, theme });
  };
  
  // Delete theme
  const deleteTheme = async (id: number): Promise<void> => {
    await deleteThemeMutation.mutateAsync(id);
  };
  
  // Activate theme
  const activateTheme = async (id: number): Promise<Theme> => {
    return await activateThemeMutation.mutateAsync(id);
  };
  
  const isLoading = isLoadingTheme || (user?.isAdmin && isLoadingAllThemes);
  const error = themeError || (user?.isAdmin && allThemesError);
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        allThemes,
        isLoading,
        error,
        createTheme,
        updateTheme,
        deleteTheme,
        activateTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
