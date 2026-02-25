import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Row, Space, Tooltip, Radio, Switch, InputNumber } from 'antd';
import React, { FC, useCallback, useMemo } from 'react';
import { Show, CollapsiblePanel, ColorPicker, SectionSeparator, ComponentsContainer } from '@/components';
import { IConfigurableTheme, ThemeLabelAlign } from '@/providers/theme/contexts';
import { humanizeString } from '@/utils/string';
import { BACKGROUND_PRESET_COLORS, PRESET_COLORS, SHESHA_COLORS, TEXT_PRESET_COLORS } from './presetColors';
import { InputRow } from '@/designer-components/settingsInputRow';
import { SettingInput } from '@/designer-components/settingsInput/settingsInput';
import { nanoid } from '@/utils/uuid';
import { useStyles } from './styles/styles';
import Box from '@/designer-components/styleBox/components/box';
import { borderStyles, getBorderInputs, getCornerInputs } from '@/designer-components/_settings/utils/border/utils';
import { useTheme } from '@/providers';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { RadioWrapper } from '@/designer-components/inputComponent/wrappers/radio';

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
  const fbf = useFormBuilderFactory();

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
    [theme, readonly, styles],
  );

  const renderDivider = () => (<SectionSeparator lineColor="gray" lineThickness={2} lineWidth="100%" />);

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

  const backgroundConfigs: IThemeConfig[] = useMemo(() => [
    { name: 'pageBackground', onChange: (hex: string) => updateTheme('pageBackground', hex as any) },
    { name: 'componentBackground', onChange: (hex: string) => updateTheme('componentBackground', hex as any) },
  ], []);

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
        <Space direction='vertical' size='middle'>
          <HeaderContent title="Margin & Padding" subtitle="Configure layout styling such as margin and padding" />
          <Box 
          value={layoutSettings?.stylingBox} 
          onChange={(val) => updateLayoutComponents({ stylingBox: val })} 
          readOnly={readonly}
          />
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
        {/* Background Color */}
        {renderColor('color', '', '#ffff', (val) => updateLayoutComponents({
            background: { ...layoutSettings?.background, color: val },
          }))}

        {/* Border Section */}
        <HeaderContent title="Border" subtitle="Configure border settings" />
        <RadioWrapper 
          propertyName='' 
          type='radio' 
          label='Type' 
          onChange={(val) => updateLayoutComponents({
            border: { ...layoutSettings?.border, borderType: val.target.value },
          })}
          buttonGroupOptions={[
            { value: 'all', title: 'All'},
            { value: 'custom', title: 'Custom'}
          ]}
          />

        {/* Border Settings */}
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
                value: layoutSettings?.border?.border?.all?.width,
                onChange: (val) => updateLayoutComponents({
                  border: {
                    ...layoutSettings?.border,
                    border: {
                      ...layoutSettings?.border?.border,
                      all: { ...layoutSettings?.border?.border?.all, width: val },
                    },
                  },
                }),
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
                value: layoutSettings?.border?.border?.all?.style,
                onChange: (val) => updateLayoutComponents({
                  border: {
                    ...layoutSettings?.border,
                    border: {
                      ...layoutSettings?.border?.border,
                      all: { ...layoutSettings?.border?.border?.all, style: val },
                    },
                  },
                }),
                ...commonInputProps,
              } as any,
              {
                type: 'colorPicker',
                id: nanoid(),
                propertyName: 'layoutComponents.border.border.all.color',
                label: 'Color',
                hideLabel: true,
                value: layoutSettings?.border?.border?.all?.color,
                onChange: (val) => updateLayoutComponents({
                  border: {
                    ...layoutSettings?.border,
                    border: {
                      ...layoutSettings?.border?.border,
                      all: { ...layoutSettings?.border?.border?.all, color: val },
                    },
                  },
                }),
                ...commonInputProps,
              } as any,
            ]}
          />
        )}
        {layoutSettings?.border?.borderType === 'custom' && (
            ['top', 'bottom', 'left', 'right'].map((side) => {
              return (
                <InputRow
            inputs={[
              {
                type: 'textField',
                id: nanoid(),
                propertyName: '',
                label: 'Width',
                placeholder: '0',
                hideLabel: true,
                value: layoutSettings?.border?.border?.all?.width,
                onChange: (val) => updateLayoutComponents({
                  border: {
                    ...layoutSettings?.border,
                    border: {
                      ...layoutSettings?.border?.border,
                      [side]: { ...layoutSettings?.border?.border?.[side], width: val },
                    },
                  },
                }),
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
                value: layoutSettings?.border?.border?.all?.style,
                onChange: (val) => updateLayoutComponents({
                  border: {
                    ...layoutSettings?.border,
                    border: {
                      ...layoutSettings?.border?.border,
                      all: { ...layoutSettings?.border?.border?.all, style: val },
                    },
                  },
                }),
                ...commonInputProps,
              } as any,
              {
                type: 'colorPicker',
                id: nanoid(),
                propertyName: 'layoutComponents.border.border.all.color',
                label: 'Color',
                hideLabel: true,
                value: layoutSettings?.border?.border?.all?.color,
                onChange: (val) => updateLayoutComponents({
                  border: {
                    ...layoutSettings?.border,
                    border: {
                      ...layoutSettings?.border?.border,
                      all: { ...layoutSettings?.border?.border?.all, color: val },
                    },
                  },
                }),
                ...commonInputProps,
              } as any,
            ]}
          />
              )
            })
        )}

        {/* Radius Section */}
        <HeaderContent title="Border Radius" subtitle="Configure border radius settings" />
        <RadioWrapper 
          propertyName='' 
          type='radio' 
          label='Type' 
          onChange={(val) => updateLayoutComponents({
            border: { ...layoutSettings?.border, radiusType: val.target.value },
          })}
          buttonGroupOptions={[
            { value: 'all', title: 'All'},
            { value: 'custom', title: 'Custom'}
          ]}
          />

        {layoutSettings?.border?.radiusType !== 'custom' && (
          <InputRow
            inline
            inputs={[
              {
                type: 'numberField',
                id: nanoid(),
                propertyName: 'layoutComponents.border.radius.all',
                label: 'Radius',
                placeholder: 0,
                hideLabel: true,
                value: layoutSettings?.border?.radius?.all,
                onChange: (val) => updateLayoutComponents({
                  border: {
                    ...layoutSettings?.border,
                    radius: { ...layoutSettings?.border?.radius, all: val },
                  },
                }),
                ...commonInputProps,
              } as any,
            ]}
          />
        )}
                {layoutSettings?.border?.radiusType === 'custom' && (
            ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'].map((side) => {
              return (
                <InputRow
            inputs={[
              {
                type: 'textField',
                id: nanoid(),
                propertyName: '',
                label: 'Width',
                placeholder: '0',
                hideLabel: true,
                value: layoutSettings?.border?.radius?.[side],
                onChange: (val) => updateLayoutComponents({
                  border: {
                    ...layoutSettings?.border,
                    border: {
                      ...layoutSettings?.border?.border,
                      [side]: { ...layoutSettings?.border?.radius?.[side], [side]: val },
                    },
                  },
                }),
                ...commonInputProps,
              } as any
            ]}
          />
              )
            })
        )}

        {/* Shadow Section */}
        <HeaderContent title="Shadow" subtitle="Configure shadow settings" />
        <InputRow
          inputs={[
            {
              type: 'numberField',
              id: nanoid(),
              propertyName: 'layoutComponents.shadow.offsetX',
              label: 'position',
              tooltip: 'Offset X',
              icon: 'dragOutlined',
              value: layoutSettings?.shadow?.offsetX,
              onChange: (val) => updateLayoutComponents({
                shadow: { ...layoutSettings?.shadow, offsetX: val },
              }),
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
              value: layoutSettings?.shadow?.offsetY,
              onChange: (val) => updateLayoutComponents({
                shadow: { ...layoutSettings?.shadow, offsetY: val },
              }),
              ...commonInputProps,
            } as any,
            {
              type: 'numberField',
              id: nanoid(),
              propertyName: 'layoutComponents.shadow.blurRadius',
              label: 'Blur',
              tooltip: 'Blur radius',
              icon: 'eyeInvisibleOutlined',
              value: layoutSettings?.shadow?.blurRadius,
              onChange: (val) => updateLayoutComponents({
                shadow: { ...layoutSettings?.shadow, blurRadius: val },
              }),
              ...commonInputProps,
            } as any,
            {
              type: 'numberField',
              id: nanoid(),
              propertyName: 'layoutComponents.shadow.spreadRadius',
              label: 'Spread',
              tooltip: 'Spread radius',
              icon: 'expandOutlined',
              value: layoutSettings?.shadow?.spreadRadius,
              onChange: (val) => updateLayoutComponents({
                shadow: { ...layoutSettings?.shadow, spreadRadius: val },
              }),
              ...commonInputProps,
            } as any,
            {
              type: 'colorPicker',
              id: nanoid(),
              propertyName: 'layoutComponents.shadow.color',
              label: 'Color',
              value: layoutSettings?.shadow?.color,
              onChange: (val) => updateLayoutComponents({
                shadow: { ...layoutSettings?.shadow, color: val },
              }),
              ...commonInputProps,
            } as any,
          ]}
        />
        </Space>
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
              propertyName: 'inputComponents.labelAlign',
              id: nanoid(),
              label: 'Label Alignment',
              buttonGroupOptions: [
                { value: 'left', title: 'Left' },
                { value: 'right', title: 'Right' },
                { value: 'top', title: 'Top' }
              ],
              value: inputSettings?.labelAlign || 'right',
              onChange: (val) => updateInputComponents({ labelAlign: val }),
              ...commonInputProps,
            } as any,
          ]}
        />

        <SettingInput
          id={nanoid()}
          type="numberField"
          propertyName="inputComponents.labelSpan"
          label="Label Span (1-24)"
          tooltip="The span for labels in a 24-column grid"
          value={inputSettings?.labelSpan}
          onChange={(val) => updateInputComponents({ 
            labelSpan: val,
            contentSpan: 24 - (val || 0),
          })}
          {...commonInputProps}
        />

        <SettingInput
          id={nanoid()}
          label="Label Height"
          propertyName="inputComponents.labelHeight"
          type="textField"
          value={inputSettings?.labelHeight}
          onChange={(val) => updateInputComponents({ labelHeight: val })}
          {...commonInputProps}
        />

        <SettingInput
          id={nanoid()}
          type="switch"
          propertyName="inputComponents.labelColon"
          label="Show Label Colon"
          value={inputSettings?.labelColon}
          onChange={(val) => updateInputComponents({ labelColon: val })}
          {...commonInputProps}
        />

        {/* Margin Control */}
        <Box
          value={inputSettings?.stylingBox}
          onChange={(val) => updateInputComponents({ stylingBox: val })}
          readOnly={readonly} 
        />
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
