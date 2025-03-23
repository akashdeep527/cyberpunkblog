import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CyberBorderProps {
  children: ReactNode;
  className?: string;
}

export default function CyberBorder({ children, className }: CyberBorderProps) {
  return (
    <div className={cn("cyber-border", className)}>
      <style jsx>{`
        .cyber-border {
          position: relative;
          border: 1px solid transparent;
          background-clip: padding-box;
        }
        
        .cyber-border::after {
          content: '';
          position: absolute;
          top: -2px; right: -2px; bottom: -2px; left: -2px;
          background: linear-gradient(45deg, #ff2a6d, #05d9e8, #9d4edd);
          z-index: -1;
          border-radius: inherit;
        }
      `}</style>
      {children}
    </div>
  );
}
