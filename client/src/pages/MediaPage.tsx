import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "../components/layout/AdminLayout";
import PageHeader from "../components/dashboard/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { Loader2, Search, UploadCloud, Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";

// Define Media type
interface Media {
  id: number;
  filename: string;
  url: string;
  filesize: number;
  type: string;
  uploadDate: Date;
}

export default function MediaPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Simulate fetching media
  const { data: mediaItems, isLoading, refetch } = useQuery<Media[]>({
    queryKey: ["/api/admin/media"],
  });
  
  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a fake media item
      const file = formData.get("file") as File;
      return {
        id: Date.now(),
        filename: file.name,
        url: URL.createObjectURL(file),
        filesize: file.size,
        type: file.type,
        uploadDate: new Date()
      };
    },
    onSuccess: () => {
      toast({ title: "File uploaded successfully" });
      setUploadDialogOpen(false);
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Upload failed", 
        description: "There was a problem uploading your file.",
        variant: "destructive" 
      });
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mediaId;
    },
    onSuccess: () => {
      toast({ title: "File deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Delete failed", 
        description: "There was a problem deleting the file.",
        variant: "destructive" 
      });
    },
  });
  
  // Handle file upload
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    if (!formData.get("file")) {
      toast({ 
        title: "No file selected", 
        description: "Please select a file to upload.",
        variant: "destructive" 
      });
      return;
    }
    
    uploadMutation.mutate(formData);
  };
  
  // Handle file delete
  const handleDelete = (mediaId: number) => {
    if (confirm("Are you sure you want to delete this file?")) {
      deleteMutation.mutate(mediaId);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };
  
  // Filter media based on search and active tab
  const filteredMedia = mediaItems?.filter(item => {
    // First filter by search query
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then filter by type
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "images") return matchesSearch && item.type.startsWith("image/");
    if (activeTab === "documents") return matchesSearch && (
      item.type.includes("pdf") || 
      item.type.includes("doc") || 
      item.type.includes("text") || 
      item.type.includes("excel") ||
      item.type.includes("sheet")
    );
    
    return matchesSearch;
  });
  
  return (
    <AdminLayout title="Media">
      <PageHeader 
        title="Media Library" 
        description="Manage your uploaded files and images"
      >
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <UploadCloud className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
              <DialogDescription>
                Select a file to upload to your media library.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUpload} className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-neonBlue/50 rounded-lg p-8 text-center">
                <input 
                  type="file" 
                  name="file" 
                  id="file" 
                  className="hidden" 
                />
                <label 
                  htmlFor="file" 
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <UploadCloud className="h-10 w-10 text-neonBlue mb-2" />
                  <p className="mb-1 font-medium">Click to select a file</p>
                  <p className="text-xs text-mutedText">or drag and drop</p>
                </label>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setUploadDialogOpen(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Upload
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="relative">
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-mutedText" />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-neonBlue" />
            </div>
          ) : !filteredMedia?.length ? (
            <div className="text-center py-20 text-mutedText">
              {searchQuery 
                ? "No files match your search query." 
                : "No media found. Upload some files to get started."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <div 
                  key={item.id} 
                  className="border border-neonBlue/20 rounded-lg overflow-hidden bg-darkerBg hover:border-neonBlue/50 transition-colors"
                >
                  <div className="h-32 bg-darkBg flex items-center justify-center relative group">
                    {item.type.startsWith("image/") ? (
                      <img 
                        src={item.url} 
                        alt={item.filename} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-mutedText">
                        <ImageIcon className="h-12 w-12 mb-2" />
                        <span className="text-xs uppercase">{item.type.split("/")[1]}</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-dangerRed" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <p className="font-medium text-sm truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <div className="flex justify-between items-center mt-1 text-xs text-mutedText">
                      <span>{formatFileSize(item.filesize)}</span>
                      <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 