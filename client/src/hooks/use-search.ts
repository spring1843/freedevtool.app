import { useState, useMemo } from "react";
import { toolsData, type ToolData } from "@/data/tools";

export interface SearchResult {
  name: string;
  path: string;
  shortcut: string;
  description: string;
  section: string;
  color: string;
}

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    Object.entries(toolsData).forEach(([section, data]) => {
      data.tools.forEach(tool => {
        const nameMatch = tool.name.toLowerCase().includes(query);
        const descriptionMatch = tool.description.toLowerCase().includes(query);
        const shortcutMatch = tool.shortcut.toLowerCase().includes(query);
        
        if (nameMatch || descriptionMatch || shortcutMatch) {
          results.push({
            ...tool,
            section,
            color: data.color
          });
        }
      });
    });



    // Sort results by relevance - prioritize name matches
    return results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(query);
      const bNameMatch = b.name.toLowerCase().includes(query);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery]);

  const filteredToolsData = useMemo(() => {
    if (!searchQuery.trim()) return toolsData;
    
    const filtered: ToolData = {};
    Object.entries(toolsData).forEach(([section, data]) => {
      const matchingTools = data.tools.filter(tool => {
        const query = searchQuery.toLowerCase();
        return tool.name.toLowerCase().includes(query) ||
               tool.description.toLowerCase().includes(query) ||
               tool.shortcut.toLowerCase().includes(query);
      });
      
      if (matchingTools.length > 0) {
        filtered[section] = { ...data, tools: matchingTools };
      }
    });
    return filtered;
  }, [searchQuery]);

  const navigateResults = (direction: 'up' | 'down') => {
    if (searchResults.length === 0) return;
    
    if (direction === 'down') {
      setSelectedIndex(prev => prev < searchResults.length - 1 ? prev + 1 : 0);
    } else {
      setSelectedIndex(prev => prev > 0 ? prev - 1 : searchResults.length - 1);
    }
  };

  const selectResult = () => {
    if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
      return searchResults[selectedIndex];
    }
    return null;
  };

  const resetSelection = () => {
    setSelectedIndex(-1);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    filteredToolsData,
    hasResults: searchResults.length > 0,
    isEmpty: searchQuery.trim() !== "" && searchResults.length === 0,
    selectedIndex,
    navigateResults,
    selectResult,
    resetSelection
  };
}