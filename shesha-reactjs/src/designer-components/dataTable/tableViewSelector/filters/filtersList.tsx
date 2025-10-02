import { ListEditor } from '@/components';
import { ITableViewProps } from '@/providers/dataTable/filters/models';
import { nanoid } from '@/utils/uuid';
import React, { FC } from 'react';
import { FilterItem } from './filterItem';
import { ListItem } from '@/components/listEditor/models';

export interface IFiltersListProps {
  value?: ITableViewProps[];
  onChange?: (newValue: ITableViewProps[]) => void;
  readOnly: boolean;
}

export const FiltersList: FC<IFiltersListProps> = ({ value, onChange, readOnly }) => {
  const createDefaultFilter = () => ({
    id: nanoid(),
    sortOrder: 0,
    name: 'Default Filter',
  });

  const makeNewFilter = (items: ITableViewProps[]) => {
    const itemsCount = (items ?? []).length;
    const itemNo = itemsCount + 1;
    return {
      id: nanoid(),
      sortOrder: itemsCount,
      name: `Filter ${itemNo}`,
    };
  };

  const localOnChange = (newValue: ITableViewProps[]) => {
    // Ensure there's always at least one filter
    const finalValue = newValue.length === 0 ? [createDefaultFilter()] : newValue;
    onChange([...finalValue]);
  };

  // Ensure there's always at least one filter when initializing
  const initialValue = (!value || value.length === 0) ? [createDefaultFilter()] : value;

  return (
        <ListEditor<ITableViewProps & ListItem>
          value={initialValue}
          onChange={localOnChange}
          initNewItem={makeNewFilter}
          readOnly={readOnly}
        >
            {({ item, itemOnChange, readOnly }) => (<FilterItem value={item} onChange={itemOnChange} readOnly={readOnly} />)}
        </ListEditor>
  );
};
