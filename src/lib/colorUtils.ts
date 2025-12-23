// src/lib/colorUtils.ts

/**
 * Generates a random color.
 * @returns A hex color string.
 */
export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Creates a color mapping for a given set of keys (e.g., kecamatan names).
 * @param keys - An array of strings to map to colors.
 * @returns A record mapping each key to a hex color string.
 */
export const createColorMap = (keys: string[]): Record<string, string> => {
  const colorMap: Record<string, string> = {};
  keys.forEach(key => {
    colorMap[key] = getRandomColor();
  });
  return colorMap;
};
