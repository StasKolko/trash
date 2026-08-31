

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





export function mergeVariantSizes(config: Input): Output {
  const result: Output = {} as Output;

  for (const variantKey of Object.keys(config)) {
    const variant = config[variantKey]!;
    const sizeMap: Record<SizeKey, string[]> = {};

    // variant: { height: {...}, paddingX: {...}, ... }
    for (const propKey of Object.keys(variant)) {
      const sizeObj = variant[propKey]; // { xs: "...", sm: "...", ... }

      for (const sizeKey of Object.keys(sizeObj)) {
        const value = sizeObj[sizeKey];
        if (!value) continue; // пропускаем пустые строки/undefined

        if (!sizeMap[sizeKey]) {
          sizeMap[sizeKey] = [];
        }

        sizeMap[sizeKey].push(value);
      }
    }

    // Собираем строки вида "h-[28px] px-[12px] rounded-[6px] ..."
    const merged: Record<SizeKey, string> = {};
    for (const sizeKey of Object.keys(sizeMap)) {
      merged[sizeKey] = sizeMap[sizeKey].join(" ");
    }

    result[variantKey] = merged;
  }

  return result;
}