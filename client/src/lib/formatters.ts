import * as yaml from "js-yaml";
import * as prettier from "prettier";

export async function formatJSON(input: string): Promise<{
  formatted: string;
  error?: string;
}> {
  try {
    // First validate the JSON
    const parsed = JSON.parse(input);

    try {
      // Use Prettier for professional formatting
      const formatted = await prettier.format(input, {
        parser: "json",
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semicolons: true,
        singleQuote: false,
        trailingComma: "none",
      });
      return { formatted: formatted.trim() };
    } catch {
      // Fallback to basic JSON formatting
      return { formatted: JSON.stringify(parsed, null, 2) };
    }
  } catch (error) {
    return {
      formatted: input,
      error: `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

interface ValidationIssue {
  type: "error" | "warning";
  message: string;
  line?: number;
  column?: number;
}

function validateHTML(input: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = input.split("\n");

  // Track open tags for validation
  const openTags: Array<{ name: string; line: number; column: number }> = [];
  const selfClosingTags = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    let columnNumber = 0;

    // Find all tags in the line
    const tagRegex = /<\/?[^>]+>/g;
    let match;

    while ((match = tagRegex.exec(line)) !== null) {
      columnNumber = match.index + 1;
      const fullTag = match[0];
      const tagContent = fullTag.slice(1, -1);

      if (tagContent.startsWith("!")) {
        // Skip comments and DOCTYPE
        continue;
      }

      const isClosingTag = tagContent.startsWith("/");
      const tagMatch = tagContent.match(/^\/?\s*([a-zA-Z0-9-]+)/);

      if (!tagMatch) {
        issues.push({
          type: "error",
          message: `Invalid tag syntax: ${fullTag}`,
          line: lineNumber,
          column: columnNumber,
        });
        continue;
      }

      const tagName = tagMatch[1].toLowerCase();
      const isSelfClosing =
        selfClosingTags.has(tagName) || tagContent.endsWith("/");

      if (isClosingTag) {
        // Check if there's a matching opening tag
        const lastOpenTag = openTags.findIndex(tag => tag.name === tagName);
        if (lastOpenTag === -1) {
          issues.push({
            type: "error",
            message: `Closing tag </${tagName}> has no matching opening tag`,
            line: lineNumber,
            column: columnNumber,
          });
        } else {
          // Remove all tags from this point (handles nested unclosed tags)
          const unclosedTags = openTags.splice(lastOpenTag + 1);
          unclosedTags.forEach(tag => {
            issues.push({
              type: "warning",
              message: `Unclosed tag <${tag.name}> opened at line ${tag.line}`,
              line: tag.line,
              column: tag.column,
            });
          });
          openTags.pop(); // Remove the matched opening tag
        }
      } else if (!isSelfClosing) {
        // Opening tag - add to stack
        openTags.push({
          name: tagName,
          line: lineNumber,
          column: columnNumber,
        });
      }
    }
  }

  // Check for unclosed tags at the end
  openTags.forEach(tag => {
    issues.push({
      type: "error",
      message: `Unclosed tag <${tag.name}>`,
      line: tag.line,
      column: tag.column,
    });
  });

  return issues;
}

export async function formatHTML(
  input: string,
  minify = false
): Promise<{
  formatted: string;
  error?: string;
  warnings?: ValidationIssue[];
}> {
  try {
    // Validate HTML first
    const validationIssues = validateHTML(input);
    const errors = validationIssues.filter(issue => issue.type === "error");
    const warnings = validationIssues.filter(issue => issue.type === "warning");

    let formatted: string;

    if (minify) {
      // Use Prettier to minify HTML by formatting first, then minifying
      try {
        const prettierFormatted = await prettier.format(input, {
          parser: "html",
          printWidth: 1000, // Very long line width for minification
          tabWidth: 0,
          useTabs: false,
          singleQuote: false,
          htmlWhitespaceSensitivity: "ignore",
        });

        // Additional minification steps
        formatted = prettierFormatted
          // Remove comments (but preserve conditional comments)
          .replace(/<!--(?!\[if|\s*\[if)[\s\S]*?-->/g, "")
          // Remove unnecessary whitespace between tags
          .replace(/>\s+</g, "><")
          // Remove leading/trailing whitespace from lines
          .replace(/^\s+|\s+$/gm, "")
          // Collapse multiple spaces within content
          .replace(/\s{2,}/g, " ")
          // Remove whitespace around attribute equals
          .replace(/\s*=\s*/g, "=")
          .trim();
      } catch {
        // Fallback to simple minification if Prettier fails
        formatted = input
          .replace(/<!--(?!\[if|\s*\[if)[\s\S]*?-->/g, "")
          .replace(/>\s+</g, "><")
          .replace(/^\s+|\s+$/gm, "")
          .replace(/\s{2,}/g, " ")
          .replace(/\s*=\s*/g, "=")
          .trim();
      }
    } else {
      // Use Prettier to beautify HTML
      try {
        formatted = await prettier.format(input, {
          parser: "html",
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          singleQuote: false,
          htmlWhitespaceSensitivity: "css",
          bracketSameLine: false,
        });
      } catch {
        // Fallback to custom formatting if Prettier fails
        formatted = await fallbackHTMLFormatter(input);
      }
    }

    if (errors.length > 0) {
      const errorMessage = errors
        .slice(0, 3)
        .map(e => `Line ${e.line}: ${e.message}`)
        .join("; ");
      return {
        formatted,
        error: `HTML validation errors: ${errorMessage}${errors.length > 3 ? ` (${errors.length - 3} more...)` : ""}`,
        warnings,
      };
    }

    return { formatted, warnings };
  } catch (error) {
    return {
      formatted: input,
      error: `HTML formatting error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function fallbackHTMLFormatter(input: string): Promise<string> {
  // Fallback HTML formatter implementation
  const cleanInput = input.trim().replace(/>\s+</g, "><");

  // Define self-closing tags
  const selfClosingTags = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  // Define tags that should preserve whitespace
  const preformattedTags = new Set(["pre", "code", "script", "style"]);

  let indentLevel = 0;
  const indentSize = 2;
  const result: string[] = [];
  let i = 0;
  let inPreformatted = false;
  let preformattedContent = "";
  let currentPreformattedTag = "";

  while (i < cleanInput.length) {
    if (cleanInput[i] === "<") {
      // Find the end of the tag
      let tagEnd = i + 1;
      while (tagEnd < cleanInput.length && cleanInput[tagEnd] !== ">") {
        tagEnd++;
      }

      if (tagEnd >= cleanInput.length) break;

      const tagContent = cleanInput.substring(i + 1, tagEnd);
      const fullTag = cleanInput.substring(i, tagEnd + 1);

      // Extract tag name
      const tagMatch = tagContent.match(/^\/?\s*([a-zA-Z0-9-]+)/);
      if (!tagMatch) {
        i = tagEnd + 1;
        continue;
      }

      const isClosingTag = tagContent.startsWith("/");
      const tagName = tagMatch[1].toLowerCase();
      const isSelfClosing =
        selfClosingTags.has(tagName) || tagContent.endsWith("/");

      // Handle preformatted content
      if (preformattedTags.has(tagName)) {
        if (!isClosingTag && !inPreformatted) {
          inPreformatted = true;
          currentPreformattedTag = tagName;
          result.push(" ".repeat(indentLevel * indentSize) + fullTag);
          if (!isSelfClosing) indentLevel++;
        } else if (
          isClosingTag &&
          inPreformatted &&
          tagName === currentPreformattedTag
        ) {
          if (preformattedContent.trim()) {
            const lines = preformattedContent.split("\n");
            const currentIndent = indentLevel * indentSize;
            lines.forEach(line => {
              result.push(" ".repeat(currentIndent) + line);
            });
          }
          indentLevel--;
          result.push(" ".repeat(indentLevel * indentSize) + fullTag);
          inPreformatted = false;
          preformattedContent = "";
          currentPreformattedTag = "";
        }
      } else if (inPreformatted) {
        preformattedContent += fullTag;
      } else {
        if (isClosingTag) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        result.push(" ".repeat(indentLevel * indentSize) + fullTag);

        if (!isClosingTag && !isSelfClosing) {
          indentLevel++;
        }
      }

      i = tagEnd + 1;
    } else {
      // Handle text content
      let textEnd = i;
      while (textEnd < cleanInput.length && cleanInput[textEnd] !== "<") {
        textEnd++;
      }

      const textContent = cleanInput.substring(i, textEnd);

      if (inPreformatted) {
        preformattedContent += textContent;
      } else {
        const trimmedText = textContent.trim();
        if (trimmedText) {
          result.push(" ".repeat(indentLevel * indentSize) + trimmedText);
        }
      }

      i = textEnd;
    }
  }

  // Join results and clean up
  let formatted = result.join("\n");
  formatted = formatted.replace(/\n\s*\n\s*\n/g, "\n\n");

  return formatted;
}

export async function formatCSS(
  input: string,
  minify = false
): Promise<{ formatted: string; error?: string }> {
  try {
    if (minify) {
      try {
        // Use Prettier to format first, then minify
        const prettierFormatted = await prettier.format(input, {
          parser: "css",
          printWidth: 1000,
          tabWidth: 0,
          useTabs: false,
        });

        // Additional minification
        const minified = prettierFormatted
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\s+/g, " ")
          .replace(/\s*{\s*/g, "{")
          .replace(/\s*}\s*/g, "}")
          .replace(/\s*:\s*/g, ":")
          .replace(/\s*;\s*/g, ";")
          .replace(/\s*,\s*/g, ",")
          .replace(/;}/g, "}")
          .trim();

        return { formatted: minified };
      } catch {
        // Fallback minification
        const minified = input
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\s+/g, " ")
          .replace(/\s*{\s*/g, "{")
          .replace(/\s*}\s*/g, "}")
          .replace(/\s*:\s*/g, ":")
          .replace(/\s*;\s*/g, ";")
          .replace(/\s*,\s*/g, ",")
          .replace(/;}/g, "}")
          .trim();
        return { formatted: minified };
      }
    }

    try {
      // Use Prettier for beautification
      const formatted = await prettier.format(input, {
        parser: "css",
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
      });
      return { formatted };
    } catch {
      // Fallback formatting logic (existing implementation)
      let formatted = input
        .replace(/\/\*[\s\S]*?\*\//g, match => `\n${match}\n`)
        .replace(/\s+/g, " ")
        .trim();

      formatted = formatted
        .replace(/\{/g, " {\n")
        .replace(/\}/g, "\n}\n")
        .replace(/;(?!\s*\})/g, ";\n")
        .replace(/\n\s*\n+/g, "\n\n")
        .trim();

      const lines = formatted.split("\n");
      let indentLevel = 0;
      const finalFormatted = lines
        .map(line => {
          const trimmed = line.trim();
          if (!trimmed) return "";

          if (trimmed.startsWith("/*")) {
            return "  ".repeat(indentLevel) + trimmed;
          }

          if (trimmed === "}") {
            indentLevel = Math.max(0, indentLevel - 1);
            return "  ".repeat(indentLevel) + trimmed;
          }

          const result = "  ".repeat(indentLevel) + trimmed;

          if (trimmed.endsWith("{")) {
            indentLevel++;
          }

          return result;
        })
        .filter(line => line !== "")
        .join("\n");

      return { formatted: finalFormatted };
    }
  } catch (error) {
    return {
      formatted: input,
      error: `CSS formatting error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function formatYAML(input: string): Promise<{
  formatted: string;
  error?: string;
}> {
  try {
    // First validate YAML by parsing it
    const parsed = yaml.load(input);

    try {
      // Use Prettier for professional YAML formatting
      const formatted = await prettier.format(input, {
        parser: "yaml",
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
      });
      return { formatted: formatted.trim() };
    } catch {
      // Fallback to js-yaml for formatting
      try {
        const yamlFormatted = yaml.dump(parsed, {
          indent: 2,
          lineWidth: 80,
          noRefs: true,
          sortKeys: false,
        });
        return { formatted: yamlFormatted.trim() };
      } catch {
        // Basic YAML formatting fallback
        const lines = input.split("\n");
        const formatted = lines
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            const depth = (input.match(
              new RegExp(
                `^( *)${line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
                "m"
              )
            ) || ["", ""])[1].length;
            const indentLevel = Math.floor(depth / 2);
            return "  ".repeat(indentLevel) + line.trim();
          })
          .join("\n");

        return { formatted };
      }
    }
  } catch (error) {
    return {
      formatted: input,
      error: `YAML formatting error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function formatMarkdown(input: string): Promise<{
  formatted: string;
  error?: string;
}> {
  try {
    try {
      // Use Prettier for professional Markdown formatting
      const formatted = await prettier.format(input, {
        parser: "markdown",
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        proseWrap: "preserve",
        singleQuote: false,
      });
      return { formatted: formatted.trim() };
    } catch {
      // Fallback to basic markdown formatting
      const lines = input.split("\n");
      const formatted = lines
        .map(line => line.trim())
        .join("\n")
        .replace(/\n(#{1,6})/g, "\n\n$1")
        .replace(/(#{1,6}.*)\n/g, "$1\n\n")
        .replace(/\n([*-+])/g, "\n\n$1")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      return { formatted };
    }
  } catch (error) {
    return {
      formatted: input,
      error: `Markdown formatting error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function formatLESS(
  input: string,
  minify = false
): Promise<{ formatted: string; error?: string }> {
  try {
    if (minify) {
      try {
        // Use Prettier to format LESS first, then minify
        const prettierFormatted = await prettier.format(input, {
          parser: "less",
          printWidth: 1000,
          tabWidth: 0,
          useTabs: false,
        });

        // Additional minification
        const minified = prettierFormatted
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\/\/.*$/gm, "")
          .replace(/\s+/g, " ")
          .replace(/\s*{\s*/g, "{")
          .replace(/\s*}\s*/g, "}")
          .replace(/\s*:\s*/g, ":")
          .replace(/\s*;\s*/g, ";")
          .replace(/\s*,\s*/g, ",")
          .replace(/;}/g, "}")
          .trim();

        return { formatted: minified };
      } catch {
        // Fallback to CSS formatter for minification
        return await formatCSS(input, minify);
      }
    }

    try {
      // Use Prettier for LESS beautification
      const formatted = await prettier.format(input, {
        parser: "less",
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
      });
      return { formatted };
    } catch {
      // Fallback to CSS formatter
      return await formatCSS(input, minify);
    }
  } catch (error) {
    return {
      formatted: input,
      error: `LESS formatting error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function formatTypeScript(
  input: string,
  minify = false
): Promise<{ formatted: string; error?: string }> {
  try {
    if (minify) {
      // Basic minification for TypeScript/JavaScript
      const minified = input
        .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
        .replace(/\/\/.*$/gm, "") // Remove line comments
        .replace(/\s+/g, " ") // Collapse whitespace
        .replace(/\s*{\s*/g, "{")
        .replace(/\s*}\s*/g, "}")
        .replace(/\s*;\s*/g, ";")
        .replace(/\s*,\s*/g, ",")
        .replace(/\s*:\s*/g, ":")
        .replace(/\s*\(\s*/g, "(")
        .replace(/\s*\)\s*/g, ")")
        .trim();

      return { formatted: minified };
    }

    // Custom TypeScript/JavaScript beautifier since Prettier's typescript parser isn't available
    const formatted = input.trim();
    let indentLevel = 0;
    const indentStr = "  ";
    const lines: string[] = [];
    let currentLine = "";
    let inString = false;
    let stringChar = "";
    let inComment = false;

    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      const nextChar = formatted[i + 1] || "";

      // Handle string literals
      if (!inComment && (char === '"' || char === "'" || char === "`")) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar && formatted[i - 1] !== "\\") {
          inString = false;
          stringChar = "";
        }
        currentLine += char;
        continue;
      }

      // Handle comments
      if (!inString) {
        if (char === "/" && nextChar === "/") {
          inComment = true;
          currentLine += char;
          continue;
        }
        if (char === "/" && nextChar === "*") {
          // Block comment start
          currentLine += char;
          continue;
        }
        if (char === "*" && nextChar === "/") {
          // Block comment end
          currentLine += char + nextChar;
          i++; // Skip next char
          continue;
        }
      }

      if (inString || inComment) {
        currentLine += char;
        if (inComment && char === "\n") {
          inComment = false;
          lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
          currentLine = "";
        }
        continue;
      }

      // Handle structural characters
      if (char === "{") {
        currentLine += char;
        lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
        currentLine = "";
        indentLevel++;
      } else if (char === "}") {
        if (currentLine.trim()) {
          lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
          currentLine = "";
        }
        indentLevel = Math.max(0, indentLevel - 1);
        lines.push(indentStr.repeat(indentLevel) + char);
      } else if (char === ";") {
        currentLine += char;
        if (nextChar !== " " && nextChar !== "\n" && nextChar !== "\t") {
          lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
          currentLine = "";
        }
      } else if (char === "\n" || char === "\r") {
        if (currentLine.trim()) {
          lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
          currentLine = "";
        }
      } else {
        currentLine += char;
      }
    }

    // Add any remaining content
    if (currentLine.trim()) {
      lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
    }

    const result = lines.filter(line => line.trim().length > 0).join("\n");

    return { formatted: result };
  } catch (error) {
    return {
      formatted: input,
      error: `TypeScript formatting error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export function convertJSONToYAML(jsonString: string): {
  converted: string;
  error?: string;
} {
  try {
    const jsonObject = JSON.parse(jsonString);
    const yamlString = yaml.dump(jsonObject, { indent: 2 });
    return { converted: yamlString };
  } catch (error) {
    return {
      converted: "",
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}

export function convertYAMLToJSON(yamlString: string): {
  converted: string;
  error?: string;
} {
  try {
    const jsonObject = yaml.load(yamlString);
    const jsonString = JSON.stringify(jsonObject, null, 2);
    return { converted: jsonString };
  } catch (error) {
    return {
      converted: "",
      error: error instanceof Error ? error.message : "Invalid YAML",
    };
  }
}

export async function formatSCSS(
  input: string,
  minify = false
): Promise<{ formatted: string; error?: string }> {
  try {
    if (minify) {
      try {
        // Use Prettier to format SCSS first, then minify
        const prettierFormatted = await prettier.format(input, {
          parser: "scss",
          printWidth: 1000,
          tabWidth: 0,
          useTabs: false,
        });

        // Additional minification
        const minified = prettierFormatted
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\/\/.*$/gm, "")
          .replace(/\s+/g, " ")
          .replace(/\s*{\s*/g, "{")
          .replace(/\s*}\s*/g, "}")
          .replace(/\s*:\s*/g, ":")
          .replace(/\s*;\s*/g, ";")
          .replace(/\s*,\s*/g, ",")
          .replace(/;}/g, "}")
          .trim();

        return { formatted: minified };
      } catch {
        // Fallback to CSS formatter for minification
        return await formatCSS(input, minify);
      }
    }

    try {
      // Use Prettier for SCSS beautification
      const formatted = await prettier.format(input, {
        parser: "scss",
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        singleQuote: false,
      });
      return { formatted };
    } catch {
      // Fallback to CSS formatter
      return await formatCSS(input, minify);
    }
  } catch (error) {
    return {
      formatted: input,
      error: `SCSS formatting error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function formatJSONC(input: string): Promise<{
  formatted: string;
  error?: string;
}> {
  try {
    // Custom JSONC formatter that preserves comments
    const lines = input.split("\n");
    let formatted = "";
    let indentLevel = 0;
    const indentStr = "  ";
    let inString = false;
    let stringChar = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        formatted += "\n";
        continue;
      }

      // Handle comments - preserve them as-is with proper indentation
      if (line.startsWith("//") || line.startsWith("/*")) {
        formatted += `${indentStr.repeat(indentLevel) + line}\n`;
        continue;
      }

      // Parse character by character for proper JSON formatting
      let formattedLine = "";
      let j = 0;

      while (j < line.length) {
        const char = line[j];

        // Handle string detection
        if ((char === '"' || char === "'") && line[j - 1] !== "\\") {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
            stringChar = "";
          }
          formattedLine += char;
          j++;
          continue;
        }

        if (inString) {
          formattedLine += char;
          j++;
          continue;
        }

        // Handle structural characters outside of strings
        if (char === "{" || char === "[") {
          formattedLine += char;
          if (
            j < line.length - 1 &&
            line[j + 1] !== "}" &&
            line[j + 1] !== "]"
          ) {
            formatted += `${indentStr.repeat(indentLevel) + formattedLine}\n`;
            indentLevel++;
            formattedLine = "";
          }
        } else if (char === "}" || char === "]") {
          if (formattedLine.trim()) {
            formatted += `${indentStr.repeat(indentLevel) + formattedLine}\n`;
            formattedLine = "";
          }
          indentLevel = Math.max(0, indentLevel - 1);
          formattedLine += char;
        } else if (char === ",") {
          formattedLine += char;
          if (j < line.length - 1) {
            formatted += `${indentStr.repeat(indentLevel) + formattedLine}\n`;
            formattedLine = "";
          }
        } else if (char === ":") {
          formattedLine += `${char} `;
        } else if (
          char !== " " ||
          formattedLine[formattedLine.length - 1] !== " "
        ) {
          formattedLine += char;
        }

        j++;
      }

      if (formattedLine.trim()) {
        formatted += `${indentStr.repeat(indentLevel) + formattedLine}\n`;
      }
    }

    return { formatted: formatted.trim() };
  } catch (error) {
    return {
      formatted: input,
      error: `JSONC formatting error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function formatGraphQL(input: string): Promise<{
  formatted: string;
  error?: string;
}> {
  try {
    // Custom GraphQL formatter since Prettier's graphql parser isn't available
    const formatted = input.trim();
    let indentLevel = 0;
    const indentStr = "  ";
    const lines: string[] = [];
    let currentLine = "";
    let inString = false;
    let stringChar = "";

    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      const nextChar = formatted[i + 1] || "";

      // Handle string literals
      if (char === '"' || char === "'") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar && formatted[i - 1] !== "\\") {
          inString = false;
          stringChar = "";
        }
        currentLine += char;
        continue;
      }

      if (inString) {
        currentLine += char;
        continue;
      }

      // Handle structural characters
      if (char === "{") {
        currentLine += ` ${char}`;
        lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
        currentLine = "";
        indentLevel++;
      } else if (char === "}") {
        if (currentLine.trim()) {
          lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
          currentLine = "";
        }
        indentLevel = Math.max(0, indentLevel - 1);
        lines.push(indentStr.repeat(indentLevel) + char);
      } else if (char === "(") {
        currentLine += char;
        if (nextChar !== ")") {
          indentLevel++;
        }
      } else if (char === ")") {
        currentLine += char;
        if (formatted[i - 1] !== "(") {
          indentLevel = Math.max(0, indentLevel - 1);
        }
      } else if (char === ":") {
        currentLine += `${char} `;
      } else if (char === ",") {
        currentLine += char;
        lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
        currentLine = "";
      } else if (char === "\n" || char === "\r") {
        if (currentLine.trim()) {
          lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
          currentLine = "";
        }
      } else if (
        char !== "\t" &&
        !(char === " " && currentLine.endsWith(" "))
      ) {
        currentLine += char;
      }
    }

    // Add any remaining content
    if (currentLine.trim()) {
      lines.push(indentStr.repeat(indentLevel) + currentLine.trim());
    }

    const result = lines.filter(line => line.trim().length > 0).join("\n");

    return { formatted: result };
  } catch (error) {
    return {
      formatted: input,
      error: `GraphQL formatting error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
