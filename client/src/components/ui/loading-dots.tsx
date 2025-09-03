export function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="text-primary-foreground font-medium">Processing</span>
      <span className="loading-dots-enhanced">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </span>
  );
}
