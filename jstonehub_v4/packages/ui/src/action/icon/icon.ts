import type { ComponentSize } from "../../_model/type";
import type { IconName } from "./_icon.type";

import { DEFAULT_COMPONENT_SIZE } from "../../_model/constant";
import { ICON_MAP, ICON_SIZE, ICON_SIZE_OVERRIDE } from "./icon.constant";

function icon(options: {
  name: IconName;
  size?: ComponentSize;
  class?: string;
}) {
  const size = options.size ?? DEFAULT_COMPONENT_SIZE;
  const override = ICON_SIZE_OVERRIDE[options.name];
  const px = override ? override[size] : ICON_SIZE[size];

  return ICON_MAP[options.name]({ size: px, class: options.class });
}

export { icon };
