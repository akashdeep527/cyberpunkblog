import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema, Post, Category, Tag } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import CyberBorder from "@/components/shared/CyberBorder";
import RichTextEditor from "@/components/editor/RichTextEditor";
import PostOptions from "@/components/editor/PostOptions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Extend the insert schema with validation
const postFormSchema = insertPostSchema.extend({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
});

// Infer the type from the schema
type PostFormValues = z.infer<typeof postFormSchema>;

interface PostEditorProps {
  post?: Post;
  categories: Category[];
  tags: Tag[];
  postCategories?: Category[];
  postTags?: Tag[];
}

export default function PostEditor({ 
  post, 
  categories,
  tags,
  postCategories = [],
  postTags = [] 
}: PostEditorProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(postCategories);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(postTags);
  const [featuredImage, setFeaturedImage] = useState<string | null>(post?.featuredImage || null);
  
  // Set up form with default values
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      featuredImage: post?.featuredImage || "",
      status: post?.status || "draft",
      visibility: post?.visibility || "public",
      authorId: post?.authorId || user?.id || 1,
    },
  });
  
  // Create or update post mutation
  const postMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      if (post) {
        // Update existing post
        return apiRequest("PUT", `/api/admin/posts/${post.id}`, data);
      } else {
        // Create new post
        return apiRequest("POST", "/api/admin/posts", data);
      }
    },
    onSuccess: async (response) => {
      const responseData = await response.json() as Post;
      
      // Manage categories and tags for the post
      if (selectedCategories.length > 0) {
        for (const category of selectedCategories) {
          if (!postCategories.some(c => c.id === category.id)) {
            await apiRequest("POST", `/api/admin/posts/${responseData.id}/categories/${category.id}`);
          }
        }
      }
      
      if (selectedTags.length > 0) {
        for (const tag of selectedTags) {
          if (!postTags.some(t => t.id === tag.id)) {
            await apiRequest("POST", `/api/admin/posts/${responseData.id}/tags/${tag.id}`);
          }
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: post ? "Post updated" : "Post created",
        description: post ? "The post has been updated successfully" : "The post has been created successfully",
      });
      
      navigate("/admin/posts");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${post ? "update" : "create"} post: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Save draft or publish post
  const onSubmit = (data: PostFormValues) => {
    // Include featured image if selected
    if (featuredImage) {
      data.featuredImage = featuredImage;
    }
    
    postMutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CyberBorder className="rounded-lg bg-darkBg p-6 mb-8">
          <h2 className="font-orbitron text-xl mb-4 text-neonBlue">
            {post ? "Edit Post" : "Create New Post"}
          </h2>
          
          <div className="mb-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Post Title" 
                      className="w-full bg-darkerBg border border-neonBlue/30 rounded-lg p-3 text-cyberText placeholder-mutedText focus:border-neonBlue focus:shadow-neon-blue"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RichTextEditor 
                    value={field.value} 
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Post Options Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <PostOptions
              form={form}
              categories={categories}
              tags={tags}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              featuredImage={featuredImage}
              setFeaturedImage={setFeaturedImage}
              isSubmitting={postMutation.isPending}
            />
          </div>
        </CyberBorder>
      </form>
    </Form>
  );
}
