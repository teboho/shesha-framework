import { IBorderType, IStyleType } from "@/index";
import { IImageProps } from "./interfaces";
import { IConfigurableTheme, getStandardComponentThemeDefaults } from "@/providers/theme";

export const defaultStyles = (prev: IImageProps, theme?: IConfigurableTheme): IStyleType => {
  const themeDefaults = getStandardComponentThemeDefaults(theme);
  const { borderColor, borderRadius, borderType } = prev;
  const borderWidth = "borderWidth" in prev && typeof (prev.borderWidth) === "string" ? prev.borderWidth : undefined;
  return {
    border: {
      radiusType: 'all', borderType: 'all',
      border: {
        all: { width: borderWidth || '1px', style: (borderType as IBorderType) || 'none', color: borderColor },
      },
      radius: { all: borderRadius },
    },
    dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    // Apply theme stylingBox as default if available
    stylingBox: themeDefaults.stylingBox,
  };
};
