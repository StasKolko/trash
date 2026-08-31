import { VARIANTS } from "./_lib/config";
import { generateFaviconSizes } from "./_lib/image";
import {
  createFaviconRecord,
  deleteFaviconAndFiles,
  generateManifestFor,
  getActiveFavicon,
  getFaviconById,
  getOrCreateDefaultSettings,
  listFavicons,
  setActiveFavicon,
  updateSettingsMaxSizesAndQuality,
  uploadToS3Batch,
} from "./_lib/repo";
import { validateImageDimensions } from "./_lib/validate";

export {
  generateFaviconSizes,
  validateImageDimensions,
  uploadToS3Batch,
  createFaviconRecord,
  setActiveFavicon,
  getActiveFavicon,
  getFaviconById,
  listFavicons,
  deleteFaviconAndFiles,
  generateManifestFor,
  getOrCreateDefaultSettings,
  updateSettingsMaxSizesAndQuality,
  VARIANTS,
};
