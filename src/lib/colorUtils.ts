/**
 * ============================================================================
 * COLOR UTILITIES
 * ============================================================================
 * 
 * File ini berisi utility functions untuk generate dan manage colors.
 * Digunakan terutama untuk visualisasi peta (choropleth, markers).
 * 
 * Fungsi Utama:
 * -------------
 * 1. getRandomColor() - Generate random hex color
 * 2. createColorMap() - Create color mapping untuk array keys
 * 
 * Use Cases:
 * ----------
 * - Choropleth map: Warna berbeda untuk setiap kecamatan
 * - Marker colors: Differentiate TPS berdasarkan status/jenis
 * - Chart visualization: Category colors
 * 
 * Color Format:
 * -------------
 * Menggunakan HEX color format: #RRGGBB
 * - R (Red): 00-FF
 * - G (Green): 00-FF
 * - B (Blue): 00-FF
 * - Total possible colors: 16,777,216 (16^6)
 * 
 * Dependencies:
 * - None (pure JavaScript)
 * 
 * Author: GoClean Team
 * Last Updated: December 2024
 * ============================================================================
 */

// ===== RANDOM COLOR GENERATOR =====
/**
 * Generates a random hex color
 * 
 * @returns A hex color string in format #RRGGBB
 * 
 * Algorithm:
 * ----------
 * 1. Start with '#'
 * 2. Loop 6 kali untuk 6 karakter hex (RRGGBB)
 * 3. Setiap loop, random pick dari '0-9A-F' (16 possibilities)
 * 4. Append ke color string
 * 
 * @example
 * getRandomColor() // "#A3E4D7"
 * getRandomColor() // "#F39C12"
 * getRandomColor() // "#2ECC71"
 * 
 * Range:
 * ------
 * - Minimum: #000000 (black)
 * - Maximum: #FFFFFF (white)
 * - Distribution: Uniform random across all colors
 * 
 * Note:
 * -----
 * Tidak ada guarantee bahwa warna akan berbeda setiap call.
 * Untuk unique colors per key, gunakan createColorMap().
 */
export const getRandomColor = (): string => {
  // Hex digits: 0-9, A-F (16 total)
  const letters = '0123456789ABCDEF';
  let color = '#';

  // Generate 6 random hex digits untuk RRGGBB
  for (let i = 0; i < 6; i++) {
    // Random index 0-15, get corresponding letter
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
};

// ===== COLOR MAP CREATOR =====
/**
 * Creates a color mapping for a given set of keys (e.g., kecamatan names)
 * 
 * @param keys - Array of strings to map to colors
 * @returns Record mapping each key to unique random hex color
 * 
 * @example
 * const kecamatanColors = createColorMap(['Gubeng', 'Sukolilo', 'Rungkut'])
 * // Returns:
 * // {
 * //   'Gubeng': '#A3E4D7',
 * //   'Sukolilo': '#F39C12',
 * //   'Rungkut': '#2ECC71'
 * // }
 * 
 * // Usage in Leaflet map
 * const fillColor = kecamatanColors[feature.properties.kecamatan]
 * 
 * Use Case:
 * ---------
 * - Choropleth Map: Assign color ke setiap kecamatan
 * - Legend: Generate consistent colors untuk categories
 * - Data Visualization: Category-based coloring
 * 
 * Note:
 * -----
 * - Setiap key mendapat 1 random color
 * - Colors bisa duplicate (random collision)
 * - Untuk truly unique colors, perlu deterministic algorithm
 */
export const createColorMap = (keys: string[]): Record<string, string> => {
  const colorMap: Record<string, string> = {};

  // Iterate semua keys, assign random color
  keys.forEach(key => {
    colorMap[key] = getRandomColor();
  });

  return colorMap;
};

