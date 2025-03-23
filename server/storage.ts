import {
  users, User, InsertUser,
  posts, Post, InsertPost,
  categories, Category, InsertCategory,
  tags, Tag, InsertTag,
  postCategories, PostCategory, InsertPostCategory,
  postTags, PostTag, InsertPostTag,
  comments, Comment, InsertComment,
  adverts, Advert, InsertAdvert,
  themes, Theme, InsertTheme,
  stats, Stats
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getAllPosts(): Promise<Post[]>;
  getPostsByAuthor(authorId: number): Promise<Post[]>;
  
  // Category methods
  createCategory(category: InsertCategory): Promise<Category>;
  getCategory(id: number): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Tag methods
  createTag(tag: InsertTag): Promise<Tag>;
  getTag(id: number): Promise<Tag | undefined>;
  getAllTags(): Promise<Tag[]>;
  updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<boolean>;
  
  // Post-Category relationship methods
  addCategoryToPost(postCategory: InsertPostCategory): Promise<PostCategory>;
  removeCategoryFromPost(postId: number, categoryId: number): Promise<boolean>;
  getCategoriesByPost(postId: number): Promise<Category[]>;
  
  // Post-Tag relationship methods
  addTagToPost(postTag: InsertPostTag): Promise<PostTag>;
  removeTagFromPost(postId: number, tagId: number): Promise<boolean>;
  getTagsByPost(postId: number): Promise<Tag[]>;
  
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  approveComment(id: number): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  
  // Advert methods
  createAdvert(advert: InsertAdvert): Promise<Advert>;
  getAdvert(id: number): Promise<Advert | undefined>;
  getAllAdverts(): Promise<Advert[]>;
  updateAdvert(id: number, advert: Partial<InsertAdvert>): Promise<Advert | undefined>;
  deleteAdvert(id: number): Promise<boolean>;
  
  // Theme methods
  createTheme(theme: InsertTheme): Promise<Theme>;
  getTheme(id: number): Promise<Theme | undefined>;
  getAllThemes(): Promise<Theme[]>;
  updateTheme(id: number, theme: Partial<InsertTheme>): Promise<Theme | undefined>;
  deleteTheme(id: number): Promise<boolean>;
  activateTheme(id: number): Promise<Theme | undefined>;
  getActiveTheme(): Promise<Theme | undefined>;
  
  // Stats methods
  getStats(): Promise<Stats | undefined>;
  incrementViews(count: number): Promise<Stats | undefined>;
  updateAdRevenue(amount: number): Promise<Stats | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private categories: Map<number, Category>;
  private tags: Map<number, Tag>;
  private postCategories: Map<number, PostCategory>;
  private postTags: Map<number, PostTag>;
  private comments: Map<number, Comment>;
  private adverts: Map<number, Advert>;
  private themes: Map<number, Theme>;
  private stats: Stats | undefined;
  
  sessionStore: session.SessionStore;
  
  private userCounter: number = 1;
  private postCounter: number = 1;
  private categoryCounter: number = 1;
  private tagCounter: number = 1;
  private postCategoryCounter: number = 1;
  private postTagCounter: number = 1;
  private commentCounter: number = 1;
  private advertCounter: number = 1;
  private themeCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.categories = new Map();
    this.tags = new Map();
    this.postCategories = new Map();
    this.postTags = new Map();
    this.comments = new Map();
    this.adverts = new Map();
    this.themes = new Map();
    
    // Create the session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize stats
    this.stats = {
      id: 1,
      totalViews: 0,
      totalAdRevenue: 0,
      updatedAt: new Date()
    };
    
    // Create initial admin user
    this.createUser({
      username: "admin",
      password: "admin",
      isAdmin: true
    });
    
    // Create some initial categories
    this.createCategory({ name: "Cyberpunk", slug: "cyberpunk" });
    this.createCategory({ name: "Technology", slug: "technology" });
    this.createCategory({ name: "Future", slug: "future" });
    this.createCategory({ name: "AI", slug: "ai" });
    
    // Create initial theme
    this.createTheme({
      name: "Neon City",
      description: "Default cyberpunk theme",
      previewImage: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5",
      isActive: true
    });
    
    // Create initial adverts
    this.createAdvert({
      name: "Sidebar Ad",
      size: "300x250",
      code: "<script>console.log('Sidebar Ad');</script>",
      enabled: true,
      position: "sidebar"
    });
    
    this.createAdvert({
      name: "In-content Ad",
      size: "728x90",
      code: "<script>console.log('In-content Ad');</script>",
      enabled: true,
      position: "content"
    });
    
    this.createAdvert({
      name: "Footer Ad",
      size: "970x250",
      code: "<script>console.log('Footer Ad');</script>",
      enabled: false,
      position: "footer"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Post methods
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.postCounter++;
    const now = new Date();
    const newPost: Post = {
      ...post,
      id,
      views: 0,
      createdAt: now,
      updatedAt: now
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(
      (post) => post.slug === slug
    );
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined> {
    const existingPost = this.posts.get(id);
    if (!existingPost) return undefined;
    
    const updatedPost: Post = {
      ...existingPost,
      ...post,
      updatedAt: new Date()
    };
    
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values());
  }

  async getPostsByAuthor(authorId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.authorId === authorId
    );
  }

  // Category methods
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory: Category = {
      ...existingCategory,
      ...category
    };
    
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Tag methods
  async createTag(tag: InsertTag): Promise<Tag> {
    const id = this.tagCounter++;
    const newTag: Tag = { ...tag, id };
    this.tags.set(id, newTag);
    return newTag;
  }

  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getAllTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  async updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined> {
    const existingTag = this.tags.get(id);
    if (!existingTag) return undefined;
    
    const updatedTag: Tag = {
      ...existingTag,
      ...tag
    };
    
    this.tags.set(id, updatedTag);
    return updatedTag;
  }

  async deleteTag(id: number): Promise<boolean> {
    return this.tags.delete(id);
  }

  // Post-Category relationship methods
  async addCategoryToPost(postCategory: InsertPostCategory): Promise<PostCategory> {
    const id = this.postCategoryCounter++;
    const newPostCategory: PostCategory = { ...postCategory, id };
    this.postCategories.set(id, newPostCategory);
    return newPostCategory;
  }

  async removeCategoryFromPost(postId: number, categoryId: number): Promise<boolean> {
    const entry = Array.from(this.postCategories.entries()).find(
      ([_, pc]) => pc.postId === postId && pc.categoryId === categoryId
    );
    
    if (!entry) return false;
    return this.postCategories.delete(entry[0]);
  }

  async getCategoriesByPost(postId: number): Promise<Category[]> {
    const categoryIds = Array.from(this.postCategories.values())
      .filter(pc => pc.postId === postId)
      .map(pc => pc.categoryId);
    
    return Array.from(this.categories.values())
      .filter(category => categoryIds.includes(category.id));
  }

  // Post-Tag relationship methods
  async addTagToPost(postTag: InsertPostTag): Promise<PostTag> {
    const id = this.postTagCounter++;
    const newPostTag: PostTag = { ...postTag, id };
    this.postTags.set(id, newPostTag);
    return newPostTag;
  }

  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    const entry = Array.from(this.postTags.entries()).find(
      ([_, pt]) => pt.postId === postId && pt.tagId === tagId
    );
    
    if (!entry) return false;
    return this.postTags.delete(entry[0]);
  }

  async getTagsByPost(postId: number): Promise<Tag[]> {
    const tagIds = Array.from(this.postTags.values())
      .filter(pt => pt.postId === postId)
      .map(pt => pt.tagId);
    
    return Array.from(this.tags.values())
      .filter(tag => tagIds.includes(tag.id));
  }

  // Comment methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentCounter++;
    const newComment: Comment = {
      ...comment,
      id,
      approved: false,
      createdAt: new Date()
    };
    
    this.comments.set(id, newComment);
    return newComment;
  }

  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId);
  }

  async approveComment(id: number): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    const updatedComment: Comment = {
      ...comment,
      approved: true
    };
    
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Advert methods
  async createAdvert(advert: InsertAdvert): Promise<Advert> {
    const id = this.advertCounter++;
    const newAdvert: Advert = { ...advert, id };
    this.adverts.set(id, newAdvert);
    return newAdvert;
  }

  async getAdvert(id: number): Promise<Advert | undefined> {
    return this.adverts.get(id);
  }

  async getAllAdverts(): Promise<Advert[]> {
    return Array.from(this.adverts.values());
  }

  async updateAdvert(id: number, advert: Partial<InsertAdvert>): Promise<Advert | undefined> {
    const existingAdvert = this.adverts.get(id);
    if (!existingAdvert) return undefined;
    
    const updatedAdvert: Advert = {
      ...existingAdvert,
      ...advert
    };
    
    this.adverts.set(id, updatedAdvert);
    return updatedAdvert;
  }

  async deleteAdvert(id: number): Promise<boolean> {
    return this.adverts.delete(id);
  }

  // Theme methods
  async createTheme(theme: InsertTheme): Promise<Theme> {
    // If this is marked as active, deactivate all other themes
    if (theme.isActive) {
      for (const [id, existingTheme] of this.themes.entries()) {
        if (existingTheme.isActive) {
          this.themes.set(id, { ...existingTheme, isActive: false });
        }
      }
    }
    
    const id = this.themeCounter++;
    const newTheme: Theme = { ...theme, id };
    this.themes.set(id, newTheme);
    return newTheme;
  }

  async getTheme(id: number): Promise<Theme | undefined> {
    return this.themes.get(id);
  }

  async getAllThemes(): Promise<Theme[]> {
    return Array.from(this.themes.values());
  }

  async updateTheme(id: number, theme: Partial<InsertTheme>): Promise<Theme | undefined> {
    const existingTheme = this.themes.get(id);
    if (!existingTheme) return undefined;
    
    const updatedTheme: Theme = {
      ...existingTheme,
      ...theme
    };
    
    this.themes.set(id, updatedTheme);
    return updatedTheme;
  }

  async deleteTheme(id: number): Promise<boolean> {
    return this.themes.delete(id);
  }

  async activateTheme(id: number): Promise<Theme | undefined> {
    const theme = this.themes.get(id);
    if (!theme) return undefined;
    
    // Deactivate all themes
    for (const [themeId, existingTheme] of this.themes.entries()) {
      if (existingTheme.isActive) {
        this.themes.set(themeId, { ...existingTheme, isActive: false });
      }
    }
    
    // Activate the chosen theme
    const updatedTheme: Theme = {
      ...theme,
      isActive: true
    };
    
    this.themes.set(id, updatedTheme);
    return updatedTheme;
  }

  async getActiveTheme(): Promise<Theme | undefined> {
    return Array.from(this.themes.values())
      .find(theme => theme.isActive);
  }

  // Stats methods
  async getStats(): Promise<Stats | undefined> {
    return this.stats;
  }

  async incrementViews(count: number): Promise<Stats | undefined> {
    if (!this.stats) return undefined;
    
    this.stats = {
      ...this.stats,
      totalViews: this.stats.totalViews + count,
      updatedAt: new Date()
    };
    
    return this.stats;
  }

  async updateAdRevenue(amount: number): Promise<Stats | undefined> {
    if (!this.stats) return undefined;
    
    this.stats = {
      ...this.stats,
      totalAdRevenue: this.stats.totalAdRevenue + amount,
      updatedAt: new Date()
    };
    
    return this.stats;
  }
}

export const storage = new MemStorage();
