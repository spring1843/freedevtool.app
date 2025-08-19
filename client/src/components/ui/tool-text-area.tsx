import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToolTextAreaProps {
  title: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  minHeight?: number;
  rows?: number;
  showLineNumbers?: boolean;
  showCharacterCount?: boolean;
  showWordCount?: boolean;
  showCursorPosition?: boolean;
  maxLength?: number;
  language?: string;
  error?: string;
  id?: string;
  "data-testid"?: string;
}

export function ToolTextArea({
  title,
  value,
  onChange,
  placeholder = "",
  readOnly = false,
  className,
  minHeight = 300,
  rows,
  showLineNumbers = true,
  showCharacterCount = true,
  showWordCount = false,
  showCursorPosition = true,
  maxLength,
  language,
  error,
  id,
  "data-testid": dataTestId,
}: ToolTextAreaProps) {
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = value.split("\n");
  const lineCount = lines.length;
  const characterCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const updateCursorPosition = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const textBeforeCursor = value.substring(0, start);
      const lines = textBeforeCursor.split("\n");
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      setCursorPosition({ line, column });
    }
  };

  useEffect(() => {
    updateCursorPosition();
  }, [value, updateCursorPosition]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
    updateCursorPosition();
  };

  const handleKeyUp = () => {
    updateCursorPosition();
  };

  const handleClick = () => {
    updateCursorPosition();
  };

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            {language ? (
              <Badge variant="outline" className="text-xs">
                {language.toUpperCase()}
              </Badge>
            ) : null}
            {showCharacterCount ? (
              <span>
                {characterCount.toLocaleString()} chars
                {maxLength ? ` / ${maxLength.toLocaleString()}` : null}
              </span>
            ) : null}
            {showWordCount ? (
              <span>{wordCount.toLocaleString()} words</span>
            ) : null}
            <span>{lineCount.toLocaleString()} lines</span>
            {showCursorPosition && !readOnly ? (
              <span>
                Ln {cursorPosition.line}, Col {cursorPosition.column}
              </span>
            ) : null}
          </div>
        </div>
        {error ? (
          <div className="text-sm text-red-600 dark:text-red-400 mt-1">
            {error}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div className="flex">
            {showLineNumbers ? (
              <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 px-3 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 select-none">
                {lines.map((_, index) => (
                  <div
                    key={index + 1}
                    className="leading-6 text-right min-w-[2rem]"
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            ) : null}
            <textarea
              ref={textareaRef}
              id={id}
              value={value}
              onChange={handleTextareaChange}
              onKeyUp={handleKeyUp}
              onClick={handleClick}
              placeholder={placeholder}
              readOnly={readOnly}
              maxLength={maxLength}
              rows={rows}
              className={cn(
                "flex-1 resize-none border-0 bg-transparent p-3 font-mono text-sm leading-6",
                "placeholder:text-slate-400 dark:placeholder:text-slate-600",
                "focus-visible:outline-none focus-visible:ring-0",
                "disabled:cursor-not-allowed disabled:opacity-50",
                readOnly && "cursor-default"
              )}
              style={{ minHeight: `${minHeight}px` }}
              data-testid={dataTestId || `textarea-${title.toLowerCase().replace(/\s+/g, "-")}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
