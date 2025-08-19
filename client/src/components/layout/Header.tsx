import { Search, Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/providers/theme-provider";
import { Link } from "wouter";
import { useSearch } from "@/hooks/use-search";
import { SearchResults } from "@/components/ui/search-results";
import { getToolsCount } from "@/data/tools";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedIndex,
    navigateResults,
    selectResult,
    resetSelection,
  } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowResults(value.trim().length > 0);
    resetSelection(); // Reset selection when search changes
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery("");
    setIsMobileSearchOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    resetSelection();
  };

  const focusSearch = () => {
    const searchInput = document.querySelector(
      '[data-testid="search-input"]'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation in search
  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!showResults || searchResults.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        navigateResults("down");
        break;
      case "ArrowUp":
        event.preventDefault();
        navigateResults("up");
        break;
      case "Enter": {
        event.preventDefault();
        const selected = selectResult();
        if (selected) {
          // Navigate to the selected result
          window.location.href = selected.path;
          handleResultClick();
        }
        break;
      }
      case "Escape":
        event.preventDefault();
        setShowResults(false);
        resetSelection();
        (event.target as HTMLInputElement).blur();
        break;
      default: {
        // Handle default case
      }
    }
  };

  // Add Ctrl+S keyboard shortcut for search
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        focusSearch();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  return (
    <TooltipProvider>
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm relative">
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title - Always leftmost */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="flex items-center space-x-3">
                {/* Blue FD Logo - toggles menu */}
                <div
                  className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-lg active:scale-95"
                  onClick={onMenuClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onMenuClick();
                    }
                  }}
                  aria-label="Toggle navigation menu"
                  data-testid="logo-menu-toggle"
                >
                  <span className="text-white text-sm font-bold transition-transform duration-300">
                    FD
                  </span>
                </div>

                {/* Text Logo - links to homepage */}
                <Link href="/">
                  <div className="hidden sm:block cursor-pointer hover:opacity-80 transition-opacity">
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      FreeDevTool.App
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      Free, Secure, Open Source, and Offline
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-3">
              {/* Desktop Search */}
              <div className="hidden md:block relative z-50" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 z-10" />
                <Input
                  type="text"
                  placeholder={`Search ${getToolsCount()} tools... (Ctrl+S)`}
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 pr-8 w-64 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  data-testid="search-input"
                  onFocus={() => setShowResults(searchQuery.trim().length > 0)}
                />
                {searchQuery ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                        data-testid="desktop-clear-search"
                      >
                        <X className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear Search</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                {showResults ? (
                  <SearchResults
                    results={searchResults}
                    onResultClick={handleResultClick}
                    selectedIndex={selectedIndex}
                  />
                ) : null}
              </div>

              {/* Mobile Search Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden h-10 w-10 p-0 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors touch-manipulation"
                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                    data-testid="mobile-search-toggle"
                    aria-label="Toggle search"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open Search (Ctrl+S)</p>
                </TooltipContent>
              </Tooltip>

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="h-10 w-10 p-0 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors touch-manipulation"
                    data-testid="theme-toggle"
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to {theme === "dark" ? "Light" : "Dark"} Mode</p>
                </TooltipContent>
              </Tooltip>

              {/* Hamburger Menu - Always visible */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors touch-manipulation"
                    onClick={onMenuClick}
                    data-testid="menu-button"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open Menu (Ctrl+M)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobileSearchOpen ? (
            <div
              className="md:hidden border-t border-slate-200 dark:border-slate-700 p-4 relative z-50"
              ref={searchRef}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 z-10" />
                <Input
                  type="text"
                  placeholder={`Search ${getToolsCount()} tools... (Ctrl+S)`}
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10 pr-8 w-full bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  data-testid="mobile-search-input"
                  autoFocus
                />
                {searchQuery ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                        data-testid="mobile-clear-search"
                      >
                        <X className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear Search</p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
              {showResults ? (
                <SearchResults
                  results={searchResults}
                  onResultClick={handleResultClick}
                  selectedIndex={selectedIndex}
                  className="mt-2 relative"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </header>
    </TooltipProvider>
  );
}
