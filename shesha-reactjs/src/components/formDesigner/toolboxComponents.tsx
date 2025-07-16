import React, { FC, useMemo, useCallback, memo } from 'react';
import ToolboxComponent from './toolboxComponent';
import { Collapse, CollapseProps, Empty } from 'antd';
import { useLocalStorage } from '@/hooks';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { TOOLBOX_COMPONENT_DROPPABLE_KEY } from '@/providers/form/models';
import { IToolboxComponentGroup } from '@/interfaces';
import { SearchBox } from './toolboxSearchBox';
import { useFormDesignerActions, useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useStyles } from './styles/styles';

type PanelType = CollapseProps['items'][number];

export interface IToolboxComponentsProps { }

export const ToolboxComponents: FC<IToolboxComponentsProps> = memo(() => {
  const [openedKeys, setOpenedKeys] = useLocalStorage('shaDesigner.toolbox.components.openedKeys', ['']);
  const [searchText, setSearchText] = useLocalStorage('shaDesigner.toolbox.components.search', '');
  const { styles } = useStyles();

  const toolboxComponentGroups = useFormDesignerStateSelector(state => state.toolboxComponentGroups);
  const isDragging = useFormDesignerStateSelector(state => state.isDragging);
  const { startDraggingNewItem, endDraggingNewItem } = useFormDesignerActions();

  const filteredGroups = useMemo<IToolboxComponentGroup[]>(() => {
    if (!Boolean(searchText)) return [...toolboxComponentGroups];

    const result: IToolboxComponentGroup[] = [];

    toolboxComponentGroups.forEach((group) => {
      const filteredComponents = group.components.filter((c) =>
        c.name?.toLowerCase().includes(searchText?.toLowerCase())
      );
      if (filteredComponents.length > 0) result.push({ ...group, components: filteredComponents });
    });
    return result;
  }, [toolboxComponentGroups, searchText]);

  const onCollapseChange = useCallback((key: string | string[]) => {
    setOpenedKeys(Array.isArray(key) ? key : [key]);
  }, [setOpenedKeys]);

  const onDragStart = useCallback(() => {
    startDraggingNewItem();
  }, [startDraggingNewItem]);

  const onDragEnd = useCallback((_evt) => {
    endDraggingNewItem();
  }, [endDraggingNewItem]);

  const sortableItems = useMemo(() => {
    const visibleComponents = filteredGroups.flatMap(group => group.components);
    return visibleComponents.map<ItemInterface>((component) => {
      return {
        id: component.type,
        type: TOOLBOX_COMPONENT_DROPPABLE_KEY,
      };
    });
  }, [filteredGroups]);

  const sortableConfig = useMemo(() => ({
    onStart: onDragStart,
    onEnd: onDragEnd,
    list: sortableItems,
    setList: () => { /* no-op for toolbox */ },
    group: {
      name: 'shared',
      pull: 'clone',
      put: false,
    },
    clone: true,
    sort: false,
    animation: 0, // No animation for toolbox items for better performance
    ghostClass: styles.shaComponentGhost,
  }), [onDragStart, onDragEnd, sortableItems, styles.shaComponentGhost]);

  const renderGroupContent = useCallback((group: IToolboxComponentGroup) => (
    <div key={group.name}>
      {group.components.map((component, compIndex) => (
        <ToolboxComponent 
          key={`${component.type}_${compIndex}`}
          component={component} 
        />
      ))}
    </div>
  ), []);

  const collapseItems = useMemo<PanelType[]>(() => {
    return filteredGroups.map<PanelType>((group, index) => ({
      key: group.name,
      label: group.name,
      children: renderGroupContent(group),
      showArrow: group.components.length > 0,
    }));
  }, [filteredGroups, renderGroupContent]);

  const hasComponents = useMemo(() => 
    filteredGroups.some(group => group.components.length > 0),
    [filteredGroups]
  );

  return (
    <div className={styles.shaToolboxComponents}>
      <SearchBox value={searchText} onChange={setSearchText} placeholder="Search components..." />
      
      {hasComponents ? (
        <ReactSortable {...sortableConfig}>
          <Collapse
            className={styles.shaToolboxPanelComponents}
            defaultActiveKey={openedKeys}
            onChange={onCollapseChange}
            items={collapseItems}
            size="small"
            ghost
          />
        </ReactSortable>
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="No components found"
          style={{ marginTop: '20px' }}
        />
      )}
    </div>
  );
});

ToolboxComponents.displayName = 'ToolboxComponents';