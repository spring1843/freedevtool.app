import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronUp,
  Square,
  SkipForward,
  Timer,
  Play,
  Pause,
} from "lucide-react";
import { toolsData } from "@/data/tools";
import { useDemo } from "@/providers/demo-provider";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [, setLocation] = useLocation();
  const {
    isDemoRunning,
    isDemoPaused,
    currentDemoTool,
    demoProgress,
    demoSpeed,
    stopDemo,
    skipToNext,
    setDemoSpeed,
    pauseDemo,
    resumeDemo,
  } = useDemo();

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if no input field is focused
      if (event.target && (event.target as HTMLElement).tagName === "INPUT")
        return;

      // Handle Escape key to close menu
      if (event.key === "Escape" && mobileMenuOpen) {
        event.preventDefault();
        setMobileMenuOpen(false);
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        // Handle menu toggle with Ctrl+M (case-sensitive check)
        if (event.key === "m" || event.key === "M") {
          event.preventDefault();
          event.stopPropagation();
          const wasOpen = mobileMenuOpen;
          setMobileMenuOpen(!mobileMenuOpen);

          // If opening the menu, focus the sidebar after a brief delay
          if (!wasOpen) {
            setTimeout(() => {
              const sidebar = document.querySelector(
                '[role="navigation"]'
              ) as HTMLElement;
              if (sidebar) {
                sidebar.focus();
              }
            }, 100);
          }
          return;
        }

        // Find matching tool by shortcut
        Object.values(toolsData).forEach(section => {
          section.tools.forEach(tool => {
            const shortcutParts = tool.shortcut.split("+");
            let matches = true;

            if (
              shortcutParts.includes("Ctrl") &&
              !event.ctrlKey &&
              !event.metaKey
            )
              matches = false;
            if (shortcutParts.includes("Shift") && !event.shiftKey)
              matches = false;

            const key = shortcutParts[shortcutParts.length - 1].toLowerCase();
            if (event.key.toLowerCase() !== key) matches = false;

            if (matches) {
              event.preventDefault();
              setLocation(tool.path); // tool.path already includes /tools prefix
            }
          });
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [setLocation, mobileMenuOpen]);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        {/* Collapsible Header */}
        <div
          className={`transition-all duration-300 ${headerCollapsed ? "h-0" : "h-auto"} ${headerCollapsed ? "overflow-hidden" : "overflow-visible"} relative z-50`}
        >
          <Header onMenuClick={() => setMobileMenuOpen(true)} />
        </div>

        {/* Demo Status Bar */}
        {isDemoRunning ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="default" className="bg-blue-600">
                  Demo Mode Active
                </Badge>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {currentDemoTool}
                </span>
                <div className="w-32 bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${demoProgress}%` }}
                  />
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {Math.round(demoProgress)}%
                </span>

                {/* Speed Control */}
                <div className="flex items-center space-x-1">
                  <Timer className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <Select value={demoSpeed} onValueChange={setDemoSpeed}>
                    <SelectTrigger className="h-7 w-20 text-xs border-blue-300 dark:border-blue-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow" className="text-xs">
                        Slow (8s)
                      </SelectItem>
                      <SelectItem value="normal" className="text-xs">
                        Normal (5s)
                      </SelectItem>
                      <SelectItem value="fast" className="text-xs">
                        Fast (3s)
                      </SelectItem>
                      <SelectItem value="very-fast" className="text-xs">
                        Very Fast (1.5s)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={isDemoPaused ? resumeDemo : pauseDemo}
                      className="flex items-center space-x-1 h-7"
                    >
                      {isDemoPaused ? (
                        <>
                          <Play className="w-3 h-3" />
                          <span className="text-xs">Resume</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3" />
                          <span className="text-xs">Pause</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isDemoPaused ? "Resume Demo Tour" : "Pause Demo Tour"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={skipToNext}
                      className="flex items-center space-x-1 h-7"
                    >
                      <SkipForward className="w-3 h-3" />
                      <span className="text-xs">Skip</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Skip to Next Tool in Demo</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={stopDemo}
                      className="flex items-center space-x-1 h-7"
                    >
                      <Square className="w-3 h-3" />
                      <span className="text-xs">Stop</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop Demo Tour</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        ) : null}

        {/* Header Collapse Toggle */}
        <div
          className={`flex justify-end pr-4 transition-all duration-300 ${headerCollapsed ? "py-1" : "py-0"}`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHeaderCollapsed(!headerCollapsed)}
                className="h-6 w-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-sm"
                data-testid="header-collapse-toggle"
                title={headerCollapsed ? "Expand header" : "Minimize header"}
              >
                <ChevronUp
                  className={`w-3 h-3 transition-transform duration-200 ${headerCollapsed ? "rotate-180" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{headerCollapsed ? "Expand Header" : "Minimize Header"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-1">
          {/* Sidebar - Always hamburger menu */}
          <Sheet
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            modal={false}
          >
            <SheetContent
              side="left"
              className="w-80 p-0 bg-white dark:bg-slate-900 border-0 shadow-2xl"
              style={{
                marginTop: "4rem",
                height: "fit-content",
                maxHeight: "calc(100vh - 4rem)",
              }}
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Navigation menu with all available developer tools organized
                  by category
                </SheetDescription>
              </SheetHeader>
              <Sidebar collapsed={false} />
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8 overflow-auto custom-scrollbar">
            {children}
          </main>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-4">
              <span>Ready</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>All operations client-side</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                Ctrl+M
              </kbd>
              <span>Menu</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                Ctrl+K
              </kbd>
              <span>Search</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                Ctrl+D
              </kbd>
              <span>Theme</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
