import React, { FC } from 'react';
import { Card, Radio, Slider, Row, Col, Typography } from 'antd';
import { IComponentSettingsProps } from './models';

export const FormLayoutSettings: FC<IComponentSettingsProps> = ({
  value,
  onChange,
  readonly
}) => {
  const formLayoutSettings = value?.formLayout || {};

  const handleFormLayoutChange = (key: string, val: any) => {
    if (onChange) {
      onChange({
        ...value,
        formLayout: {
          ...formLayoutSettings,
          [key]: val,
        },
      });
    }
  };

  return (
    <div>
      <Card title="Form Layout Configuration" size="small">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Typography.Text strong>Form Layout</Typography.Text>
            <Radio.Group
              value={formLayoutSettings.layout || 'horizontal'}
              onChange={(e) => handleFormLayoutChange('layout', e.target.value)}
              disabled={readonly}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Radio.Button value="horizontal">Horizontal</Radio.Button>
              <Radio.Button value="vertical">Vertical</Radio.Button>
            </Radio.Group>
          </Col>
          
          <Col span={24}>
            <Typography.Text strong>Form Span</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Form width using 24-column grid system: {formLayoutSettings.span || 24}
            </Typography.Text>
            <Slider
              min={1}
              max={24}
              value={formLayoutSettings.span || 24}
              onChange={(val) => handleFormLayoutChange('span', val)}
              disabled={readonly}
              style={{ marginTop: 8 }}
              marks={{
                1: '1',
                6: '6',
                12: '12',
                18: '18',
                24: '24',
              }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};