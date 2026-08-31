import { appendClass } from "./append-class";

export type VariantProps<T extends (variants?: any) => string> = T extends (
  variants?: infer V,
) => string
  ? V
  : never;

type VariantConfig = Record<string, Record<string, string>>;

export function createVariantClasses<C extends VariantConfig>(
  baseClasses: string,
  config: {
    [K in keyof C]: C[K] & { default: keyof Omit<C[K], "default"> };
  },
) {
  return (
    variants?: Partial<{ [K in keyof C]: keyof Omit<C[K], "default"> }>,
  ) => {
    let classes = baseClasses;

    for (const key in config) {
      const section = config[key];
      const variant = variants?.[key] ?? section.default;

      classes = appendClass(classes, section[variant]);
    }

    return classes;
  };
}
