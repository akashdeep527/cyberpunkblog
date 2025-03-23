import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Advert } from "@shared/schema";
import CyberBorder from "@/components/shared/CyberBorder";
import ToggleSwitch from "@/components/shared/ToggleSwitch";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdSenseManagementProps {
  adverts: Advert[];
  revenue: number;
}

export default function AdSenseManagement({ adverts, revenue }: AdSenseManagementProps) {
  const [timeframe, setTimeframe] = useState("7");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const toggleAdvertMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      return apiRequest("PUT", `/api/admin/adverts/${id}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/adverts"] });
      toast({
        title: "Ad unit updated",
        description: "Ad unit status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update ad unit: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleToggleAdvert = (id: number, enabled: boolean) => {
    toggleAdvertMutation.mutate({ id, enabled });
  };
  
  // Format dollar amount
  const formatRevenue = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };
  
  return (
    <CyberBorder className="rounded-lg bg-darkBg p-6">
      <h2 className="font-orbitron text-xl text-neonBlue mb-4">AdSense Management</h2>
      
      <div className="bg-darkerBg rounded p-4 mb-4 border border-neonPurple/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-neonPurple">Ad Performance</h3>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="bg-darkBg border border-neonPurple/30 rounded text-xs h-7 w-32">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-darkerBg border border-neonPurple/30">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="365">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-mutedText">Impressions</span>
            <span className="text-sm font-tech">28,493</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-mutedText">Clicks</span>
            <span className="text-sm font-tech">347</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-mutedText">CTR</span>
            <span className="text-sm font-tech">1.22%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-mutedText">Revenue</span>
            <span className="text-sm font-tech text-neonGreen">{formatRevenue(revenue)}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-orbitron text-neonPink text-sm uppercase mb-2">Ad Units</h3>
        
        {adverts.map((advert) => (
          <div key={advert.id} className="bg-darkerBg rounded p-3 mb-2 border border-neonBlue/30 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">{advert.name}</p>
              <p className="text-xs text-mutedText">{advert.size}</p>
            </div>
            <div className="flex items-center">
              <button className="text-xs bg-darkBg border border-neonBlue/30 py-1 px-2 rounded hover:bg-neonBlue/10 transition-all duration-200 mr-3">
                Edit
              </button>
              <ToggleSwitch 
                id={`ad-toggle-${advert.id}`}
                checked={advert.enabled}
                onChange={(checked) => handleToggleAdvert(advert.id, checked)}
                disabled={toggleAdvertMutation.isPending}
              />
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full bg-neonPurple/20 text-neonPurple py-2 rounded flex items-center justify-center hover:bg-neonPurple/30 transition-all duration-200">
        <Plus className="h-4 w-4 mr-2" /> Add New Ad Unit
      </button>
    </CyberBorder>
  );
}
