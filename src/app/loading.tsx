/**
 * Route-level loading state. Deliberately a single hairline that draws itself
 * across the top of the page rather than a spinner — it reads as a page
 * being set rather than software thinking.
 */
export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 z-[110]" role="status" aria-label="Loading">
      <span className="block h-px w-full origin-left animate-[loadbar_1.4s_cubic-bezier(0.16,1,0.3,1)_infinite] bg-ink/70" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
