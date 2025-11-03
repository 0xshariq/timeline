// Predefined color schemes for better visual consistency

type ColorScheme = 'default' | 'vibrant' | 'pastel' | 'dark';

interface ColorSchemes {
  default: string[];
  vibrant: string[];
  pastel: string[];
  dark: string[];
}

export const colorSchemes: ColorSchemes = {
  default: [
    'hsl(0, 70%, 50%)',    // Red
    'hsl(30, 70%, 50%)',   // Orange
    'hsl(60, 70%, 50%)',   // Yellow
    'hsl(120, 70%, 50%)',  // Green
    'hsl(180, 70%, 50%)',  // Cyan
    'hsl(240, 70%, 50%)',  // Blue
    'hsl(280, 70%, 50%)',  // Purple
    'hsl(320, 70%, 50%)',  // Pink
  ],
  vibrant: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  ],
  pastel: [
    '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA',
    '#FFD9BA', '#E0BBE4', '#D4F1F4', '#FEC8D8',
  ],
  dark: [
    '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
    '#9B59B6', '#1ABC9C', '#E67E22', '#34495E',
  ],
};

export function getColorScheme(schemeName: ColorScheme | string = 'default'): string[] {
  return colorSchemes[schemeName as ColorScheme] || colorSchemes.default;
}

export function getRandomColor(scheme: ColorScheme | string = 'default'): string {
  const colors = getColorScheme(scheme);
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getColorByIndex(index: number, scheme: ColorScheme | string = 'default'): string {
  const colors = getColorScheme(scheme);
  return colors[index % colors.length];
}
