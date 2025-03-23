import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";
import { Category, Tag } from "@shared/schema";
import CyberBorder from "@/components/shared/CyberBorder";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface PostOptionsProps {
  form: UseFormReturn<any>;
  categories: Category[];
  tags: Tag[];
  selectedCategories: Category[];
  setSelectedCategories: Dispatch<SetStateAction<Category[]>>;
  selectedTags: Tag[];
  setSelectedTags: Dispatch<SetStateAction<Tag[]>>;
  featuredImage: string | null;
  setFeaturedImage: Dispatch<SetStateAction<string | null>>;
  isSubmitting: boolean;
}

export default function PostOptions({
  form,
  categories,
  tags,
  selectedCategories,
  setSelectedCategories,
  selectedTags,
  setSelectedTags,
  featuredImage,
  setFeaturedImage,
  isSubmitting
}: PostOptionsProps) {
  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    const categoryIdNum = parseInt(categoryId);
    const category = categories.find(c => c.id === categoryIdNum);
    
    if (category && !selectedCategories.some(c => c.id === categoryIdNum)) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Remove category from selection
  const removeCategory = (categoryId: number) => {
    setSelectedCategories(selectedCategories.filter(c => c.id !== categoryId));
  };
  
  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      
      const input = e.currentTarget;
      const tagName = input.value.trim().replace(/,+$/, '');
      
      if (tagName && !selectedTags.some(t => t.name.toLowerCase() === tagName.toLowerCase())) {
        // Check if tag already exists in the database
        const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        
        if (existingTag) {
          setSelectedTags([...selectedTags, existingTag]);
        } else {
          // Create a temporary tag (will be created on server when post is saved)
          const newTag: Tag = {
            id: -Math.random(), // Temporary negative ID
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-')
          };
          setSelectedTags([...selectedTags, newTag]);
        }
      }
      
      input.value = '';
    }
  };
  
  // Remove tag from selection
  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };
  
  // Handle image upload
  const handleImageUrlChange = (url: string) => {
    setFeaturedImage(url);
  };
  
  return (
    <>
      {/* Featured Image Section */}
      <CyberBorder className="bg-darkerBg rounded-lg p-4">
        <h3 className="font-orbitron text-neonPink mb-3 text-sm uppercase">Featured Image</h3>
        <div className="bg-darkBg border border-dashed border-neonBlue/50 rounded-lg p-4 text-center">
          {featuredImage ? (
            <div className="relative">
              <img src={featuredImage} alt="Featured" className="w-full h-40 object-cover rounded-lg mb-2" />
              <button 
                type="button"
                onClick={() => setFeaturedImage(null)} 
                className="absolute top-2 right-2 bg-darkerBg rounded-full p-1 text-neonPink hover:bg-dangerRed/20 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="text-mutedText text-2xl mb-2 mx-auto" />
              <p className="text-sm text-mutedText mb-2">Drag & drop your image here</p>
            </>
          )}
          
          <Input
            type="text"
            placeholder="Or enter image URL"
            className="bg-darkBg border border-neonBlue/30 mb-2 placeholder-mutedText"
            onChange={(e) => handleImageUrlChange(e.target.value)}
          />
          
          <Button 
            type="button"
            className="bg-neonBlue/20 text-neonBlue text-sm py-1 px-3 rounded hover:bg-neonBlue/30 transition-all duration-200"
          >
            Upload Image
          </Button>
        </div>
      </CyberBorder>
      
      {/* Categories & Tags Section */}
      <CyberBorder className="bg-darkerBg rounded-lg p-4">
        <h3 className="font-orbitron text-neonPink mb-3 text-sm uppercase">Categories & Tags</h3>
        <div className="mb-3">
          <label className="text-xs text-mutedText block mb-1">Categories</label>
          <Select onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full bg-darkBg border border-neonBlue/30 rounded text-cyberText">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="bg-darkerBg border border-neonBlue/30">
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCategories.map((category) => (
                <span key={category.id} className="bg-neonPurple/20 text-neonPurple text-xs py-1 px-2 rounded flex items-center">
                  {category.name} 
                  <button type="button" onClick={() => removeCategory(category.id)}>
                    <X className="ml-1 h-3 w-3 cursor-pointer" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="text-xs text-mutedText block mb-1">Tags</label>
          <Input 
            type="text" 
            placeholder="Add tags, separated by commas" 
            className="w-full bg-darkBg border border-neonBlue/30 rounded p-2 text-cyberText placeholder-mutedText"
            onKeyDown={handleTagInput}
          />
          
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <span key={tag.id} className="bg-neonBlue/20 text-neonBlue text-xs py-1 px-2 rounded flex items-center">
                  {tag.name}
                  <button type="button" onClick={() => removeTag(tag.id)}>
                    <X className="ml-1 h-3 w-3 cursor-pointer" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </CyberBorder>
      
      {/* Publication Section */}
      <CyberBorder className="bg-darkerBg rounded-lg p-4">
        <h3 className="font-orbitron text-neonPink mb-3 text-sm uppercase">Publication</h3>
        <div className="mb-3">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-mutedText">Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-darkBg border border-neonBlue/30 rounded text-cyberText">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-darkerBg border border-neonBlue/30">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="mb-3">
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-mutedText">Visibility</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-darkBg border border-neonBlue/30 rounded text-cyberText">
                      <SelectValue placeholder="Select Visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-darkerBg border border-neonBlue/30">
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="password">Password Protected</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Button
            type="button"
            onClick={() => {
              form.setValue("status", "draft");
              form.handleSubmit(form.getValues())();
            }}
            className="bg-darkBg border border-neonPink/50 text-neonPink text-sm py-1 px-3 rounded hover:bg-neonPink/10 transition-all duration-200"
            disabled={isSubmitting}
          >
            Save Draft
          </Button>
          <Button
            type="submit"
            className="bg-neonPink text-white text-sm py-1 px-3 rounded hover:bg-neonPink/80 transition-all duration-200"
            disabled={isSubmitting}
            onClick={() => {
              if (form.getValues().status === "draft") {
                form.setValue("status", "published");
              }
            }}
          >
            {form.getValues().status === "published" ? "Update" : "Publish"}
          </Button>
        </div>
      </CyberBorder>
    </>
  );
}
