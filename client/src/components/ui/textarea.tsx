import * as React from "react";
import { cn } from "@/lib/utils";
import { Copy, WrapText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextareaProps extends React.ComponentProps<"textarea"> {
  showLineNumbers?: boolean;
  showStats?: boolean;
  enableWordWrap?: boolean;
  showControls?: boolean;
  onCopy?: () => void;
  resizable?: boolean;
}

const RichTextarea = React.forwardRef<HTMLTextAreaElement, RichTextareaProps>(
  (
    {
      className,
      showLineNumbers = false,
      showStats = false,
      enableWordWrap = true,
      showControls = true,
      onCopy,
      resizable = true,
      value = "",
      onChange,
      readOnly: initialReadOnly = false,
      ...restProps
    },
    ref
  ) => {
    // Remove readOnly from restProps to prevent conflicts
    const { readOnly: _, ...cleanRestProps } = restProps as any;
    const [setCursorPosition] = React.useState(0);
    const [currentLine, setCurrentLine] = React.useState(1);
    const [currentColumn, setCurrentColumn] = React.useState(1);
    const [wordWrap, setWordWrap] = React.useState(enableWordWrap);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Use forwarded ref or our own ref
    const actualRef = ref || textareaRef;

    // Calculate line numbers and cursor position
    React.useEffect(() => {
      const textarea =
        typeof actualRef === "function"
          ? textareaRef.current
          : actualRef?.current;
      if (!textarea) return;

      const handleSelectionChange = () => {
        const position = textarea.selectionStart;
        setCursorPosition(position);

        const textBeforeCursor = value.toString().slice(0, position);
        const lines = textBeforeCursor.split("\n");
        setCurrentLine(lines.length);
        setCurrentColumn(lines[lines.length - 1].length + 1);
      };

      textarea.addEventListener("selectionchange", handleSelectionChange);
      textarea.addEventListener("click", handleSelectionChange);
      textarea.addEventListener("keyup", handleSelectionChange);

      // Initial calculation
      handleSelectionChange();

      return () => {
        textarea.removeEventListener("selectionchange", handleSelectionChange);
        textarea.removeEventListener("click", handleSelectionChange);
        textarea.removeEventListener("keyup", handleSelectionChange);
      };
    }, [value, actualRef]);

    const textValue = value.toString();
    const lineCount = textValue.split("\n").length;
    const characterCount = textValue.length;
    const lineNumbers = Array.from(
      { length: Math.max(lineCount, 10) },
      (_, i) => i + 1
    );

    const handleCopyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(value.toString());
        if (onCopy) onCopy();
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }
    };

    const toggleWordWrap = () => {
      setWordWrap(!wordWrap);
    };

    const baseClassName = cn(
      "flex min-h-[80px] w-full border border-input bg-background text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      wordWrap ? "whitespace-pre-wrap" : "whitespace-nowrap overflow-auto",
      resizable ? "resize-y" : "resize-none",
      showLineNumbers && !wordWrap ? "pl-14" : "px-3",
      showControls ? "rounded-t-md" : "rounded-md",
      "py-2",
      className
    );

    return (
      <div className="relative">
        {/* Controls Bar */}
        {showControls ? (
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-b-0 border-input rounded-t-md">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleWordWrap}
                className="h-7 px-2 text-xs"
                title={wordWrap ? "Disable word wrap" : "Enable word wrap"}
              >
                <WrapText className="w-3 h-3 mr-1" />
                {wordWrap ? "No Wrap" : "Wrap"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {value ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  className="h-7 px-2 text-xs"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Line Numbers */}
        {showLineNumbers && !wordWrap ? (
          <div
            className="absolute left-0 top-0 bottom-0 w-12 bg-slate-50 dark:bg-slate-800 border-r border-input flex flex-col text-sm text-slate-500 dark:text-slate-400 font-mono select-none z-10"
            style={{ marginTop: showControls ? "41px" : "0" }}
          >
            <div className="py-2 px-2 flex-1 leading-6">
              {lineNumbers.map(num => (
                <div key={num} className="text-right leading-6 h-6">
                  {num <= lineCount ? num : ""}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Textarea */}
        <textarea
          {...cleanRestProps}
          ref={actualRef}
          className={baseClassName}
          value={value}
          onChange={onChange}
          readOnly={initialReadOnly}
          style={{
            lineHeight: "1.5rem", // 24px line height to match line numbers
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            whiteSpace: wordWrap ? "pre-wrap" : "nowrap",
            overflowWrap: wordWrap ? "break-word" : "normal",
          }}
        />

        {/* Stats Bar */}
        {showStats ? (
          <div className="flex justify-between items-center px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-t-0 border-input rounded-b-md text-xs text-slate-600 dark:text-slate-400">
            <div className="flex gap-4">
              <span>Lines: {lineCount}</span>
              <span>Characters: {characterCount}</span>
            </div>
            <div>
              Line {currentLine}, Column {currentColumn}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
);

RichTextarea.displayName = "RichTextarea";

// Legacy export for backward compatibility
const Textarea = RichTextarea;
type TextareaProps = RichTextareaProps;

export { RichTextarea, Textarea, type RichTextareaProps, type TextareaProps };
