import { parseUserAgent } from "#api/shared/helper/user-agent";

type FingerprintCheckInput = {
  createdUserAgent: string;
  createdIpAddress: string;
  currentUserAgent: string;
  currentIpAddress: string;
};

type FingerprintCheckResult = {
  isSuspicious: boolean;
  reasons: string[];
};

function checkFingerprint(
  input: FingerprintCheckInput,
): FingerprintCheckResult {
  const reasons: string[] = [];

  const createdDevice = parseUserAgent(input.createdUserAgent);
  const currentDevice = parseUserAgent(input.currentUserAgent);

  if (_isOsChanged(createdDevice.os, currentDevice.os)) {
    reasons.push(`os_changed:${createdDevice.os}->${currentDevice.os}`);
  }

  if (_isBrowserChanged(createdDevice.browser, currentDevice.browser)) {
    reasons.push(
      `browser_changed:${createdDevice.browser}->${currentDevice.browser}`,
    );
  }

  if (_isNetworkChanged(input.createdIpAddress, input.currentIpAddress)) {
    reasons.push(
      `network_changed:${input.createdIpAddress}->${input.currentIpAddress}`,
    );
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

function _isOsChanged(createdOs: string, currentOs: string) {
  if (createdOs === "Unknown" || currentOs === "Unknown") {
    return false;
  }

  const createdFamily = _extractOsFamily(createdOs);
  const currentFamily = _extractOsFamily(currentOs);

  return createdFamily !== currentFamily;
}

function _extractOsFamily(os: string) {
  const spaceIndex = os.indexOf(" ");

  if (spaceIndex === -1) {
    return os;
  }

  return os.slice(0, spaceIndex);
}

function _isBrowserChanged(createdBrowser: string, currentBrowser: string) {
  if (createdBrowser === "Unknown" || currentBrowser === "Unknown") {
    return false;
  }

  const createdFamily = _extractBrowserFamily(createdBrowser);
  const currentFamily = _extractBrowserFamily(currentBrowser);

  return createdFamily !== currentFamily;
}

function _extractBrowserFamily(browser: string) {
  const spaceIndex = browser.indexOf(" ");

  if (spaceIndex === -1) {
    return browser;
  }

  return browser.slice(0, spaceIndex);
}

function _isNetworkChanged(createdIp: string, currentIp: string) {
  if (createdIp === "unknown" || currentIp === "unknown") {
    return false;
  }

  const createdPrefix = _extractIpPrefix(createdIp);
  const currentPrefix = _extractIpPrefix(currentIp);

  if (!(createdPrefix && currentPrefix)) {
    return false;
  }

  return createdPrefix !== currentPrefix;
}

function _extractIpPrefix(ip: string) {
  const parts = ip.split(".");
  const minParts = 2;

  if (parts.length < minParts) {
    return null;
  }

  return `${parts[0]}.${parts[1]}`;
}

export type { FingerprintCheckResult };
export { checkFingerprint };
