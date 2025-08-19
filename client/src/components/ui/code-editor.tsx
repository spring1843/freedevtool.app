import { Textarea } from "./textarea";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  language?: string;
  className?: string;
  showCopy?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
  className,
  showCopy = true,
}: CodeEditorProps) {
  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          "font-mono text-sm min-h-[200px] resize-y",
          readOnly && "bg-slate-50 dark:bg-slate-800",
          className
        )}
        data-testid={readOnly ? "code-output" : "code-input"}
      />
      {showCopy && value ? (
        <div className="absolute top-2 right-2">
          <CopyButton text={value} />
        </div>
      ) : null}
    </div>
  );
}
