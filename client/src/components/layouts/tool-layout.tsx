import type { ReactNode } from "react";
import AdSlot from "@/components/ui/ad-slot";
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
  showBottomAd?: boolean;
  adId?: string;
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
  showTopAd = false,
  showBottomAd = false,
  adId = "TL",
  maxWidth = "max-w-6xl",
}: ToolLayoutProps) {
  return (
    <div className={`${maxWidth} mx-auto`}>
      {showTopAd ? (
        <AdSlot
          position="top"
          id={`${adId}-001`}
          size="large"
          className="mb-6"
        />
      ) : null}

      <ToolHeader
        title={title}
        description={description}
        experimental={experimental}
        showSecurityBanner={showSecurityBanner}
      />

      <ErrorAlert error={error || null} warnings={warnings} />

      {children}

      {showBottomAd ? (
        <div className="flex justify-center mt-8">
          <AdSlot position="bottom" id={`${adId}-003`} size="large" />
        </div>
      ) : null}
    </div>
  );
}
