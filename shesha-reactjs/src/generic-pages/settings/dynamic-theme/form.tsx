import { SmileOutlined } from '@ant-design/icons';
import { Form, Input, Space } from 'antd';
import React, { FC } from 'react';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { jsonSafeParse } from '@/utils/object';
import { pickStyleFromModel, StyleBoxValue } from '@/index';
import { FormLabelAlign } from 'antd/es/form/interface';

interface FormExampleProps {
  theme?: IConfigurableTheme;
}

const FormExample: FC<FormExampleProps> = ({ theme }) => {
  const inputSettings = theme?.inputComponents;
  const formLayout = theme?.formLayout;
  const labelAlign = inputSettings?.labelAlign;

  // Build form item layout based on settings
  const formItemLayout = {
    labelCol: { span: inputSettings?.labelSpan ?? 6 },
    wrapperCol: { span: inputSettings?.contentSpan ?? 18 },
    // Label align to mean we set for layout to vertical so don't apply label align
    labelAlign: labelAlign !== 'top' ? labelAlign as FormLabelAlign : null,
  };

  // Calculate margins for standard components
  const inputStylingBoxParsed = jsonSafeParse<StyleBoxValue>(inputSettings?.stylingBox || '{}');
  const inputStylingBoxAsCSS = pickStyleFromModel(inputStylingBoxParsed);

  const inputMargins = {
    ...inputStylingBoxAsCSS,
  };

  return (
    <Form
      layout={formLayout?.layout === 'vertical' || inputSettings?.labelAlign === 'top' ? 'vertical' : 'horizontal'}
      {...formItemLayout}
      size="small"
      colon={inputSettings?.labelColon ?? true}
      style={{ width: '100%' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item
          label="Text Input"
          validateStatus="success"
          style={inputMargins}
        >
          <Input placeholder="Enter text" defaultValue="Sample text" />
        </Form.Item>
        <Form.Item
          label="Failed"
          validateStatus="error"
          help="This field has an error"
          style={{ ...inputMargins }}
        >
          <Input placeholder="Error input" />
        </Form.Item>

        <Form.Item
          label="Warning"
          validateStatus="warning"
          style={{ ...inputMargins }}
        >
          <Input placeholder="Warning input" prefix={<SmileOutlined />} />
        </Form.Item>

        <Form.Item
          label="Validating"
          validateStatus="validating"
          style={{ ...inputMargins }}
        >
          <Input placeholder="Warning input" prefix={<SmileOutlined />} />
        </Form.Item>
      </Space>
    </Form>
  );
};

export default FormExample;
