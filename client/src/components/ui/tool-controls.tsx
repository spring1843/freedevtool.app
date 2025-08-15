import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export interface ControlButton {
  label: string;
  onClick: () => void;
  icon: LucideIcon;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  disabled?: boolean;
  testId?: string;
}

interface ToolControlsProps {
  buttons: ControlButton[];
  className?: string;
}

export function ToolControls({ buttons, className = "mb-6 flex flex-wrap gap-3" }: ToolControlsProps) {
  return (
    <div className={className}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          onClick={button.onClick}
          variant={button.variant || "default"}
          disabled={button.disabled}
          data-testid={button.testId}
        >
          <button.icon className="w-4 h-4 mr-2" />
          {button.label}
        </Button>
      ))}
    </div>
  );
}