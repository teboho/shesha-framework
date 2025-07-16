import React, { FC, MutableRefObject, PropsWithChildren, useMemo, useState, useCallback, memo } from 'react';
import { ShaForm } from '@/providers/form';
import { Button, Tooltip } from 'antd';
import { useFormDesignerState, useFormDesignerActions } from '@/providers/formDesigner';
import { DeleteFilled, FunctionOutlined } from '@ant-design/icons';
import { useStyles } from '../styles/styles';

interface IDragWrapperProps {
  componentId: string;
  componentRef: MutableRefObject<any>;
  readOnly?: boolean;
}

export const DragWrapper: FC<PropsWithChildren<IDragWrapperProps>> = memo((props) => {
  const { styles } = useStyles();
  
  const { selectedComponentId, isDebug } = useFormDesignerState();
  const { setSelectedComponent, deleteComponent } = useFormDesignerActions();
  const [isOpen, setIsOpen] = useState(false);

  const componentModel = ShaForm.useComponentModel(props.componentId);

  const isSelected = useMemo(() => 
    selectedComponentId === props.componentId,
    [selectedComponentId, props.componentId]
  );

  const tooltip = useMemo(() => (
    <div>
      {isDebug && (
        <div>
          <strong>Id:</strong> {componentModel.id}
        </div>
      )}
      <div>
        <strong>Type:</strong> {componentModel.type}
      </div>
      {Boolean(componentModel.propertyName) && (
        <div>
          <strong>Property name: </strong> 
          {typeof(componentModel.propertyName) === 'string' ? componentModel.propertyName : ''}
          {typeof(componentModel.propertyName) === 'object' && <FunctionOutlined />}
        </div>
      )}
      {Boolean(componentModel.componentName) && (
        <div><strong>Component name: </strong>{componentModel.componentName}</div>
      )}
    </div>
  ), [componentModel, isDebug]);

  const onClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    if (selectedComponentId !== props.componentId)
      setSelectedComponent({ id: props.componentId, name: componentModel.componentName });
  }, [selectedComponentId, props.componentId, setSelectedComponent, componentModel.componentName]);

  const onDelete = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    deleteComponent({ componentId: props.componentId });
  }, [deleteComponent, props.componentId]);

  const onMouseEnter = useCallback(() => {
    if (!props.readOnly) {
      setIsOpen(true);
    }
  }, [props.readOnly]);

  const onMouseLeave = useCallback(() => {
    setIsOpen(false);
  }, []);

  const controlsStyle = useMemo(() => ({
    display: isSelected && isOpen && !props.readOnly ? 'block' : 'none'
  }), [isSelected, isOpen, props.readOnly]);

  return (
    <Tooltip title={tooltip} mouseEnterDelay={1}>
      <div
        className={styles.componentDragHandle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <div className={styles.shaComponentControls} style={controlsStyle}>
          <Button
            icon={<DeleteFilled color="red" />}
            onClick={onDelete}
            size="small"
            danger
          />
        </div>
        {props.children}
      </div>
    </Tooltip>
  );
}, (prevProps, nextProps) => {
  // Only re-render if componentId, readOnly, or children reference changes
  return (
    prevProps.componentId === nextProps.componentId &&
    prevProps.readOnly === nextProps.readOnly &&
    prevProps.children === nextProps.children
  );
});

DragWrapper.displayName = 'DragWrapper';

export default DragWrapper;