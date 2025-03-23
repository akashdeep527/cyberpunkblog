import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import { ZodError } from "zod";
import {
  insertPostSchema,
  insertCategorySchema,
  insertTagSchema,
  insertCommentSchema,
  insertAdvertSchema,
  insertThemeSchema
} from "@shared/schema";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // Set up multer for file uploads (in-memory storage)
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  });
  
  // Middleware to validate request body with Zod schema
  const validateBody = (schema: any) => (req: any, res: any, next: any) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        next(error);
      }
    }
  };
  
  // Helper to create slug from title
  const createSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  };

  // ===== POSTS API =====
  
  // Get all posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  // Get post by ID
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(parseInt(req.params.id));
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });
  
  // Get post by slug
  app.get("/api/posts/slug/:slug", async (req, res) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count
      await storage.updatePost(post.id, { 
        ...post,
        views: post.views + 1 
      });
      
      // Also update global stats
      await storage.incrementViews(1);
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });
  
  // Create post (admin only)
  app.post("/api/admin/posts", validateBody(insertPostSchema), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user as Express.User;
      const postData = req.validatedBody;
      
      // Generate slug if not provided
      if (!postData.slug) {
        postData.slug = createSlug(postData.title);
      }
      
      // Generate excerpt if not provided
      if (!postData.excerpt && postData.content) {
        const plainText = postData.content.replace(/<[^>]*>/g, '');
        postData.excerpt = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
      }
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  // Update post (admin only)
  app.put("/api/admin/posts/:id", validateBody(insertPostSchema.partial()), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const postId = parseInt(req.params.id);
      const postData = req.validatedBody;
      
      // Generate slug if title was changed and slug not provided
      if (postData.title && !postData.slug) {
        postData.slug = createSlug(postData.title);
      }
      
      // Update excerpt if content changed
      if (postData.content && !postData.excerpt) {
        const plainText = postData.content.replace(/<[^>]*>/g, '');
        postData.excerpt = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
      }
      
      const updatedPost = await storage.updatePost(postId, postData);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });
  
  // Delete post (admin only)
  app.delete("/api/admin/posts/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const postId = parseInt(req.params.id);
      const success = await storage.deletePost(postId);
      
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });
  
  // ===== CATEGORIES API =====
  
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Create category (admin only)
  app.post("/api/admin/categories", validateBody(insertCategorySchema), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const categoryData = req.validatedBody;
      
      // Generate slug if not provided
      if (!categoryData.slug) {
        categoryData.slug = createSlug(categoryData.name);
      }
      
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  // Update category (admin only)
  app.put("/api/admin/categories/:id", validateBody(insertCategorySchema.partial()), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const categoryId = parseInt(req.params.id);
      const categoryData = req.validatedBody;
      
      // Generate slug if name was changed and slug not provided
      if (categoryData.name && !categoryData.slug) {
        categoryData.slug = createSlug(categoryData.name);
      }
      
      const updatedCategory = await storage.updateCategory(categoryId, categoryData);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  // Delete category (admin only)
  app.delete("/api/admin/categories/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const categoryId = parseInt(req.params.id);
      const success = await storage.deleteCategory(categoryId);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  // ===== TAGS API =====
  
  // Get all tags
  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });
  
  // Create tag (admin only)
  app.post("/api/admin/tags", validateBody(insertTagSchema), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const tagData = req.validatedBody;
      
      // Generate slug if not provided
      if (!tagData.slug) {
        tagData.slug = createSlug(tagData.name);
      }
      
      const tag = await storage.createTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      res.status(500).json({ message: "Failed to create tag" });
    }
  });
  
  // Update tag (admin only)
  app.put("/api/admin/tags/:id", validateBody(insertTagSchema.partial()), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const tagId = parseInt(req.params.id);
      const tagData = req.validatedBody;
      
      // Generate slug if name was changed and slug not provided
      if (tagData.name && !tagData.slug) {
        tagData.slug = createSlug(tagData.name);
      }
      
      const updatedTag = await storage.updateTag(tagId, tagData);
      if (!updatedTag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.json(updatedTag);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tag" });
    }
  });
  
  // Delete tag (admin only)
  app.delete("/api/admin/tags/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const tagId = parseInt(req.params.id);
      const success = await storage.deleteTag(tagId);
      
      if (!success) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.status(200).json({ message: "Tag deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tag" });
    }
  });
  
  // ===== POST-CATEGORY RELATION API =====
  
  // Get categories for a post
  app.get("/api/posts/:id/categories", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const categories = await storage.getCategoriesByPost(postId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories for post" });
    }
  });
  
  // Add category to post (admin only)
  app.post("/api/admin/posts/:postId/categories/:categoryId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const postId = parseInt(req.params.postId);
      const categoryId = parseInt(req.params.categoryId);
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const postCategory = await storage.addCategoryToPost({ postId, categoryId });
      res.status(201).json(postCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to add category to post" });
    }
  });
  
  // Remove category from post (admin only)
  app.delete("/api/admin/posts/:postId/categories/:categoryId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const postId = parseInt(req.params.postId);
      const categoryId = parseInt(req.params.categoryId);
      
      const success = await storage.removeCategoryFromPost(postId, categoryId);
      if (!success) {
        return res.status(404).json({ message: "Post-category relationship not found" });
      }
      
      res.status(200).json({ message: "Category removed from post successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove category from post" });
    }
  });
  
  // ===== POST-TAG RELATION API =====
  
  // Get tags for a post
  app.get("/api/posts/:id/tags", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const tags = await storage.getTagsByPost(postId);
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tags for post" });
    }
  });
  
  // Add tag to post (admin only)
  app.post("/api/admin/posts/:postId/tags/:tagId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const postId = parseInt(req.params.postId);
      const tagId = parseInt(req.params.tagId);
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const tag = await storage.getTag(tagId);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      const postTag = await storage.addTagToPost({ postId, tagId });
      res.status(201).json(postTag);
    } catch (error) {
      res.status(500).json({ message: "Failed to add tag to post" });
    }
  });
  
  // Remove tag from post (admin only)
  app.delete("/api/admin/posts/:postId/tags/:tagId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const postId = parseInt(req.params.postId);
      const tagId = parseInt(req.params.tagId);
      
      const success = await storage.removeTagFromPost(postId, tagId);
      if (!success) {
        return res.status(404).json({ message: "Post-tag relationship not found" });
      }
      
      res.status(200).json({ message: "Tag removed from post successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove tag from post" });
    }
  });
  
  // ===== COMMENTS API =====
  
  // Get comments for a post
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPost(postId);
      
      // For public API, only return approved comments
      const approvedComments = comments.filter(comment => comment.approved);
      
      res.json(approvedComments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  // Get all comments (admin only)
  app.get("/api/admin/comments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const posts = await storage.getAllPosts();
      const allComments = [];
      
      for (const post of posts) {
        const comments = await storage.getCommentsByPost(post.id);
        allComments.push(...comments.map(comment => ({
          ...comment,
          postTitle: post.title
        })));
      }
      
      res.json(allComments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  // Create comment
  app.post("/api/posts/:id/comments", validateBody(insertCommentSchema), async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const commentData = req.validatedBody;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const comment = await storage.createComment({
        ...commentData,
        postId
      });
      
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });
  
  // Approve comment (admin only)
  app.put("/api/admin/comments/:id/approve", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const commentId = parseInt(req.params.id);
      const comment = await storage.approveComment(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve comment" });
    }
  });
  
  // Delete comment (admin only)
  app.delete("/api/admin/comments/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const commentId = parseInt(req.params.id);
      const success = await storage.deleteComment(commentId);
      
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });
  
  // ===== ADVERTS API =====
  
  // Get all adverts (admin only)
  app.get("/api/admin/adverts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const adverts = await storage.getAllAdverts();
      res.json(adverts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch adverts" });
    }
  });
  
  // Get enabled adverts (public)
  app.get("/api/adverts", async (req, res) => {
    try {
      const allAdverts = await storage.getAllAdverts();
      const enabledAdverts = allAdverts.filter(advert => advert.enabled);
      res.json(enabledAdverts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch adverts" });
    }
  });
  
  // Create advert (admin only)
  app.post("/api/admin/adverts", validateBody(insertAdvertSchema), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const advertData = req.validatedBody;
      const advert = await storage.createAdvert(advertData);
      res.status(201).json(advert);
    } catch (error) {
      res.status(500).json({ message: "Failed to create advert" });
    }
  });
  
  // Update advert (admin only)
  app.put("/api/admin/adverts/:id", validateBody(insertAdvertSchema.partial()), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const advertId = parseInt(req.params.id);
      const advertData = req.validatedBody;
      
      const updatedAdvert = await storage.updateAdvert(advertId, advertData);
      if (!updatedAdvert) {
        return res.status(404).json({ message: "Advert not found" });
      }
      
      res.json(updatedAdvert);
    } catch (error) {
      res.status(500).json({ message: "Failed to update advert" });
    }
  });
  
  // Delete advert (admin only)
  app.delete("/api/admin/adverts/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const advertId = parseInt(req.params.id);
      const success = await storage.deleteAdvert(advertId);
      
      if (!success) {
        return res.status(404).json({ message: "Advert not found" });
      }
      
      res.status(200).json({ message: "Advert deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete advert" });
    }
  });
  
  // ===== THEMES API =====
  
  // Get all themes (admin only)
  app.get("/api/admin/themes", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const themes = await storage.getAllThemes();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch themes" });
    }
  });
  
  // Get active theme (public)
  app.get("/api/theme", async (req, res) => {
    try {
      const theme = await storage.getActiveTheme();
      if (!theme) {
        return res.status(404).json({ message: "No active theme found" });
      }
      
      res.json(theme);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active theme" });
    }
  });
  
  // Create theme (admin only)
  app.post("/api/admin/themes", validateBody(insertThemeSchema), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const themeData = req.validatedBody;
      const theme = await storage.createTheme(themeData);
      res.status(201).json(theme);
    } catch (error) {
      res.status(500).json({ message: "Failed to create theme" });
    }
  });
  
  // Update theme (admin only)
  app.put("/api/admin/themes/:id", validateBody(insertThemeSchema.partial()), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const themeId = parseInt(req.params.id);
      const themeData = req.validatedBody;
      
      const updatedTheme = await storage.updateTheme(themeId, themeData);
      if (!updatedTheme) {
        return res.status(404).json({ message: "Theme not found" });
      }
      
      res.json(updatedTheme);
    } catch (error) {
      res.status(500).json({ message: "Failed to update theme" });
    }
  });
  
  // Activate theme (admin only)
  app.put("/api/admin/themes/:id/activate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const themeId = parseInt(req.params.id);
      const theme = await storage.activateTheme(themeId);
      
      if (!theme) {
        return res.status(404).json({ message: "Theme not found" });
      }
      
      res.json(theme);
    } catch (error) {
      res.status(500).json({ message: "Failed to activate theme" });
    }
  });
  
  // Delete theme (admin only)
  app.delete("/api/admin/themes/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const themeId = parseInt(req.params.id);
      const success = await storage.deleteTheme(themeId);
      
      if (!success) {
        return res.status(404).json({ message: "Theme not found" });
      }
      
      res.status(200).json({ message: "Theme deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete theme" });
    }
  });
  
  // ===== STATS API =====
  
  // Get stats (admin only)
  app.get("/api/admin/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const stats = await storage.getStats();
      if (!stats) {
        return res.status(404).json({ message: "Stats not found" });
      }
      
      // Enhance stats with additional information
      const posts = await storage.getAllPosts();
      const comments = [];
      
      for (const post of posts) {
        const postComments = await storage.getCommentsByPost(post.id);
        comments.push(...postComments);
      }
      
      const pendingComments = comments.filter(comment => !comment.approved);
      
      const enhancedStats = {
        ...stats,
        totalPosts: posts.length,
        totalComments: comments.length,
        pendingComments: pendingComments.length,
        formattedRevenue: `$${(stats.totalAdRevenue / 100).toFixed(2)}`
      };
      
      res.json(enhancedStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  
  // Update ad revenue (admin only)
  app.post("/api/admin/stats/revenue", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { amount } = req.body;
      if (typeof amount !== 'number') {
        return res.status(400).json({ message: "Amount must be a number" });
      }
      
      const stats = await storage.updateAdRevenue(amount);
      if (!stats) {
        return res.status(404).json({ message: "Stats not found" });
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ad revenue" });
    }
  });

  return httpServer;
}
