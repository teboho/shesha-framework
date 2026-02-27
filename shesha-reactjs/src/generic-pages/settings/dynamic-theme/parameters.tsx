import { Space, Radio, InputNumber, Input, Select, Slider, Switch } from 'antd';
import React, { FC, useMemo } from 'react';
import { CollapsiblePanel, ColorPicker } from '@/components';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { humanizeString, toCamelCase } from '@/utils/string';
import { BACKGROUND_PRESET_COLORS, TEXT_PRESET_COLORS } from './presetColors';
import { useStyles } from './styles/styles';
import Box from '@/designer-components/styleBox/components/box';
import { borderStyles } from '@/designer-components/_settings/utils/border/utils';
import Icon from '@/components/icon/Icon';
import {
  createThemeUpdaters,
  createColorConfigs,
  getThemeValueWithFallback,
  BORDER_RADIUS_CORNERS,
  BORDER_SIDES,
  LABEL_ALIGN_OPTIONS,
} from './utils';
import { HeaderContent, RenderInput, RenderColor, RenderDivider } from './components';

export interface ThemeParametersProps {
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
}

const ThemeParameters: FC<ThemeParametersProps> = ({ value: theme, onChange, readonly }) => {
  const { styles } = useStyles();

  // Create theme updater functions
  const {
    updateInputComponents,
    updateLayoutComponents,
    updateStandardComponents,
    updateInlineComponents,
    updateApplication,
    updateText,
  } = useMemo(() => createThemeUpdaters(theme, onChange), [theme, onChange]);

  // Create color configurations
  const { colorConfigs, textConfigs, backgroundConfigs } = useMemo(
    () => createColorConfigs(updateApplication, updateText, onChange, theme),
    [theme, onChange],
  );

  // Extract settings for easier access
  const inputSettings = theme?.inputComponents;
  const layoutSettings = theme?.layoutComponents;
  const standardSettings = theme?.standardComponents;
  const inlineSettings = theme?.inlineComponents;

  // Common props
  const commonInputProps = { readOnly: readonly, jsSetting: false };
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
          {/* Sidebar Theme */}
          <Space direction="vertical" align="start" className={styles.space}>
            <HeaderContent title="Theme" subtitle="" />
            <Radio.Group
              onChange={(e) => onChange({ ...theme, sidebar: e.target.value })}
              value={theme?.sidebar || 'light'}
            >
              <Radio.Button value="dark">Dark</Radio.Button>
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="system">System</Radio.Button>
            </Radio.Group>
          </Space>
          <RenderDivider />

          {/* Application Colors */}
          <Space direction="vertical" align="start" size="middle" className={styles.space}>
            <HeaderContent title="Colours" subtitle="Select a circle below to choose your desired colour" />
            <Space direction="horizontal" align="center">
              {colorConfigs.map((config, index) => (
                <RenderColor
                  key={`theme_${index}`}
                  colorName={config.name.replace('Color', '')}
                  initialColor={theme?.application?.[config.name]}
                  onChange={config.onChange}
                  className={styles.themeColorSpace}
                  colorPickerClassName={styles.themeColorPicker}
                />
              ))}
            </Space>
            <RenderDivider />

            {/* Text Colors */}
            <HeaderContent title="Text Colors" subtitle="Customize text colors for your application" />
            <Space direction="horizontal" align="center">
              {textConfigs.map((config, index) => (
                <RenderColor
                  key={`text_${index}`}
                  colorName={config.name}
                  initialColor={theme?.text?.[config.name]}
                  onChange={config.onChange}
                  presetColors={TEXT_PRESET_COLORS}
                  hint={config?.hint}
                  className={styles.themeColorSpace}
                  colorPickerClassName={styles.themeColorPicker}
                />
              ))}
            </Space>
            <RenderDivider />

            {/* Background Colors */}
            <HeaderContent title="Background Colors" subtitle="Customize background colors for your application" />
            <Space direction="horizontal" align="center">
              {backgroundConfigs.map((config, index) => {
                // Handle legacy layoutBackground property for pageBackground
                const legacyKey = config.name === 'pageBackground' ? 'layoutBackground' : undefined;
                const colorValue = getThemeValueWithFallback(theme, config.name, legacyKey);

                return (
                  <RenderColor
                    key={`bg_${index}`}
                    colorName={config.name}
                    initialColor={colorValue}
                    onChange={config.onChange}
                    presetColors={BACKGROUND_PRESET_COLORS}
                    className={styles.themeColorSpace}
                    colorPickerClassName={styles.themeColorPicker}
                  />
                );
              })}
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
          {/* Margin & Padding */}
          <Space direction="vertical">
            <HeaderContent title="Margin & Padding" subtitle="Configure layout styling such as margin and padding" />
            <Box
              value={layoutSettings?.stylingBox}
              onChange={(val) => updateLayoutComponents({ stylingBox: val })}
              readOnly={readonly}
            />
          </Space>
          <RenderDivider />

          {/* Grid Gap */}
          <Space direction="vertical">
            <HeaderContent title="Grid Gap" subtitle="Configure layout component styling" />
            <Space direction="horizontal">
              <RenderInput
                value={layoutSettings?.gridGapHorizontal}
                onChange={(val) => updateLayoutComponents({ gridGapHorizontal: val })}
                label="Column Gap"
                disabled={readonly}
              />
              <RenderInput
                value={layoutSettings?.gridGapVertical}
                onChange={(val) => updateLayoutComponents({ gridGapVertical: val })}
                label="Row Gap"
                disabled={readonly}
              />
            </Space>
          </Space>
          <RenderDivider />

          {/* Background */}
          <Space direction="vertical">
            <HeaderContent title="Background" subtitle="Configure background settings" />
            <RenderColor
              colorName=""
              initialColor={layoutSettings?.background?.color || '#ffffff'}
              onChange={(color: any) =>
                updateLayoutComponents({
                  background: { ...layoutSettings?.background, color: color?.toHexString?.() ?? color },
                })
              }
              readonly={readonly}
            />
          </Space>
          <RenderDivider />

          {/* Border */}
          <Space direction="vertical">
            <HeaderContent title="Border" subtitle="Configure border settings" />
            <Space direction="horizontal" size="large" style={{ alignItems: 'flex-start' }}>
              <Radio.Group
                value={layoutSettings?.border?.borderType}
                size="small"
                onChange={(e) =>
                  updateLayoutComponents({ border: { ...layoutSettings?.border, borderType: e.target.value } })
                }
              >
                <Radio.Button value="all">
                  <Icon icon="BorderOutlined" />
                </Radio.Button>
                <Radio.Button value="custom">
                  <Icon icon="BorderOuterOutlined" />
                </Radio.Button>
              </Radio.Group>

              {/* All Border Settings */}
              {layoutSettings?.border?.borderType !== 'custom' && (
                <Space direction="horizontal">
                  <Input
                    placeholder="0"
                    size="small"
                    value={layoutSettings?.border?.border?.all?.width}
                    onChange={(e) =>
                      updateLayoutComponents({
                        border: {
                          ...layoutSettings?.border,
                          border: {
                            ...layoutSettings?.border?.border,
                            all: { ...layoutSettings?.border?.border?.all, width: e.target.value },
                          },
                        },
                      })
                    }
                    disabled={readonly}
                    style={{ width: 80 }}
                  />
                  <Select
                    placeholder="Solid"
                    size="small"
                    options={borderStyles}
                    value={layoutSettings?.border?.border?.all?.style}
                    onChange={(val) =>
                      updateLayoutComponents({
                        border: {
                          ...layoutSettings?.border,
                          border: {
                            ...layoutSettings?.border?.border,
                            all: { ...layoutSettings?.border?.border?.all, style: val },
                          },
                        },
                      })
                    }
                    disabled={readonly}
                    style={{ width: 120 }}
                  />
                  <ColorPicker
                    value={layoutSettings?.border?.border?.all?.color}
                    onChange={(val) =>
                      updateLayoutComponents({
                        border: {
                          ...layoutSettings?.border,
                          border: {
                            ...layoutSettings?.border?.border,
                            all: { ...layoutSettings?.border?.border?.all, color: val?.toString?.() },
                          },
                        },
                      })
                    }
                    readOnly={readonly}
                    size="small"
                  />
                </Space>
              )}

              {/* Custom Border Settings */}
              {layoutSettings?.border?.borderType === 'custom' && (
                <Space direction="vertical">
                  {BORDER_SIDES.map((side) => (
                    <div key={side} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 50 }}>{humanizeString(side)}</span>
                      <Input
                        placeholder="0"
                        size="small"
                        value={layoutSettings?.border?.border?.[side]?.width}
                        onChange={(e) =>
                          updateLayoutComponents({
                            border: {
                              ...layoutSettings?.border,
                              border: {
                                ...layoutSettings?.border?.border,
                                [side]: { ...layoutSettings?.border?.border?.[side], width: e.target.value },
                              },
                            },
                          })
                        }
                        disabled={readonly}
                        style={{ width: 80 }}
                      />
                      <Select
                        placeholder="Solid"
                        size="small"
                        options={borderStyles}
                        value={layoutSettings?.border?.border?.[side]?.style}
                        onChange={(val) =>
                          updateLayoutComponents({
                            border: {
                              ...layoutSettings?.border,
                              border: {
                                ...layoutSettings?.border?.border,
                                [side]: { ...layoutSettings?.border?.border?.[side], style: val },
                              },
                            },
                          })
                        }
                        disabled={readonly}
                        style={{ width: 120 }}
                      />
                      <ColorPicker
                        value={layoutSettings?.border?.border?.[side]?.color}
                        onChange={(val) =>
                          updateLayoutComponents({
                            border: {
                              ...layoutSettings?.border,
                              border: {
                                ...layoutSettings?.border?.border,
                                [side]: { ...layoutSettings?.border?.border?.[side], color: val?.toString?.() },
                              },
                            },
                          })
                        }
                        readOnly={readonly}
                        size="small"
                      />
                    </div>
                  ))}
                </Space>
              )}
            </Space>
          </Space>
          <RenderDivider />

          {/* Border Radius */}
          <Space direction="vertical">
            <HeaderContent title="Border Radius" subtitle="Configure border radius settings" />
            <Space direction="horizontal" size="large">
              <Radio.Group
                value={layoutSettings?.border?.radiusType}
                size="small"
                onChange={(e) =>
                  updateLayoutComponents({ border: { ...layoutSettings?.border, radiusType: e.target.value } })
                }
              >
                <Radio.Button value="all">
                  <Icon icon="ExpandOutlined" />
                </Radio.Button>
                <Radio.Button value="custom">
                  <Icon icon="RadiusUprightOutlined" />
                </Radio.Button>
              </Radio.Group>

              {layoutSettings?.border?.radiusType !== 'custom' && (
                <InputNumber
                  placeholder="0"
                  size="small"
                  value={layoutSettings?.border?.radius?.all}
                  onChange={(val) =>
                    updateLayoutComponents({
                      border: { ...layoutSettings?.border, radius: { ...layoutSettings?.border?.radius, all: val } },
                    })
                  }
                  disabled={readonly}
                  style={{ width: 80 }}
                />
              )}

              {layoutSettings?.border?.radiusType === 'custom' && (
                <Space direction="horizontal">
                  {BORDER_RADIUS_CORNERS.map(({ key, label, icon }) => (
                    <RenderInput
                      key={key}
                      value={layoutSettings?.border?.radius?.[key]}
                      icon={icon}
                      label={label}
                      onChange={(val) =>
                        updateLayoutComponents({
                          border: {
                            ...layoutSettings?.border,
                            radius: { ...layoutSettings?.border?.radius, [toCamelCase(label)]: val },
                          },
                        })
                      }
                      disabled={readonly}
                    />
                  ))}
                </Space>
              )}
            </Space>
          </Space>
          <RenderDivider />

          {/* Shadow */}
          <Space direction="vertical">
            <HeaderContent title="Shadow" subtitle="Configure shadow settings" />
            <Space direction="horizontal">
              <RenderInput
                value={layoutSettings?.shadow?.offsetX}
                onChange={(val) => updateLayoutComponents({ shadow: { ...layoutSettings?.shadow, offsetX: val } })}
                label="Position X"
                icon="x"
                disabled={readonly}
              />
              <RenderInput
                value={layoutSettings?.shadow?.offsetY}
                onChange={(val) => updateLayoutComponents({ shadow: { ...layoutSettings?.shadow, offsetY: val } })}
                label="Position Y"
                icon="y"
                disabled={readonly}
              />
              <RenderInput
                value={layoutSettings?.shadow?.blurRadius}
                onChange={(val) => updateLayoutComponents({ shadow: { ...layoutSettings?.shadow, blurRadius: val } })}
                label="Blur"
                icon="blurIcon"
                disabled={readonly}
              />
              <RenderInput
                value={layoutSettings?.shadow?.spreadRadius}
                onChange={(val) =>
                  updateLayoutComponents({ shadow: { ...layoutSettings?.shadow, spreadRadius: val } })
                }
                label="Spread"
                icon="spreadIcon"
                disabled={readonly}
              />
              <RenderColor
                colorName="color"
                initialColor={layoutSettings?.shadow?.color || ''}
                onChange={(color: any) =>
                  updateLayoutComponents({ shadow: { ...layoutSettings?.shadow, color: color?.toHexString?.() ?? color } })
                }
                readonly={readonly}
              />
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
          {/* Label Align */}
          <Space direction="vertical">
            <HeaderContent
              title="Label Align"
              subtitle="Select below to choose your desired input label alignment."
            />
            <Radio.Group
              value={inputSettings?.labelAlign || 'right'}
              options={LABEL_ALIGN_OPTIONS}
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
          <RenderDivider />

          {/* Label Span */}
          {inputSettings?.labelAlign !== 'top' && (
            <Space direction="vertical">
              <HeaderContent
                title="Label Span Settings"
                subtitle="The layout uses a 24-column grid system by default. Adjusting the slider to the right will increase the width of labels."
              />
              <Slider
                min={0}
                max={24}
                value={inputSettings?.labelSpan}
                onChange={(val) => updateInputComponents({ labelSpan: val, contentSpan: 24 - val || 0 })}
              />
            </Space>
          )}

          {/* Label Colon */}
          <Space direction="vertical">
            <HeaderContent
              title="Label Colon"
              subtitle="When label colon is enabled it will suffix the label with a colon."
            />
            <Switch
              value={inputSettings?.labelColon}
              onChange={(val) => updateInputComponents({ labelColon: val })}
              {...commonInputProps}
            />
          </Space>
          <RenderDivider />

          {/* Margin & Padding */}
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
        <Box
          value={standardSettings?.stylingBox}
          onChange={(val) => updateStandardComponents({ stylingBox: val })}
          readOnly={readonly}
        />
      </CollapsiblePanel>

      {/* Inline Component Settings Section */}
      <CollapsiblePanel
        {...commonPanelProps}
        header={
          <HeaderContent
            title="Inline Component Settings"
            subtitle="Customize inline component appearance and behavior"
          />
        }
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
