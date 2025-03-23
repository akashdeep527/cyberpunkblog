import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Post, InsertPost, Category, Tag } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PostsContextType {
  posts: Post[] | undefined;
  isLoading: boolean;
  error: Error | null;
  categories: Category[] | undefined;
  tags: Tag[] | undefined;
  createPost: (post: InsertPost) => Promise<Post>;
  updatePost: (id: number, post: Partial<InsertPost>) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
}

const PostsContext = createContext<PostsContextType | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Fetch all posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts, 
    error: postsError 
  } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });
  
  // Fetch categories
  const { 
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch tags
  const { 
    data: tags,
    isLoading: isLoadingTags,
    error: tagsError
  } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (post: InsertPost) => {
      const res = await apiRequest("POST", "/api/admin/posts", post);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created",
        description: "The post has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, post }: { id: number; post: Partial<InsertPost> }) => {
      const res = await apiRequest("PUT", `/api/admin/posts/${id}`, post);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post updated",
        description: "The post has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update post: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Create post
  const createPost = async (post: InsertPost): Promise<Post> => {
    return await createPostMutation.mutateAsync(post);
  };
  
  // Update post
  const updatePost = async (id: number, post: Partial<InsertPost>): Promise<Post> => {
    return await updatePostMutation.mutateAsync({ id, post });
  };
  
  // Delete post
  const deletePost = async (id: number): Promise<void> => {
    await deletePostMutation.mutateAsync(id);
  };
  
  const isLoading = isLoadingPosts || isLoadingCategories || isLoadingTags;
  const error = postsError || categoriesError || tagsError;
  
  return (
    <PostsContext.Provider
      value={{
        posts,
        isLoading,
        error,
        categories,
        tags,
        createPost,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}
