import { Alert, AlertProps, Space } from 'antd';
import React, { FC } from 'react';

const renderAlert = (message: string, type: AlertProps['type']) => ( <Alert style={{height: '28px'}} message={message} type={type} showIcon />);

const AlertsExample: FC = () => (
  <Space direction="vertical" size="small" style={{ width: '100%' }}>
    {renderAlert("Success alert", "success")}
    {renderAlert("Info alert", "info")}
    {renderAlert("Warning alert", "warning")}
    {renderAlert("Error alert", "error")}
  </Space>
);

export default AlertsExample;
