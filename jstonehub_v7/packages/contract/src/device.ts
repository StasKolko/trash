type DeviceType = (typeof DEVICE_TYPE)[number];

const DEVICE_TYPE = ["desktop", "mobile", "tablet"] as const;

export type { DeviceType };
export { DEVICE_TYPE };
