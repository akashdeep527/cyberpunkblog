import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Advert, InsertAdvert } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface AdsenseContextType {
  adverts: Advert[] | undefined;
  isLoading: boolean;
  error: Error | null;
  createAdvert: (advert: InsertAdvert) => Promise<Advert>;
  updateAdvert: (id: number, advert: Partial<InsertAdvert>) => Promise<Advert>;
  deleteAdvert: (id: number) => Promise<void>;
  toggleAdvert: (id: number, enabled: boolean) => Promise<Advert>;
}

const AdsenseContext = createContext<AdsenseContextType | null>(null);

export function AdsenseProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Determine which API endpoint to use based on user
  const endpoint = user?.isAdmin ? "/api/admin/adverts" : "/api/adverts";
  
  // Fetch all adverts
  const { 
    data: adverts, 
    isLoading, 
    error 
  } = useQuery<Advert[]>({
    queryKey: [endpoint],
  });
  
  // Create advert mutation
  const createAdvertMutation = useMutation({
    mutationFn: async (advert: InsertAdvert) => {
      const res = await apiRequest("POST", "/api/admin/adverts", advert);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast({
        title: "Ad unit created",
        description: "The ad unit has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create ad unit: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update advert mutation
  const updateAdvertMutation = useMutation({
    mutationFn: async ({ id, advert }: { id: number; advert: Partial<InsertAdvert> }) => {
      const res = await apiRequest("PUT", `/api/admin/adverts/${id}`, advert);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast({
        title: "Ad unit updated",
        description: "The ad unit has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update ad unit: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete advert mutation
  const deleteAdvertMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/adverts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast({
        title: "Ad unit deleted",
        description: "The ad unit has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete ad unit: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Toggle advert status mutation
  const toggleAdvertMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/adverts/${id}`, { enabled });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      toast({
        title: "Ad unit updated",
        description: "The ad unit status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update ad unit status: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Create advert
  const createAdvert = async (advert: InsertAdvert): Promise<Advert> => {
    return await createAdvertMutation.mutateAsync(advert);
  };
  
  // Update advert
  const updateAdvert = async (id: number, advert: Partial<InsertAdvert>): Promise<Advert> => {
    return await updateAdvertMutation.mutateAsync({ id, advert });
  };
  
  // Delete advert
  const deleteAdvert = async (id: number): Promise<void> => {
    await deleteAdvertMutation.mutateAsync(id);
  };
  
  // Toggle advert status
  const toggleAdvert = async (id: number, enabled: boolean): Promise<Advert> => {
    return await toggleAdvertMutation.mutateAsync({ id, enabled });
  };
  
  return (
    <AdsenseContext.Provider
      value={{
        adverts,
        isLoading,
        error,
        createAdvert,
        updateAdvert,
        deleteAdvert,
        toggleAdvert,
      }}
    >
      {children}
    </AdsenseContext.Provider>
  );
}

export function useAdsense() {
  const context = useContext(AdsenseContext);
  if (!context) {
    throw new Error("useAdsense must be used within an AdsenseProvider");
  }
  return context;
}
