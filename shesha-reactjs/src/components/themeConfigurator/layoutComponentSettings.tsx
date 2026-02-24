import React, { FC } from 'react';
import { Card, InputNumber, Typography, Row, Col } from 'antd';
import { IComponentSettingsProps, parseStylingBox, stringifyStylingBox } from './models';
import { StylingBoxConfigurator } from './stylingBoxConfigurator';

export const LayoutComponentSettings: FC<IComponentSettingsProps> = ({
  value,
  onChange,
  readonly
}) => {
  const layoutSettings = value?.layoutComponents || {};

  const handleLayoutSettingChange = (key: string, val: any) => {
    if (onChange) {
      onChange({
        ...value,
        layoutComponents: {
          ...layoutSettings,
          [key]: val,
        },
      });
    }
  };

  const handleStylingBoxChange = (stylingBoxValues: any) => {
    handleLayoutSettingChange('stylingBox', stringifyStylingBox(stylingBoxValues));
  };

  const currentStylingBox = parseStylingBox(layoutSettings.stylingBox);

  return (
    <div>
      <Card title="Grid Configuration" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Typography.Text strong>Grid Gap (Gutter Spacing)</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
              Spacing between grid columns and rows in pixels
            </Typography.Text>
            <InputNumber
              min={0}
              max={48}
              value={layoutSettings.gridGap || 16}
              onChange={(val) => handleLayoutSettingChange('gridGap', val || 16)}
              disabled={readonly}
              style={{ width: '100%' }}
              placeholder="16"
              addonAfter="px"
            />
          </Col>
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