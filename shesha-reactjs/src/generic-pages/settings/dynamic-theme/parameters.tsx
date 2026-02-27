import { QuestionCircleOutlined } from '@ant-design/icons';
import { Space, Tooltip, Radio, InputNumber, Input, Select, Slider, Switch } from 'antd';
import React, { FC, useCallback, useMemo } from 'react';
import { Show, CollapsiblePanel, ColorPicker, SectionSeparator } from '@/components';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { humanizeString, toCamelCase } from '@/utils/string';
import { BACKGROUND_PRESET_COLORS, PRESET_COLORS, SHESHA_COLORS, TEXT_PRESET_COLORS } from './presetColors';
import { nanoid } from '@/utils/uuid';
import { useStyles } from './styles/styles';
import Box from '@/designer-components/styleBox/components/box';
import { borderStyles } from '@/designer-components/_settings/utils/border/utils';
import { useTheme } from '@/providers';
import Icon from '@/components/icon/Icon';

interface IThemeConfig {
  name: string;
  onChange: (color: any) => void;
  hint?: string;
}

export interface ThemeParametersProps {
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
}

interface IHeaderProps {
  title?: string;
  subtitle?: string;
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

  const updateInlineComponents = (update: Partial<IConfigurableTheme['inlineComponents']>): void => {
    updateTheme('inlineComponents', update);
  };

  const renderInput = useCallback(({ value, onChange, icon, label, hint, type = 'number' }: { value: number | string; onChange: (value: number | string) => void; icon?: string; label: string; hint?: string; type?: 'number' | 'string' }) => (
    <Space direction="horizontal">
      <span>{humanizeString(label)} </span>
      <Show when={Boolean(hint)}>
        <Tooltip title={hint}>
          <span className="sha-input-tooltip" style={{ cursor: 'pointer' }}>
            <QuestionCircleOutlined />
          </span>
        </Tooltip>
      </Show>
      {type == 'number' ? (
        <InputNumber
          id={nanoid()}
          prefix={<Icon icon={icon} style={{ color: '#d9d9d9', height: 16 }} />}
          value={value}
          size="small"
          onChange={onChange}
        />
      ) : (
        <Input
          id={nanoid()}
          prefix={<Icon icon={icon} />}
          value={value}
          size="small"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Space>

  ), [theme]);
  const renderColor = useCallback(
    (
      key: string,
      colorName: string,
      initialColor: string,
      onChange: (color: any) => void,
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
    [theme, readonly, styles],
  );

  const renderDivider = () => (<SectionSeparator lineColor="#d9d9d9" lineThickness={1} lineWidth="100%" />);

  const colorConfigs: IThemeConfig[] = useMemo(() => [
    { name: 'primaryColor', onChange: (color: any) => updateTheme('application', { primaryColor: color.toHexString() }) },
    { name: 'errorColor', onChange: (color: any) => updateTheme('application', { errorColor: color.toHexString() }) },
    { name: 'warningColor', onChange: (color: any) => updateTheme('application', { warningColor: color.toHexString() }) },
    { name: 'successColor', onChange: (color: any) => updateTheme('application', { successColor: color.toHexString() }) },
    { name: 'infoColor', onChange: (color: any) => updateTheme('application', { infoColor: color.toHexString() }) },
  ], [theme]);

  const textConfigs: IThemeConfig[] = useMemo(() => [
    { name: 'default', onChange: (color: any) => updateTheme('text', { default: color.toHexString() }) },
    { name: 'secondary', onChange: (color: any) => updateTheme('text', { secondary: color.toHexString() }) },
  ], [theme]);

  const backgroundConfigs: IThemeConfig[] = useMemo(() => [
    { name: 'pageBackground', onChange: (color: any) => changeThemeInternal({ ...theme, pageBackground: color.toString() }) },
    { name: 'componentBackground', onChange: (color: any) => changeThemeInternal({ ...theme, componentBackground: color.toString() }) },
  ], [theme]);

  const inputSettings = theme?.inputComponents;
  const layoutSettings = theme?.layoutComponents;
  const standardSettings = theme?.standardComponents;
  const inlineSettings = theme?.inlineComponents;

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
              value={theme?.sidebar || 'light'}
            >
              <Radio.Button value="dark">Dark</Radio.Button>
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="system">System</Radio.Button>
            </Radio.Group>
          </Space>
          {renderDivider()}
          <Space direction="vertical" align="start" size="middle" className={styles.space}>
            <HeaderContent title="Colours" subtitle="Select a circle below to choose your desired colour" />
            <Space direction="horizontal" align="center">
              {colorConfigs.map((config, index) =>
                renderColor(`theme_${index}`, config.name.replace('Color', ''), theme?.application?.[config.name], (hex) => config.onChange(hex)),
              )}
            </Space>
            {renderDivider()}
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
            {renderDivider()}
            <HeaderContent title="Background Colors" subtitle="Customize background colors for your application" />
            <Space direction="horizontal" align="center">
              {backgroundConfigs.map((config, index) => renderColor(
                `bg_${index}`,
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
        <Space size="middle" direction="vertical" className={styles.space}>
          <Space direction="vertical" >
            <HeaderContent title="Margin & Padding" subtitle="Configure layout styling such as margin and padding" />
            <Box
              value={layoutSettings?.stylingBox}
              onChange={(val) => updateLayoutComponents({ stylingBox: val })}
              readOnly={readonly}
            />
          </Space>
          {renderDivider()}
          <Space direction="vertical">
            <HeaderContent title="Grid Gap" subtitle="Configure layout component styling" />
            <Space direction="horizontal">
              {renderInput({ value: layoutSettings?.gridGapHorizontal, onChange: (val) => updateLayoutComponents({ gridGapHorizontal: val }), label: 'Column Gap' })}
              {renderInput({ value: layoutSettings?.gridGapVertical, onChange: (val) => updateLayoutComponents({ gridGapVertical: val }), label: 'Row Gap' })}
            </Space>
          </Space>
          {renderDivider()}

          {/* Background Section */}
          <Space direction="vertical">
            <HeaderContent title="Background" subtitle="Configure background settings" />
            {/* Background Color */}
            {renderColor('color', '', '#ffff', (color: any) => updateLayoutComponents({
              background: { ...layoutSettings?.background, color: color?.toHexString?.() ?? color },
            }))}
          </Space>

          {renderDivider()}

          {/* Border Section */}
          <Space direction="vertical">
            <HeaderContent title="Border" subtitle="Configure border settings" />
            <Space direction="horizontal" size='large' style={{ alignItems: 'flex-start' }}>
              <Radio.Group
                value={layoutSettings?.border?.borderType}
                size="small"
                onChange={(e) => updateLayoutComponents({
                  border: { ...layoutSettings?.border, borderType: e.target.value },
                })}
              >
                <Radio.Button value="all"><Icon icon="BorderOutlined" /></Radio.Button>
                <Radio.Button value="custom"><Icon icon="BorderOuterOutlined" /></Radio.Button>
              </Radio.Group>

              {/* Border Settings */}
              {layoutSettings?.border?.borderType !== 'custom' && (
                <Space direction="horizontal">
                  <Input
                    placeholder="0"
                    size="small"
                    value={layoutSettings?.border?.border?.all?.width}
                    onChange={(e) => updateLayoutComponents({
                      border: {
                        ...layoutSettings?.border,
                        border: {
                          ...layoutSettings?.border?.border,
                          all: { ...layoutSettings?.border?.border?.all, width: e.target.value },
                        },
                      },
                    })}
                    disabled={readonly}
                    style={{ width: 80 }}
                  />
                  <Select
                    placeholder="Solid"
                    size="small"
                    options={borderStyles}
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
                    disabled={readonly}
                    style={{ width: 120 }}
                  />
                  <ColorPicker
                    value={layoutSettings?.border?.border?.all?.color}
                    onChange={(val) => updateLayoutComponents({
                      border: {
                        ...layoutSettings?.border,
                        border: {
                          ...layoutSettings?.border?.border,
                          all: { ...layoutSettings?.border?.border?.all, color: val?.toString?.() },
                        },
                      },
                    })}
                    readOnly={readonly}
                    size="small"
                  />
                </Space>
              )}
              {layoutSettings?.border?.borderType === 'custom' && (
                <Space direction='vertical'>
                  {['top', 'bottom', 'left', 'right'].map((side) => (
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 50 }}>{humanizeString(side)}</span>
                      <Input
                        placeholder="0"
                        size="small"
                        value={layoutSettings?.border?.border?.[side]?.width}
                        onChange={(e) => updateLayoutComponents({
                          border: {
                            ...layoutSettings?.border,
                            border: {
                              ...layoutSettings?.border?.border,
                              [side]: { ...layoutSettings?.border?.border?.[side], width: e.target.value },
                            },
                          },
                        })}
                        disabled={readonly}
                        style={{ width: 80 }}
                      />
                      <Select
                        placeholder="Solid"
                        size="small"
                        options={borderStyles}
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
                        disabled={readonly}
                        style={{ width: 120 }}
                      />
                      <ColorPicker
                        value={layoutSettings?.border?.border?.[side]?.color}
                        onChange={(val) => updateLayoutComponents({
                          border: {
                            ...layoutSettings?.border,
                            border: {
                              ...layoutSettings?.border?.border,
                              [side]: { ...layoutSettings?.border?.border?.[side], color: val?.toString?.() },
                            },
                          },
                        })}
                        readOnly={readonly}
                        size="small"
                      />
                    </div>
                  ))}
                </Space>
              )}
            </Space>
          </Space>
          {renderDivider()}

          {/* Radius Section */}
          <Space direction="vertical">
            <HeaderContent title="Border Radius" subtitle="Configure border radius settings" />
            <Space direction="horizontal" size='large'>
              <Radio.Group
                value={layoutSettings?.border?.radiusType}
                size="small"
                onChange={(e) => updateLayoutComponents({
                  border: { ...layoutSettings?.border, radiusType: e.target.value },
                })}
              >
                <Radio.Button value="all"><Icon icon="ExpandOutlined" /></Radio.Button>
                <Radio.Button value="custom"><Icon icon="RadiusUprightOutlined" /></Radio.Button>
              </Radio.Group>

              {layoutSettings?.border?.radiusType !== 'custom' && (
                <InputNumber
                  placeholder="0"
                  size="small"
                  value={layoutSettings?.border?.radius?.all}
                  onChange={(val) => updateLayoutComponents({
                    border: {
                      ...layoutSettings?.border,
                      radius: { ...layoutSettings?.border?.radius, all: val },
                    },
                  })}
                  disabled={readonly}
                  style={{ width: 80 }}
                />
              )}
              {layoutSettings?.border?.radiusType === 'custom' && (
                <Space direction="horizontal">
                  {[{ value: layoutSettings?.border?.radius?.topLeft, label: 'Top Left', icon: 'RadiusUpleftOutlined' },
                  { value: layoutSettings?.border?.radius?.bottomLeft, label: 'Bottom Left', icon: 'RadiusBottomleftOutlined' },
                  { value: layoutSettings?.border?.radius?.topRight, label: 'Top Right', icon: 'RadiusUprightOutlined' },
                  { value: layoutSettings?.border?.radius?.bottomRight, label: 'Bottom Right', icon: 'RadiusBottomrightOutlined' }]
                    .map(({ value, icon, label }) => {
                      return (
                        <>
                          {renderInput({
                            value: value, icon: icon, label: '', onChange: (val) => updateLayoutComponents({
                              border: {
                                ...layoutSettings?.border,
                                radius: {
                                  ...layoutSettings?.border?.radius,
                                  [value]: { ...layoutSettings?.border?.radius?.[toCamelCase(label)], [toCamelCase(label)]: val },
                                },
                              },
                            }),
                          })}
                        </>
                      );
                    })}
                </Space>
              )}
            </Space>
          </Space>
          {renderDivider()}

          {/* Shadow Section */}
          <Space direction="vertical">
            <HeaderContent title="Shadow" subtitle="Configure shadow settings" />
            <Space direction="horizontal">
              {renderInput({
                value: layoutSettings?.shadow?.offsetX,
                onChange: (val) => updateLayoutComponents({
                  shadow: { ...layoutSettings?.shadow, offsetX: val },
                }),
                label: 'Position',
                icon: 'x',
              })}
              {renderInput({
                value: layoutSettings?.shadow?.offsetY,
                onChange: (val) => updateLayoutComponents({
                  shadow: { ...layoutSettings?.shadow, offsetY: val },
                }),
                label: '',
                icon: 'y',
              })}
              {renderInput({
                icon: 'blurIcon',
                value: layoutSettings?.shadow?.blurRadius,
                onChange: (val) => updateLayoutComponents({
                  shadow: { ...layoutSettings?.shadow, blurRadius: val },
                }),
                label: 'Blur',
                hint: '',
              })}
              {renderInput({
                icon: 'spreadIcon',
                value: layoutSettings?.shadow?.spreadRadius,
                onChange: (val) => updateLayoutComponents({
                  shadow: { ...layoutSettings?.shadow, spreadRadius: val },
                }),
                label: '',
                hint: '',
              })}
              {renderColor('', 'color', '', (color: any) => updateLayoutComponents({
                shadow: { ...layoutSettings?.shadow, color: color?.toHexString?.() ?? color },
              }))}
            </Space>
          </Space>
        </Space>
      </CollapsiblePanel>

      {/* Form Layout Section */}
      <CollapsiblePanel
        {...commonPanelProps}
        header={<HeaderContent title="Form Layout" subtitle="Configure form layout settings" />}
      >
        <Space direction="vertical" size="large">
          <Space direction="vertical">
            <HeaderContent title="Label Align" subtitle="Select below to choose your desired input label alignment." />
            <Radio.Group
              value={inputSettings?.labelAlign || 'right'}
              options={[
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
                { label: 'Top', value: 'top' },
              ]}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'top') {
                  updateInputComponents({ labelAlign: value, labelSpan: 24, contentSpan: 24 });
                } else {
                  updateInputComponents({ labelAlign: value });
                }
              }}
              defaultValue="left"
            />
          </Space>
          {renderDivider()}

          {inputSettings?.labelAlign !== 'top' && (
            <Space direction="vertical">
              <HeaderContent title="Label Span Settings" subtitle="The layout uses a 24-column grid system by default. Adjusting the slider to the right will increase the width of labels. " />
              <Slider
                id={nanoid()}
                min={0}
                max={24}
                value={inputSettings?.labelSpan}
                onChange={(val) => updateInputComponents({
                  labelSpan: val,
                  contentSpan: (24 - val) || 0,
                })}
              />
            </Space>
          )}
          <Space direction="vertical">
            <HeaderContent title="Label Colon" subtitle="When label colon is enabled it will suffix the label with a colon." />
            <Switch
              id={nanoid()}
              value={inputSettings?.labelColon}
              onChange={(val) => updateInputComponents({ labelColon: val })}
              {...commonInputProps}
            />
          </Space>
          {renderDivider()}

          {/* Margin Control */}
          <Box
            value={inputSettings?.stylingBox}
            onChange={(val) => updateInputComponents({ stylingBox: val })}
            readOnly={readonly}
          />
        </Space>

      </CollapsiblePanel>

      {/* Standard Component Settings Section */}
      <CollapsiblePanel
        {...commonPanelProps}
        header={<HeaderContent title="Standard Component Settings" subtitle="Configure standard component styling" />}
      >
        {/* Margin Control */}
        <Box
          value={standardSettings?.stylingBox}
          onChange={(val) => updateStandardComponents({ stylingBox: val })}
          readOnly={readonly}
        />
      </CollapsiblePanel>

      {/* Inline Component Settings Section */}
      <CollapsiblePanel
        {...commonPanelProps}
        header={<HeaderContent title="Inline Component Settings" subtitle="Customize inline component appearance and behavior" />}
      >
        <Box
          value={inlineSettings?.stylingBox}
          onChange={(val) => updateInlineComponents({ stylingBox: val })}
          readOnly={readonly}
        />
      </CollapsiblePanel>
    </div>
  );
};

export default ThemeParameters;
