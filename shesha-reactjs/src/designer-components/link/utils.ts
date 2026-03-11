import { IStyleType } from "@/index";
import { IConfigurableTheme, getInlineComponentThemeDefaults } from "@/providers/theme";

export const defaultStyles = (theme?: IConfigurableTheme): IStyleType => {
  const themeDefaults = getInlineComponentThemeDefaults(theme);

  return {
    font: { weight: '400', size: 14, type: 'Segoe UI' },
    // Apply theme stylingBox as default if available
    stylingBox: themeDefaults.stylingBox,
  };
};
