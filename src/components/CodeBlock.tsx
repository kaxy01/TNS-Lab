import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}

const CodeBlock = ({ code, language = "python", title, className }: CodeBlockProps) => {
  return (
    <div className={cn("rounded-lg overflow-hidden", className)}>
      {title && (
        <div className="glass-strong px-4 py-2 border-b border-border/50 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/70" />
            <div className="w-3 h-3 rounded-full" style={{ background: "hsl(45, 80%, 50%, 0.7)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "hsl(140, 70%, 45%, 0.7)" }} />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-2">{title}</span>
        </div>
      )}
      <div className="glass-strong p-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed">
          <code className="font-mono text-foreground/90 whitespace-pre">{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
