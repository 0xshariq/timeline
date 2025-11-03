/**
 * 3D Charts - Type Definitions
 */

// 3D-specific dataset type
export interface Dataset3D {
  label: string;
  data: number[];
  labels?: string[];
  x?: number[];
  y?: number[];
  z?: number[];
}

// Helper function type for color generation
export type ColorFunction = (index: number) => number;
