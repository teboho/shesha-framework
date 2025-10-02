import React, { FC } from 'react';
import { Card, Typography, Popover } from 'antd';
import { SettingOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTheme } from '@/providers';

const { Text } = Typography;

interface ISmartDefaultItemProps {
  /** The data record to display */
  data: any;
  /** Entity metadata to determine which properties to show */
  entityMetadata?: any;
  /** Whether we're in design mode */
  isDesignMode?: boolean;
  /** The index of this item in the list */
  itemIndex: number;
  /** Entity type name for context */
  entityType?: string;
  /** Context scenario to show appropriate message */
  contextScenario?: 'outside-datacontext' | 'no-entitytype' | 'no-form' | 'loading';
}

/**
 * Simple placeholder item renderer for DataList when no formId is configured.
 * Shows only the ID with ellipses and prompts the configurator to set up a proper form template.
 */
export const SmartDefaultItem: FC<ISmartDefaultItemProps> = ({
  data,
  isDesignMode = false,
  itemIndex,
  entityType,
  contextScenario = 'no-form',
}) => {
  const { theme } = useTheme();

  // Get contextual configuration messages based on scenario
  const getConfigurationMessage = () => {
    switch (contextScenario) {
      case 'outside-datacontext':
        return {
          title: 'Configuration Issue:',
          message: 'Data List must be used within a Data Context.',
          instruction: 'Place the Data List inside a Data Context component.',
        };
      case 'no-entitytype':
        return {
          title: 'Configuration Issue:',
          message: 'The Data Context has no Entity Type configured.',
          instruction: 'Configure the Entity Type in the Data Context settings.',
        };
      case 'no-form':
        return {
          title: 'Configuration Issue:',
          message: 'The Data List item template is not configured.',
          instruction: 'Configure a Form ID for the data list item template ("Form" property in the Data section).',
        };
      case 'loading':
        return {
          title: 'Loading...',
          message: 'Loading form template configuration.',
          instruction: 'Please wait while the configuration is being loaded.',
        };
      default:
        return {
          title: 'Configuration Issue:',
          message: 'The Data List item template is not configured.',
          instruction: 'Configure a Form ID for the data list item template ("Form" property in the Data section).',
        };
    }
  };

  // Get a simple display name for the placeholder
  const getPlaceholderTitle = (): string => {
    return `${entityType || 'Item'} #${itemIndex + 1}`;
  };

  const formatIdDisplay = (id: any): React.ReactNode => {
    if (!id) return null;

    const idString = String(id);

    // For very short IDs (like 1, 2, 3), show them fully
    if (idString.length <= 6) {
      return (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          ID: {idString}
        </Text>
      );
    }

    // For GUID-like patterns (8-4-4-4-12), show first 8 chars
    const guidPattern = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (guidPattern.test(idString)) {
      const displayId = `${idString.substring(0, 8)}...`;
      return (
        <Text
          type="secondary"
          style={{ fontSize: '12px', cursor: 'help' }}
          title={`Full ID: ${idString}`}
        >
          ID: {displayId}
        </Text>
      );
    }

    // For other long IDs, show first 5 + ellipsis + last 3 if long enough
    let displayId: string;
    if (idString.length > 10) {
      displayId = `${idString.substring(0, 5)}...${idString.substring(idString.length - 3)}`;
    } else {
      displayId = `${idString.substring(0, 5)}...`;
    }

    return (
      <Text
        type="secondary"
        style={{ fontSize: '12px', cursor: 'help' }}
        title={`Full ID: ${idString} (click to copy)`}
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard?.writeText(idString);
        }}
      >
        ID: {displayId}
      </Text>
    );
  };

  if (!data) {
    return <Card size="small"><Text type="secondary">No data</Text></Card>;
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        margin: '4px 0',
        border: '1px dashed #d9d9d9',
        borderRadius: '6px',
        backgroundColor: '#fafafa',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '13px',
      }}
      className={isDesignMode ? 'sha-datalist-smart-default' : ''}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f5f5f5';
        e.currentTarget.style.borderColor = '#bfbfbf';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fafafa';
        e.currentTarget.style.borderColor = '#d9d9d9';
      }}
    >
      {itemIndex === 0 && (
        <>
          <style>
            {`
              .ant-popover.sha-smart-default-item-hint-popover .ant-popover-inner {
                background-color: rgb(214, 214, 214) !important;
                border-radius: 8px !important;
              }
              .ant-popover.sha-smart-default-item-hint-popover .ant-popover-arrow::before,
              .ant-popover.sha-smart-default-item-hint-popover .ant-popover-arrow::after {
                background-color: rgb(214, 214, 214) !important;
              }
            `}
          </style>
          <div style={{ marginBottom: 8, padding: '4px 8px', backgroundColor: theme.layoutBackground, borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center' }}>
            <SettingOutlined style={{ marginRight: 4 }} />
            <Text type="secondary" style={{ fontSize: '11px', flex: 1 }}>
              Auto-display mode • {getConfigurationMessage().instruction}
            </Text>
            <Popover
              placement="right"
              title={getConfigurationMessage().title}
              rootClassName="sha-smart-default-item-hint-popover"
              content={(
                <p>
                  {getConfigurationMessage().message}<br />
                  <br />
                  {getConfigurationMessage().instruction}
                  <br />
                  <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">
                    See component documentation
                  </a>
                  for setup and usage.
                </p>
              )}
            >
              <InfoCircleOutlined style={{ color: theme?.application?.warningColor || '#faad14', cursor: 'help', fontSize: '12px', marginLeft: 4 }} />
            </Popover>
          </div>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {(data?.avatar || entityType) && (
          <div style={{ marginRight: 12, fontSize: '24px', color: theme.application.primaryColor }}>
            {data.avatar || (entityType ? <UserOutlined /> : null)}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Check if we have user-like data (mock data) OR if we should show mock display */}
          {(data?.displayName || data?.firstName || data?.name || data?.email) || entityType ? (
            /* Show user-friendly display */
            <>
              {((data?.displayName || data?.firstName || data?.name) || entityType) && (
                <div>
                  <Text style={{ color: '#262626', fontSize: '14px', fontWeight: 500 }}>
                    {data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name ||
                      (entityType ? `Sample ${entityType} Item` : '')}
                  </Text>
                </div>
              )}
              {(data?.email || entityType) && (
                <div style={{ marginTop: 2 }}>
                  <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    {data.email || (entityType ? 'sample.email@example.com' : '')}
                  </Text>
                </div>
              )}
            </>
          ) : (
            /* Show generic placeholder with ID for real entity data */
            <>
              <Text style={{ color: '#8c8c8c', fontSize: '13px' }}>
                {getPlaceholderTitle()}
              </Text>
              {data?.id && (
                <div style={{ marginTop: 4 }}>
                  {formatIdDisplay(data.id)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartDefaultItem;
