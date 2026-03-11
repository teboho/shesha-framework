import { IColumnsInputProps } from "./interfaces";
import { IConfigurableTheme, getLayoutComponentThemeDefaults } from "@/providers/theme";

export const defaultStyles = (theme?: IConfigurableTheme): IColumnsInputProps => {
  const themeDefaults = getLayoutComponentThemeDefaults(theme);

  // Apply theme grid gap settings to gutterX and gutterY
  // Convert string/number to number (theme stores as px value)
  const themeGutterX = themeDefaults.gridGapHorizontal !== undefined
    ? Number(themeDefaults.gridGapHorizontal)
    : undefined;
  const themeGutterY = themeDefaults.gridGapVertical !== undefined
    ? Number(themeDefaults.gridGapVertical)
    : undefined;

  return {
    background: themeDefaults.background ?? { type: 'color', color: '' },
    dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: '100%' },
    border: themeDefaults.border ?? {
      borderType: 'all',
      radiusType: 'all',
      border: {
        all: { width: '0px', color: '#d3d3d3', style: 'solid' },
        bottom: { width: '0px', color: '#d3d3d3', style: 'solid' },
        left: { width: '0px', color: '#d3d3d3', style: 'solid' },
        right: { width: '0px', color: '#d3d3d3', style: 'solid' },
        top: { width: '0px', color: '#d3d3d3', style: 'solid' },
      },
      radius: { all: 0, bottomLeft: 0, bottomRight: 0, topLeft: 0, topRight: 0 },
      hideBorder: false,
    },
    borderRadius: 0,
    // Apply theme grid gap as defaults if available
    gutterX: themeGutterX ?? 12,
    gutterY: themeGutterY ?? 12,
    stylingBox: themeDefaults.stylingBox ?? "{\"marginBottom\":\"5\"}",
  };
};
