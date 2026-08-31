import { FOCUS_RING } from "../../_model/style";

const LOGO_ROOT = [
  "group inline-flex items-center gap-[10px]",
  "font-bold select-none",
  "rounded-sm",
  "transition-[box-shadow] duration-fast",
  FOCUS_RING,
].join(" ");

const LOGO_ICON_CONTAINER = [
  "w-[36px] h-[36px]",
  "flex items-center justify-center",
  "relative overflow-hidden",
  "rounded-sm",
  "bg-gradient-to-br from-logo-from via-logo-via to-logo-to",
  "transition-[transform] duration-slow ease-out",
  "group-hover:rotate-3 group-hover:scale-105",
].join(" ");

const LOGO_SHINE = [
  "absolute inset-0",
  "bg-gradient-to-tr from-white/25 via-white/10 to-transparent",
].join(" ");

const LOGO_LETTER = [
  "text-[20px] text-white font-bold font-mono",
  "relative z-10",
  "transition-[transform] duration-slow",
  "group-hover:scale-110",
].join(" ");

const LOGO_TEXT_WRAPPER = "flex flex-col gap-[2px] leading-none";

const LOGO_BRAND = "text-[16px] text-foreground font-bold tracking-tight";

const LOGO_LABEL = [
  "text-[10px] text-logo-accent",
  "font-bold uppercase tracking-[3.2px]",
  "transition-[color,filter] duration-slow",
  "group-hover:brightness-110",
].join(" ");

export {
  LOGO_BRAND,
  LOGO_ICON_CONTAINER,
  LOGO_LABEL,
  LOGO_LETTER,
  LOGO_ROOT,
  LOGO_SHINE,
  LOGO_TEXT_WRAPPER,
};
