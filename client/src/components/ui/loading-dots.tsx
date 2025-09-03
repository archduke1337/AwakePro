export function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="text-primary-foreground font-medium">Processing</span>
      <span className="flex space-x-1">
        <span className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce [animation-delay:-0.32s]"></span>
        <span className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce [animation-delay:-0.16s]"></span>
        <span className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce"></span>
      </span>
    </span>
  );
}
