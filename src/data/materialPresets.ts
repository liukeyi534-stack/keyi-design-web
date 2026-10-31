// ============================================================
// LOWKEY — material presets for the Optical Archive boards
// Each preset varies only transmission, roughness, ior, thickness,
// edge tint, internal layer density, and highlight intensity.
// Shape, edge band, and proportions stay identical.
// ============================================================

import * as THREE from 'three';
import type { MaterialPreset } from './series';

export interface MaterialRecipe {
  preset: MaterialPreset;

  /** mesh-transmission-material parameters */
  transmission: number;
  thickness: number;
  roughness: number;
  ior: number;
  chromaticAberration: number;
  distortion: number;
  distortionScale: number;
  temporalDistortion: number;
  attenuationDistance: number;

  /** visual style */
  edgeColor: string;        // hex — restrained edge tint, never neon
  edgeOpacity: number;
  highlightIntensity: number; // 0..1 — brightness of the polished top edge
  internalLayerOpacity: number; // 0..1 — opacity of the inlay behind the cover
  showEtchedIndex: boolean;  // tiny etched index label visible
  etchedText: string;       // e.g. "LK 01 / 24"

  /** slot name — preserved in the same archive family */
  label: string;
  note: string;
}

export const MATERIAL_RECIPES: Record<MaterialPreset, MaterialRecipe> = {
  'clear-acrylic': {
    preset: 'clear-acrylic',
    transmission: 1.0,
    thickness: 0.42,
    roughness: 0.04,
    ior: 1.49,
    chromaticAberration: 0.018,
    distortion: 0.06,
    distortionScale: 0.4,
    temporalDistortion: 0.05,
    attenuationDistance: 1.6,
    edgeColor: '#f5efe2',
    edgeOpacity: 0.85,
    highlightIntensity: 1.0,
    internalLayerOpacity: 0.0,
    showEtchedIndex: true,
    etchedText: 'CLEAR · ACRYLIC',
    label: 'Clear Acrylic',
    note: 'Transparent cast acrylic. Default for clean editorial work.'
  },
  'frosted-acrylic': {
    preset: 'frosted-acrylic',
    transmission: 0.85,
    thickness: 0.55,
    roughness: 0.22,
    ior: 1.49,
    chromaticAberration: 0.012,
    distortion: 0.10,
    distortionScale: 0.5,
    temporalDistortion: 0.04,
    attenuationDistance: 1.2,
    edgeColor: '#e9e1cf',
    edgeOpacity: 0.75,
    highlightIntensity: 0.55,
    internalLayerOpacity: 0.12,
    showEtchedIndex: true,
    etchedText: 'FROSTED · ACRYLIC',
    label: 'Frosted Acrylic',
    note: 'Soft light pass, low-contrast interior — quiet narrative and text-led series.'
  },
  'smoked-glass': {
    preset: 'smoked-glass',
    transmission: 0.55,
    thickness: 0.70,
    roughness: 0.10,
    ior: 1.55,
    chromaticAberration: 0.022,
    distortion: 0.08,
    distortionScale: 0.45,
    temporalDistortion: 0.06,
    attenuationDistance: 0.9,
    edgeColor: '#2a2823',
    edgeOpacity: 0.70,
    highlightIntensity: 0.45,
    internalLayerOpacity: 0.10,
    showEtchedIndex: true,
    etchedText: 'SMOKED · GLASS',
    label: 'Smoked Glass',
    note: 'Dark edge band, low-light photography register.'
  },
  'amber-resin': {
    preset: 'amber-resin',
    transmission: 0.90,
    thickness: 0.50,
    roughness: 0.08,
    ior: 1.54,
    chromaticAberration: 0.024,
    distortion: 0.10,
    distortionScale: 0.5,
    temporalDistortion: 0.07,
    attenuationDistance: 1.3,
    edgeColor: '#c69a5b',
    edgeOpacity: 0.70,
    highlightIntensity: 0.75,
    internalLayerOpacity: 0.08,
    showEtchedIndex: true,
    etchedText: 'AMBER · RESIN',
    label: 'Amber Resin',
    note: 'Warm interior layer — object and print-driven series.'
  },
  'dichroic-film': {
    preset: 'dichroic-film',
    transmission: 0.95,
    thickness: 0.40,
    roughness: 0.05,
    ior: 1.50,
    chromaticAberration: 0.05,
    distortion: 0.12,
    distortionScale: 0.55,
    temporalDistortion: 0.08,
    attenuationDistance: 1.4,
    edgeColor: '#b6a4c4',
    edgeOpacity: 0.65,
    highlightIntensity: 0.85,
    internalLayerOpacity: 0.06,
    showEtchedIndex: true,
    etchedText: 'DICHROIC · FILM',
    label: 'Dichroic Film',
    note: 'Subtle angle-driven colour shift, not rainbow.'
  },
  'ice-blue-glass': {
    preset: 'ice-blue-glass',
    transmission: 0.92,
    thickness: 0.48,
    roughness: 0.06,
    ior: 1.52,
    chromaticAberration: 0.020,
    distortion: 0.08,
    distortionScale: 0.45,
    temporalDistortion: 0.05,
    attenuationDistance: 1.4,
    edgeColor: '#9cb6c4',
    edgeOpacity: 0.70,
    highlightIntensity: 0.80,
    internalLayerOpacity: 0.05,
    showEtchedIndex: true,
    etchedText: 'ICE · BLUE · GLASS',
    label: 'Ice Blue Glass',
    note: 'Cool edge band, architectural and spatial work.'
  },
  'milky-translucent': {
    preset: 'milky-translucent',
    transmission: 0.55,
    thickness: 0.65,
    roughness: 0.32,
    ior: 1.48,
    chromaticAberration: 0.010,
    distortion: 0.18,
    distortionScale: 0.6,
    temporalDistortion: 0.05,
    attenuationDistance: 0.85,
    edgeColor: '#ede5d2',
    edgeOpacity: 0.80,
    highlightIntensity: 0.50,
    internalLayerOpacity: 0.20,
    showEtchedIndex: true,
    etchedText: 'MILKY · TRANSLUCENT',
    label: 'Milky Translucent',
    note: 'Soft glow — text and essay-led series.'
  },
  'negative-film': {
    preset: 'negative-film',
    transmission: 0.70,
    thickness: 0.50,
    roughness: 0.12,
    ior: 1.50,
    chromaticAberration: 0.018,
    distortion: 0.08,
    distortionScale: 0.4,
    temporalDistortion: 0.05,
    attenuationDistance: 1.1,
    edgeColor: '#cfc6b3',
    edgeOpacity: 0.60,
    highlightIntensity: 0.50,
    internalLayerOpacity: 0.12,
    showEtchedIndex: true,
    etchedText: 'NEGATIVE · FILM',
    label: 'Negative Film',
    note: 'Photographic-negative inlay.'
  },
  'metal-mesh-inlay': {
    preset: 'metal-mesh-inlay',
    transmission: 0.45,
    thickness: 0.80,
    roughness: 0.30,
    ior: 1.55,
    chromaticAberration: 0.012,
    distortion: 0.10,
    distortionScale: 0.4,
    temporalDistortion: 0.04,
    attenuationDistance: 0.8,
    edgeColor: '#a59a86',
    edgeOpacity: 0.85,
    highlightIntensity: 0.65,
    internalLayerOpacity: 0.18,
    showEtchedIndex: true,
    etchedText: 'METAL · MESH',
    label: 'Metal Mesh Inlay',
    note: 'Industrial and installation registers.'
  },
  'pearlescent-film': {
    preset: 'pearlescent-film',
    transmission: 0.85,
    thickness: 0.45,
    roughness: 0.18,
    ior: 1.50,
    chromaticAberration: 0.040,
    distortion: 0.14,
    distortionScale: 0.55,
    temporalDistortion: 0.07,
    attenuationDistance: 1.3,
    edgeColor: '#d9c8c0',
    edgeOpacity: 0.70,
    highlightIntensity: 0.85,
    internalLayerOpacity: 0.08,
    showEtchedIndex: true,
    etchedText: 'PEARLESCENT · FILM',
    label: 'Pearlescent Film',
    note: 'Pearl sheen, not metallic shine.'
  }
};

export function recipeFor(preset: MaterialPreset): MaterialRecipe {
  return MATERIAL_RECIPES[preset] ?? MATERIAL_RECIPES['clear-acrylic'];
}

// helpers — keep colour maths in one place
export const toColor = (hex: string) => new THREE.Color(hex);
