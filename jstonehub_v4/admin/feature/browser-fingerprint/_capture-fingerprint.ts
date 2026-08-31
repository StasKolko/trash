type CapturedFingerprint = {
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  timezone: string;
  timezoneOffset: number;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  cookieEnabled: boolean;
  webglVendor: string;
  webglRenderer: string;
  availWidth: number;
  availHeight: number;
  pixelRatio: number;
  deviceMemory: number | null;
  doNotTrack: string | null;
  pdfViewerEnabled: boolean;
  vendor: string;
  appVersion: string;
};

function captureCurrentFingerprint(): CapturedFingerprint {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl");

  let webglVendor = "Unknown";
  let webglRenderer = "Unknown";

  if (gl) {
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      webglVendor =
        gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "Unknown";
      webglRenderer =
        gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "Unknown";
    }
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: [...navigator.languages],
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    cookieEnabled: navigator.cookieEnabled,
    webglVendor,
    webglRenderer,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    pixelRatio: window.devicePixelRatio,
    deviceMemory:
      (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? null,
    doNotTrack: navigator.doNotTrack ?? null,
    pdfViewerEnabled:
      (navigator as unknown as { pdfViewerEnabled?: boolean }).pdfViewerEnabled
      ?? false,
    vendor: navigator.vendor || "",
    appVersion: navigator.appVersion,
  };
}

export type { CapturedFingerprint };
export { captureCurrentFingerprint };
