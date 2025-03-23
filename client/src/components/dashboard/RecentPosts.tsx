import { Post } from "@shared/schema";
import { format } from "date-fns";
import { Edit, Trash, Calendar, Eye, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import CyberBorder from "@/components/shared/CyberBorder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RecentPostsProps {
  posts: Post[];
}

export default function RecentPosts({ posts }: RecentPostsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
  
  return (
    <CyberBorder className="lg:col-span-2 rounded-lg bg-darkBg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-orbitron text-xl text-neonBlue">Recent Posts</h2>
        <Link href="/admin/posts">
          <a className="text-neonPink text-sm hover:text-neonPink/80 transition-all duration-200">
            View All <span className="ml-1">→</span>
          </a>
        </Link>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center p-6 text-mutedText">
          <p>No posts yet. Create your first post!</p>
          <Link href="/admin/posts/new">
            <a className="text-neonPink hover:text-neonPink/80 mt-2 inline-block">
              Create Post
            </a>
          </Link>
        </div>
      ) : (
        posts.slice(0, 5).map((post) => (
          <div key={post.id} className="border-b border-neonBlue/20 pb-4 mb-4 last:border-0">
            <div className="flex items-start">
              {post.featuredImage ? (
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-20 h-14 object-cover rounded mr-3" 
                />
              ) : (
                <div className="w-20 h-14 bg-darkerBg rounded mr-3 flex items-center justify-center text-mutedText">
                  <Eye className="h-6 w-6" />
                </div>
              )}
              
              <div>
                <Link href={`/admin/posts/${post.id}`}>
                  <h3 className="font-chakra font-semibold hover:text-neonPink transition-all duration-200 cursor-pointer">
                    {post.title}
                  </h3>
                </Link>
                
                <div className="flex items-center mt-1 text-xs text-mutedText">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> 
                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                  </span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" /> 
                    <span>{post.views}</span>
                  </span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" /> 
                    <span>0</span>
                  </span>
                </div>
              </div>
              
              <div className="ml-auto flex">
                <Link href={`/admin/posts/${post.id}/edit`}>
                  <button 
                    className="text-mutedText hover:text-neonBlue transition-all duration-200 mr-2" 
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </Link>
                
                <button 
                  className="text-mutedText hover:text-dangerRed transition-all duration-200" 
                  title="Delete"
                  onClick={() => handleDeletePost(post.id)}
                  disabled={deletePostMutation.isPending}
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </CyberBorder>
  );
}
