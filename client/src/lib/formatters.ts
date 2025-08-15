
import * as yaml from 'js-yaml';

export function formatJSON(input: string): { formatted: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    return { formatted: JSON.stringify(parsed, null, 2) };
  } catch (error) {
    return { formatted: input, error: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
}

function validateHTML(input: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = input.split('\n');
  
  // Track open tags for validation
  const openTags: Array<{ name: string; line: number; column: number }> = [];
  const selfClosingTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
    'link', 'meta', 'param', 'source', 'track', 'wbr'
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
      
      if (tagContent.startsWith('!')) {
        // Skip comments and DOCTYPE
        continue;
      }
      
      const isClosingTag = tagContent.startsWith('/');
      const tagMatch = tagContent.match(/^\/?\s*([a-zA-Z0-9-]+)/);
      
      if (!tagMatch) {
        issues.push({
          type: 'error',
          message: `Invalid tag syntax: ${fullTag}`,
          line: lineNumber,
          column: columnNumber
        });
        continue;
      }
      
      const tagName = tagMatch[1].toLowerCase();
      const isSelfClosing = selfClosingTags.has(tagName) || tagContent.endsWith('/');
      
      if (isClosingTag) {
        // Check if there's a matching opening tag
        const lastOpenTag = openTags.findIndex(tag => tag.name === tagName);
        if (lastOpenTag === -1) {
          issues.push({
            type: 'error',
            message: `Closing tag </${tagName}> has no matching opening tag`,
            line: lineNumber,
            column: columnNumber
          });
        } else {
          // Remove all tags from this point (handles nested unclosed tags)
          const unclosedTags = openTags.splice(lastOpenTag + 1);
          unclosedTags.forEach(tag => {
            issues.push({
              type: 'warning',
              message: `Unclosed tag <${tag.name}> opened at line ${tag.line}`,
              line: tag.line,
              column: tag.column
            });
          });
          openTags.pop(); // Remove the matched opening tag
        }
      } else if (!isSelfClosing) {
        // Opening tag - add to stack
        openTags.push({ name: tagName, line: lineNumber, column: columnNumber });
      }
    }
  }
  
  // Check for unclosed tags at the end
  openTags.forEach(tag => {
    issues.push({
      type: 'error',
      message: `Unclosed tag <${tag.name}>`,
      line: tag.line,
      column: tag.column
    });
  });
  
  return issues;
}

export function formatHTML(input: string, minify: boolean = false): { formatted: string; error?: string; warnings?: ValidationIssue[] } {
  try {
    if (minify) {
      // Minify HTML
      const minified = input
        // Remove comments (but preserve conditional comments)
        .replace(/<!--(?!\[if|\s*\[if)[\s\S]*?-->/g, '')
        // Remove unnecessary whitespace between tags
        .replace(/>\s+</g, '><')
        // Remove leading/trailing whitespace
        .replace(/^\s+|\s+$/gm, '')
        // Collapse multiple spaces within content
        .replace(/\s{2,}/g, ' ')
        // Remove whitespace around certain characters
        .replace(/\s*=\s*/g, '=')
        .trim();
      
      return { formatted: minified };
    }

    // Beautify HTML - Clean input - remove extra whitespace but preserve content
    const cleanInput = input.trim().replace(/>\s+</g, '><');
    
    // Define self-closing tags
    const selfClosingTags = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]);
    
    // Define inline tags that shouldn't force newlines
    const _inlineTags = new Set([
      'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 'code',
      'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'q',
      'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup',
      'textarea', 'tt', 'var'
    ]);
    
    // Define tags that should preserve whitespace
    const preformattedTags = new Set(['pre', 'code', 'script', 'style']);
    
    let indentLevel = 0;
    const indentSize = 2;
    const result: string[] = [];
    let i = 0;
    let inPreformatted = false;
    let preformattedContent = '';
    let currentPreformattedTag = '';
    
    while (i < cleanInput.length) {
      if (cleanInput[i] === '<') {
        // Find the end of the tag
        let tagEnd = i + 1;
        while (tagEnd < cleanInput.length && cleanInput[tagEnd] !== '>') {
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
        
        const isClosingTag = tagContent.startsWith('/');
        const tagName = tagMatch[1].toLowerCase();
        const isSelfClosing = selfClosingTags.has(tagName) || tagContent.endsWith('/');
        
        // Handle preformatted content
        if (preformattedTags.has(tagName)) {
          if (!isClosingTag && !inPreformatted) {
            // Starting preformatted block
            inPreformatted = true;
            currentPreformattedTag = tagName;
            result.push(' '.repeat(indentLevel * indentSize) + fullTag);
            if (!isSelfClosing) indentLevel++;
          } else if (isClosingTag && inPreformatted && tagName === currentPreformattedTag) {
            // Ending preformatted block
            if (preformattedContent.trim()) {
              // Add the preformatted content with minimal formatting
              const lines = preformattedContent.split('\n');
              const currentIndent = indentLevel * indentSize;
              lines.forEach(line => {
                result.push(' '.repeat(currentIndent) + line);
              });
            }
            indentLevel--;
            result.push(' '.repeat(indentLevel * indentSize) + fullTag);
            inPreformatted = false;
            preformattedContent = '';
            currentPreformattedTag = '';
          }
        } else if (inPreformatted) {
          // Collect content inside preformatted tags
          preformattedContent += fullTag;
        } else {
          // Regular tag processing
          if (isClosingTag) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          
          // Comments and DOCTYPE declarations
          if (tagContent.startsWith('!')) {
            result.push(' '.repeat(indentLevel * indentSize) + fullTag);
          } else {
            // Regular tags
            result.push(' '.repeat(indentLevel * indentSize) + fullTag);
            
            if (!isClosingTag && !isSelfClosing) {
              indentLevel++;
            }
          }
        }
        
        i = tagEnd + 1;
      } else {
        // Handle text content
        let textEnd = i;
        while (textEnd < cleanInput.length && cleanInput[textEnd] !== '<') {
          textEnd++;
        }
        
        const textContent = cleanInput.substring(i, textEnd);
        
        if (inPreformatted) {
          preformattedContent += textContent;
        } else {
          const trimmedText = textContent.trim();
          if (trimmedText) {
            // Check if this text should be on the same line (inline content)
            const lines = trimmedText.split('\n').filter(line => line.trim());
            if (lines.length === 1 && lines[0].length < 80) {
              // Short single-line text - might be inline
              result.push(' '.repeat(indentLevel * indentSize) + trimmedText);
            } else {
              // Multi-line or long text
              const currentIndent = indentLevel * indentSize;
              lines.forEach(line => {
                if (line.trim()) {
                  result.push(' '.repeat(currentIndent) + line.trim());
                }
              });
            }
          }
        }
        
        i = textEnd;
      }
    }
    
    // Join results and clean up
    let formatted = result.join('\n');
    
    // Clean up excessive blank lines
    formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Ensure proper spacing around block elements
    formatted = formatted.replace(/(<\/(div|p|h[1-6]|section|article|header|footer|main|nav|aside)>)\n(<(?!\/)[a-zA-Z])/g, '$1\n\n$3');
    
    // Validate HTML
    const validationIssues = validateHTML(input);
    const errors = validationIssues.filter(issue => issue.type === 'error');
    const warnings = validationIssues.filter(issue => issue.type === 'warning');
    
    if (errors.length > 0) {
      const errorMessage = errors.slice(0, 3).map(e => 
        `Line ${e.line}: ${e.message}`
      ).join('; ');
      return { 
        formatted, 
        error: `HTML validation errors: ${errorMessage}${errors.length > 3 ? ` (${errors.length - 3} more...)` : ''}`,
        warnings 
      };
    }
    
    return { formatted, warnings };
  } catch (error) {
    return { formatted: input, error: `HTML formatting error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export function formatCSS(input: string, minify: boolean = false): { formatted: string; error?: string } {
  try {
    if (minify) {
      // Minify CSS
      const minified = input
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around certain characters
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        // Remove trailing semicolons before closing braces
        .replace(/;}/g, '}')
        .trim();
      
      return { formatted: minified };
    } else {
      // Beautify CSS
      let formatted = input
        // Remove comments first but preserve them for now
        .replace(/\/\*[\s\S]*?\*\//g, (match) => `\n${match}\n`)
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();

      // Add proper line breaks and indentation
      formatted = formatted
        // Add newlines after opening braces
        .replace(/\{/g, ' {\n')
        // Add newlines before closing braces
        .replace(/\}/g, '\n}\n')
        // Add newlines after semicolons (but not before closing braces)
        .replace(/;(?!\s*\})/g, ';\n')
        // Clean up multiple newlines
        .replace(/\n\s*\n+/g, '\n\n')
        .trim();

      // Split into lines and properly indent
      const lines = formatted.split('\n');
      let indentLevel = 0;
      const finalFormatted = lines
        .map(line => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          
          // Comments stay at current indent level
          if (trimmed.startsWith('/*')) {
            return '  '.repeat(indentLevel) + trimmed;
          }
          
          // Closing braces decrease indent first
          if (trimmed === '}') {
            indentLevel = Math.max(0, indentLevel - 1);
            return '  '.repeat(indentLevel) + trimmed;
          }
          
          const result = '  '.repeat(indentLevel) + trimmed;
          
          // Opening braces increase indent after
          if (trimmed.endsWith('{')) {
            indentLevel++;
          }
          
          return result;
        })
        .filter(line => line !== '')
        .join('\n');
      
      return { formatted: finalFormatted };
    }
  } catch (error) {
    return { formatted: input, error: `CSS formatting error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export function formatYAML(input: string): { formatted: string; error?: string } {
  try {
    // Basic YAML formatting - normalize indentation and spacing
    const lines = input.split('\n');
    const formatted = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const depth = (input.match(new RegExp(`^( *)${line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm')) || ['', ''])[1].length;
        const indentLevel = Math.floor(depth / 2);
        return '  '.repeat(indentLevel) + line.trim();
      })
      .join('\n');
    
    return { formatted };
  } catch (error) {
    return { formatted: input, error: `YAML formatting error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export function formatMarkdown(input: string): { formatted: string; error?: string } {
  try {
    // Basic markdown formatting
    const lines = input.split('\n');
    const formatted = lines
      .map(line => 
        // Remove extra whitespace
         line.trim()
      )
      .join('\n')
      // Normalize line breaks around headers
      .replace(/\n(#{1,6})/g, '\n\n$1')
      .replace(/(#{1,6}.*)\n/g, '$1\n\n')
      // Normalize line breaks around lists
      .replace(/\n([*-+])/g, '\n\n$1')
      // Remove excessive blank lines
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return { formatted };
  } catch (error) {
    return { formatted: input, error: `Markdown formatting error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export function formatLESS(input: string, minify: boolean = false): { formatted: string; error?: string } {
  // LESS has similar syntax to CSS, so we can use the CSS formatter as a base
  return formatCSS(input, minify);
}

export function convertJSONToYAML(jsonString: string): { converted: string; error?: string } {
  try {
    const jsonObject = JSON.parse(jsonString);
    const yamlString = yaml.dump(jsonObject, { indent: 2 });
    return { converted: yamlString };
  } catch (error) {
    return { converted: "", error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}

export function convertYAMLToJSON(yamlString: string): { converted: string; error?: string } {
  try {
    const jsonObject = yaml.load(yamlString);
    const jsonString = JSON.stringify(jsonObject, null, 2);
    return { converted: jsonString };
  } catch (error) {
    return { converted: "", error: error instanceof Error ? error.message : "Invalid YAML" };
  }
}
