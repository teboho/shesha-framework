import React from 'react';
import { UnorderedListOutlined, UserOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "@/interfaces";
import { useDataSources } from '@/providers/dataSourcesProvider';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IDataListComponentProps } from './model';
import DataListControl from './dataListControl';
import { useDataTableStore } from '@/providers';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { Tooltip } from 'antd';
// import defaultPersonFormTemplate from './defaultPersonFormTemplate.json';

const DataListComponent: IToolboxComponent<IDataListComponentProps> = {
  type: 'datalist',
  isInput: true,
  name: 'DataList',
  icon: <UnorderedListOutlined />,
  Factory: ({ model }) => {
    const ds = useDataSources();
    const dts = useDataTableStore(false);
    if (model.hidden) return null;

    const dataSource = model.dataSource
      ? ds.getDataSource(model.dataSource)?.dataSource
      : dts;

    // Check if dataSource exists AND has a valid modelType/entityType
    if (dataSource && dataSource.modelType) {
      return <DataListControl {...model} dataSourceInstance={dataSource} />;
    }

    // Create a mock data source with greyed-out sample data
    const mockDataSource = {
      tableData: [
        {
          id: "sample-1",
          displayName: "Sample Item 1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          _className: "Entity",
          avatar: <UserOutlined />,
        },
        {
          id: "sample-2",
          displayName: "Sample Item 2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          _className: "Entity",
          avatar: <UserOutlined />,
        },
        {
          id: "sample-3",
          displayName: "Sample Item 3",
          firstName: "Bob",
          lastName: "Wilson",
          email: "bob.wilson@example.com",
          _className: "Entity",
          avatar: <UserOutlined />,
        },
      ],
      isFetchingTableData: false,
      selectedIds: [],
      changeSelectedIds: () => { /* noop */ },
      getRepository: () => null,
      modelType: "Entity",
      selectedRow: null,
      selectedRows: [],
      setSelectedRow: () => { /* noop */ },
      setMultiSelectedRow: () => { /* noop */ },
      registerConfigurableColumns: () => { /* noop */ },
      requireColumns: () => { /* noop */ },
      // Flag to indicate this is outside DataContext scenario
      _isOutsideDataContext: true,
    };

    return (
      <Tooltip title="Data List must be used within a Data Context or have a Data Source configured. Currently showing sample data.">
        <div style={{
          filter: 'grayscale(25%)',
          position: 'relative',
        }}
        >
          <DataListControl {...model} dataSourceInstance={mockDataSource as any} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.4)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
          />
        </div>
      </Tooltip>
    );
  },
  migrator: (m) => m
    .add<IDataListComponentProps>(0, (prev) => ({ ...prev, formSelectionMode: 'name', selectionMode: 'none', items: [] }))
    .add<IDataListComponentProps>(1, (prev) => ({ ...prev, orientation: 'vertical', listItemWidth: 1 }))
    .add<IDataListComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDataListComponentProps>(3, (prev) => migrateVisibility(prev))
    .add<IDataListComponentProps>(4, (prev) => ({ ...prev, collapsible: true }))
    .add<IDataListComponentProps>(5, (prev) => {
      return {
        ...prev,
        canAddInline: 'no',
        canEditInline: 'no',
        canDeleteInline: 'no',
        inlineEditMode: 'one-by-one',
        inlineSaveMode: 'manual',
        dblClickActionConfiguration: prev['actionConfiguration'],

      };
    })
    .add<IDataListComponentProps>(6, (prev) => ({ ...prev, dblClickActionConfiguration: migrateNavigateAction(prev.dblClickActionConfiguration) }))
    .add<IDataListComponentProps>(7, (prev: IDataListComponentProps) => ({
      ...migrateFormApi.properties(prev),
      onNewListItemInitialize: migrateFormApi.full(prev.onNewListItemInitialize),
      onListItemSave: migrateFormApi.full(prev.onListItemSave),
    }))
    .add<IDataListComponentProps>(8, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
    .add<IDataListComponentProps>(9, (prev) => {
      return {
        ...prev,
        desktop: {
          ...prev.desktop,
          gap: prev.cardSpacing,
          dimensions: {
            ...prev.desktop.dimensions,
            minWidth: prev.cardMinWidth,
            maxWidth: prev.cardMaxWidth,
            width: prev.customWidth,
            height: prev.cardHeight,
          },
        },
      };
    }).add<IDataListComponentProps>(10, (prev) => {
      const cardSpacing = prev.cardSpacing || '0px';
      const parsedGap = parseInt(cardSpacing.replace('px', ''), 10);
      const gap = isNaN(parsedGap) ? 0 : parsedGap;

      return {
        ...prev,
        orientation: prev.orientation,
        desktop: {
          ...prev.desktop,
          gap: gap,
          orientation: prev.orientation,
          dimensions: {
            minWidth: prev.cardMinWidth ?? 'auto',
            maxWidth: prev.cardMaxWidth ?? 'auto',
            width: prev.customWidth ?? prev.cardMaxWidth ?? 'auto',
            height: prev.cardHeight ?? 'auto',
            minHeight: 'auto',
            maxHeight: 'auto',
          },
        },
      };
    }),
  settingsFormMarkup: (data) => getSettings(data),
  initModel: (model: IDataListComponentProps) => {
    const defaultModel: IDataListComponentProps = {
      ...model,
      formSelectionMode: 'name',
      orientation: 'vertical',
      selectionMode: 'none',
      canAddInline: 'no',
      canEditInline: 'no',
      canDeleteInline: 'no',
      noDataText: "No Data",
      noDataSecondaryText: "No data is available for this list",
      hideLabel: true,
      inlineEditMode: 'one-by-one',
      inlineSaveMode: 'manual',
      collapsible: false,
    };
    return defaultModel;
  },
};

export default DataListComponent;
