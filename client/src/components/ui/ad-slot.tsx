import React from "react";

interface AdSlotProps {
  position: "top" | "middle" | "bottom" | "sidebar";
  id: string;
  size?: "small" | "medium" | "large" | "banner";
  className?: string;
}

const adSizes = {
  small: { width: "300px", height: "150px", label: "300x150" },
  medium: { width: "300px", height: "250px", label: "300x250" },
  large: { width: "728px", height: "90px", label: "728x90" },
  banner: { width: "100%", height: "60px", label: "Responsive" },
};

export const AdSlot: React.FC<AdSlotProps> = ({
  position,
  id,
  size = "medium",
  className = "",
}) => {
  const adSize = adSizes[size];

  return (
    <div
      className={`ad-slot border-2 border-dashed border-slate-300 dark:border-slate-600 
                  bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 
                  flex flex-col items-center justify-center p-4 text-center 
                  hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${className}`}
      style={{
        minWidth: adSize.width,
        height: adSize.height,
        maxWidth: size === "banner" ? "100%" : adSize.width,
      }}
      data-testid={`ad-slot-${id}`}
    >
      <div className="font-semibold text-sm mb-1">Github</div>
      <div className="text-xs opacity-75">
        {" "}
        <a target="_blank" href="https://github.com/spring1843/FreeDevTool.App" rel="noreferrer">
          FreeDevTool.App
        </a>
      </div>
    </div>
  );
};

export default AdSlot;
