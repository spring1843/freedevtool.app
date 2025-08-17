import { RichTextarea } from "./textarea";
import { cn } from "@/lib/utils";

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
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("w-full", className)} data-testid={testId}>
      <RichTextarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        showLineNumbers={showLineNumbers}
        showStats={true}
        showControls={showCopy}
        className={cn(
          "font-mono text-sm",
          "min-h-[200px]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          minHeight: `${minHeight}px`,
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        }}
        data-testid={`${testId}-textarea`}
      />
      
      {/* Language indicator if not text */}
      {language !== 'text' && (
        <div className="flex justify-end mt-1">
          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300">
            {language.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}