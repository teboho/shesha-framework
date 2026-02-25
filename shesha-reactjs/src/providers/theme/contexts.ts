import { IBackgroundValue, IBorderValue, IShadowValue } from '@/designer-components/_settings/utils/index';
import { createNamedContext } from '@/utils/react';
import { Theme } from 'antd/lib/config-provider/context';

interface ITextTheme {
  default?: string;
  secondary?: string;
  link?: string;
}

export type ThemeLabelAlign = 'left' | 'right' | 'top';


export interface IInputComponentSettings {
  labelAlign?: ThemeLabelAlign;
  labelColon?: boolean;
  labelSpan?: number;
  labelHeight?: string | number;
  contentSpan?: number;
  stylingBox?: string;
}

export interface ILayoutComponentSettings {
  stylingBox?: string;
  gridGapVertical?: number;
  gridGapHorizontal?: number;
  background?: IBackgroundValue;
  border?: IBorderValue;
  shadow?: IShadowValue;
}

export interface IStandardComponentSettings {
  stylingBox?: string;
}

export interface IInlineComponentSettings {
  stylingBox?: string;
}

export interface IThemeFormLayoutSettings {
  span?: number;
  layout?: 'vertical' | 'horizontal';
  labelAlign?: 'left' | 'right' | 'top';
}

export interface IConfigurableTheme {
  application?: Theme;
  sidebar?: 'dark' | 'light';
  sidebarBackground?: string;
  pageBackground?: string;
  componentBackground?: string;
  text?: ITextTheme;
  // Legacy fields (kept for backwards compatibility)
  labelSpan?: number;
  componentSpan?: number;
  // New grouped settings
  inputComponents?: IInputComponentSettings;
  layoutComponents?: ILayoutComponentSettings;
  standardComponents?: IStandardComponentSettings;
  inlineComponents?: IInlineComponentSettings;
  formLayout?: IThemeFormLayoutSettings;
}

export interface IThemeStateContext {
  readonly theme?: IConfigurableTheme;
  prefixCls: string;
  iconPrefixCls: string;
  labelSpan: number;
  componentSpan: number;
}

export interface IThemeActionsContext {
  changeTheme: (theme: IConfigurableTheme, isApplication?: boolean) => void;
  resetToApplicationTheme: () => void;

  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const THEME_CONTEXT_INITIAL_STATE: IThemeStateContext = {
  theme: {
    application: {
      primaryColor: '#1890ff',
      errorColor: '#ff4d4f',
      warningColor: '#faad14',
      successColor: '#52c41a',
      infoColor: '#1890ff',
    },
    sidebar: 'dark',
    pageBackground: '#f0f2f5',
    text: {
      default: '#000000d9',
      secondary: '#00000073',
      link: '',
    },
    // New grouped settings with defaults
    inputComponents: {
      labelAlign: 'right',
      labelColon: true,
      labelSpan: 6,
      contentSpan: 18,
      stylingBox: '{"marginBottom":"5","paddingLeft":"8","paddingBottom":"8","paddingTop":"8","paddingRight":"8"}',
    },
    layoutComponents: {
      stylingBox: '{"marginBottom":"5","paddingLeft":"8","paddingBottom":"8","paddingTop":"8","paddingRight":"8"}',
      gridGapVertical: 16,
      gridGapHorizontal: 16,
      background: {
        type: 'color',
      },
      border: {
        borderType: 'all',
        border: {
          top: { width: 1, color: '#d9d9d9', style: 'solid'},
          bottom: { width: 1, color: '#d9d9d9', style: 'solid'},
          left: { width: 1, color: '#d9d9d9', style: 'solid'},
          right: { width: 1, color: '#d9d9d9', style: 'solid'},
          all: { width: 1, color: '#d9d9d9', style: 'solid'}
        },
      },
      shadow: {
        blurRadius: 0,
        color: '#000',
        offsetX: 0,
        offsetY: 0,
      }
    },
    standardComponents: {
      stylingBox: '{"marginBottom":"5","paddingLeft":"8","paddingBottom":"8","paddingTop":"8","paddingRight":"8"}',
    },
    inlineComponents: {
      stylingBox: '{"marginLeft":"4","marginRight":"4","marginTop":"2","marginBottom":"2"}',
    },
    formLayout: {
      span: 24,
      layout: 'horizontal',
    },
  },
  prefixCls: 'antd',
  iconPrefixCls: 'antdicon',
  labelSpan: 6,
  componentSpan: 18,
};

export const UiStateContext = createNamedContext<IThemeStateContext>(THEME_CONTEXT_INITIAL_STATE, "UiStateContext");

export const UiActionsContext = createNamedContext<IThemeActionsContext>(undefined, "UiActionsContext");
