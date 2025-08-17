import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  RefreshCw,
  Share,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolButtonProps {
  variant?:
    | "copy"
    | "reset"
    | "share"
    | "download"
    | "upload"
    | "play"
    | "pause"
    | "stop"
    | "clear"
    | "custom";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  tooltip: string;
  size?: "default" | "sm" | "lg" | "icon";
}

const variantConfig = {
  copy: {
    icon: Copy,
    text: "Copy",
    tooltip: "Copy to clipboard",
  },
  reset: {
    icon: RefreshCw,
    text: "Reset",
    tooltip: "Reset to default values",
  },
  share: {
    icon: Share,
    text: "Share",
    tooltip: "Copy shareable URL to clipboard",
  },
  download: {
    icon: Download,
    text: "Download",
    tooltip: "Download file",
  },
  upload: {
    icon: Upload,
    text: "Upload",
    tooltip: "Upload file",
  },
  play: {
    icon: Play,
    text: "Start",
    tooltip: "Start",
  },
  pause: {
    icon: Pause,
    text: "Pause",
    tooltip: "Pause",
  },
  stop: {
    icon: Square,
    text: "Stop",
    tooltip: "Stop",
  },
  clear: {
    icon: RotateCcw,
    text: "Clear",
    tooltip: "Clear all data",
  },
};

export function ToolButton({
  variant = "custom",
  onClick,
  disabled = false,
  className,
  children,
  icon,
  tooltip,
  size = "default",
}: ToolButtonProps) {
  const config = variant !== "custom" ? variantConfig[variant] : null;
  const IconComponent = config?.icon;
  const buttonText = config?.text;
  const defaultTooltip = config?.tooltip;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            disabled={disabled}
            size={size}
            className={cn(className)}
            data-testid={`button-${variant}`}
          >
            {icon ||
              (IconComponent && <IconComponent className="w-4 h-4 mr-2" />)}
            {children || buttonText}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip || defaultTooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Specialized button variants for common use cases
export function CopyButton({
  onClick,
  disabled,
  text = "Copy",
  tooltip = "Copy to clipboard",
}: {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
  tooltip?: string;
}) {
  return (
    <ToolButton
      variant="copy"
      onClick={onClick}
      disabled={disabled}
      tooltip={tooltip}
    >
      {text}
    </ToolButton>
  );
}

export function ResetButton({
  onClick,
  disabled,
  tooltip = "Reset to default values",
}: {
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}) {
  return (
    <ToolButton
      variant="reset"
      onClick={onClick}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
}

export function ShareButton({
  onClick,
  disabled,
  tooltip = "Copy shareable URL to clipboard",
}: {
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}) {
  return (
    <ToolButton
      variant="share"
      onClick={onClick}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
}
