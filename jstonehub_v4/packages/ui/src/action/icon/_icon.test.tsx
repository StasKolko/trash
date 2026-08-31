import type { ComponentSize } from "../../_model/type";
import type { IconName } from "./_icon.type";

import { render } from "@solidjs/testing-library";

import { DEFAULT_COMPONENT_SIZE } from "../../_model/constant";
import { icon } from "./icon";
import { ICON_MAP, ICON_SIZE, ICON_SIZE_OVERRIDE } from "./icon.constant";

const ALL_NAMES = Object.keys(ICON_MAP) as IconName[];
const ALL_SIZES: (ComponentSize | undefined)[] = [undefined, "sm", "md", "lg"];
const ALL_CLASSES: (string | undefined)[] = [undefined, "custom-icon-class"];

describe("[icon]", () => {
  for (const name of ALL_NAMES) {
    for (const size of ALL_SIZES) {
      for (const cls of ALL_CLASSES) {
        it(`name=${name} size=${size} class=${cls}`, () => {
          const { container } = render(() => icon({ name, size, class: cls }));

          const svg = container.querySelector("svg");
          expect(svg).toBeInTheDocument();
          expect(svg).toHaveAttribute("aria-hidden", "true");

          const resolvedSize = size ?? DEFAULT_COMPONENT_SIZE;
          const override = ICON_SIZE_OVERRIDE[name];
          const expectedPx = override
            ? override[resolvedSize]
            : ICON_SIZE[resolvedSize];

          expect(svg).toHaveAttribute("width", String(expectedPx));
          expect(svg).toHaveAttribute("height", String(expectedPx));

          if (cls) {
            expect(svg).toHaveClass(cls);
          }
        });
      }
    }
  }
});
