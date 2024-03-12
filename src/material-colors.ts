import {MaterialDynamicColors} from '@material/material-color-utilities';

export type TMaterialColors = Record<keyof typeof MaterialColors, string>;

export type TMaterialColors = Record<keyof typeof MaterialColors, string>;

export type TMaterialColors = Record<keyof typeof MaterialColors, string>;

/**
 * A Mapping of color token name to MCU HCT color function generator.
 */
export const MaterialColors = {
  primaryPaletteKeyColor: MaterialDynamicColors.primaryPaletteKeyColor,
  secondaryPaletteKeyColor: MaterialDynamicColors.secondaryPaletteKeyColor,
  tertiaryPaletteKeyColor: MaterialDynamicColors.tertiaryPaletteKeyColor,
  neutralPaletteKeyColor: MaterialDynamicColors.neutralPaletteKeyColor,
  neutralVariantPaletteKeyColor:
    MaterialDynamicColors.neutralVariantPaletteKeyColor,
  background: MaterialDynamicColors.background,
  onBackground: MaterialDynamicColors.onBackground,
  surface: MaterialDynamicColors.surface,
  surfaceDim: MaterialDynamicColors.surfaceDim,
  surfaceBright: MaterialDynamicColors.surfaceBright,
  surfaceContainerLowest: MaterialDynamicColors.surfaceContainerLowest,
  surfaceContainerLow: MaterialDynamicColors.surfaceContainerLow,
  surfaceContainer: MaterialDynamicColors.surfaceContainer,
  surfaceContainerHigh: MaterialDynamicColors.surfaceContainerHigh,
  surfaceContainerHighest: MaterialDynamicColors.surfaceContainerHighest,
  onSurface: MaterialDynamicColors.onSurface,
  surfaceVariant: MaterialDynamicColors.surfaceVariant,
  onSurfaceVariant: MaterialDynamicColors.onSurfaceVariant,
  inverseSurface: MaterialDynamicColors.inverseSurface,
  inverseOnSurface: MaterialDynamicColors.inverseOnSurface,
  outline: MaterialDynamicColors.outline,
  outlineVariant: MaterialDynamicColors.outlineVariant,
  shadow: MaterialDynamicColors.shadow,
  scrim: MaterialDynamicColors.scrim,
  surfaceTint: MaterialDynamicColors.surfaceTint,
  primary: MaterialDynamicColors.primary,
  onPrimary: MaterialDynamicColors.onPrimary,
  primaryContainer: MaterialDynamicColors.primaryContainer,
  onPrimaryContainer: MaterialDynamicColors.onPrimaryContainer,
  inversePrimary: MaterialDynamicColors.inversePrimary,
  secondary: MaterialDynamicColors.secondary,
  onSecondary: MaterialDynamicColors.onSecondary,
  secondaryContainer: MaterialDynamicColors.secondaryContainer,
  onSecondaryContainer: MaterialDynamicColors.onSecondaryContainer,
  tertiary: MaterialDynamicColors.tertiary,
  onTertiary: MaterialDynamicColors.onTertiary,
  tertiaryContainer: MaterialDynamicColors.tertiaryContainer,
  onTertiaryContainer: MaterialDynamicColors.onTertiaryContainer,
  error: MaterialDynamicColors.error,
  onError: MaterialDynamicColors.onError,
  errorContainer: MaterialDynamicColors.errorContainer,
  onErrorContainer: MaterialDynamicColors.onErrorContainer,
  primaryFixed: MaterialDynamicColors.primaryFixed,
  primaryFixedDim: MaterialDynamicColors.primaryFixedDim,
  onPrimaryFixed: MaterialDynamicColors.onPrimaryFixed,
  onPrimaryFixedVariant: MaterialDynamicColors.onPrimaryFixedVariant,
  secondaryFixed: MaterialDynamicColors.secondaryFixed,
  secondaryFixedDim: MaterialDynamicColors.secondaryFixedDim,
  onSecondaryFixed: MaterialDynamicColors.onSecondaryFixed,
  onSecondaryFixedVariant: MaterialDynamicColors.onSecondaryFixedVariant,
  tertiaryFixed: MaterialDynamicColors.tertiaryFixed,
  tertiaryFixedDim: MaterialDynamicColors.tertiaryFixedDim,
  onTertiaryFixed: MaterialDynamicColors.onTertiaryFixed,
  onTertiaryFixedVariant: MaterialDynamicColors.onTertiaryFixedVariant,
};
