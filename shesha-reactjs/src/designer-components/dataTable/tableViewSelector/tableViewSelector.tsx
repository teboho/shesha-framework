import _ from 'lodash';
import React, { FC, useEffect } from 'react';
import TableViewSelectorRenderer from '@/components/tableViewSelectorRenderer';
import { evaluateDynamicFilters } from '@/utils';
import { ITableViewSelectorComponentProps } from './models';
import { useDataContextOrUndefined } from '@/providers/dataContextProvider/contexts';
import { useDataContextManagerOrUndefined } from '@/providers/dataContextManager';
import {
  useDataFetchDependency,
  useDataTableStore,
  useGlobalState,
  useNestedPropertyMetadatAccessor,
  useSheshaApplication,
} from '@/providers';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useShaFormDataUpdate, useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { nanoid } from '@/utils/uuid';
import { IStoredFilter } from '@/providers/dataTable/interfaces';

interface ITableViewSelectorProps extends ITableViewSelectorComponentProps {
}

const createDefaultFilter = (): IStoredFilter => ({
  id: nanoid(),
  name: 'Default Filter',
  tooltip: 'Default filter - can be configured as needed',
  expression: null,
  selected: true,
  defaultSelected: true,
});

export const TableViewSelector: FC<ITableViewSelectorProps> = ({
  id,
  filters,
  hidden,
  persistSelectedFilters,
}) => {
  const {
    changeSelectedStoredFilterIds,
    selectedStoredFilterIds,
    setPredefinedFilters,
    predefinedFilters,
    changePersistedFiltersToggle,
    modelType,
    refreshTable,
  } = useDataTableStore();

  // ToDo: AS - need to optimize
  useShaFormDataUpdate();

  const application = useSheshaApplication();
  const { globalState } = useGlobalState();
  const { formData, formMode } = useShaFormInstance();
  const dataContextManager = useDataContextManagerOrUndefined();
  const pageContext = dataContextManager?.getPageContext();
  const dataContext = useDataContextOrUndefined();
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(modelType);

  const selectedFilterId =
        selectedStoredFilterIds && selectedStoredFilterIds.length > 0 ? selectedStoredFilterIds[0] : null;

  const dataFetchDep = useDataFetchDependency(id);
  const isDesignerMode = formMode === 'designer';

  //#region Filters
  const debounceEvaluateDynamicFiltersHelper = () => {
    const match = [
      { match: 'data', data: formData },
      { match: 'globalState', data: globalState },
      { match: 'pageContext', data: { ...pageContext?.getFull() } },
    ];

    if (dataContextManager)
      match.push({ match: 'contexts', data: dataContextManager.getDataContextsData(dataContext?.id) });

    const permissionedFilters = filters.filter((f) => !f.permissions || (f.permissions && application.anyOfPermissionsGranted(f.permissions)));

    // Ensure there's always at least one filter available
    const filtersToEvaluate = permissionedFilters.length > 0 ? permissionedFilters : [createDefaultFilter()];

    evaluateDynamicFilters(
      filtersToEvaluate,
      match,
      propertyMetadataAccessor
    ).then((evaluatedFilters) => {
      dataFetchDep.ready();
      setPredefinedFilters(evaluatedFilters);
    });
  };

  useDeepCompareEffect(() => {
    debounceEvaluateDynamicFiltersHelper();
  }, [filters, formData, globalState, dataContextManager.lastUpdate]);

  useEffect(() => {
    changePersistedFiltersToggle(persistSelectedFilters);
  }, [persistSelectedFilters]);

  // Trigger table refresh when selected filter changes
  useEffect(() => {
    if (!isDesignerMode && selectedFilterId && predefinedFilters?.length > 0) {
      // Small delay to ensure filter is applied before refresh
      setTimeout(() => {
        refreshTable();
      }, 100);
    }
  }, [selectedFilterId, predefinedFilters, isDesignerMode, refreshTable]);
  //#endregion

  const changeSelectedFilter = (id: string) => {
    changeSelectedStoredFilterIds(id ? [id] : []);
  };

  return (
        <TableViewSelectorRenderer
          hidden={hidden && !isDesignerMode}
          filters={predefinedFilters || []}
          onSelectFilter={changeSelectedFilter}
          selectedFilterId={selectedFilterId}
          isDesignerMode={isDesignerMode}
        />
  );
};
