import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Type, Grid3X3, Hash, Star, ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";

interface UnicodeBlock {
  name: string;
  start: number;
  end: number;
  description: string;
}

// Common Unicode blocks
const UNICODE_BLOCKS: UnicodeBlock[] = [
  { name: 'Basic Latin', start: 0x0020, end: 0x007F, description: 'Standard ASCII characters' },
  { name: 'Latin-1 Supplement', start: 0x0080, end: 0x00FF, description: 'Extended Latin characters' },
  { name: 'Latin Extended-A', start: 0x0100, end: 0x017F, description: 'Additional Latin characters' },
  { name: 'Latin Extended-B', start: 0x0180, end: 0x024F, description: 'More Latin extensions' },
  { name: 'Greek and Coptic', start: 0x0370, end: 0x03FF, description: 'Greek alphabet and symbols' },
  { name: 'Cyrillic', start: 0x0400, end: 0x04FF, description: 'Cyrillic script (Russian, Bulgarian, etc.)' },
  { name: 'Arabic', start: 0x0600, end: 0x06FF, description: 'Arabic script and symbols' },
  { name: 'Hebrew', start: 0x0590, end: 0x05FF, description: 'Hebrew script' },
  { name: 'Devanagari', start: 0x0900, end: 0x097F, description: 'Hindi, Sanskrit, and other scripts' },
  { name: 'Chinese CJK', start: 0x4E00, end: 0x4E7F, description: 'Chinese, Japanese, Korean characters (sample)' },
  { name: 'Hiragana', start: 0x3040, end: 0x309F, description: 'Japanese Hiragana syllabary' },
  { name: 'Katakana', start: 0x30A0, end: 0x30FF, description: 'Japanese Katakana syllabary' },
  { name: 'Geometric Shapes', start: 0x25A0, end: 0x25FF, description: 'Circles, squares, triangles' },
  { name: 'Mathematical Operators', start: 0x2200, end: 0x22FF, description: 'Math symbols and operators' },
  { name: 'Arrows', start: 0x2190, end: 0x21FF, description: 'Arrow symbols' },
  { name: 'Box Drawing', start: 0x2500, end: 0x257F, description: 'Line drawing characters' },
  { name: 'Block Elements', start: 0x2580, end: 0x259F, description: 'Block and shading characters' },
  { name: 'Miscellaneous Symbols', start: 0x2600, end: 0x26FF, description: 'Various symbols and pictographs' },
  { name: 'Dingbats', start: 0x2700, end: 0x27BF, description: 'Decorative symbols and characters' },
  { name: 'Emoticons', start: 0x1F600, end: 0x1F64F, description: 'Emoji faces and gestures' },
  { name: 'Transport Symbols', start: 0x1F680, end: 0x1F6FF, description: 'Vehicle and transport emoji' },
  { name: 'Symbols and Pictographs', start: 0x1F300, end: 0x1F5FF, description: 'Weather, objects, and symbols' }
];

// Popular character categories
const POPULAR_CATEGORIES = {
  'Currency': [0x0024, 0x00A2, 0x00A3, 0x00A4, 0x00A5, 0x20AC, 0x00A1, 0x00BF],
  'Math Symbols': [0x00B1, 0x00D7, 0x00F7, 0x2260, 0x2264, 0x2265, 0x221E, 0x2211, 0x220F, 0x221A],
  'Arrows': [0x2190, 0x2191, 0x2192, 0x2193, 0x2194, 0x2195, 0x2196, 0x2197, 0x2198, 0x2199],
  'Stars & Hearts': [0x2605, 0x2606, 0x2665, 0x2660, 0x2663, 0x2666, 0x2764, 0x1F496, 0x1F497],
  'Punctuation': [0x00A1, 0x00BF, 0x2026, 0x2013, 0x2014, 0x201C, 0x201D, 0x2018, 0x2019],
  'Copyright': [0x00A9, 0x00AE, 0x2122, 0x2120, 0x2117, 0x00A7, 0x00B6]
};

export default function UnicodeCharacters() {
  const [selectedBlock, setSelectedBlock] = useState('Basic Latin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState<'block' | 'category' | 'search' | 'custom' | 'all'>('block');
  const [copiedChar, setCopiedChar] = useState<string>('');
  
  // Pagination for "ALL" unicode characters view and custom range
  const [currentPage, setCurrentPage] = useState(0);
  const [customRangePage, setCustomRangePage] = useState(0);
  const CHARS_PER_PAGE = 256; // 16x16 grid
  const CUSTOM_CHARS_PER_PAGE = 1000; // Show 1000 characters per page for custom range
  const MAX_UNICODE = 0x10FFFF; // Maximum Unicode code point
  
  const { toast } = useToast();

  // Get characters from selected block
  const getBlockCharacters = (block: UnicodeBlock): string[] => {
    const chars: string[] = [];
    const maxChars = Math.min(block.end - block.start + 1, 200); // Limit for performance
    
    for (let i = 0; i < maxChars; i++) {
      const codePoint = block.start + i;
      if (codePoint <= block.end) {
        try {
          const char = String.fromCodePoint(codePoint);
          // Skip control characters and some problematic ranges
          if (codePoint >= 0x20 && char && char.trim()) {
            chars.push(char);
          }
        } catch {
          // Skip invalid code points
        }
      }
    }
    
    return chars;
  };

  // Get characters from category
  const getCategoryCharacters = (category: string): string[] => {
    const codePoints = POPULAR_CATEGORIES[category as keyof typeof POPULAR_CATEGORIES] || [];
    return codePoints.map(cp => String.fromCodePoint(cp));
  };

  // Get characters from custom range with pagination
  const getCustomRangeCharacters = (start: string, end: string): string[] => {
    const startCode = parseInt(start, 16);
    const endCode = parseInt(end, 16);
    
    if (isNaN(startCode) || isNaN(endCode) || startCode > endCode) {
      return [];
    }
    
    // Calculate pagination range for custom unicode characters display
    const pageStart = startCode + (customRangePage * CUSTOM_CHARS_PER_PAGE);
    const pageEnd = Math.min(pageStart + CUSTOM_CHARS_PER_PAGE - 1, endCode);
    
    const chars: string[] = [];
    
    for (let codePoint = pageStart; codePoint <= pageEnd; codePoint++) {
      try {
        const char = String.fromCodePoint(codePoint);
        chars.push(char);
      } catch {
        // Skip invalid code points
        chars.push(''); // Add empty placeholder
      }
    }
    
    return chars;
  };

  // Get total pages for custom range
  const getCustomRangeTotalPages = (start: string, end: string): number => {
    const startCode = parseInt(start, 16);
    const endCode = parseInt(end, 16);
    
    if (isNaN(startCode) || isNaN(endCode) || startCode > endCode) {
      return 0;
    }
    
    const totalRange = endCode - startCode + 1;
    return Math.ceil(totalRange / CUSTOM_CHARS_PER_PAGE);
  };

  // Get current range info for custom range
  const getCustomRangeInfo = (start: string, end: string): string => {
    const startCode = parseInt(start, 16);
    const endCode = parseInt(end, 16);
    
    if (isNaN(startCode) || isNaN(endCode) || startCode > endCode) {
      return 'Invalid range';
    }
    
    const pageStart = startCode + (customRangePage * CUSTOM_CHARS_PER_PAGE);
    const pageEnd = Math.min(pageStart + CUSTOM_CHARS_PER_PAGE - 1, endCode);
    
    return `U+${pageStart.toString(16).toUpperCase().padStart(4, '0')} - U+${pageEnd.toString(16).toUpperCase().padStart(4, '0')}`;
  };

  // Filter characters by search
  const searchCharacters = (query: string): string[] => {
    if (!query.trim()) return [];
    
    const chars: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Search through common blocks
    const searchBlocks = [
      UNICODE_BLOCKS.find(b => b.name === 'Basic Latin'),
      UNICODE_BLOCKS.find(b => b.name === 'Latin-1 Supplement'),
      UNICODE_BLOCKS.find(b => b.name === 'Mathematical Operators'),
      UNICODE_BLOCKS.find(b => b.name === 'Geometric Shapes'),
      UNICODE_BLOCKS.find(b => b.name === 'Miscellaneous Symbols')
    ].filter(Boolean) as UnicodeBlock[];
    
    searchBlocks.forEach(block => {
      const blockChars = getBlockCharacters(block);
      blockChars.forEach(char => {
        const codePoint = char.codePointAt(0);
        if (codePoint) {
          const hexCode = codePoint.toString(16).toUpperCase();
          const unicodeName = `U+${hexCode.padStart(4, '0')}`;
          
          // Match by character, hex code, or unicode name
          if (char.includes(query) || 
              hexCode.includes(lowerQuery.toUpperCase()) ||
              unicodeName.toLowerCase().includes(lowerQuery)) {
            chars.push(char);
          }
        }
      });
    });
    
    return chars.slice(0, 100); // Limit search results
  };

  // Get characters for the "ALL" view with pagination
  const getAllViewCharacters = (): string[] => {
    const start = currentPage * CHARS_PER_PAGE;
    const end = Math.min(start + CHARS_PER_PAGE, MAX_UNICODE);
    const chars: string[] = [];
    
    for (let i = start; i < end; i++) {
      try {
        const char = String.fromCodePoint(i);
        // Skip control characters and private use areas for better display
        if (i < 32 || (i >= 0x7F && i < 0xA0) || (i >= 0xE000 && i <= 0xF8FF)) {
          chars.push(''); // Empty placeholder for control chars
        } else {
          chars.push(char);
        }
      } catch {
        chars.push(''); // Skip invalid code points
      }
    }
    
    return chars;
  };

  const getTotalPages = (): number => Math.ceil(MAX_UNICODE / CHARS_PER_PAGE);

  const getCurrentRangeInfo = (): string => {
    const start = currentPage * CHARS_PER_PAGE;
    const end = Math.min(start + CHARS_PER_PAGE - 1, MAX_UNICODE);
    return `U+${start.toString(16).toUpperCase().padStart(4, '0')} - U+${end.toString(16).toUpperCase().padStart(4, '0')}`;
  };

  // Get current characters based on view mode
  const currentCharacters = useMemo(() => {
    switch (viewMode) {
      case 'all':
        return getAllViewCharacters();
      case 'block':
        const block = UNICODE_BLOCKS.find(b => b.name === selectedBlock);
        return block ? getBlockCharacters(block) : [];
      case 'category':
        return selectedCategory ? getCategoryCharacters(selectedCategory) : [];
      case 'search':
        return searchCharacters(searchQuery);
      case 'custom':
        return getCustomRangeCharacters(customRange.start, customRange.end);
      default:
        return [];
    }
  }, [viewMode, selectedBlock, selectedCategory, searchQuery, customRange, currentPage, customRangePage]);

  // Copy character to clipboard
  const copyCharacter = async (char: string) => {
    try {
      await navigator.clipboard.writeText(char);
      setCopiedChar(char);
      setTimeout(() => setCopiedChar(''), 2000);
      
      const codePoint = char.codePointAt(0);
      const unicodeName = codePoint ? `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}` : '';
      
      toast({
        title: "Character Copied",
        description: `${char} (${unicodeName}) copied to clipboard.`,
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy character to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Get character info
  const getCharacterInfo = (char: string) => {
    const codePoint = char.codePointAt(0);
    if (!codePoint) return null;
    
    return {
      char,
      decimal: codePoint,
      hex: codePoint.toString(16).toUpperCase(),
      unicode: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
      html: `&#${codePoint};`,
      htmlHex: `&#x${codePoint.toString(16).toUpperCase()};`
    };
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="UC-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Unicode Character Map
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Browse and copy Unicode characters from various scripts and symbol sets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="w-5 h-5 mr-2" />
                Browse Characters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>View Mode</Label>
                <Select value={viewMode} onValueChange={(value: typeof viewMode) => setViewMode(value)}>
                  <SelectTrigger data-testid="view-mode-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Unicode Blocks</SelectItem>
                    <SelectItem value="category">Popular Categories</SelectItem>
                    <SelectItem value="all">ALL Characters</SelectItem>
                    <SelectItem value="search">Search</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {viewMode === 'block' && (
                <div>
                  <Label>Unicode Block</Label>
                  <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                    <SelectTrigger data-testid="unicode-block-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {UNICODE_BLOCKS.map((block) => (
                        <SelectItem key={block.name} value={block.name}>
                          {block.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {viewMode === 'category' && (
                <div>
                  <Label>Character Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="category-select">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(POPULAR_CATEGORIES).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {viewMode === 'search' && (
                <div>
                  <Label htmlFor="search-input">Search Characters</Label>
                  <Input
                    id="search-input"
                    placeholder="Search by character or Unicode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="search-input"
                  />
                </div>
              )}

              {viewMode === 'all' && (
                <div className="space-y-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <div>Page {(currentPage + 1).toLocaleString()} of {getTotalPages().toLocaleString()}</div>
                    <div className="font-mono text-xs mt-1">
                      {getCurrentRangeInfo()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(0)}
                        disabled={currentPage === 0}
                        data-testid="first-page-button"
                      >
                        <SkipBack className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        data-testid="prev-page-button"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(getTotalPages() - 1, currentPage + 1))}
                        disabled={currentPage >= getTotalPages() - 1}
                        data-testid="next-page-button"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(getTotalPages() - 1)}
                        disabled={currentPage >= getTotalPages() - 1}
                        data-testid="last-page-button"
                      >
                        <SkipForward className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-1">
                      <Input
                        placeholder="Go to page..."
                        className="text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            const page = parseInt(target.value, 10) - 1;
                            if (!isNaN(page) && page >= 0 && page < getTotalPages()) {
                              setCurrentPage(page);
                              target.value = '';
                            }
                          }
                        }}
                        data-testid="page-jump-input"
                      />
                    </div>
                    
                    <div className="text-xs text-slate-500">
                      {CHARS_PER_PAGE} characters per page
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom Unicode Range (Hex)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Start (e.g., 0020)"
                      value={customRange.start}
                      onChange={(e) => {
                        setCustomRange({ ...customRange, start: e.target.value });
                        setCustomRangePage(0); // Reset to first page when range changes
                      }}
                      data-testid="custom-start"
                    />
                    <Input
                      placeholder="End (e.g., 007F)"
                      value={customRange.end}
                      onChange={(e) => {
                        setCustomRange({ ...customRange, end: e.target.value });
                        setCustomRangePage(0); // Reset to first page when range changes
                      }}
                      data-testid="custom-end"
                    />
                  </div>
                  
                  {/* Custom range pagination controls */}
                  {customRange.start && customRange.end && getCustomRangeTotalPages(customRange.start, customRange.end) > 1 ? <div className="space-y-3 mt-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <div>Page {(customRangePage + 1).toLocaleString()} of {getCustomRangeTotalPages(customRange.start, customRange.end).toLocaleString()}</div>
                        <div className="font-mono text-xs mt-1">
                          {getCustomRangeInfo(customRange.start, customRange.end)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCustomRangePage(0)}
                            disabled={customRangePage === 0}
                            data-testid="custom-first-page-button"
                          >
                            <SkipBack className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCustomRangePage(Math.max(0, customRangePage - 1))}
                            disabled={customRangePage === 0}
                            data-testid="custom-prev-page-button"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCustomRangePage(Math.min(getCustomRangeTotalPages(customRange.start, customRange.end) - 1, customRangePage + 1))}
                            disabled={customRangePage >= getCustomRangeTotalPages(customRange.start, customRange.end) - 1}
                            data-testid="custom-next-page-button"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCustomRangePage(getCustomRangeTotalPages(customRange.start, customRange.end) - 1)}
                            disabled={customRangePage >= getCustomRangeTotalPages(customRange.start, customRange.end) - 1}
                            data-testid="custom-last-page-button"
                          >
                            <SkipForward className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-xs text-slate-500">
                          {CUSTOM_CHARS_PER_PAGE} characters per page
                        </div>
                      </div>
                    </div> : null}
                </div>
              )}

              <div className="text-xs text-slate-600 dark:text-slate-400">
                <p><strong>Characters shown:</strong> {currentCharacters.length}</p>
                {viewMode === 'block' && (
                  <p className="mt-1">
                    {UNICODE_BLOCKS.find(b => b.name === selectedBlock)?.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.keys(POPULAR_CATEGORIES).map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewMode('category');
                      setSelectedCategory(category);
                    }}
                    className="w-full justify-start text-xs"
                    data-testid={`quick-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Character Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Grid3X3 className="w-5 h-5 mr-2" />
                  Character Grid
                </div>
                {currentCharacters.length > 0 && (
                  <Badge variant="secondary">
                    {currentCharacters.length} characters
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentCharacters.length > 0 ? (
                <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-1 max-h-96 overflow-y-auto">
                  {currentCharacters.map((char, index) => {
                    const info = getCharacterInfo(char);
                    const isCopied = copiedChar === char;
                    const isEmpty = char === '';
                    const codePoint = (currentPage * CHARS_PER_PAGE) + index;
                    
                    if (isEmpty && viewMode === 'all') {
                      // Show empty placeholder for control characters
                      return (
                        <div
                          key={`empty-${index}`}
                          className="aspect-square p-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center"
                          title={`U+${codePoint.toString(16).toUpperCase().padStart(4, '0')} - Control Character`}
                        >
                          <span className="text-xs text-slate-400">•</span>
                        </div>
                      );
                    }
                    
                    return (
                      <Button
                        key={`${char}-${index}`}
                        variant="outline"
                        size="sm"
                        onClick={() => copyCharacter(char)}
                        className={`aspect-square p-1 text-lg font-mono hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors ${
                          isCopied ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700' : ''
                        }`}
                        title={info ? `${char} - ${info.unicode}` : char}
                        data-testid={`char-${index}`}
                      >
                        {char}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="min-h-96 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <Type className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Characters Found</p>
                    <p className="text-sm">
                      {viewMode === 'search' ? 'Try a different search term' :
                       viewMode === 'custom' ? 'Enter a valid Unicode range' :
                       viewMode === 'category' ? 'Select a character category' :
                       viewMode === 'all' ? 'Browsing all Unicode characters' :
                       'Select a Unicode block to view characters'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="UC-002" size="medium" />
      </div>

      {/* Character Info & Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            How to Use Unicode Characters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Usage Instructions:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Click any character to copy it to clipboard</li>
                <li>• Paste the character anywhere you need it</li>
                <li>• Use HTML entities in web development</li>
                <li>• Unicode names help identify characters</li>
                <li>• Some characters may not display on all devices</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Character Formats:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• <strong>Unicode:</strong> U+0041 (standard notation)</li>
                <li>• <strong>HTML Decimal:</strong> &amp;#65; (for web)</li>
                <li>• <strong>HTML Hex:</strong> &amp;#x41; (for web)</li>
                <li>• <strong>CSS:</strong> content: "\\0041" (in CSS)</li>
                <li>• <strong>JavaScript:</strong> String.fromCodePoint(0x41)</li>
              </ul>
            </div>
          </div>
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Tip:</strong> Not all Unicode characters will display correctly on every device or font. 
              Test important characters across different browsers and operating systems.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="UC-003" size="large" />
      </div>
    </div>
  );
}