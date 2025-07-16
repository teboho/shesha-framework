import classNames from 'classnames';
import ConditionalWrap from '@/components/conditionalWrapper';
import { ConfigurableFormComponent } from '../configurableFormComponent';
import React, { FC, PropsWithChildren, useMemo, useCallback, useRef } from 'react';
import { getAlignmentStyle } from './util';
import { IComponentsContainerProps } from './componentsContainer';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { TOOLBOX_COMPONENT_DROPPABLE_KEY, TOOLBOX_DATA_ITEM_DROPPABLE_KEY } from '@/providers/form/models';
import { ShaForm } from '@/providers/form';
import { useFormDesignerActions, useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useStyles } from '../styles/styles';
import { useParent } from '@/providers/parentProvider';
import { useDebouncedCallback } from 'use-debounce';
import _ from 'lodash';

export const ComponentsContainerDesigner: FC<PropsWithChildren<IComponentsContainerProps>> = React.memo((props) => {
    const {
        containerId,
        children,
        direction = 'vertical',
        className,
        render,
        itemsLimit = -1,
        wrapperStyle,
        style: incomingStyle,
        noDefaultStyling,
    } = props;

    const { styles } = useStyles();
    const parent = useParent();

    const readOnly = useFormDesignerStateSelector(x => x.readOnly);
    const hasDragged = useFormDesignerStateSelector(x => x.hasDragged);
    const isDragging = useFormDesignerStateSelector(x => x.isDragging);
    const { updateChildComponents, addComponent, addDataProperty, startDragging, endDragging } = useFormDesignerActions();

    const childIds = ShaForm.useChildComponentIds(containerId.replace(`${parent?.subFormIdPrefix}.`, ''));

    const componentsMapped = useMemo<ItemInterface[]>(() => {
        return childIds.map<ItemInterface>((id) => ({
            id: id,
        }));
    }, [childIds]);

    // Use ref to track the latest state without causing re-renders
    const latestStateRef = useRef({ hasDragged, isDragging, childIds });
    latestStateRef.current = { hasDragged, isDragging, childIds };

    // Debounced update function to reduce frequent state updates
    const debouncedUpdateChildComponents = useDebouncedCallback((payload) => {
        updateChildComponents(payload);
    }, 50);

    const onSetList = useCallback((newState: ItemInterface[], _sortable, _store) => {
        if (!latestStateRef.current.hasDragged) return;

        if (!isNaN(itemsLimit) && itemsLimit && newState?.length === Math.round(itemsLimit) + 1) {
            return;
        }

        const chosen = newState.some((item) => item.chosen === true);
        if (chosen) return;

        const newDataItemIndex = newState.findIndex((item) => item['type'] === TOOLBOX_DATA_ITEM_DROPPABLE_KEY);
        if (newDataItemIndex > -1) {
            // dropped data item
            const draggedItem = newState[newDataItemIndex];

            addDataProperty({
                propertyMetadata: draggedItem.metadata,
                containerId,
                index: newDataItemIndex,
            });
        } else {
            const newComponentIndex = newState.findIndex((item) => item['type'] === TOOLBOX_COMPONENT_DROPPABLE_KEY);
            if (newComponentIndex > -1) {
                // add new component
                const toolboxComponent = newState[newComponentIndex];

                addComponent({
                    containerId,
                    componentType: toolboxComponent.id.toString(),
                    index: newComponentIndex,
                });
            } else {
                // reorder existing components
                const currentChildIds = latestStateRef.current.childIds;
                let isModified = currentChildIds.length !== newState.length;

                if (!isModified) {
                    for (let i = 0; i < currentChildIds.length; i++) {
                        if (currentChildIds[i] !== newState[i].id) {
                            isModified = true;
                            break;
                        }
                    }
                }

                if (isModified) {
                    const newIds = newState.map<string>((item) => item.id.toString());
                    // Use debounced update to reduce rapid state changes
                    debouncedUpdateChildComponents({ containerId, componentIds: newIds });
                }
            }
        }
    }, [containerId, itemsLimit, addDataProperty, addComponent, debouncedUpdateChildComponents]);

    const onDragStart = useCallback(() => {
        startDragging();
    }, [startDragging]);

    const onDragEnd = useCallback((_evt) => {
        endDragging();
    }, [endDragging]);

    const renderComponents = useCallback(() => {
        const renderedComponents = childIds.map((id) => (
            <ConfigurableFormComponent id={id} key={id} />
        ));

        return typeof render === 'function' ? render(renderedComponents) : renderedComponents;
    }, [childIds, render]);

    const style = useMemo(() => getAlignmentStyle(props), [props]);

    // Optimize sortable configuration for better performance
    const sortableConfig = useMemo(() => ({
        disabled: readOnly,
        onStart: onDragStart,
        onEnd: onDragEnd,
        list: componentsMapped,
        setList: onSetList,
        fallbackOnBody: true,
        swapThreshold: 0.65, // Increased for better stability
        group: {
            name: 'shared',
        },
        sort: true,
        draggable: `.${styles.shaComponent}`,
        animation: 120, // Slightly slower for better visual feedback and performance
        ghostClass: styles.shaComponentGhost,
        emptyInsertThreshold: 20,
        handle: `.${styles.componentDragHandle}`,
        scroll: true,
        bubbleScroll: true,
        direction: direction,
        className: noDefaultStyling ? '' : styles.shaComponentsContainerInner,
        style: { ...style, ...incomingStyle },
        // Performance optimizations
        delayOnTouchStart: true,
        delay: 0,
        touchStartThreshold: 5,
        forceFallback: false,
        preventOnFilter: true,
    }), [
        readOnly, onDragStart, onDragEnd, componentsMapped, onSetList, styles.shaComponent, 
        styles.shaComponentGhost, styles.componentDragHandle, direction, noDefaultStyling, 
        styles.shaComponentsContainerInner, style, incomingStyle
    ]);

    return (
        <ConditionalWrap
            condition={!noDefaultStyling}
            wrap={(content) => (
                <div className={classNames(styles.shaComponentsContainer, direction, className)} style={wrapperStyle}>
                    {content}
                </div>
            )}
        >
            <>
                {childIds.length === 0 && <div className={styles.shaDropHint}>Drag and Drop form component</div>}
                <ReactSortable {...sortableConfig}>
                    {renderComponents()}
                </ReactSortable>
            </>

            {children}
        </ConditionalWrap>
    );
});

ComponentsContainerDesigner.displayName = 'ComponentsContainerDesigner';