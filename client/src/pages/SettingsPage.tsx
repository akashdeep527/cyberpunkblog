import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient } from "../lib/queryClient";
import DashboardLayout from "../components/layout/DashboardLayout";
import PageHeader from "../components/dashboard/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Loader2, Save } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // Sample settings state - ideally these would come from an API
  const [blogTitle, setBlogTitle] = useState("NeonPulse");
  const [blogDescription, setBlogDescription] = useState("Exploring the digital frontier since 2023");
  const [enableComments, setEnableComments] = useState(true);
  const [enableAdsense, setEnableAdsense] = useState(false);
  const [adsenseCode, setAdsenseCode] = useState("");
  
  // Mock mutation for saving settings
  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveGeneral = () => {
    saveSettings({
      blogTitle,
      blogDescription,
      enableComments,
    });
  };
  
  const handleSaveAdsense = () => {
    saveSettings({
      enableAdsense,
      adsenseCode,
    });
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Settings" 
        description="Configure your blog settings"
      />
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="adsense">Adsense</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic blog settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blogTitle">Blog Title</Label>
                <Input 
                  id="blogTitle" 
                  value={blogTitle} 
                  onChange={(e) => setBlogTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blogDescription">Blog Description</Label>
                <Input 
                  id="blogDescription" 
                  value={blogDescription} 
                  onChange={(e) => setBlogDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enableComments" 
                  checked={enableComments} 
                  onCheckedChange={(checked) => setEnableComments(checked as boolean)}
                />
                <Label htmlFor="enableComments">Enable comments on posts</Label>
              </div>
              <Button onClick={handleSaveGeneral} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="adsense">
          <Card>
            <CardHeader>
              <CardTitle>Adsense Settings</CardTitle>
              <CardDescription>
                Configure Google Adsense for your blog
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enableAdsense" 
                  checked={enableAdsense} 
                  onCheckedChange={(checked) => setEnableAdsense(checked as boolean)}
                />
                <Label htmlFor="enableAdsense">Enable Google Adsense</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adsenseCode">Adsense Publisher ID</Label>
                <Input 
                  id="adsenseCode" 
                  value={adsenseCode} 
                  onChange={(e) => setAdsenseCode(e.target.value)}
                  placeholder="ca-pub-1234567890123456"
                />
              </div>
              <Button onClick={handleSaveAdsense} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Adsense Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced blog settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-mutedText">Advanced settings will be implemented in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
} 