/**
 * Common constants used across the application.
 */

/** Page size options for table pagination */
export const PAGE_SIZES = [10, 25, 50, 100] as const;

/** Responsive breakpoints in pixels */
export const BREAKPOINTS = {
  mobile: 400,
  tablet: 768,
  desktop: 1024,
} as const;

/** Default animation durations in milliseconds */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/** Common z-index values */
export const Z_INDEX = {
  dropdown: 1000,
  modal: 1050,
  tooltip: 1070,
} as const;

/** Table layout constants */
export const TABLE_LAYOUT = {
  defaultHeight: 400,
  headerOffset: 50,
  minHeight: 200,
} as const;
