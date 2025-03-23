import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Theme } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import CyberBorder from "@/components/shared/CyberBorder";
import { Settings, Trash, Plus } from "lucide-react";

interface ThemeManagementProps {
  themes: Theme[];
}

export default function ThemeManagement({ themes }: ThemeManagementProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const activateThemeMutation = useMutation({
    mutationFn: async (themeId: number) => {
      return apiRequest("PUT", `/api/admin/themes/${themeId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/themes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/theme"] });
      toast({
        title: "Theme activated",
        description: "The theme has been activated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to activate theme: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const deleteThemeMutation = useMutation({
    mutationFn: async (themeId: number) => {
      return apiRequest("DELETE", `/api/admin/themes/${themeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/themes"] });
      toast({
        title: "Theme deleted",
        description: "The theme has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete theme: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleActivateTheme = (themeId: number) => {
    activateThemeMutation.mutate(themeId);
  };
  
  const handleDeleteTheme = (themeId: number) => {
    if (window.confirm("Are you sure you want to delete this theme?")) {
      deleteThemeMutation.mutate(themeId);
    }
  };
  
  return (
    <CyberBorder className="rounded-lg bg-darkBg p-6 mb-8">
      <h2 className="font-orbitron text-xl text-neonBlue mb-4">Theme Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div 
            key={theme.id} 
            className={`bg-darkerBg rounded-lg overflow-hidden group ${theme.isActive ? 'border border-neonPink' : 'border border-neonBlue/30'}`}
          >
            <div className="relative">
              <img 
                src={theme.previewImage || "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5"} 
                alt={theme.name} 
                className="w-full h-40 object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darkerBg to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-3">
                <h3 className={`font-orbitron ${theme.isActive ? 'text-neonPink' : 'text-neonBlue'}`}>
                  {theme.name}
                </h3>
                <p className="text-xs text-mutedText">
                  {theme.isActive ? 'Active Theme' : 'Installed'}
                </p>
              </div>
              {theme.isActive && (
                <div className="absolute top-2 right-2 bg-neonPink text-xs text-white py-1 px-2 rounded">
                  Active
                </div>
              )}
            </div>
            <div className="p-3 flex justify-between items-center">
              {theme.isActive ? (
                <button className="text-xs bg-darkBg border border-neonBlue/30 py-1 px-2 rounded hover:bg-neonBlue/10 transition-all duration-200">
                  Customize
                </button>
              ) : (
                <button 
                  className="text-xs bg-neonBlue/20 text-neonBlue py-1 px-2 rounded hover:bg-neonBlue/30 transition-all duration-200"
                  onClick={() => handleActivateTheme(theme.id)}
                  disabled={activateThemeMutation.isPending}
                >
                  Activate
                </button>
              )}
              <div className="flex items-center">
                <button className="text-mutedText hover:text-neonBlue transition-all duration-200 mr-2" title="Settings">
                  <Settings className="h-4 w-4" />
                </button>
                {!theme.isActive && (
                  <button 
                    className="text-mutedText hover:text-dangerRed transition-all duration-200" 
                    title="Delete"
                    onClick={() => handleDeleteTheme(theme.id)}
                    disabled={deleteThemeMutation.isPending}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="bg-darkerBg rounded-lg border border-dashed border-neonBlue/30 flex flex-col items-center justify-center h-60 p-6 text-center">
          <Plus className="text-neonBlue text-3xl mb-3" />
          <h3 className="font-orbitron text-neonBlue mb-2">Add New Theme</h3>
          <p className="text-xs text-mutedText mb-3">Upload or search for new themes</p>
          <button className="bg-neonBlue/20 text-neonBlue text-sm py-1 px-3 rounded hover:bg-neonBlue/30 transition-all duration-200">
            Browse Themes
          </button>
        </div>
      </div>
    </CyberBorder>
  );
}
