import { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  
  // Custom modules and formats for Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'color', 'background',
    'link', 'image', 'video'
  ];
  
  // Apply cyberpunk styling to Quill editor
  useEffect(() => {
    // Apply custom styles to Quill toolbar
    if (quillRef.current) {
      const toolbar = quillRef.current.getEditor().container.querySelector('.ql-toolbar');
      if (toolbar) {
        toolbar.classList.add('bg-darkerBg', 'border', 'border-neonBlue/30', 'rounded-t-lg');
      }
    }
  }, [quillRef]);
  
  return (
    <div className="rich-text-editor">
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border-color: rgba(5, 217, 232, 0.3) !important;
          background-color: #010118;
        }
        
        .ql-container.ql-snow {
          border-color: rgba(5, 217, 232, 0.3) !important;
          border-top: 0 !important;
          background-color: #010118;
          min-height: 300px;
          color: #caf3f3;
          font-family: 'Chakra Petch', sans-serif;
        }
        
        .ql-snow .ql-stroke {
          stroke: #adb5bd;
        }
        
        .ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill {
          fill: #adb5bd;
        }
        
        .ql-snow.ql-toolbar button:hover .ql-stroke, 
        .ql-snow .ql-toolbar button:hover .ql-stroke,
        .ql-snow.ql-toolbar button.ql-active .ql-stroke, 
        .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: #05d9e8;
        }
        
        .ql-snow.ql-toolbar button:hover .ql-fill, 
        .ql-snow .ql-toolbar button:hover .ql-fill,
        .ql-snow.ql-toolbar button.ql-active .ql-fill, 
        .ql-snow .ql-toolbar button.ql-active .ql-fill {
          fill: #05d9e8;
        }
        
        .ql-snow a {
          color: #ff2a6d;
        }
        
        .ql-editor.ql-blank::before {
          color: #adb5bd;
          font-style: normal;
        }
        
        .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6 {
          font-family: 'Orbitron', sans-serif;
          color: #ff2a6d;
          margin-bottom: 0.5em;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid #9d4edd;
          padding-left: 1em;
          margin-left: 0;
          color: #caf3f3;
        }
        
        .ql-editor code, .ql-editor pre {
          background-color: #01012b;
          color: #39ff14;
          font-family: 'Share Tech Mono', monospace;
          border-radius: 4px;
          padding: 3px 5px;
        }
        
        .ql-editor pre {
          padding: 10px;
        }
      `}</style>
      
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Start writing your cyberpunk-themed post here..."
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "rounded-lg overflow-hidden",
          isFocused && "shadow-neon-blue"
        )}
      />
    </div>
  );
}
