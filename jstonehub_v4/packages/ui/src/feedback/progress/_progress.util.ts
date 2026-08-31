import type { SemanticVariant } from "../../_model/type";

const PERCENTAGE_MULTIPLIER = 100;
const NUMBER_GROUP_SEPARATOR = " ";
const NUMBER_GROUP_REGEX = /\B(?=(\d{3})+(?!\d))/g;

function calculatePercentage(value: number, max: number): number {
  if (max === 0) {
    return 0;
  }
  return (value / max) * PERCENTAGE_MULTIPLIER;
}

function formatNumber(n: number): string {
  return n.toString().replace(NUMBER_GROUP_REGEX, NUMBER_GROUP_SEPARATOR);
}

function resolveVariant(options: {
  processed: number;
  max: number;
  error: number;
  warning: number;
}): SemanticVariant {
  if (options.error > 0) {
    return "error";
  }
  if (options.warning > 0) {
    return "warning";
  }
  if (options.processed === options.max) {
    return "success";
  }
  return "info";
}

export { calculatePercentage, formatNumber, resolveVariant };
