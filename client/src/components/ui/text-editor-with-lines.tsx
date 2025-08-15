import { EnhancedCodeEditor } from "./enhanced-code-editor";

interface TextEditorWithLinesProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showCharacterPosition?: boolean;
  language?: 'javascript' | 'json' | 'css' | 'html' | 'xml' | 'yaml' | 'markdown' | 'text';
  "data-testid"?: string;
}

export function TextEditorWithLines({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  showCharacterPosition = true,
  language = 'text',
  "data-testid": testId
}: TextEditorWithLinesProps) {
  return (
    <EnhancedCodeEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      language={language}
      showLineNumbers={true}
      showCopy={true}
      readOnly={disabled}
      minHeight={200}
      data-testid={testId}
    />
  );
}