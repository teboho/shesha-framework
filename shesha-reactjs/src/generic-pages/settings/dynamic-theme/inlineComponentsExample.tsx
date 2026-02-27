import { Button, Space, Typography } from "antd";
import React, { FC } from "react";
import { IConfigurableTheme, pickStyleFromModel, StyleBoxValue } from '@/index';
import { jsonSafeParse } from '@/utils/object';

interface InlineComponentsExampleProps {
  theme?: IConfigurableTheme;
}

export const InlineComponentsExample: FC<InlineComponentsExampleProps> = ({ theme }) => {
  // Apply inlineComponents stylingBox
  const inlineStylingBoxParsed = jsonSafeParse<StyleBoxValue>(theme?.inlineComponents?.stylingBox || '{}');
  const inlineStylingBoxCSS = pickStyleFromModel(inlineStylingBoxParsed);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: "1fr 1fr", rowGap: 8, columnGap: 8 }}>
          <Button type="primary" style={inlineStylingBoxCSS}>Primary</Button>
          <Button danger style={inlineStylingBoxCSS}>Error</Button>
          <Button type="link" style={inlineStylingBoxCSS}>Secondary</Button>
          <Button type="default" style={inlineStylingBoxCSS}>Default</Button>
        </div>
      </Space>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Typography.Text style={{ color: theme?.text?.default, ...inlineStylingBoxCSS }}>
            Default text
          </Typography.Text>

          <Typography.Text type="secondary" style={{ color: theme?.text?.secondary, ...inlineStylingBoxCSS }}>
            Secondary text
          </Typography.Text>

          <Typography.Link style={{ color: theme?.text?.link, ...inlineStylingBoxCSS }}>Link text</Typography.Link>
        </Space>
      </Space>
    </Space>
  );
};
