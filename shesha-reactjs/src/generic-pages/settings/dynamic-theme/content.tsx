import { Col, Row, Alert, Typography, Space } from 'antd';
import React, { FC, ReactElement } from 'react';
import { CollapsiblePanel } from '@/components';
import AlertsExample from './alertsExamples';
import FormExample from './form';
import ThemeParameters from './parameters';
import { useStyles } from './styles/styles';
import { IConfigurableTheme } from '@/index';
import LayoutExample from './layoutsExamples';
import { InlineComponentsExample } from './inlineComponentsExample';

export interface IConfigurableThemePageProps {
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
}

export const ConfigurableThemeContent: FC<IConfigurableThemePageProps> = ({ value, onChange, readonly }) => {
  const { styles } = useStyles();

  const GroupWrapper = ({ title, children }): ReactElement => (
    <Space className={styles.space} direction="vertical" style={{ width: '100%' }}>
      <h4 style={{ color: '#9d9d9d' }}>{title}</h4>
      {children}
    </Space>
  );

  const previewItems = [
    {
      key: 'alerts',
      label: 'Alerts',
      children: <GroupWrapper title="Alerts"><AlertsExample theme={value} /></GroupWrapper>,
    },
    {
      key: 'forms',
      label: 'Forms',
      children: <GroupWrapper title="Forms"><FormExample theme={value} /></GroupWrapper>,
    },
    {
      key: 'inline',
      label: 'Inline components',
      children: <GroupWrapper title="Inline components"><InlineComponentsExample theme={value} /></GroupWrapper>,
    },
    {
      key: 'layouts',
      label: 'Layouts',
      children: <GroupWrapper title="Layouts"><LayoutExample theme={value} /></GroupWrapper>,
    },
  ];

  return (
    <Row gutter={16} style={{ height: 'calc(100vh - 205px)' }}>
      <Col xs={24} sm={24} md={14} lg={16} xl={17} xxl={18} style={{ height: '100%', overflowY: 'auto' }}>
        <CollapsiblePanel
          collapsible="disabled"
          header={(
            <>
              <Typography.Text type="secondary" className={styles.themeHeader}>
                Theme Settings
              </Typography.Text>
              <Typography.Text type="secondary" className={styles.themeHeader}>
                Customize the look and feel of your workspace
              </Typography.Text>
            </>
          )}
          className={styles.themeParameters}
        >
          <Alert
            type="info"
            message="Configure your theme settings below. Changes are reflected in real-time in the preview panel."
            showIcon
            style={{ marginBottom: 16 }}
          />
          <ThemeParameters value={value} onChange={onChange} readonly={readonly} />
        </CollapsiblePanel>
      </Col>

      <Col xs={24} sm={24} md={10} lg={8} xl={7} xxl={6} style={{ height: '100%', overflowY: 'auto' }}>
        <div className={styles.space} style={{ padding: 16, backgroundColor: '#F0F2F5', borderRadius: 8 }}>
          <h3>Preview Card</h3>
          <Space className={styles.space} size="middle" direction="vertical">
            {previewItems.map(({ key, children }) => (
              <React.Fragment key={key}>{children}</React.Fragment>
            ))}
          </Space>
        </div>
      </Col>
    </Row>
  );
};
