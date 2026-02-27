import { Alert, AlertProps, Space } from 'antd';
import React, { FC, ReactElement } from 'react';
import { IConfigurableTheme } from '@/index';

interface AlertsExampleProps {
  theme?: IConfigurableTheme;
}

const AlertsExample: FC<AlertsExampleProps> = ({ theme }) => {

  const renderAlert = (message: string, type: AlertProps['type']): ReactElement => (
    <Alert style={{ height: '28px' }} message={message} type={type} showIcon />
  );

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      {renderAlert("Success alert", "success")}
      {renderAlert("Info alert", "info")}
      {renderAlert("Warning alert", "warning")}
      {renderAlert("Error alert", "error")}
    </Space>
  );
};

export default AlertsExample;
