import React, { FC } from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, Space, Alert } from 'antd';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { parseStylingBox, applyStylingBoxToCssStyle } from './models';

interface ILivePreviewProps {
  theme?: IConfigurableTheme;
  activeTab?: string;
}

export const LivePreview: FC<ILivePreviewProps> = ({ theme, activeTab }) => {
  const [form] = Form.useForm();

  const inputSettings = theme?.inputComponents || {};
  const layoutSettings = theme?.layoutComponents || {};
  const standardSettings = theme?.standardComponents || {};
  const inlineSettings = theme?.inlineComponents || {};
  const formLayoutSettings = theme?.formLayout || {};

  const inputStyling = applyStylingBoxToCssStyle(parseStylingBox(inputSettings.stylingBox));
  const layoutStyling = applyStylingBoxToCssStyle(parseStylingBox(layoutSettings.stylingBox));
  const standardStyling = applyStylingBoxToCssStyle(parseStylingBox(standardSettings.stylingBox));
  const inlineStyling = applyStylingBoxToCssStyle(parseStylingBox(inlineSettings.stylingBox));

  const labelCol = inputSettings.labelAlign === 'top' 
    ? { span: 24 } 
    : { span: inputSettings.labelSpan || 6 };
  const wrapperCol = inputSettings.labelAlign === 'top' 
    ? { span: 24 } 
    : { span: inputSettings.contentSpan || 18 };

  const renderInputComponentPreview = () => (
    <Card size="small" title="Input Components" style={{ marginBottom: 16 }}>
      <Form
        form={form}
        layout={inputSettings.labelAlign === 'top' ? 'vertical' : 'horizontal'}
        labelAlign={inputSettings.labelAlign === 'left' ? 'left' : 'right'}
        colon={inputSettings.labelColon !== false}
        labelCol={labelCol}
        wrapperCol={wrapperCol}
      >
        <Form.Item label="Text Input" name="textInput" style={inputStyling}>
          <Input placeholder="Sample text input" />
        </Form.Item>
        <Form.Item label="Email" name="email" style={inputStyling}>
          <Input placeholder="sample@email.com" />
        </Form.Item>
      </Form>
    </Card>
  );

  const renderLayoutComponentPreview = () => (
    <Card size="small" title="Layout Components" style={{ marginBottom: 16 }}>
      <div style={layoutStyling}>
        <Row gutter={layoutSettings.gridGap || 16}>
          <Col span={12}>
            <Card size="small" bodyStyle={{ padding: '8px', textAlign: 'center' }}>
              Column 1
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" bodyStyle={{ padding: '8px', textAlign: 'center' }}>
              Column 2
            </Card>
          </Col>
        </Row>
      </div>
    </Card>
  );

  const renderStandardComponentPreview = () => (
    <Card size="small" title="Standard Components" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button type="primary" style={standardStyling}>
          Primary Button
        </Button>
        <Alert 
          message="Sample Alert" 
          type="info" 
          showIcon 
          style={standardStyling}
        />
      </Space>
    </Card>
  );

  const renderInlineComponentPreview = () => (
    <Card size="small" title="Inline Components" style={{ marginBottom: 16 }}>
      <Space wrap>
        <Button size="small" style={inlineStyling}>
          Action 1
        </Button>
        <Button size="small" style={inlineStyling}>
          Action 2
        </Button>
        <Button size="small" style={inlineStyling}>
          Action 3
        </Button>
      </Space>
    </Card>
  );

  const renderFormLayoutPreview = () => (
    <Card size="small" title="Form Layout" style={{ marginBottom: 16 }}>
      <Row>
        <Col span={formLayoutSettings.span || 24}>
          <Card 
            size="small" 
            bodyStyle={{ 
              padding: '12px', 
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              border: '1px dashed #d9d9d9'
            }}
          >
            <Typography.Text type="secondary">
              Form Content Area
              <br />
              Span: {formLayoutSettings.span || 24}/24
              <br />
              Layout: {formLayoutSettings.layout || 'horizontal'}
            </Typography.Text>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        Live Preview
      </Typography.Title>
      
      {(!activeTab || activeTab === 'input') && renderInputComponentPreview()}
      {(!activeTab || activeTab === 'layout') && renderLayoutComponentPreview()}
      {(!activeTab || activeTab === 'standard') && renderStandardComponentPreview()}
      {(!activeTab || activeTab === 'inline') && renderInlineComponentPreview()}
      {(!activeTab || activeTab === 'formLayout') && renderFormLayoutPreview()}
      
      {activeTab && (
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          Showing preview for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings
        </Typography.Text>
      )}
    </div>
  );
};