import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "../components/layout/AdminLayout";
import PageHeader from "../components/dashboard/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { Loader2, Search, Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

// Define Page type
interface Page {
  id: number;
  title: string;
  slug: string;
  status: "published" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

export default function PagesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  
  // Simulate fetching pages
  const { data: pages, isLoading, refetch } = useQuery<Page[]>({
    queryKey: ["/api/admin/pages"],
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (pageId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return pageId;
    },
    onSuccess: () => {
      toast({ title: "Page deleted successfully" });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Delete failed", 
        description: "There was a problem deleting the page.",
        variant: "destructive" 
      });
    },
  });
  
  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: "published" | "draft" }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id, status };
    },
    onSuccess: (data) => {
      toast({ 
        title: `Page ${data.status === "published" ? "published" : "unpublished"}`,
        description: data.status === "published" 
          ? "The page is now visible to visitors."
          : "The page is now hidden from visitors."
      });
      refetch();
    },
    onError: () => {
      toast({ 
        title: "Action failed", 
        description: "There was a problem updating the page status.",
        variant: "destructive" 
      });
    },
  });
  
  // Handle page delete
  const handleDelete = (pageId: number) => {
    if (confirm("Are you sure you want to delete this page?")) {
      deleteMutation.mutate(pageId);
    }
  };
  
  // Handle status toggle
  const handleToggleStatus = (page: Page) => {
    const newStatus = page.status === "published" ? "draft" : "published";
    toggleStatusMutation.mutate({ id: page.id, status: newStatus });
  };
  
  // Filter pages based on search query
  const filteredPages = pages?.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <AdminLayout title="Pages">
      <PageHeader 
        title="Pages" 
        description="Manage your static pages"
      >
        <Button onClick={() => setLocation("/admin/pages/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </PageHeader>
      
      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 pl-10"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-mutedText" />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-neonBlue" />
            </div>
          ) : !filteredPages?.length ? (
            <div className="text-center py-8 text-mutedText">
              {searchQuery 
                ? "No pages match your search query." 
                : "No pages found. Create your first page!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-mutedText">{page.slug}</TableCell>
                    <TableCell>
                      {page.status === "published" ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">Published</Badge>
                      ) : (
                        <Badge variant="outline" className="text-mutedText">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-mutedText">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleStatus(page)}
                        title={page.status === "published" ? "Unpublish" : "Publish"}
                        className="mr-1"
                      >
                        {page.status === "published" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                        title="View page"
                        className="mr-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setLocation(`/admin/pages/${page.id}/edit`)}
                        title="Edit page"
                        className="mr-1"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                        title="Delete page"
                      >
                        <Trash2 className="h-4 w-4 text-dangerRed" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
} 