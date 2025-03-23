import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-2xl font-bold font-orbitron text-neonBlue">{title}</h1>
          {description && <p className="text-mutedText text-sm mt-1">{description}</p>}
        </div>
        {children && <div className="flex items-center space-x-2">{children}</div>}
      </div>
      <div className="h-1 w-20 bg-neonPink mb-4"></div>
    </div>
  );
} 