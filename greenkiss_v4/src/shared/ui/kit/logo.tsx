import Link from "next/link";
import { cn } from "@/shared/lib/css";

export const Logo = ({
  className,
  href,
}: {
  className?: string;
  href: string;
}) => {
  return (
    <Link
      aria-label="Логотип GREEN KISS"
      className={cn("relative inline-block group", className)}
      href={href}
    >
      {/* Слой 1 - самый светлый фон */}
      <span
        aria-hidden="true"
        className="absolute inset-0 text-2xl font-bold text-green-300 dark:text-green-300 text-nowrap transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
      >
        GREEN KISS
      </span>

      {/* Слой 2 */}
      <span
        aria-hidden="true"
        className="absolute inset-0 text-2xl font-bold text-green-400 dark:text-green-400 text-nowrap transition-all duration-300 ease-out delay-[50ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        GREEN KISS
      </span>

      {/* Слой 3 */}
      <span
        aria-hidden="true"
        className="absolute inset-0 text-2xl font-bold text-green-500 dark:text-green-500 text-nowrap transition-all duration-300 ease-out delay-[100ms] group-hover:-translate-x-0.5 group-hover:translate-y-0.5"
      >
        GREEN KISS
      </span>

      {/* Слой 4 */}
      <span
        aria-hidden="true"
        className="absolute inset-0 text-2xl font-bold text-green-600 dark:text-green-600 text-nowrap transition-all duration-300 ease-out delay-[150ms] group-hover:-translate-x-1 group-hover:translate-y-1"
      >
        GREEN KISS
      </span>

      {/* Слой 5 - основной, контрастный но не слишком темный */}
      <span
        aria-hidden="true"
        className="relative text-2xl font-bold bg-linear-to-r from-green-700 to-green-600 dark:from-green-500 dark:to-green-400 bg-clip-text text-transparent text-nowrap z-10"
      >
        GREEN KISS
      </span>
    </Link>
  );
};
