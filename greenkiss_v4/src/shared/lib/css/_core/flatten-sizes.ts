type SizeKey = string;
type VariantKey = string;

type InputConfig = Record<
  VariantKey,
  Record<string, Record<SizeKey, string>>
>;

type OutputConfig = Record<VariantKey, Record<SizeKey, string>>;

export function flattenSizes(config: InputConfig): OutputConfig {
  const result: OutputConfig = {};

  for (const variantName in config) {
    const variant = config[variantName];
    const sizeMap: Record<SizeKey, string[]> = {};

    for (const propName in variant) {
      const propValues = variant[propName];

      for (const size in propValues) {
        const value = propValues[size];
        if (!value) continue;

        if (!sizeMap[size]) {
          sizeMap[size] = [];
        }

        sizeMap[size].push(value);
      }
    }

    result[variantName] = Object.fromEntries(
      Object.entries(sizeMap).map(([size, classes]) => [
        size,
        classes.join(" "),
      ]),
    );
  }

  return result;
}
