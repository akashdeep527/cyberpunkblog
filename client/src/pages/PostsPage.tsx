import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { Post } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash, 
  Eye, 
  Plus, 
  Search, 
  Calendar, 
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function PostsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch posts
  const { 
    data: posts, 
    isLoading, 
    error 
  } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });
  
  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("DELETE", `/api/admin/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleDeletePost = (postId: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };
  
  // Filter posts based on search query
  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Generate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <div className="flex items-center gap-1 text-neonGreen">
            <CheckCircle className="h-4 w-4" />
            <span>Published</span>
          </div>
        );
      case "draft":
        return (
          <div className="flex items-center gap-1 text-warningYellow">
            <AlertCircle className="h-4 w-4" />
            <span>Draft</span>
          </div>
        );
      case "scheduled":
        return (
          <div className="flex items-center gap-1 text-neonBlue">
            <Calendar className="h-4 w-4" />
            <span>Scheduled</span>
          </div>
        );
      default:
        return status;
    }
  };
  
  // Generate visibility badge
  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return (
          <div className="flex items-center gap-1 text-mutedText">
            <Eye className="h-4 w-4" />
            <span>Public</span>
          </div>
        );
      case "private":
        return (
          <div className="flex items-center gap-1 text-mutedText">
            <Lock className="h-4 w-4" />
            <span>Private</span>
          </div>
        );
      case "password":
        return (
          <div className="flex items-center gap-1 text-mutedText">
            <Lock className="h-4 w-4" />
            <span>Password</span>
          </div>
        );
      default:
        return visibility;
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout title="Posts">
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-neonBlue animate-spin" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout title="Posts">
        <div className="text-center py-8 text-dangerRed">
          <p>Error loading posts. Please try again later.</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Posts">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-darkBg border border-neonBlue/30 rounded py-1 px-3 text-sm text-cyberText placeholder-mutedText focus:border-neonBlue focus:shadow-neon-blue pr-8"
          />
          <Search className="h-4 w-4 absolute right-3 top-2 text-mutedText" />
        </div>
        
        <Link href="/admin/posts/new">
          <Button className="bg-neonPink text-white hover:bg-neonPink/80">
            <Plus className="h-4 w-4 mr-1" /> New Post
          </Button>
        </Link>
      </div>
      
      {filteredPosts?.length === 0 ? (
        <div className="text-center p-10 bg-darkerBg rounded-lg border border-neonBlue/30">
          <p className="text-mutedText mb-4">No posts found.</p>
          <Link href="/admin/posts/new">
            <Button className="bg-neonPink text-white hover:bg-neonPink/80">
              <Plus className="h-4 w-4 mr-1" /> Create Your First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-darkerBg rounded-lg border border-neonBlue/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-darkBg/50 border-b border-neonBlue/30">
                <TableHead className="text-neonBlue">Title</TableHead>
                <TableHead className="text-neonBlue">Status</TableHead>
                <TableHead className="text-neonBlue">Visibility</TableHead>
                <TableHead className="text-neonBlue">Date</TableHead>
                <TableHead className="text-neonBlue text-center">Views</TableHead>
                <TableHead className="text-neonBlue text-center">Comments</TableHead>
                <TableHead className="text-neonBlue text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts?.map((post) => (
                <TableRow key={post.id} className="hover:bg-darkBg/50 border-b border-neonBlue/30">
                  <TableCell className="font-chakra">
                    <div className="flex items-center">
                      {post.featuredImage ? (
                        <img 
                          src={post.featuredImage} 
                          alt={post.title} 
                          className="w-10 h-10 object-cover rounded mr-3" 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-darkBg rounded mr-3 flex items-center justify-center text-mutedText">
                          <Eye className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <Link href={`/admin/posts/${post.id}/edit`} className="hover:text-neonPink transition-colors">
                          {post.title}
                        </Link>
                        <p className="text-xs text-mutedText truncate max-w-[250px]">
                          {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 50) + '...'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>{getVisibilityBadge(post.visibility)}</TableCell>
                  <TableCell className="text-mutedText">{format(new Date(post.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-center font-tech">{post.views}</TableCell>
                  <TableCell className="text-center font-tech">
                    <div className="flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 mr-1 text-mutedText" />
                      <span>0</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Link href={`/post/${post.slug}`} target="_blank">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-mutedText hover:text-neonBlue hover:bg-darkBg"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-mutedText hover:text-neonBlue hover:bg-darkBg"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-mutedText hover:text-dangerRed hover:bg-darkBg"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletePostMutation.isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
