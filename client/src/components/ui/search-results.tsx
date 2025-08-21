import React, { useRef, useEffect } from "react";
import { Link } from "wouter";

import { ExternalLink } from "lucide-react";
import type { SearchResult } from "@/hooks/use-search";

interface SearchResultsProps {
  results: SearchResult[];
  onResultClick?: () => void;
  className?: string;
  selectedIndex?: number;
}

export function SearchResults({
  results,
  onResultClick,
  className = "",
  selectedIndex = -1,
}: SearchResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view when selectedIndex changes
  useEffect(() => {
    if (selectedIndex >= 0 && containerRef.current) {
      const container = containerRef.current;
      const selectedItem = container.children[selectedIndex] as HTMLElement;

      if (selectedItem) {
        const containerRect = container.getBoundingClientRect();
        const selectedRect = selectedItem.getBoundingClientRect();

        // Check if item is above visible area
        if (selectedRect.top < containerRect.top) {
          selectedItem.scrollIntoView({ block: "start", behavior: "smooth" });
        }
        // Check if item is below visible area
        else if (selectedRect.bottom > containerRect.bottom) {
          selectedItem.scrollIntoView({ block: "end", behavior: "smooth" });
        }
      }
    }
  }, [selectedIndex]);

  if (results.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-[9999] max-h-96 overflow-y-auto ${className}`}
      style={{ zIndex: 9999 }}
      data-testid={`search-results`}
    >
      {results.map((result, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Link key={`${result.path}-${index}`} href={result.path}>
            <div
              className={`p-3 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0 flex items-center justify-between group ${
                isSelected
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : "hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
              onClick={onResultClick}
              data-testid={`search-result-${result.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-medium ${
                      isSelected
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    }`}
                  >
                    {result.name}
                  </span>
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
                    {result.section}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {result.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-mono">
                  {result.shortcut}
                </p>
              </div>
              <ExternalLink
                className={`w-4 h-4 ml-2 transition-opacity ${
                  isSelected
                    ? "text-blue-500 opacity-100"
                    : "text-slate-400 opacity-0 group-hover:opacity-100"
                }`}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
