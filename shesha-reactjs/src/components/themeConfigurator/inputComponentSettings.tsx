import React, { FC } from 'react';
import { Card, Radio, Switch, Slider, Row, Col, Typography } from 'antd';
import { IComponentSettingsProps, parseStylingBox, stringifyStylingBox } from './models';
import { StylingBoxConfigurator } from './stylingBoxConfigurator';
import { ThemeLabelAlign } from '@/providers/theme/contexts';

export const InputComponentSettings: FC<IComponentSettingsProps> = ({
  value,
  onChange,
  readonly
}) => {
  const inputSettings = value?.inputComponents || {};

  const handleInputSettingChange = (key: string, val: any) => {
    if (onChange) {
      onChange({
        ...value,
        inputComponents: {
          ...inputSettings,
          [key]: val,
        },
      });
    }
  };

  const handleStylingBoxChange = (stylingBoxValues: any) => {
    handleInputSettingChange('stylingBox', stringifyStylingBox(stylingBoxValues));
  };

  const currentStylingBox = parseStylingBox(inputSettings.stylingBox);
  const isLabelTopAligned = inputSettings.labelAlign === 'top';

  return (
    <div>
      <Card title="Label Configuration" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Typography.Text strong>Label Alignment</Typography.Text>
            <Radio.Group
              value={inputSettings.labelAlign || 'right'}
              onChange={(e) => handleInputSettingChange('labelAlign', e.target.value as ThemeLabelAlign)}
              disabled={readonly}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Radio.Button value="left">Left</Radio.Button>
              <Radio.Button value="right">Right</Radio.Button>
              <Radio.Button value="top">Top</Radio.Button>
            </Radio.Group>
          </Col>
          
          <Col span={24}>
            <Row align="middle" justify="space-between">
              <Typography.Text strong>Label Colon</Typography.Text>
              <Switch
                checked={inputSettings.labelColon !== false}
                onChange={(checked) => handleInputSettingChange('labelColon', checked)}
                disabled={readonly}
              />
            </Row>
          </Col>
          
          {!isLabelTopAligned && (
            <>
              <Col span={24}>
                <Typography.Text strong>Label Span</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                  Label width (out of 24 columns): {inputSettings.labelSpan || 6}
                </Typography.Text>
                <Slider
                  min={4}
                  max={20}
                  value={inputSettings.labelSpan || 6}
                  onChange={(val) => {
                    handleInputSettingChange('labelSpan', val);
                    handleInputSettingChange('contentSpan', 24 - val);
                  }}
                  disabled={readonly}
                  style={{ marginTop: 8 }}
                />
              </Col>
              
              <Col span={24}>
                <Typography.Text strong>Content Span</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                  Content width (out of 24 columns): {inputSettings.contentSpan || 18}
                </Typography.Text>
                <Slider
                  min={4}
                  max={20}
                  value={inputSettings.contentSpan || 18}
                  onChange={(val) => {
                    handleInputSettingChange('contentSpan', val);
                    handleInputSettingChange('labelSpan', 24 - val);
                  }}
                  disabled={readonly}
                  style={{ marginTop: 8 }}
                />
              </Col>
            </>
          )}
          
          {isLabelTopAligned && (
            <Col span={24}>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                Label and content span settings are disabled for top-aligned labels as they use full width.
              </Typography.Text>
            </Col>
          )}
        </Row>
      </Card>

      <StylingBoxConfigurator
        title="Default Spacing"
        value={currentStylingBox}
        onChange={handleStylingBoxChange}
        readonly={readonly}
      />
    </div>
  );
};