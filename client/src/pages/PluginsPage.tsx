import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "../components/layout/AdminLayout";
import PageHeader from "../components/dashboard/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Card, CardContent } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "../components/ui/dialog";
import { Loader2, Search, Info, Settings, Upload, X } from "lucide-react";

// Define Plugin type
interface Plugin {
  id: number;
  name: string;
  description: string;
  author: string;
  version: string;
  status: "active" | "inactive";
  settings?: Record<string, any>;
}

export default function PluginsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [configurePlugin, setConfigurePlugin] = useState<Plugin | null>(null);
  const [newPlugin, setNewPlugin] = useState<{name: string, file: File | null}>({
    name: "",
    file: null
  });
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // Simulate fetching plugins
  const { data: plugins, isLoading, refetch } = useQuery<Plugin[]>({
    queryKey: ["/api/admin/plugins"],
    queryFn: async () => {
      // Simulate API call with sample data
      return [
        {
          id: 1,
          name: "SEO Optimizer",
          description: "Optimize your posts for search engines",
          author: "CyberScribe Team",
          version: "1.2.0",
          status: "active" as const,
          settings: {
            metaDescription: true,
            autoKeywords: true,
            sitemapGeneration: false,
            seoScoring: true
          }
        },
        {
          id: 2,
          name: "Social Media Sharing",
          description: "Share your posts automatically on social media platforms",
          author: "CyberScribe Team",
          version: "1.0.3",
          status: "inactive" as const,
          settings: {
            platforms: ["twitter", "facebook"],
            autoShare: true,
            scheduleSharing: false
          }
        },
        {
          id: 3,
          name: "Code Syntax Highlighter",
          description: "Highlight code blocks in your posts with syntax colors",
          author: "CodeMasters",
          version: "2.1.1",
          status: "active" as const,
          settings: {
            theme: "cyberpunk",
            lineNumbers: true,
            highlightLines: true
          }
        }
      ];
    }
  });
  
  // Activate/deactivate mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: "active" | "inactive" }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id, status };
    },
    onSuccess: (data) => {
      toast({ 
        title: `Plugin ${data.status === "active" ? "activated" : "deactivated"}`,
        description: `The plugin has been ${data.status === "active" ? "activated" : "deactivated"} successfully.` 
      });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Action failed", 
        description: "There was a problem updating the plugin status.",
        variant: "destructive" 
      });
    },
  });
  
  // Plugin installation mutation
  const installMutation = useMutation({
    mutationFn: async (pluginData: {name: string, file: File | null}) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { ...pluginData, id: Math.floor(Math.random() * 1000) };
    },
    onSuccess: () => {
      toast({ title: "Plugin installed successfully" });
      setShowUploadDialog(false);
      setNewPlugin({ name: "", file: null });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Installation failed", 
        description: "There was a problem installing the plugin.",
        variant: "destructive" 
      });
    },
  });
  
  // Plugin deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async (pluginId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return pluginId;
    },
    onSuccess: () => {
      toast({ title: "Plugin deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Delete failed", 
        description: "There was a problem deleting the plugin.",
        variant: "destructive" 
      });
    },
  });
  
  // Toggle plugin status
  const handleTogglePlugin = (pluginId: number, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    toggleMutation.mutate({ id: pluginId, status: newStatus });
  };
  
  // Handle plugin delete
  const handleDeletePlugin = (pluginId: number) => {
    if (confirm("Are you sure you want to delete this plugin? This action cannot be undone.")) {
      deleteMutation.mutate(pluginId);
    }
  };
  
  // Handle plugin install
  const handleInstallPlugin = () => {
    if (!newPlugin.name.trim()) {
      toast({ 
        title: "Error", 
        description: "Plugin name is required.",
        variant: "destructive" 
      });
      return;
    }
    
    if (!newPlugin.file) {
      toast({ 
        title: "Error", 
        description: "Plugin file is required.",
        variant: "destructive" 
      });
      return;
    }
    
    installMutation.mutate(newPlugin);
  };
  
  // Filter plugins based on search query
  const filteredPlugins = plugins?.filter(plugin => 
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.author.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <AdminLayout title="Plugins">
      <PageHeader 
        title="Plugins" 
        description="Install and manage plugins to extend your blog's functionality"
      />
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative">
              <Input
                placeholder="Search plugins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-mutedText" />
            </div>
            
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Install New Plugin
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-neonBlue" />
            </div>
          ) : !filteredPlugins?.length ? (
            <div className="text-center py-8 text-mutedText">
              {searchQuery 
                ? "No plugins match your search query." 
                : "No plugins installed yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlugins.map((plugin) => (
                <Card key={plugin.id} className="border border-borderColor">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{plugin.name}</h3>
                        <p className="text-sm text-mutedText mb-4">{plugin.description}</p>
                        
                        <div className="text-xs text-mutedText flex flex-wrap gap-x-4 gap-y-1">
                          <span>Version: {plugin.version}</span>
                          <span>Author: {plugin.author}</span>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <Switch 
                          checked={plugin.status === "active"}
                          onCheckedChange={() => handleTogglePlugin(plugin.id, plugin.status)}
                          className="data-[state=checked]:bg-neonBlue"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-borderColor">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        plugin.status === "active" 
                          ? "bg-neonBlue/10 text-neonBlue" 
                          : "bg-mutedText/10 text-mutedText"
                      }`}>
                        {plugin.status === "active" ? "Active" : "Inactive"}
                      </span>
                      
                      <div>
                        {plugin.settings && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setConfigurePlugin(plugin)}
                            className="mr-1"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePlugin(plugin.id)}
                          className="text-dangerRed hover:text-dangerRed/80"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Plugin Settings Dialog */}
          <Dialog open={!!configurePlugin} onOpenChange={(open) => !open && setConfigurePlugin(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {configurePlugin?.name} Settings
                </DialogTitle>
                <DialogDescription>
                  Configure settings for {configurePlugin?.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                {configurePlugin?.settings && Object.entries(configurePlugin.settings).map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </label>
                      
                      {typeof value === 'boolean' ? (
                        <Switch 
                          checked={value}
                          className="data-[state=checked]:bg-neonBlue"
                        />
                      ) : typeof value === 'string' ? (
                        <Input 
                          value={value} 
                          className="max-w-[200px]" 
                        />
                      ) : Array.isArray(value) ? (
                        <div className="text-sm text-right">
                          {value.join(', ')}
                        </div>
                      ) : (
                        <div className="text-sm text-right">
                          {JSON.stringify(value)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-sm text-mutedText italic mt-4">
                  <Info className="h-4 w-4 inline mr-1" />
                  These settings are for demonstration purposes only.
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setConfigurePlugin(null)}>
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Upload Plugin Dialog */}
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Install New Plugin
                </DialogTitle>
                <DialogDescription>
                  Upload a plugin to extend your blog's functionality
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Plugin Name</label>
                  <Input
                    value={newPlugin.name}
                    onChange={(e) => setNewPlugin({...newPlugin, name: e.target.value})}
                    placeholder="Enter plugin name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Plugin File</label>
                  <div className="mt-1 border-2 border-dashed border-borderColor rounded-md px-6 py-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-mutedText mb-2" />
                    <p className="text-sm mb-2">
                      {newPlugin.file ? newPlugin.file.name : "Drag & drop your plugin file here"}
                    </p>
                    <p className="text-xs text-mutedText mb-3">
                      Supported formats: .zip
                    </p>
                    <Input
                      type="file"
                      accept=".zip"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewPlugin({...newPlugin, file: e.target.files[0]});
                        }
                      }}
                      className="hidden"
                      id="plugin-file"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById("plugin-file")?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadDialog(false);
                    setNewPlugin({ name: "", file: null });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInstallPlugin}
                  disabled={installMutation.isPending}
                >
                  {installMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Install Plugin
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 