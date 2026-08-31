type ParsedUserAgent = {
  deviceType: string;
  os: string;
  browser: string;
};

const RE_MOBILE_IOS = /iPhone|iPod/;
const RE_TABLET = /iPad|Tablet/;
const RE_ANDROID = /Android/;
const RE_MOBILE_SUFFIX = /Mobile/;

const RE_WINDOWS_10 = /Windows NT 10/;
const RE_WINDOWS_11 = /Windows NT 11/;
const RE_WINDOWS = /Windows/;
const RE_MAC = /Mac OS X/;
const RE_IOS = /iPhone OS|iOS/;
const RE_LINUX = /Linux/;

const RE_EDGE = /Edg\//;
const RE_CHROME = /Chrome\//;
const RE_CHROMIUM = /Chromium/;
const RE_FIREFOX = /Firefox\//;
const RE_SAFARI = /Safari\//;
const RE_CHROME_IN_UA = /Chrome/;
const RE_OPERA = /Opera|OPR\//;

function parseUserAgent(userAgent: string): ParsedUserAgent {
  if (!userAgent || userAgent === "unknown") {
    return {
      deviceType: "Unknown",
      os: "Unknown",
      browser: "Unknown",
    };
  }

  return {
    deviceType: _detectDeviceType(userAgent),
    os: _detectOs(userAgent),
    browser: _detectBrowser(userAgent),
  };
}

function _detectDeviceType(ua: string) {
  if (RE_MOBILE_IOS.test(ua)) {
    return "Mobile";
  }
  if (RE_TABLET.test(ua)) {
    return "Tablet";
  }
  if (RE_ANDROID.test(ua)) {
    return RE_MOBILE_SUFFIX.test(ua) ? "Mobile" : "Tablet";
  }
  return "Desktop";
}

function _detectOs(ua: string) {
  if (RE_WINDOWS_10.test(ua)) {
    return "Windows 10";
  }
  if (RE_WINDOWS_11.test(ua)) {
    return "Windows 11";
  }
  if (RE_WINDOWS.test(ua)) {
    return "Windows";
  }
  if (RE_MAC.test(ua)) {
    return "macOS";
  }
  if (RE_IOS.test(ua)) {
    return "iOS";
  }
  if (RE_ANDROID.test(ua)) {
    return "Android";
  }
  if (RE_LINUX.test(ua)) {
    return "Linux";
  }
  return "Unknown";
}

function _detectBrowser(ua: string) {
  if (RE_EDGE.test(ua)) {
    return "Edge";
  }
  if (RE_CHROME.test(ua) && !RE_CHROMIUM.test(ua)) {
    return "Chrome";
  }
  if (RE_FIREFOX.test(ua)) {
    return "Firefox";
  }
  if (RE_SAFARI.test(ua) && !RE_CHROME_IN_UA.test(ua)) {
    return "Safari";
  }
  if (RE_OPERA.test(ua)) {
    return "Opera";
  }
  return "Unknown";
}

export type { ParsedUserAgent };
export { parseUserAgent };
