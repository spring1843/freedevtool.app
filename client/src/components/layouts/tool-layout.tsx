import type { ReactNode } from "react";

import { ToolHeader } from "@/components/ui/tool-header";
import { ErrorAlert } from "@/components/ui/error-alert";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  error?: string | null;
  warnings?: Array<{ message: string; line?: number }>;
  experimental?: boolean;
  showSecurityBanner?: boolean;
  showTopAd?: boolean;
  maxWidth?: string;
}

export function ToolLayout({
  title,
  description,
  children,
  error,
  warnings,
  experimental = false,
  showSecurityBanner = false,
  maxWidth = "max-w-6xl",
}: ToolLayoutProps) {
  return (
    <div className={`${maxWidth} mx-auto`}>
      <ToolHeader
        title={title}
        description={description}
        experimental={experimental}
        showSecurityBanner={showSecurityBanner}
      />

      <ErrorAlert error={error || null} warnings={warnings} />

      {children}
    </div>
  );
}
