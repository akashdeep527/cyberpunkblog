import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function ToggleSwitch({ 
  id, 
  checked, 
  onChange, 
  disabled = false 
}: ToggleSwitchProps) {
  const [isChecked, setIsChecked] = useState(checked);
  
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);
  
  const handleChange = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(newValue);
  };
  
  return (
    <div className="relative">
      <input 
        type="checkbox" 
        id={id} 
        className="sr-only" 
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
      />
      <label htmlFor={id} className="flex items-center cursor-pointer">
        <div className="relative w-10 h-5 bg-darkBg rounded-full transition-colors duration-200">
          <div 
            className={cn(
              "absolute left-1 top-1 w-3 h-3 rounded-full transition-transform duration-300 transform",
              isChecked 
                ? "translate-x-full bg-neonBlue" 
                : "translate-x-0 bg-mutedText"
            )}
          />
        </div>
      </label>
    </div>
  );
}
