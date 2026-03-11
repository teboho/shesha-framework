import { IStyleType } from "@/index";
import { IConfigurableTheme, getInputComponentThemeDefaults } from "@/providers/theme";

export const defaultStyles = (theme?: IConfigurableTheme): IStyleType => {
  const themeDefaults = getInputComponentThemeDefaults(theme);

  return {
    background: themeDefaults?.background ?? { type: 'color', color: '#fff' },
    font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
    border: {
      border: {
        all: { width: '1px', style: 'solid', color: '#d9d9d9' },
        top: { width: '1px', style: 'solid', color: '#d9d9d9' },
        bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
        left: { width: '1px', style: 'solid', color: '#d9d9d9' },
        right: { width: '1px', style: 'solid', color: '#d9d9d9' },
      },
      radius: { all: 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    // Apply theme stylingBox as default if available
    stylingBox: themeDefaults.stylingBox,
  };
};
