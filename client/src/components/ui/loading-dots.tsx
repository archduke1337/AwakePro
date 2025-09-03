export function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-2">
      <span>Processing</span>
      <span className="flex space-x-1">
        <span className="w-1 h-1 bg-primary-foreground rounded-full animate-pulse [animation-delay:-0.32s]"></span>
        <span className="w-1 h-1 bg-primary-foreground rounded-full animate-pulse [animation-delay:-0.16s]"></span>
        <span className="w-1 h-1 bg-primary-foreground rounded-full animate-pulse"></span>
      </span>
    </span>
  );
}
