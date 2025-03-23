import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "../components/layout/AdminLayout";
import PageHeader from "../components/dashboard/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "../components/ui/dialog";
import { 
  Loader2, PaintBucket, Upload, CheckCircle, 
  Monitor, LayoutGrid, Type, Palette, Image
} from "lucide-react";

// Define Theme type
interface Theme {
  id: number;
  name: string;
  description: string;
  author: string;
  version: string;
  screenshot: string;
  isCurrent: boolean;
}

// Define Settings type for theme customization
interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    sidebarPosition: "left" | "right";
    postLayout: "grid" | "list";
    showFeaturedImages: boolean;
    showAuthor: boolean;
    showDate: boolean;
    showReadTime: boolean;
  };
}

export default function AppearancePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("themes");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [themeFile, setThemeFile] = useState<File | null>(null);
  
  // Simulate fetching themes
  const { data: themes, isLoading: loadingThemes, refetch } = useQuery<Theme[]>({
    queryKey: ["/api/admin/themes"],
    queryFn: async () => {
      // Simulate API call with sample data
      return [
        {
          id: 1,
          name: "Cyberpunk Neon",
          description: "Default cyberpunk theme with neon accents",
          author: "CyberScribe Team",
          version: "1.0.0",
          screenshot: "https://via.placeholder.com/300x200/0f172a/22d3ee?text=Cyberpunk+Neon",
          isCurrent: true
        },
        {
          id: 2,
          name: "Midnight Hacker",
          description: "Dark theme with matrix-inspired typography",
          author: "Digital Arts",
          version: "1.2.1",
          screenshot: "https://via.placeholder.com/300x200/000000/00ff00?text=Midnight+Hacker",
          isCurrent: false
        },
        {
          id: 3,
          name: "Synthwave Dreams",
          description: "80s retro-futuristic design with gradients",
          author: "RetroWave Studios",
          version: "2.0.3",
          screenshot: "https://via.placeholder.com/300x200/2d1b69/f0427c?text=Synthwave+Dreams",
          isCurrent: false
        },
        {
          id: 4,
          name: "Minimal Tech",
          description: "Clean, minimalist design for tech-focused blogs",
          author: "TechMinimal",
          version: "1.1.0",
          screenshot: "https://via.placeholder.com/300x200/ffffff/333333?text=Minimal+Tech",
          isCurrent: false
        }
      ];
    }
  });
  
  // Simulate fetching theme settings
  const { data: settings, isLoading: loadingSettings } = useQuery<ThemeSettings>({
    queryKey: ["/api/admin/theme-settings"],
    queryFn: async () => {
      // Simulate API call with sample data
      return {
        colors: {
          primary: "#14b8a6",
          secondary: "#8b5cf6",
          background: "#0f172a",
          text: "#f8fafc",
          accent: "#22d3ee"
        },
        fonts: {
          heading: "Orbitron",
          body: "Inter"
        },
        layout: {
          sidebarPosition: "left",
          postLayout: "grid",
          showFeaturedImages: true,
          showAuthor: true,
          showDate: true,
          showReadTime: true
        }
      };
    }
  });
  
  // Activate theme mutation
  const activateThemeMutation = useMutation({
    mutationFn: async (themeId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return themeId;
    },
    onSuccess: () => {
      toast({ 
        title: "Theme activated",
        description: "The theme has been applied successfully." 
      });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Activation failed", 
        description: "There was a problem activating the theme.",
        variant: "destructive" 
      });
    },
  });
  
  // Upload theme mutation
  const uploadThemeMutation = useMutation({
    mutationFn: async (file: File) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { id: Math.floor(Math.random() * 1000), name: file.name.replace('.zip', '') };
    },
    onSuccess: () => {
      toast({ title: "Theme uploaded successfully" });
      setShowUploadDialog(false);
      setThemeFile(null);
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Upload failed", 
        description: "There was a problem uploading the theme.",
        variant: "destructive" 
      });
    },
  });
  
  // Settings update mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<ThemeSettings>) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newSettings;
    },
    onSuccess: () => {
      toast({ title: "Settings updated successfully" });
    },
    onError: () => {
      toast({ 
        title: "Update failed", 
        description: "There was a problem updating the settings.",
        variant: "destructive" 
      });
    },
  });
  
  // Handle theme activation
  const handleActivateTheme = (themeId: number) => {
    activateThemeMutation.mutate(themeId);
  };
  
  // Handle theme upload
  const handleUploadTheme = () => {
    if (!themeFile) {
      toast({ 
        title: "Error", 
        description: "Please select a theme file to upload.",
        variant: "destructive" 
      });
      return;
    }
    
    uploadThemeMutation.mutate(themeFile);
  };
  
  // Handle settings change
  const handleSettingsChange = (section: keyof ThemeSettings, key: string, value: any) => {
    if (settings) {
      const newSettings = {
        ...settings,
        [section]: {
          ...settings[section],
          [key]: value
        }
      };
      
      updateSettingsMutation.mutate({ [section]: { [key]: value } });
    }
  };
  
  return (
    <AdminLayout title="Appearance">
      <PageHeader 
        title="Appearance" 
        description="Customize your blog's themes and layout"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 w-full md:w-auto">
          <TabsTrigger value="themes" className="flex items-center">
            <PaintBucket className="h-4 w-4 mr-2" />
            Themes
          </TabsTrigger>
          <TabsTrigger value="customize" className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Customize
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="themes" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Available Themes</h3>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Theme
                </Button>
              </div>
              
              {loadingThemes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-neonBlue" />
                </div>
              ) : !themes?.length ? (
                <div className="text-center py-8 text-mutedText">
                  No themes available.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {themes.map((theme) => (
                    <div key={theme.id} className="border border-borderColor rounded-lg overflow-hidden">
                      <div className="aspect-video relative">
                        <img 
                          src={theme.screenshot} 
                          alt={theme.name} 
                          className="w-full h-full object-cover"
                        />
                        {theme.isCurrent && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="bg-neonBlue text-darkBg px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              Active Theme
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-base font-semibold mb-1">{theme.name}</h4>
                        <p className="text-sm text-mutedText mb-3">{theme.description}</p>
                        
                        <div className="text-xs text-mutedText flex items-center justify-between mb-4">
                          <span>By {theme.author}</span>
                          <span>v{theme.version}</span>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          variant={theme.isCurrent ? "outline" : "default"}
                          disabled={theme.isCurrent || activateThemeMutation.isPending}
                          onClick={() => handleActivateTheme(theme.id)}
                        >
                          {activateThemeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {theme.isCurrent ? "Current Theme" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customize" className="mt-0">
          <Card>
            <CardContent className="p-6">
              {loadingSettings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-neonBlue" />
                </div>
              ) : !settings ? (
                <div className="text-center py-8 text-mutedText">
                  Unable to load settings.
                </div>
              ) : (
                <div>
                  <Tabs defaultValue="colors" className="w-full">
                    <TabsList className="mb-6 w-full md:w-auto">
                      <TabsTrigger value="colors" className="flex items-center">
                        <Palette className="h-4 w-4 mr-2" />
                        Colors
                      </TabsTrigger>
                      <TabsTrigger value="typography" className="flex items-center">
                        <Type className="h-4 w-4 mr-2" />
                        Typography
                      </TabsTrigger>
                      <TabsTrigger value="layout" className="flex items-center">
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Layout
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="colors" className="mt-0">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(settings.colors).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <label className="text-sm font-medium capitalize">
                                {key} Color
                              </label>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="color"
                                  value={value}
                                  onChange={(e) => handleSettingsChange('colors', key, e.target.value)}
                                  className="w-12 h-12 p-1 cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={value}
                                  onChange={(e) => handleSettingsChange('colors', key, e.target.value)}
                                  className="font-mono"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="p-4 rounded-md" style={{backgroundColor: settings.colors.background}}>
                          <div className="flex flex-col gap-4">
                            <h4 
                              className="text-xl font-semibold" 
                              style={{color: settings.colors.primary}}
                            >
                              Preview Title
                            </h4>
                            <p 
                              className="text-base" 
                              style={{color: settings.colors.text}}
                            >
                              This is how your content will look with these colors. The main text uses your text color choice.
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                style={{
                                  backgroundColor: settings.colors.primary,
                                  color: settings.colors.background
                                }}
                              >
                                Primary Button
                              </Button>
                              <Button 
                                variant="outline"
                                style={{
                                  borderColor: settings.colors.secondary,
                                  color: settings.colors.secondary
                                }}
                              >
                                Secondary Button
                              </Button>
                            </div>
                            <div 
                              className="text-sm p-2 rounded" 
                              style={{
                                backgroundColor: settings.colors.accent,
                                color: settings.colors.background
                              }}
                            >
                              This uses your accent color
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="typography" className="mt-0">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Heading Font</label>
                            <Select 
                              value={settings.fonts.heading} 
                              onValueChange={(value) => handleSettingsChange('fonts', 'heading', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Orbitron">Orbitron</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Montserrat">Montserrat</SelectItem>
                                <SelectItem value="Raleway">Raleway</SelectItem>
                                <SelectItem value="Poppins">Poppins</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Body Font</label>
                            <Select 
                              value={settings.fonts.body} 
                              onValueChange={(value) => handleSettingsChange('fonts', 'body', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Inter">Inter</SelectItem>
                                <SelectItem value="Roboto">Roboto</SelectItem>
                                <SelectItem value="Open Sans">Open Sans</SelectItem>
                                <SelectItem value="Lato">Lato</SelectItem>
                                <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-md border border-borderColor">
                          <h3 className="text-2xl mb-2" style={{fontFamily: settings.fonts.heading}}>
                            Heading Font: {settings.fonts.heading}
                          </h3>
                          <p className="mb-3" style={{fontFamily: settings.fonts.body}}>
                            Body Font: {settings.fonts.body}. This is how your content will look with the selected fonts.
                            Good typography improves readability and user experience.
                          </p>
                          <h4 className="text-xl mb-2" style={{fontFamily: settings.fonts.heading}}>
                            Subheading Example
                          </h4>
                          <p style={{fontFamily: settings.fonts.body}}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
                            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="layout" className="mt-0">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Sidebar Position</label>
                            <Select 
                              value={settings.layout.sidebarPosition} 
                              onValueChange={(value: "left" | "right") => handleSettingsChange('layout', 'sidebarPosition', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Post Layout</label>
                            <Select 
                              value={settings.layout.postLayout} 
                              onValueChange={(value: "grid" | "list") => handleSettingsChange('layout', 'postLayout', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grid">Grid</SelectItem>
                                <SelectItem value="list">List</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Post Display Options</h4>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm">Show Featured Images</label>
                              <Switch 
                                checked={settings.layout.showFeaturedImages}
                                onCheckedChange={(checked) => handleSettingsChange('layout', 'showFeaturedImages', checked)}
                                className="data-[state=checked]:bg-neonBlue"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label className="text-sm">Show Author</label>
                              <Switch 
                                checked={settings.layout.showAuthor}
                                onCheckedChange={(checked) => handleSettingsChange('layout', 'showAuthor', checked)}
                                className="data-[state=checked]:bg-neonBlue"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label className="text-sm">Show Date</label>
                              <Switch 
                                checked={settings.layout.showDate}
                                onCheckedChange={(checked) => handleSettingsChange('layout', 'showDate', checked)}
                                className="data-[state=checked]:bg-neonBlue"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label className="text-sm">Show Read Time</label>
                              <Switch 
                                checked={settings.layout.showReadTime}
                                onCheckedChange={(checked) => handleSettingsChange('layout', 'showReadTime', checked)}
                                className="data-[state=checked]:bg-neonBlue"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-borderColor">
                          <div className="relative border border-borderColor rounded-lg p-4 aspect-video bg-darkBg">
                            <div className={`flex ${settings.layout.sidebarPosition === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
                              <div className="w-1/4 bg-card p-2 rounded">
                                <div className="h-6 w-full bg-neonBlue/20 rounded mb-2"></div>
                                <div className="h-4 w-3/4 bg-neonBlue/10 rounded mb-2"></div>
                                <div className="h-4 w-3/4 bg-neonBlue/10 rounded mb-2"></div>
                                <div className="h-4 w-3/4 bg-neonBlue/10 rounded mb-2"></div>
                              </div>
                              
                              <div className="flex-1 ml-4 mr-4">
                                <div className="mb-6">
                                  <div className="h-6 w-3/4 bg-neonBlue/20 rounded mb-2"></div>
                                  <div className="h-4 w-1/2 bg-neonBlue/10 rounded"></div>
                                </div>
                                
                                <div className={settings.layout.postLayout === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                                  {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className={`${settings.layout.postLayout === 'grid' ? '' : 'flex gap-4'}`}>
                                      {settings.layout.showFeaturedImages && (
                                        <div className={`${settings.layout.postLayout === 'grid' ? 'w-full' : 'w-1/4'} aspect-video bg-neonBlue/10 rounded flex items-center justify-center mb-2`}>
                                          <Image className="h-6 w-6 text-neonBlue/30" />
                                        </div>
                                      )}
                                      <div className={settings.layout.postLayout === 'grid' ? '' : 'flex-1'}>
                                        <div className="h-4 w-full bg-neonBlue/20 rounded mb-2"></div>
                                        <div className="flex gap-2 mb-2">
                                          {settings.layout.showAuthor && <div className="h-3 w-20 bg-neonBlue/10 rounded"></div>}
                                          {settings.layout.showDate && <div className="h-3 w-24 bg-neonBlue/10 rounded"></div>}
                                          {settings.layout.showReadTime && <div className="h-3 w-16 bg-neonBlue/10 rounded"></div>}
                                        </div>
                                        <div className="h-3 w-full bg-neonBlue/10 rounded"></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-mutedText text-center mt-2">Layout preview</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Upload Theme Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Theme
            </DialogTitle>
            <DialogDescription>
              Upload a new theme for your blog
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="border-2 border-dashed border-borderColor rounded-md px-6 py-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-mutedText mb-2" />
              <p className="text-sm mb-2">
                {themeFile ? themeFile.name : "Drag & drop your theme file here"}
              </p>
              <p className="text-xs text-mutedText mb-3">
                Supported formats: .zip
              </p>
              <Input
                type="file"
                accept=".zip"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setThemeFile(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="theme-file"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => document.getElementById("theme-file")?.click()}
              >
                Select File
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadDialog(false);
                setThemeFile(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadTheme}
              disabled={uploadThemeMutation.isPending || !themeFile}
            >
              {uploadThemeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Upload Theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 