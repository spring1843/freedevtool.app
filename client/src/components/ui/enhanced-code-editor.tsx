import { useState } from "react";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { xml } from '@codemirror/lang-xml';
import { yaml } from '@codemirror/lang-yaml';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";
// import { useTheme } from "@/hooks/use-theme";

interface EnhancedCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  language?: 'javascript' | 'json' | 'css' | 'html' | 'xml' | 'yaml' | 'markdown' | 'text';
  showLineNumbers?: boolean;
  showCopy?: boolean;
  readOnly?: boolean;
  minHeight?: number;
  "data-testid"?: string;
}

const languageExtensions = {
  javascript: () => [javascript({ jsx: true, typescript: true })],
  json: () => [json()],
  css: () => [css()],
  html: () => [html()],
  xml: () => [xml()],
  yaml: () => [yaml()],
  markdown: () => [markdown()],
  text: () => []
};

export function EnhancedCodeEditor({
  value,
  onChange,
  placeholder = "",
  className,
  disabled = false,
  language = 'text',
  showLineNumbers = true,
  showCopy = true,
  readOnly = false,
  minHeight = 200,
  "data-testid": testId
}: EnhancedCodeEditorProps) {
  // Temporarily use light theme
  const theme = "light" as "light" | "dark";
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1, character: 0 });

  // Get language extension safely with instance check
  const getLanguageExtensions = () => {
    try {
      const extensions = languageExtensions[language]();
      // Filter out any problematic extensions that might cause instance conflicts
      return extensions.filter(ext => ext != null);
    } catch (error) {
      console.warn(`Failed to load language extension for ${language}:`, error);
      return [];
    }
  };

  const lineCount = value.split('\n').length;
  const characterCount = value.length;

  return (
    <div className={cn("relative border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden", className)} data-testid={testId}>
      <div className="relative">
        <CodeMirror
          key={`codemirror-${language}-${Date.now()}`}
          value={value}
          onChange={(val) => onChange(val)}
          placeholder={placeholder}
          extensions={getLanguageExtensions()}
          theme={theme === 'dark' ? oneDark : undefined}
          editable={!readOnly && !disabled}
          basicSetup={{
            lineNumbers: showLineNumbers,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
            searchKeymap: false
          }}
          style={{
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            minHeight: `${minHeight}px`
          }}
          className={cn(
            "text-sm",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        
        {/* Copy button */}
        {showCopy && value && !disabled && (
          <div className="absolute top-2 right-2 z-10">
            <CopyButton text={value} />
          </div>
        )}
      </div>

      {/* Status bar with cursor position and stats */}
      <div className="flex justify-between items-center px-3 py-1 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          {language !== 'text' && (
            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-medium">
              {language.toUpperCase()}
            </span>
          )}
        </div>
        <div>
          {characterCount.toLocaleString()} characters, {lineCount.toLocaleString()} lines
        </div>
      </div>
    </div>
  );
}