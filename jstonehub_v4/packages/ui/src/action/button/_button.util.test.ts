import type { ComponentSize } from "../../_model/type";
import type { ButtonVariant } from "./button.type";

import { DISABLED } from "../../_model/style";
import {
  BUTTON_BASE,
  BUTTON_ROUNDED,
  BUTTON_VARIANT,
  ICON_BUTTON_SIZE,
} from "./_button.style";
import { DEFAULT_VARIANT, resolveButtonClasses } from "./button.util";

const VARIANTS: (ButtonVariant | undefined)[] = [
  undefined,
  "primary",
  "secondary",
  "outline",
  "ghost",
  "destructive",
];

const SIZES: (ComponentSize | undefined)[] = [undefined, "sm", "md", "lg"];

const ICONS: (boolean | undefined)[] = [undefined, false, true];

const DISABLEDS: (boolean | undefined)[] = [undefined, false, true];

const CLASSES: (string | undefined)[] = [undefined, "custom-class"];

describe("[resolveButtonClasses]", () => {
  it("should return defaults when called with no arguments", () => {
    const result = resolveButtonClasses();

    expect(result).toContain(BUTTON_BASE);
    expect(result).toContain(BUTTON_VARIANT[DEFAULT_VARIANT]);
    expect(result).toContain(BUTTON_ROUNDED);
    expect(result).not.toContain(ICON_BUTTON_SIZE);
    expect(result).not.toContain(DISABLED);
  });

  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      for (const icon of ICONS) {
        for (const disabled of DISABLEDS) {
          for (const cls of CLASSES) {
            const label = `variant=${variant} size=${size} icon=${icon} disabled=${disabled} class=${cls}`;

            it(label, () => {
              const result = resolveButtonClasses({
                variant,
                size,
                icon,
                disabled,
                class: cls,
              });

              const expectedVariant = variant ?? DEFAULT_VARIANT;
              expect(result).toContain(BUTTON_BASE);
              expect(result).toContain(BUTTON_VARIANT[expectedVariant]);

              if (icon) {
                expect(result).toContain(ICON_BUTTON_SIZE);
                expect(result).not.toContain(BUTTON_ROUNDED);
              } else {
                expect(result).toContain(BUTTON_ROUNDED);
                expect(result).not.toContain(ICON_BUTTON_SIZE);
              }

              if (disabled) {
                expect(result).toContain("pointer-events-none");
                expect(result).toContain("opacity-50");
              } else {
                expect(result).not.toContain("pointer-events-none");
              }

              if (cls) {
                expect(result).toContain(cls);
              }
            });
          }
        }
      }
    }
  }
});
