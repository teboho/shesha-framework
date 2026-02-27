import { IConfigurableTheme } from '@/providers/theme/contexts';

/**
 * Merges a partial update into a theme section
 */
export const mergeThemeSection = <K extends keyof IConfigurableTheme>(
  theme: IConfigurableTheme,
  section: K,
  update: Partial<IConfigurableTheme[K]>,
): IConfigurableTheme[K] => {
  return {
    ...(theme?.[section] as Record<string, unknown> || {}),
    ...(update as Record<string, unknown>),
  } as unknown as IConfigurableTheme[K];
};

/**
 * Updates a specific section of the theme
 */
export const updateThemeSection = <K extends keyof IConfigurableTheme>(
  theme: IConfigurableTheme,
  section: K,
  update: Partial<IConfigurableTheme[K]>,
): IConfigurableTheme => {
  return {
    ...theme,
    [section]: mergeThemeSection(theme, section, update),
  };
};

/**
 * Creates theme updater functions for all component sections
 */
export const createThemeUpdaters = (
  theme: IConfigurableTheme,
  onChange: (theme: IConfigurableTheme) => void,
): {
  updateTheme: <K extends keyof IConfigurableTheme>(section: K, update: Partial<IConfigurableTheme[K]>) => void;
  updateInputComponents: (update: Partial<IConfigurableTheme['inputComponents']>) => void;
  updateLayoutComponents: (update: Partial<IConfigurableTheme['layoutComponents']>) => void;
  updateStandardComponents: (update: Partial<IConfigurableTheme['standardComponents']>) => void;
  updateInlineComponents: (update: Partial<IConfigurableTheme['inlineComponents']>) => void;
  updateApplication: (update: Partial<IConfigurableTheme['application']>) => void;
  updateText: (update: Partial<IConfigurableTheme['text']>) => void;
} => {
  const updateTheme = <K extends keyof IConfigurableTheme>(
    section: K,
    update: Partial<IConfigurableTheme[K]>,
  ): void => {
    onChange(updateThemeSection(theme, section, update));
  };

  return {
    updateTheme,
    updateInputComponents: (update: Partial<IConfigurableTheme['inputComponents']>) =>
      updateTheme('inputComponents', update),
    updateLayoutComponents: (update: Partial<IConfigurableTheme['layoutComponents']>) =>
      updateTheme('layoutComponents', update),
    updateStandardComponents: (update: Partial<IConfigurableTheme['standardComponents']>) =>
      updateTheme('standardComponents', update),
    updateInlineComponents: (update: Partial<IConfigurableTheme['inlineComponents']>) =>
      updateTheme('inlineComponents', update),
    updateApplication: (update: Partial<IConfigurableTheme['application']>) =>
      updateTheme('application', update),
    updateText: (update: Partial<IConfigurableTheme['text']>) =>
      updateTheme('text', update),
  };
};

/**
 * Configuration for theme colors
 */
export interface IThemeColorConfig {
  name: string;
  label?: string;
  onChange: (color: any) => void;
  hint?: string;
}

/**
 * Gets a theme value with fallback to legacy property
 * Handles backwards compatibility for renamed properties
 */
export const getThemeValueWithFallback = (theme: IConfigurableTheme, key: string, legacyKey?: string): any => {
  const value = theme?.[key];
  // If the value exists, return it
  if (value !== undefined && value !== null) return value;
  // Otherwise check for legacy key
  if (legacyKey) {
    const legacyValue = (theme as any)?.[legacyKey];
    if (legacyValue !== undefined && legacyValue !== null) return legacyValue;
  }
  return value;
};

/**
 * Creates color configuration arrays
 */
export const createColorConfigs = (
  updateApplication: (update: Partial<IConfigurableTheme['application']>) => void,
  updateText: (update: Partial<IConfigurableTheme['text']>) => void,
  onChange: (theme: IConfigurableTheme) => void,
  theme: IConfigurableTheme,
): {
  colorConfigs: IThemeColorConfig[];
  textConfigs: IThemeColorConfig[];
  backgroundConfigs: IThemeColorConfig[];
} => {
  const colorConfigs: IThemeColorConfig[] = [
    { name: 'primaryColor', onChange: (color: any) => updateApplication({ primaryColor: color.toString() }) },
    { name: 'errorColor', onChange: (color: any) => updateApplication({ errorColor: color.toString() }) },
    { name: 'warningColor', onChange: (color: any) => updateApplication({ warningColor: color.toString() }) },
    { name: 'successColor', onChange: (color: any) => updateApplication({ successColor: color.toString() }) },
    { name: 'infoColor', onChange: (color: any) => updateApplication({ infoColor: color.toString() }) },
  ];

  const textConfigs: IThemeColorConfig[] = [
    { name: 'default', onChange: (color: any) => updateText({ default: color.toString() }) },
    { name: 'secondary', onChange: (color: any) => updateText({ secondary: color.toString() }) },
  ];

  const backgroundConfigs: IThemeColorConfig[] = [
    {
      name: 'pageBackground',
      label: 'Page',
      onChange: (color: any) => onChange({ ...theme, pageBackground: color.toString() }),
    },
    {
      name: 'componentBackground',
      label: 'Component',
      onChange: (color: any) => onChange({ ...theme, componentBackground: color.toString() }),
    },
  ];
  return { colorConfigs, textConfigs, backgroundConfigs };
};

/**
 * Border radius configuration items
 */
export const BORDER_RADIUS_CORNERS = [
  { key: 'topLeft', label: 'Top Left', icon: 'RadiusUpleftOutlined' },
  { key: 'bottomLeft', label: 'Bottom Left', icon: 'RadiusBottomleftOutlined' },
  { key: 'topRight', label: 'Top Right', icon: 'RadiusUprightOutlined' },
  { key: 'bottomRight', label: 'Bottom Right', icon: 'RadiusBottomrightOutlined' },
];

/**
 * Border sides for custom borders
 */
export const BORDER_SIDES = ['top', 'bottom', 'left', 'right'] as const;

/**
 * Label alignment options
 */
export const LABEL_ALIGN_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
  { label: 'Top', value: 'top' },
];
