import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency in Indian Rupees.
 * Uses Intl.NumberFormat so formatting is consistent and local-aware.
 *
 * Example: formatCurrency(1234.5) => "₹1,234.50"
 */
export function formatCurrency(amount: number, locale = "en-IN") {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "₹0.00";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
