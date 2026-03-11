import { IStyleType } from "@/index";
import { ICardComponentProps } from "./interfaces";
import { IConfigurableTheme, getLayoutComponentThemeDefaults } from "@/providers/theme";

export const defaultStyles = (prev: ICardComponentProps, theme?: IConfigurableTheme): IStyleType => {
  const themeDefaults = getLayoutComponentThemeDefaults(theme);
  const { size } = prev;

  return {
    border: themeDefaults.border ?? { hideBorder: false, radiusType: 'all', borderType: 'all', border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } }, radius: { all: 8 } },
    dimensions: { width: '100%', height: size === 'small' ? '22px' : size === 'large' ? '38px' : '30px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    background: themeDefaults.background ?? {
      type: 'color',
      color: '#fff',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: {} },
      url: '',
      storedFile: { id: null },
      uploadFile: null,
    },
    font: {
      color: '#000',
      type: 'Segoe UI',
      align: 'left',
      size: 14,
      weight: '400',
    },
    shadow: themeDefaults.shadow ?? {
      offsetX: 0,
      offsetY: 0,
      color: '#000',
      blurRadius: 0,
      spreadRadius: 0,
    },
    stylingBox: themeDefaults.stylingBox,
  };
};
