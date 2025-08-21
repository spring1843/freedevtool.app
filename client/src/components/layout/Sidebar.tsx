import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { toolsData } from "@/data/tools";
import {
  Calendar,
  ArrowRightLeft,
  Code,
  FileText,
  Paintbrush,
  FileCode,
  Hash,
  Link as LinkIcon,
  Key,
  Shield,
  GitCompare,
  Search,
  ArrowUpDown,
  FileBarChart,
  Clock,
  Timer,
  Globe,
  Calculator,
  CreditCard,
  Square,
  BarChart3,
  Type,
  Palette,
  Video,
  Volume2,
  Command,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  ChevronsDown,
  ChevronsUp,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToolClick?: () => void; // Callback for when a tool is clicked (to close mobile menu)
}

// Icon mapping function based on category and tool name
function getToolIcon(category: string, toolName: string) {
  const iconMap: Record<string, Record<string, React.ReactNode>> = {
    Conversions: {
      "Date Converter": <Calendar className="w-4 h-4" />,
      "JSON ↔ YAML": <ArrowRightLeft className="w-4 h-4" />,
      "Timezone Converter": <Globe className="w-4 h-4" />,
      "Unit Converter": <Calculator className="w-4 h-4" />,
      "URL to JSON": <LinkIcon className="w-4 h-4" />,
      "CSV to JSON": <FileSpreadsheet className="w-4 h-4" />,
      "Number Base Converter": <Hash className="w-4 h-4" />,
    },
    Formatters: {
      "JSON Formatter": <Code className="w-4 h-4" />,
      "HTML Formatter": <FileText className="w-4 h-4" />,
      "YAML Formatter": <FileCode className="w-4 h-4" />,
      "Markdown Formatter": <Hash className="w-4 h-4" />,
      "CSS Formatter": <Paintbrush className="w-4 h-4" />,
      "LESS Formatter": <Paintbrush className="w-4 h-4" />,
      "Time Formatter": <Clock className="w-4 h-4" />,
    },
    Encoders: {
      "Base64 Encoder": <FileCode className="w-4 h-4" />,
      "URL Encoder": <LinkIcon className="w-4 h-4" />,
      "JWT Decoder": <Key className="w-4 h-4" />,
      "TLS Decoder": <Shield className="w-4 h-4" />,
      "MD5 Hash": <Hash className="w-4 h-4" />,
      "BCrypt Hash": <Shield className="w-4 h-4" />,
    },
    "Text Tools": {
      "Text Diff Viewer": <GitCompare className="w-4 h-4" />,
      "Regex Tester": <Search className="w-4 h-4" />,
      "Text Sort": <ArrowUpDown className="w-4 h-4" />,
      "Word Counter": <FileBarChart className="w-4 h-4" />,
      "QR Code Generator": <Square className="w-4 h-4" />,
      "Barcode Generator": <BarChart3 className="w-4 h-4" />,
      "Lorem Ipsum Generator": <FileText className="w-4 h-4" />,
      "Unicode Character Map": <Type className="w-4 h-4" />,
      "Password Generator": <Shield className="w-4 h-4" />,
      "UUID Generator": <Hash className="w-4 h-4" />,
      "Search & Replace": <Search className="w-4 h-4" />,
      "Text Split": <Type className="w-4 h-4" />,
    },
    "Time Tools": {
      "World Clock": <Globe className="w-4 h-4" />,
      Timer: <Timer className="w-4 h-4" />,
      Stopwatch: <Clock className="w-4 h-4" />,
      Countdown: <Clock className="w-4 h-4" />,
      "Date/Time Diff": <Calculator className="w-4 h-4" />,
      Metronome: <Timer className="w-4 h-4" />,
    },
    "Financial Tools": {
      "Compound Interest": <Calculator className="w-4 h-4" />,
      "Debt Repayment": <CreditCard className="w-4 h-4" />,
    },
    "Color Tools": {
      "Color Palette Generator": <Palette className="w-4 h-4" />,
    },
    Hardware: {
      "Camera Test": <Video className="w-4 h-4" />,
      "Microphone Test": <Volume2 className="w-4 h-4" />,
      "Keyboard Test": <Command className="w-4 h-4" />,
      "Speaker Test": <Volume2 className="w-4 h-4" />,
    },
    Browser: {
      "Browser Info": <FileText className="w-4 h-4" />,
    },
  };

  return iconMap[category]?.[toolName] || <Square className="w-4 h-4" />;
}

export function Sidebar({
  className,
  collapsed = false,
  onToolClick,
}: SidebarProps) {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [visitedPaths, setVisitedPaths] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const sidebarRef = useRef<HTMLElement>(null);

  // Create flat list of all navigable items (categories + tools)
  const getNavigableItems = () => {
    const items: Array<{
      type: "category" | "tool";
      categoryName: string;
      toolName?: string;
      path?: string;
      isExpanded?: boolean;
    }> = [];

    Object.entries(toolsData).forEach(([categoryName, categoryData]) => {
      items.push({
        type: "category",
        categoryName,
        isExpanded: expandedSections[categoryName],
      });

      if (expandedSections[categoryName]) {
        categoryData.tools.forEach(tool => {
          items.push({
            type: "tool",
            categoryName,
            toolName: tool.name,
            path: tool.path,
          });
        });
      }
    });

    return items;
  };

  // Get current active category
  const getCurrentCategory = () => {
    for (const [categoryName, categoryData] of Object.entries(toolsData)) {
      if (categoryData.tools.some(tool => tool.path === location)) {
        return categoryName;
      }
    }
    return null;
  };

  // Define functions before they are used in useEffect
  const toggleSection = useCallback((categoryName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  }, []);

  const expandAll = () => {
    const allExpanded = Object.keys(toolsData).reduce(
      (acc, category) => {
        acc[category] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const activeCategory = getCurrentCategory();
  const navigableItems = getNavigableItems();

  // Track visited paths (session-based) and auto-expand active category
  useEffect(() => {
    if (location && location !== "/" && !visitedPaths.has(location)) {
      const newVisited = new Set(visitedPaths);
      newVisited.add(location);
      setVisitedPaths(newVisited);
    }

    // Auto-expand the current category if not already expanded
    if (activeCategory && !expandedSections[activeCategory]) {
      setExpandedSections(prev => ({
        ...prev,
        [activeCategory]: true,
      }));
    }
  }, [location, visitedPaths, activeCategory, expandedSections]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is within sidebar
      if (!sidebarRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setFocusedIndex(prev =>
            Math.min(prev + 1, navigableItems.length - 1)
          );
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        }
        case " ":
        case "Space": {
          e.preventDefault();
          const currentItem = navigableItems[focusedIndex];
          if (currentItem && currentItem.type === "category") {
            toggleSection(currentItem.categoryName);
          }
          break;
        }
        case "Enter": {
          e.preventDefault();
          const selectedItem = navigableItems[focusedIndex];
          if (
            selectedItem &&
            selectedItem.type === "tool" &&
            selectedItem.path
          ) {
            // Use Wouter's navigation method instead of window.location
            const link = document.querySelector(
              `[href="${selectedItem.path}"]`
            ) as HTMLAnchorElement;
            if (link) {
              link.click();
            }
          } else if (selectedItem && selectedItem.type === "category") {
            toggleSection(selectedItem.categoryName);
          }
          break;
        }
        default: {
          // Handle default case
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, navigableItems, toggleSection]);

  // Reset focus when items change
  useEffect(() => {
    if (focusedIndex >= navigableItems.length) {
      setFocusedIndex(Math.max(0, navigableItems.length - 1));
    }
  }, [navigableItems.length, focusedIndex]);

  if (collapsed) {
    return null;
  }

  return (
    <TooltipProvider>
      <aside
        ref={sidebarRef}
        className={cn(
          "w-full bg-white dark:bg-slate-900 h-full flex flex-col",
          className
        )}
        tabIndex={0}
        role="navigation"
        aria-label="Tool navigation menu"
      >
        <nav className="p-6 space-y-3 flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {/* Expand/Collapse All Controls */}
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="flex-1 text-xs h-8 px-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              data-testid="expand-all-button"
            >
              <ChevronsDown className="w-3 h-3 mr-1.5" />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="flex-1 text-xs h-8 px-3 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              data-testid="collapse-all-button"
            >
              <ChevronsUp className="w-3 h-3 mr-1.5" />
              Collapse All
            </Button>
          </div>

          {Object.entries(toolsData).map(([categoryName, categoryData]) => {
            const isExpanded = expandedSections[categoryName] ?? false;
            const isCategoryActive = activeCategory === categoryName;
            const categoryItemIndex = navigableItems.findIndex(
              item =>
                item.type === "category" && item.categoryName === categoryName
            );
            const isCategoryFocused = focusedIndex === categoryItemIndex;

            return (
              <div
                key={categoryName}
                className={cn(
                  "mb-4 rounded-xl overflow-hidden transition-all duration-300",
                  isCategoryActive &&
                    "bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 shadow-sm"
                )}
              >
                {/* Category Header - Clickable */}
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between text-xs font-semibold uppercase tracking-wider mb-0 h-10 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02]",
                    isCategoryActive
                      ? "text-primary bg-primary/10 hover:bg-primary/15 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                    isCategoryFocused &&
                      (isCategoryActive
                        ? "bg-primary/25 hover:bg-primary/30 shadow-lg scale-105 ring-2 ring-primary/60 text-primary font-bold border-2 border-primary/40"
                        : "bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-150 dark:hover:bg-blue-900/60 shadow-lg scale-105 ring-2 ring-blue-400/50 text-blue-800 dark:text-blue-200 font-semibold border-2 border-blue-300/50 dark:border-blue-600/50")
                  )}
                  onClick={() => toggleSection(categoryName)}
                  data-testid={`category-${categoryName.toLowerCase().replace(/\s+/g, "-")}`}
                  tabIndex={-1}
                >
                  <span
                    className={cn(
                      "flex items-center gap-2.5",
                      isCategoryActive && "font-bold"
                    )}
                  >
                    {isCategoryActive ? (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    ) : null}
                    {categoryName}
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full font-medium transition-all duration-300",
                        isCategoryActive
                          ? "bg-primary/20 text-primary"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {categoryData.tools.length}
                    </span>
                  </span>
                  {isExpanded ? (
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isCategoryActive && "text-primary"
                      )}
                    />
                  ) : (
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isCategoryActive && "text-primary"
                      )}
                    />
                  )}
                </Button>

                {/* Category Items - Collapsible */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-out",
                    isExpanded
                      ? "max-h-[600px] opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-2",
                    isCategoryActive && "px-2"
                  )}
                >
                  <div className="space-y-1.5 pb-3 pt-1">
                    {categoryData.tools.map(tool => {
                      const toolPath = tool.path; // tool.path already includes /tools prefix
                      const isActive = location === toolPath;
                      const isVisited = visitedPaths.has(toolPath);
                      const toolItemIndex = navigableItems.findIndex(
                        item => item.type === "tool" && item.path === tool.path
                      );
                      const isToolFocused = focusedIndex === toolItemIndex;

                      return (
                        <Tooltip key={tool.path} delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Link href={toolPath}>
                              <Button
                                variant="ghost"
                                onClick={onToolClick} // Close mobile menu when tool is clicked
                                className={cn(
                                  "w-full justify-start text-sm transition-all duration-300 relative rounded-xl h-11 group hover:scale-[1.02] hover:shadow-sm",
                                  (() => {
                                    if (isActive) {
                                      return "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-medium transform scale-[1.02]";
                                    }
                                    if (isVisited) {
                                      return "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20";
                                    }
                                    return "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";
                                  })(),
                                  isToolFocused &&
                                    (() => {
                                      if (isActive) {
                                        return "ring-2 ring-primary-foreground/50 shadow-lg scale-105";
                                      }
                                      if (isVisited) {
                                        return "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 scale-[1.02] shadow-sm ring-2 ring-purple-400/30";
                                      }
                                      return "bg-slate-100 dark:bg-slate-700 hover:bg-slate-150 dark:hover:bg-slate-600 scale-[1.02] shadow-sm ring-2 ring-primary/30";
                                    })()
                                )}
                                data-testid={`tool-${tool.path.slice(1) || "date-converter"}`}
                                tabIndex={-1}
                              >
                                {isActive ? (
                                  <div className="absolute left-1 top-2 bottom-2 w-1 bg-primary-foreground rounded-r-full" />
                                ) : null}
                                <div
                                  className={cn(
                                    "w-5 h-5 mr-3 flex-shrink-0 transition-all duration-300 group-hover:scale-110",
                                    isActive &&
                                      "scale-110 text-primary-foreground"
                                  )}
                                >
                                  {getToolIcon(categoryName, tool.name)}
                                </div>
                                <span
                                  className={cn(
                                    "truncate flex-1 transition-all duration-300",
                                    isActive && "font-medium"
                                  )}
                                >
                                  {tool.name}
                                </span>
                                <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                                  {tool.experimental ? (
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "text-xs px-1.5 py-0.5 h-5 rounded-full transition-all duration-300",
                                        isActive
                                          ? "bg-primary-foreground/20 text-primary-foreground"
                                          : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                      )}
                                    >
                                      β
                                    </Badge>
                                  ) : null}
                                  {isActive ? (
                                    <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                                  ) : null}
                                  {!isActive && isVisited ? (
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full opacity-70" />
                                  ) : null}
                                </div>
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{tool.name}</p>
                                {tool.experimental ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 h-5 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                  >
                                    β Experimental
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {tool.description}
                              </p>
                              {tool.experimental ? (
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  ⚠️ This tool is in development and may have
                                  limitations
                                </p>
                              ) : null}
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                Shortcut: {tool.shortcut}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Keyboard navigation help */}
          <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
            <div className="font-medium mb-1">Keyboard Navigation:</div>
            <div className="space-y-0.5">
              <div>↑↓ Navigate • Space Expand/Collapse</div>
              <div>Enter Open Tool • Escape Close Menu</div>
              <div>Ctrl+S Search • Ctrl+M Menu</div>
            </div>
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
