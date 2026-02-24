import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Row, Space, Tooltip, Radio, Switch } from 'antd';
import React, { FC, useCallback, useMemo } from 'react';
import { Show, CollapsiblePanel, ColorPicker, SectionSeparator } from '@/components';
import { IConfigurableTheme, ThemeLabelAlign } from '@/providers/theme/contexts';
import { humanizeString } from '@/utils/string';
import { BACKGROUND_PRESET_COLORS, PRESET_COLORS, SHESHA_COLORS, TEXT_PRESET_COLORS } from './presetColors';
import { InputRow } from '@/designer-components/settingsInputRow';
import { SettingInput } from '@/designer-components/settingsInput/settingsInput';
import { nanoid } from '@/utils/uuid';
import { useStyles } from './styles/styles';
import Box from '@/designer-components/styleBox/components/box';
import SettingsInput from '@/designer-components/settingsInput';
import {
  backgroundTypeOptions,
  sizeOptions,
  positionOptions,
  repeatOptions,
} from '@/designer-components/_settings/utils/background/utils';
import { borderStyles } from '@/designer-components/_settings/utils/border/utils';
import { useTheme } from '@/providers';

interface IThemeConfig {
  name: string;
  onChange: (hex: string) => void;
  hint?: string;
}

export interface ThemeParametersProps {
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
}

interface IHeaderProps {
  title?: string;
  subtitle?: string
};

const HeaderContent: FC<IHeaderProps> = ({ title, subtitle }) => {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ margin: 0, color: '#969696' }}>{title}</h4>
      <p style={{ margin: 0, color: theme?.application?.primaryColor }}>{subtitle}</p>
    </div>
  );
};

const ThemeParameters: FC<ThemeParametersProps> = ({ value: theme, onChange, readonly }) => {
  const { styles } = useStyles();

  const changeThemeInternal = (theme: IConfigurableTheme): void => {
    if (onChange) onChange(theme);
  };

  const mergeThemeSection = <K extends keyof IConfigurableTheme>(
    section: K,
    update: Partial<IConfigurableTheme[K]>,
  ): IConfigurableTheme[K] => {
    return { ...(theme?.[section] as Record<string, unknown> || {}), ...(update as Record<string, unknown>) } as unknown as IConfigurableTheme[K];
  };

  const updateTheme = <K extends keyof IConfigurableTheme>(
    section: K,
    update: Partial<IConfigurableTheme[K]>,
  ): void => {
    changeThemeInternal({
      ...theme,
      [section]: mergeThemeSection(section, update),
    });
  };

  const updateInputComponents = (update: Partial<IConfigurableTheme['inputComponents']>): void => {
    updateTheme('inputComponents', update);
  };

  const updateLayoutComponents = (update: Partial<IConfigurableTheme['layoutComponents']>): void => {
    updateTheme('layoutComponents', update);
  };

  const updateStandardComponents = (update: Partial<IConfigurableTheme['standardComponents']>): void => {
    updateTheme('standardComponents', update);
  };

  const updateFormLayout = (update: Partial<IConfigurableTheme['formLayout']>): void => {
    updateTheme('formLayout', update);
  };

  const renderColor = useCallback(
    (
      key: string,
      colorName: string,
      initialColor: string,
      onChange: (color: string) => void,
      presetColors?: string[],
      hint?: string,
    ) => (
      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <Space direction="horizontal" className={styles.themeColorSpace}>
          <span>{humanizeString(colorName)} </span>
          <Show when={Boolean(hint)}>
            <Tooltip title={hint}>
              <span className="sha-color-tooltip" style={{ cursor: 'pointer' }}>
                <QuestionCircleOutlined />
              </span>
            </Tooltip>
          </Show>
          <ColorPicker
            title={humanizeString(colorName)}
            presets={[{ label: 'Presets', defaultOpen: true, colors: presetColors ?? PRESET_COLORS }, { label: 'Shesha', defaultOpen: false, colors: SHESHA_COLORS }]}
            value={initialColor}
            onChange={onChange}
            readOnly={readonly}
            allowClear={true}
            style={{ border: 'none' }}
            className={styles.themeColorPicker}
            size="small"
          />
        </Space>
      </div>
    ),
    [theme],
  );

  const renderDivider = () => (<SectionSeparator lineColor="gray"lineThickness={2} lineWidth="100%" />);

  const colorConfigs: IThemeConfig[] = useMemo(() => [
    { name: 'primaryColor', onChange: (hex: string) => updateTheme('application', { primaryColor: hex }) },
    { name: 'errorColor', onChange: (hex: string) => updateTheme('application', { errorColor: hex }) },
    { name: 'warningColor', onChange: (hex: string) => updateTheme('application', { warningColor: hex }) },
    { name: 'successColor', onChange: (hex: string) => updateTheme('application', { successColor: hex }) },
    { name: 'infoColor', onChange: (hex: string) => updateTheme('application', { infoColor: hex }) },
  ], []);

  const textConfigs: IThemeConfig[] = useMemo(() => [
    { name: 'default', onChange: (hex: string) => updateTheme('text', { default: hex }) },
    { name: 'secondary', onChange: (hex: string) => updateTheme('text', { secondary: hex }) },
  ], []);

  const pageConfigs: IThemeConfig[] = useMemo(() => [
    { name: 'component', onChange: (hex: string) => updateTheme('text', { secondary: hex }) },
    { name: 'page', onChange: (hex: string) => updateTheme('text', { default: hex }) },
  ], []);


  const inputSettings = theme?.inputComponents;
  const layoutSettings = theme?.layoutComponents;
  const standardSettings = theme?.standardComponents;
  const formLayoutSettings = theme?.formLayout;

  const isLabelSpanDisabled = inputSettings?.labelAlign === 'top';

  // Common input props for settingsInput
  const commonInputProps = {
    readOnly: readonly,
    jsSetting: false,
  };

  // Common props for CollapsiblePanel
  const commonPanelProps = {
    expandIconPosition: 'end' as const,
    className: styles.themeCard,
    collapsedByDefault: false,
  };

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Theme Colors Section */}
      <CollapsiblePanel
        {...commonPanelProps}
        header={<HeaderContent title="Theme Settings" subtitle="Customize the look and feel of your workspace" />}
      >
        <Space direction="vertical" align="start" size="middle" className={styles.space}>
          <Space direction="vertical" align="start" className={styles.space}>
            <HeaderContent title="Theme" subtitle="" />
            <Radio.Group
              onChange={(e) => {
                changeThemeInternal({
                  ...theme,
                  sidebar: e.target.value,
                });
              }}
              defaultValue="light"
            >
              <Radio.Button value="dark">Dark</Radio.Button>
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="system">System</Radio.Button>
            </Radio.Group>
          </Space>
          {renderDivider()}
          <Space direction="vertical" align="start" size="middle" className={styles.space}>
            <HeaderContent title="Colours" subtitle="Select a circle bellow to choose your desired colour" />
            <Space direction="horizontal" align="center">
              {colorConfigs.map((config, index) =>
                renderColor(`theme_${index}`, config.name.replace('Color', ''), theme?.application?.[config.name], (hex) => config.onChange(hex)),
              )}
            </Space>
            <HeaderContent title="Text Colors" subtitle="Customize text colors for your application" />
            <Space direction="horizontal" align="center">
              {textConfigs.map((config, index) =>
                renderColor(
                  `text_${index}`,
                  config.name,
                  theme?.text?.[config.name],
                  (hex) => config.onChange(hex),
                  TEXT_PRESET_COLORS,
                  config?.hint,
                ),
              )}
            </Space>
            <HeaderContent title="Component Page" subtitle="Customize text colors for your application" />
            <Space direction="horizontal" align="center">
              {pageConfigs.map((config, index) => renderColor(
              `text_${index}`,
              config.name,
              theme?.[config.name],
              (hex) => config.onChange(hex),
              BACKGROUND_PRESET_COLORS,
            ))}
            </Space>
           
          </Space>
        </Space>
      </CollapsiblePanel>

      {/* Layout Component Settings Section */}
      <CollapsiblePanel
        {...commonPanelProps}
        header={<HeaderContent title="Layout Component Settings" subtitle="Configure layout component styling" />}
      >
        {/* Margin & Padding Control */}
        <HeaderContent title="Margin & Padding" subtitle="Configure layout styling such as margin and padding" />
        <Box value={layoutSettings?.stylingBox} onChange={onChange} readOnly={readonly} />
        <HeaderContent title="Grid Gap" subtitle="Configure layout component styling" />
        <InputRow>
          <SettingInput
            type="numberField"
            label="Column Gap"
            propertyName="layoutComponents.gridGapHorizontal"
            value={layoutSettings?.gridGapHorizontal}
            onChange={(val) => updateLayoutComponents({ gridGapHorizontal: val })}
            {...commonInputProps}
          />
          <SettingInput
            type="numberField"
            label="Row Gap"
            propertyName="layoutComponents.gridGapVertical"
            value={layoutSettings?.gridGapVertical}
            onChange={(val) => updateLayoutComponents({ gridGapVertical: val })}
            {...commonInputProps}
          />
        </InputRow>

        {/* Background Section */}
        <HeaderContent title="Background" subtitle="Configure background settings" />
        <InputRow
          inputs={[
            {
              type: 'radio',
              id: nanoid(),
              propertyName: 'layoutComponents.background.type',
              label: 'Type',
              tooltip: 'Select a type of background',
              buttonGroupOptions: backgroundTypeOptions,
              ...commonInputProps,
            } as any,
          ]}
        >
          <Radio.Group
            value={layoutSettings?.background?.type || 'color'}
            onChange={(e) => updateLayoutComponents({
              background: { ...layoutSettings?.background, type: e.target.value },
            })}
            disabled={readonly}
          >
            <Radio.Button value="color">Color</Radio.Button>
            <Radio.Button value="gradient">Gradient</Radio.Button>
            <Radio.Button value="image">Image</Radio.Button>
            <Radio.Button value="url">URL</Radio.Button>
            <Radio.Button value="storedFile">Stored File</Radio.Button>
          </Radio.Group>
        </InputRow>

        {/* Background Color */}
        {layoutSettings?.background?.type === 'color' && (
          <InputRow
            inputs={[
              {
                type: 'colorPicker',
                id: nanoid(),
                propertyName: 'layoutComponents.background.color',
                label: 'Color',
                hideLabel: true,
                ...commonInputProps,
              } as any,
            ]}
          >
            <SettingInput
              type="colorPicker"
              label="Color"
              propertyName="layoutComponents.background.color"
              value={layoutSettings?.background?.color}
              onChange={(val) => updateLayoutComponents({
                background: { ...layoutSettings?.background, color: val },
              })}
              {...commonInputProps}
            />
          </InputRow>
        )}

        {/* Background URL */}
        {layoutSettings?.background?.type === 'url' && (
          <SettingInput
            type="textField"
            label="URL"
            propertyName="layoutComponents.background.url"
            value={layoutSettings?.background?.url}
            onChange={(val) => updateLayoutComponents({
              background: { ...layoutSettings?.background, url: val },
            })}
            {...commonInputProps}
          />
        )}

        {/* Background Size & Position */}
        {layoutSettings?.background?.type !== 'color' && (
          <>
            <InputRow
              inputs={[
                {
                  type: 'dropdown',
                  id: nanoid(),
                  propertyName: 'layoutComponents.background.size',
                  label: 'Size',
                  tooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                  dropdownOptions: sizeOptions,
                  allowClear: true,
                  ...commonInputProps,
                } as any,
              ]}
            >
              <SettingInput
                type="dropdown"
                label="Size"
                propertyName="layoutComponents.background.size"
                value={layoutSettings?.background?.size}
                onChange={(val) => updateLayoutComponents({
                  background: { ...layoutSettings?.background, size: val },
                })}
                dropdownOptions={sizeOptions}
                allowClear
                {...commonInputProps}
              />
            </InputRow>
            <InputRow
              inputs={[
                {
                  type: 'dropdown',
                  id: nanoid(),
                  propertyName: 'layoutComponents.background.position',
                  label: 'Position',
                  tooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                  dropdownOptions: positionOptions,
                  allowClear: true,
                  ...commonInputProps,
                } as any,
              ]}
            >
              <SettingInput
                type="dropdown"
                label="Position"
                propertyName="layoutComponents.background.position"
                value={layoutSettings?.background?.position}
                onChange={(val) => updateLayoutComponents({
                  background: { ...layoutSettings?.background, position: val },
                })}
                dropdownOptions={positionOptions}
                allowClear
                {...commonInputProps}
              />
            </InputRow>
            <InputRow
              inputs={[
                {
                  type: 'radio',
                  id: nanoid(),
                  propertyName: 'layoutComponents.background.repeat',
                  label: 'Repeat',
                  hideLabel: true,
                  buttonGroupOptions: repeatOptions,
                  ...commonInputProps,
                } as any,
              ]}
            >
              <Radio.Group
                value={layoutSettings?.background?.repeat}
                onChange={(e) => updateLayoutComponents({
                  background: { ...layoutSettings?.background, repeat: e.target.value },
                })}
                disabled={readonly}
              >
                <Radio.Button value="no-repeat">No Repeat</Radio.Button>
                <Radio.Button value="repeat">Repeat</Radio.Button>
                <Radio.Button value="repeat-x">Repeat X</Radio.Button>
                <Radio.Button value="repeat-y">Repeat Y</Radio.Button>
              </Radio.Group>
            </InputRow>
          </>
        )}

        {/* Border Section */}
        <HeaderContent title="Border" subtitle="Configure border settings" />
        <InputRow
          inputs={[
            {
              type: 'radio',
              id: nanoid(),
              propertyName: 'layoutComponents.border.borderType',
              label: 'Border Type',
              buttonGroupOptions: [
                { value: 'all', icon: 'BorderOutlined', title: 'All' },
                { value: 'custom', icon: 'BorderOuterOutlined', title: 'Custom' },
              ],
              ...commonInputProps,
            } as any,
          ]}
        >
          <Radio.Group
            value={layoutSettings?.border?.borderType || 'all'}
            onChange={(e) => updateLayoutComponents({
              border: { ...layoutSettings?.border, borderType: e.target.value },
            })}
            disabled={readonly}
          >
            <Radio.Button value="all">All</Radio.Button>
            <Radio.Button value="custom">Custom</Radio.Button>
          </Radio.Group>
        </InputRow>

        {/* All Border Settings */}
        {layoutSettings?.border?.borderType !== 'custom' && (
          <InputRow
            inputs={[
              {
                type: 'textField',
                id: nanoid(),
                propertyName: 'layoutComponents.border.border.all.width',
                label: 'Width',
                placeholder: '0',
                hideLabel: true,
                ...commonInputProps,
              } as any,
              {
                type: 'dropdown',
                id: nanoid(),
                propertyName: 'layoutComponents.border.border.all.style',
                label: 'Style',
                hideLabel: true,
                placeholder: 'Solid',
                dropdownOptions: borderStyles,
                ...commonInputProps,
              } as any,
              {
                type: 'colorPicker',
                id: nanoid(),
                propertyName: 'layoutComponents.border.border.all.color',
                label: 'Color',
                hideLabel: true,
                ...commonInputProps,
              } as any,
            ]}
          >
            <SettingInput
              type="textField"
              label="Width"
              propertyName="layoutComponents.border.border.all.width"
              value={layoutSettings?.border?.border?.all?.width}
              onChange={(val) => updateLayoutComponents({
                border: {
                  ...layoutSettings?.border,
                  border: {
                    ...layoutSettings?.border?.border,
                    all: { ...layoutSettings?.border?.border?.all, width: val },
                  },
                },
              })}
              placeholder="0"
              {...commonInputProps}
            />
            <SettingInput
              type="dropdown"
              label="Style"
              propertyName="layoutComponents.border.border.all.style"
              value={layoutSettings?.border?.border?.all?.style}
              onChange={(val) => updateLayoutComponents({
                border: {
                  ...layoutSettings?.border,
                  border: {
                    ...layoutSettings?.border?.border,
                    all: { ...layoutSettings?.border?.border?.all, style: val },
                  },
                },
              })}
              dropdownOptions={borderStyles}
              placeholder="Solid"
              {...commonInputProps}
            />
            <SettingInput
              type="colorPicker"
              label="Color"
              propertyName="layoutComponents.border.border.all.color"
              value={layoutSettings?.border?.border?.all?.color}
              onChange={(val) => updateLayoutComponents({
                border: {
                  ...layoutSettings?.border,
                  border: {
                    ...layoutSettings?.border?.border,
                    all: { ...layoutSettings?.border?.border?.all, color: val },
                  },
                },
              })}
              {...commonInputProps}
            />
          </InputRow>
        )}

        {/* Custom Border Settings */}
        {layoutSettings?.border?.borderType === 'custom' && (
          <>
            {['top', 'right', 'bottom', 'left'].map((side) => (
              <InputRow
                key={side}
                inputs={[
                  {
                    type: 'textField',
                    id: nanoid(),
                    propertyName: `layoutComponents.border.border.${side}.width`,
                    label: `${side.charAt(0).toUpperCase() + side.slice(1)} Width`,
                    placeholder: '0',
                    hideLabel: true,
                    ...commonInputProps,
                  } as any,
                  {
                    type: 'dropdown',
                    id: nanoid(),
                    propertyName: `layoutComponents.border.border.${side}.style`,
                    label: 'Style',
                    hideLabel: true,
                    placeholder: 'Solid',
                    dropdownOptions: borderStyles,
                    ...commonInputProps,
                  } as any,
                  {
                    type: 'colorPicker',
                    id: nanoid(),
                    propertyName: `layoutComponents.border.border.${side}.color`,
                    label: 'Color',
                    hideLabel: true,
                    ...commonInputProps,
                  } as any,
                ]}
              >
                <span style={{ textTransform: 'capitalize', minWidth: '50px' }}>{side}</span>
                <SettingInput
                  type="textField"
                  label="Width"
                  propertyName={`layoutComponents.border.border.${side}.width`}
                  value={layoutSettings?.border?.border?.[side]?.width}
                  onChange={(val) => updateLayoutComponents({
                    border: {
                      ...layoutSettings?.border,
                      border: {
                        ...layoutSettings?.border?.border,
                        [side]: { ...layoutSettings?.border?.border?.[side], width: val },
                      },
                    },
                  })}
                  placeholder="0"
                  {...commonInputProps}
                />
                <SettingInput
                  type="dropdown"
                  label="Style"
                  propertyName={`layoutComponents.border.border.${side}.style`}
                  value={layoutSettings?.border?.border?.[side]?.style}
                  onChange={(val) => updateLayoutComponents({
                    border: {
                      ...layoutSettings?.border,
                      border: {
                        ...layoutSettings?.border?.border,
                        [side]: { ...layoutSettings?.border?.border?.[side], style: val },
                      },
                    },
                  })}
                  dropdownOptions={borderStyles}
                  placeholder="Solid"
                  {...commonInputProps}
                />
                <SettingInput
                  type="colorPicker"
                  label="Color"
                  propertyName={`layoutComponents.border.border.${side}.color`}
                  value={layoutSettings?.border?.border?.[side]?.color}
                  onChange={(val) => updateLayoutComponents({
                    border: {
                      ...layoutSettings?.border,
                      border: {
                        ...layoutSettings?.border?.border,
                        [side]: { ...layoutSettings?.border?.border?.[side], color: val },
                      },
                    },
                  })}
                  {...commonInputProps}
                />
              </InputRow>
            ))}
          </>
        )}

        {/* Radius Type */}
        <InputRow
          inputs={[
            {
              type: 'radio',
              id: nanoid(),
              propertyName: 'layoutComponents.border.radiusType',
              label: 'Radius Type',
              buttonGroupOptions: [
                { value: 'all', icon: 'ExpandOutlined', title: 'All' },
                { value: 'custom', icon: 'RadiusUprightOutlined', title: 'Custom' },
              ],
              ...commonInputProps,
            } as any,
          ]}
        >
          <Radio.Group
            value={layoutSettings?.border?.radiusType || 'all'}
            onChange={(e) => updateLayoutComponents({
              border: { ...layoutSettings?.border, radiusType: e.target.value },
            })}
            disabled={readonly}
          >
            <Radio.Button value="all">All</Radio.Button>
            <Radio.Button value="custom">Custom</Radio.Button>
          </Radio.Group>
        </InputRow>

        {/* All Radius */}
        {layoutSettings?.border?.radiusType !== 'custom' && (
          <SettingInput
            type="numberField"
            label="Corner Radius"
            propertyName="layoutComponents.border.radius.all"
            value={layoutSettings?.border?.radius?.all}
            onChange={(val) => updateLayoutComponents({
              border: {
                ...layoutSettings?.border,
                radius: { ...layoutSettings?.border?.radius, all: val },
              },
            })}
            placeholder="0"
            {...commonInputProps}
          />
        )}

        {/* Custom Radius */}
        {layoutSettings?.border?.radiusType === 'custom' && (
          <InputRow
            inputs={[
              {
                type: 'numberField',
                id: nanoid(),
                propertyName: 'layoutComponents.border.radius.topLeft',
                label: 'Top Left',
                placeholder: '0',
                hideLabel: true,
                icon: 'RadiusUpleftOutlined',
                ...commonInputProps,
              } as any,
              {
                type: 'numberField',
                id: nanoid(),
                propertyName: 'layoutComponents.border.radius.topRight',
                label: 'Top Right',
                placeholder: '0',
                hideLabel: true,
                icon: 'RadiusUprightOutlined',
                ...commonInputProps,
              } as any,
              {
                type: 'numberField',
                id: nanoid(),
                propertyName: 'layoutComponents.border.radius.bottomLeft',
                label: 'Bottom Left',
                placeholder: '0',
                hideLabel: true,
                icon: 'RadiusBottomleftOutlined',
                ...commonInputProps,
              } as any,
              {
                type: 'numberField',
                id: nanoid(),
                propertyName: 'layoutComponents.border.radius.bottomRight',
                label: 'Bottom Right',
                placeholder: '0',
                hideLabel: true,
                icon: 'RadiusBottomrightOutlined',
                ...commonInputProps,
              } as any,
            ]}
          >
            <SettingInput
              type="numberField"
              label="Top Left"
              propertyName="layoutComponents.border.radius.topLeft"
              value={layoutSettings?.border?.radius?.topLeft}
              onChange={(val) => updateLayoutComponents({
                border: {
                  ...layoutSettings?.border,
                  radius: { ...layoutSettings?.border?.radius, topLeft: val },
                },
              })}
              placeholder="0"
              {...commonInputProps}
            />
            <SettingInput
              type="numberField"
              label="Top Right"
              propertyName="layoutComponents.border.radius.topRight"
              value={layoutSettings?.border?.radius?.topRight}
              onChange={(val) => updateLayoutComponents({
                border: {
                  ...layoutSettings?.border,
                  radius: { ...layoutSettings?.border?.radius, topRight: val },
                },
              })}
              placeholder="0"
              {...commonInputProps}
            />
            <SettingInput
              type="numberField"
              label="Bottom Left"
              propertyName="layoutComponents.border.radius.bottomLeft"
              value={layoutSettings?.border?.radius?.bottomLeft}
              onChange={(val) => updateLayoutComponents({
                border: {
                  ...layoutSettings?.border,
                  radius: { ...layoutSettings?.border?.radius, bottomLeft: val },
                },
              })}
              placeholder="0"
              {...commonInputProps}
            />
            <SettingInput
              type="numberField"
              label="Bottom Right"
              propertyName="layoutComponents.border.radius.bottomRight"
              value={layoutSettings?.border?.radius?.bottomRight}
              onChange={(val) => updateLayoutComponents({
                border: {
                  ...layoutSettings?.border,
                  radius: { ...layoutSettings?.border?.radius, bottomRight: val },
                },
              })}
              placeholder="0"
              {...commonInputProps}
            />
          </InputRow>
        )}

        {/* Shadow Section */}
        <HeaderContent title="Shadow" subtitle="Configure shadow settings" />
        <InputRow
          inputs={[
            {
              type: 'numberField',
              id: nanoid(),
              propertyName: 'layoutComponents.shadow.offsetX',
              label: 'Offset X',
              hideLabel: true,
              tooltip: 'Offset X',
              icon: 'dragOutlined',
              ...commonInputProps,
            } as any,
            {
              type: 'numberField',
              id: nanoid(),
              propertyName: 'layoutComponents.shadow.offsetY',
              label: 'Offset Y',
              hideLabel: true,
              tooltip: 'Offset Y',
              icon: 'dragOutlined',
              ...commonInputProps,
            } as any,
            {
              type: 'numberField',
              id: nanoid(),
              propertyName: 'layoutComponents.shadow.blurRadius',
              label: 'Blur',
              hideLabel: true,
              tooltip: 'Blur radius',
              icon: 'eyeInvisibleOutlined',
              ...commonInputProps,
            } as any,
            {
              type: 'numberField',
              id: nanoid(),
              propertyName: 'layoutComponents.shadow.spreadRadius',
              label: 'Spread',
              hideLabel: true,
              tooltip: 'Spread radius',
              icon: 'expandOutlined',
              ...commonInputProps,
            } as any,
            {
              type: 'colorPicker',
              id: nanoid(),
              propertyName: 'layoutComponents.shadow.color',
              label: 'Color',
              hideLabel: true,
              ...commonInputProps,
            } as any,
          ]}
        >
          <SettingInput
            type="numberField"
            label="Offset X"
            propertyName="layoutComponents.shadow.offsetX"
            value={layoutSettings?.shadow?.offsetX}
            onChange={(val) => updateLayoutComponents({
              shadow: { ...layoutSettings?.shadow, offsetX: val },
            })}
            placeholder="0"
            {...commonInputProps}
          />
          <SettingInput
            type="numberField"
            label="Offset Y"
            propertyName="layoutComponents.shadow.offsetY"
            value={layoutSettings?.shadow?.offsetY}
            onChange={(val) => updateLayoutComponents({
              shadow: { ...layoutSettings?.shadow, offsetY: val },
            })}
            placeholder="0"
            {...commonInputProps}
          />
          <SettingInput
            type="numberField"
            label="Blur"
            propertyName="layoutComponents.shadow.blurRadius"
            value={layoutSettings?.shadow?.blurRadius}
            onChange={(val) => updateLayoutComponents({
              shadow: { ...layoutSettings?.shadow, blurRadius: val },
            })}
            placeholder="0"
            {...commonInputProps}
          />
          <SettingInput
            type="numberField"
            label="Spread"
            propertyName="layoutComponents.shadow.spreadRadius"
            value={layoutSettings?.shadow?.spreadRadius}
            onChange={(val) => updateLayoutComponents({
              shadow: { ...layoutSettings?.shadow, spreadRadius: val },
            })}
            placeholder="0"
            {...commonInputProps}
          />
          <SettingInput
            type="colorPicker"
            label="Color"
            propertyName="layoutComponents.shadow.color"
            value={layoutSettings?.shadow?.color}
            onChange={(val) => updateLayoutComponents({
              shadow: { ...layoutSettings?.shadow, color: val },
            })}
            {...commonInputProps}
          />
        </InputRow>
      </CollapsiblePanel>
      {/* Form Layout Section */}
      <CollapsiblePanel
        {...commonPanelProps}
        header={<HeaderContent title="Form Layout" subtitle="Configure form layout settings" />}
      >
        <InputRow
          inputs={[
            {
              type: 'radio',
              id: nanoid(),
              propertyName: 'formLayout.layout',
              label: 'Form Layout',
              buttonGroupOptions: [
                { value: 'horizontal', title: 'Horizontal' },
                { value: 'vertical', title: 'Vertical' },
              ],
              ...commonInputProps,
            } as any,
          ]}
        >
          <Radio.Group
            value={formLayoutSettings?.layout || 'horizontal'}
            onChange={(e) => updateFormLayout({ layout: e.target.value })}
            disabled={readonly}
          >
            <Radio value="horizontal">Horizontal</Radio>
            <Radio value="vertical">Vertical</Radio>
          </Radio.Group>
        </InputRow>

        <SettingInput
          id={nanoid()}
          type="numberField"
          propertyName="formLayout.span"
          label="Form Span (24-column grid)"
          min={1}
          max={24}
          value={formLayoutSettings?.span || 24}
          onChange={(val) => updateFormLayout({ span: val || 24 })}
          {...commonInputProps}
        />
      </CollapsiblePanel>

      {/* Input Component Settings Section */}
      <CollapsiblePanel
        {...commonPanelProps}
        header={<HeaderContent title="Input Component Settings" subtitle="Customize input component appearance and behavior" />}
      >
        <InputRow
          inputs={[
            {
              type: 'radio',
              id: nanoid(),
              propertyName: 'inputComponents.labelAlign',
              label: 'Label Alignment',
              buttonGroupOptions: [
                { value: 'left', title: 'Left' },
                { value: 'right', title: 'Right' },
                { value: 'top', title: 'Top' },
              ],
              ...commonInputProps,
            } as any,
          ]}
        >
          <Radio.Group
            value={inputSettings?.labelAlign || 'right'}
            onChange={(e) => updateInputComponents({ labelAlign: e.target.value as ThemeLabelAlign })}
            disabled={readonly}
          >
            <Radio value="left">Left</Radio>
            <Radio value="right">Right</Radio>
            <Radio value="top">Top</Radio>
          </Radio.Group>
        </InputRow>

        <Form.Item>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Switch
              checked={inputSettings?.labelColon ?? true}
              onChange={(checked) => updateInputComponents({ labelColon: checked })}
              disabled={readonly}
              size="small"
            />
            <span>Show label colon</span>
          </div>
        </Form.Item>

        <SettingInput
          id={nanoid()}
          type="numberField"
          propertyName="inputComponents.labelSpan"
          label="Label Span"
          tooltip={isLabelSpanDisabled ? "Label span is disabled when label alignment is 'top'" : undefined}
          min={1}
          max={24}
          value={inputSettings?.labelSpan || 6}
          onChange={(val) => updateInputComponents({ labelSpan: val || 6 })}
          readOnly={readonly || isLabelSpanDisabled}
          jsSetting={false}
        />

        <SettingInput
          id={nanoid()}
          type="numberField"
          propertyName="inputComponents.contentSpan"
          label="Content Span"
          tooltip={isLabelSpanDisabled ? "Content span is disabled when label alignment is 'top'" : undefined}
          min={1}
          max={24}
          value={inputSettings?.contentSpan || 18}
          onChange={(val) => updateInputComponents({ contentSpan: val || 18 })}
          readOnly={readonly || isLabelSpanDisabled}
          jsSetting={false}
        />

        {/* Margin & Pading Control */}
        <Form.Item label="Margin (px)">
          <Row gutter={[8, 8]}>
            <Box value={inputSettings?.stylingBox} onChange={onChange} readOnly={readonly} />
          </Row>
        </Form.Item>
      </CollapsiblePanel>


      {/* Standard Component Settings Section */}
      <CollapsiblePanel
        {...commonPanelProps}
        header={<HeaderContent title="Standard Component Settings" subtitle="Configure standard component styling" />}
      >
        {/* Margin Control */}
        <Box value={standardSettings?.stylingBox} onChange={onChange} readOnly={readonly} />
      </CollapsiblePanel>
    </div>
  );
};

export default ThemeParameters;
