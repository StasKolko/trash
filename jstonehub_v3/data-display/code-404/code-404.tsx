const codeClasses = [
  "px-[12px] py-[8px] rounded-md",
  "text-[100px] sm:text-[120px]",
  "text-active-foreground font-bold",
  "leading-none tracking-tighter",
  "bg-active",
  "select-none",
].join(" ");

export function Code404() {
  return (
    <span class={codeClasses} aria-hidden="true">
      404
    </span>
  );
}
