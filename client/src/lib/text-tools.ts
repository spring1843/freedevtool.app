import type {
  DiffLine,
  RegexMatch,
  SortOrder,
  SortType,
  TextStats,
} from "@/types/tools";

// Enhanced diff with word-level highlighting for modified lines
function getWordDiff(
  line1: string,
  line2: string
): {
  type: "modified";
  content: string;
  highlightedContent: string;
  lineNumber?: number;
} {
  const words1 = line1.split(/(\s+)/);
  const words2 = line2.split(/(\s+)/);
  const maxLength = Math.max(words1.length, words2.length);

  let highlightedContent = "";

  for (let i = 0; i < maxLength; i++) {
    const word1 = words1[i] || "";
    const word2 = words2[i] || "";

    if (word1 !== word2) {
      if (word2) {
        highlightedContent += `<mark class="diff-word-modified">${word2}</mark>`;
      }
    } else {
      highlightedContent += word2;
    }
  }

  return {
    type: "modified",
    content: line2,
    highlightedContent,
  };
}

export function computeTextDiff(
  text1: string,
  text2: string
): {
  diff: DiffLine[];
  stats: {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
    charactersAdded: number;
    charactersRemoved: number;
    charactersModified: number;
  };
} {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");
  const diff: DiffLine[] = [];

  let i = 0,
    j = 0;
  let lineNum = 1; // Track the current logical line number

  // Statistics tracking
  let linesAdded = 0;
  let linesRemoved = 0;
  let linesModified = 0;
  let charactersAdded = 0;
  let charactersRemoved = 0;
  let charactersModified = 0;

  while (i < lines1.length || j < lines2.length) {
    if (i >= lines1.length) {
      // Remaining lines in text2 are additions
      diff.push({ type: "add", content: lines2[j], lineNumber: lineNum });
      linesAdded++;
      charactersAdded += lines2[j].length;
      j++;
      lineNum++;
    } else if (j >= lines2.length) {
      // Remaining lines in text1 are removals
      diff.push({ type: "remove", content: lines1[i], lineNumber: lineNum });
      linesRemoved++;
      charactersRemoved += lines1[i].length;
      i++;
      lineNum++;
    } else if (lines1[i] === lines2[j]) {
      // Lines are the same
      diff.push({ type: "normal", content: lines1[i], lineNumber: lineNum });
      i++;
      j++;
      lineNum++;
    } else {
      // Check if lines are similar enough for word-level diff
      const similarity = calculateLineSimilarity(lines1[i], lines2[j]);

      if (similarity > 0.3) {
        // If lines are somewhat similar, show word-level diff
        const wordDiff = getWordDiff(lines1[i], lines2[j]);
        diff.push({
          type: "remove",
          content: lines1[i],
          lineNumber: lineNum,
        });
        diff.push({
          type: "add",
          content: lines2[j],
          highlightedContent: wordDiff.highlightedContent,
          lineNumber: lineNum,
        });
        linesModified++;
        charactersRemoved += lines1[i].length;
        charactersAdded += lines2[j].length;
        charactersModified += Math.abs(lines2[j].length - lines1[i].length);
      } else {
        // Lines are completely different
        diff.push({ type: "remove", content: lines1[i], lineNumber: lineNum });
        diff.push({ type: "add", content: lines2[j], lineNumber: lineNum });
        linesRemoved++;
        linesAdded++;
        charactersRemoved += lines1[i].length;
        charactersAdded += lines2[j].length;
      }

      i++;
      j++;
      lineNum++;
    }
  }

  return {
    diff,
    stats: {
      linesAdded,
      linesRemoved,
      linesModified,
      charactersAdded,
      charactersRemoved,
      charactersModified,
    },
  };
}

// Calculate similarity between two lines (0-1, where 1 is identical)
function calculateLineSimilarity(line1: string, line2: string): number {
  const words1 = new Set(line1.toLowerCase().split(/\s+/));
  const words2 = new Set(line2.toLowerCase().split(/\s+/));

  const intersection = new Set(
    Array.from(words1).filter(word => words2.has(word))
  );
  const union = new Set([...Array.from(words1), ...Array.from(words2)]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

export function testRegex(
  pattern: string,
  text: string,
  flags = "g"
): {
  matches: RegexMatch[];
  error?: string;
} {
  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];
    let match;

    if (flags.includes("g")) {
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
        });

        // Prevent infinite loop on empty matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    } else {
      match = regex.exec(text);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
        });
      }
    }

    return { matches };
  } catch (error) {
    return {
      matches: [],
      error: `Invalid regex: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export function sortText(
  text: string,
  sortType: SortType,
  order: SortOrder,
  caseSensitive = false
): string {
  const lines = text.split("\n");

  const processedLines = lines.map(line => ({
    original: line,
    processed: caseSensitive ? line : line.toLowerCase(),
  }));

  processedLines.sort((a, b) => {
    let comparison = 0;

    switch (sortType) {
      case "alphabetical":
        comparison = a.processed.localeCompare(b.processed);
        break;
      case "numerical": {
        const numA = parseFloat(a.processed);
        const numB = parseFloat(b.processed);
        if (!isNaN(numA) && !isNaN(numB)) {
          comparison = numA - numB;
        } else {
          comparison = a.processed.localeCompare(b.processed);
        }
        break;
      }
      case "length":
        comparison = a.original.length - b.original.length;
        if (comparison === 0) {
          comparison = a.processed.localeCompare(b.processed);
        }
        break;
      default:
        comparison = a.processed.localeCompare(b.processed);
        break;
    }

    return order === "desc" ? -comparison : comparison;
  });

  return processedLines.map(line => line.original).join("\n");
}

export function countTextStats(text: string): TextStats {
  if (!text.trim()) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      bytes: 0,
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // Count words (split by whitespace and filter empty strings)
  const words = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // Count sentences (split by sentence endings)
  const sentences = text
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 0).length;

  // Count paragraphs (split by double newlines or more)
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter(paragraph => paragraph.trim().length > 0).length;

  // Count lines
  const lines = text.split("\n").length;

  // Calculate bytes using UTF-8 encoding (proper Unicode character support)
  const bytes = new TextEncoder().encode(text).length;

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    bytes,
  };
}
