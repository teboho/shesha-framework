import classNames from 'classnames';
import DragWrapper from './dragWrapper';
import FormComponent from '../formComponent';
import React, {
  FC,
  MutableRefObject,
  memo,
  useMemo,
  useRef,
  useCallback
} from 'react';
import { createPortal } from 'react-dom';
import ValidationIcon from './validationIcon';
import { EditMode, IConfigurableFormComponent } from '@/providers';
import {
  EditOutlined,
  EyeInvisibleOutlined,
  FunctionOutlined,
  StopOutlined
} from '@ant-design/icons';
import { getActualPropertyValue, useAvailableConstantsData } from '@/providers/form/utils';
import { isPropertySettings } from '@/designer-components/_settings/utils';
import { Show } from '@/components/show';
import { Tooltip } from 'antd';
import { ShaForm, useIsDrawingForm } from '@/providers/form';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useStyles } from '../styles/styles';
import { ComponentProperties } from '../componentPropertiesPanel/componentProperties';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';

export interface IConfigurableFormComponentDesignerProps {
  componentModel: IConfigurableFormComponent;
  componentRef: MutableRefObject<any>;
  selectedComponentId?: string;
  readOnly?: boolean;
  settingsPanelRef?: MutableRefObject<any>;
  hidden?: boolean;
  componentEditMode?: EditMode;
}

const ConfigurableFormComponentDesignerInner: FC<IConfigurableFormComponentDesignerProps> = memo(({ 
  componentModel,
  componentRef,
  selectedComponentId,
  readOnly,
  settingsPanelRef,
  hidden,
  componentEditMode
}) => {
  const { styles } = useStyles();

  const getToolboxComponent = useFormDesignerComponentGetter();

  const allData = useAvailableConstantsData({ topContextId: 'all' });

  const isSelected = useMemo(() => 
    selectedComponentId === componentModel.id, 
    [selectedComponentId, componentModel.id]
  );

  const { hiddenFx, componentEditModeFx } = useMemo(() => {
    const hiddenValue = getActualPropertyValue(componentModel, allData, 'hidden');
    const editModeValue = getActualPropertyValue(componentModel, allData, 'editMode');
    
    return {
      hiddenFx: hiddenValue?.hiddenFx,
      componentEditModeFx: editModeValue?.componentEditModeFx
    };
  }, [componentModel, allData]);

  const toolboxComponent = useMemo(() => 
    getToolboxComponent(componentModel.type), 
    [getToolboxComponent, componentModel.type]
  );

  const invalidConfiguration = useMemo(() => {
    const hasErrors = componentModel.settingsValidationErrors && componentModel.settingsValidationErrors.length > 0;
    return Boolean(hasErrors);
  }, [componentModel.settingsValidationErrors]);

  const { actionText1, actionText2 } = useMemo(() => {
    let text1 = '';
    let text2 = '';
    
    if (hiddenFx) {
      text1 = 'hidden';
      text2 = 'showing';
    } else if (componentEditModeFx) {
      text1 = 'disabled';
      text2 = 'enabled';
    }
    
    return { actionText1: text1, actionText2: text2 };
  }, [hiddenFx, componentEditModeFx]);

  const settingsEditor = useMemo(() => {
    if (!isSelected || !settingsPanelRef?.current) return null;
    
    return createPortal(
      <ComponentProperties
        componentModel={componentModel}
        readOnly={readOnly}
        toolboxComponent={toolboxComponent}
      />,
      settingsPanelRef.current
    );
  }, [isSelected, settingsPanelRef, componentModel, readOnly, toolboxComponent]);

  const componentClassNames = useMemo(() => 
    classNames(styles.shaComponent, {
      selected: isSelected,
      'has-config-errors': invalidConfiguration,
    }), 
    [styles.shaComponent, isSelected, invalidConfiguration]
  );

  const renderIndicator = useCallback(() => (
    <span className={styles.shaComponentIndicator}>
      <Show when={hiddenFx || componentEditModeFx}>
        <Tooltip title={`This component is ${actionText1} by condition. It's now ${actionText2} because we're in a designer mode`}>
          <FunctionOutlined />
        </Tooltip>
      </Show>

      <Show when={!hiddenFx && hidden}>
        <Tooltip title="This component is hidden. It's now showing because we're in a designer mode">
          <EyeInvisibleOutlined />
        </Tooltip>
      </Show>

      <Show when={!componentEditModeFx && (componentEditMode === 'readOnly' || componentEditMode === false)}>
        <Tooltip title="This component is always in Read only mode. It's now enabled because we're in a designer mode">
          <StopOutlined />
        </Tooltip>
      </Show>
      <Show when={!componentEditModeFx && componentEditMode === 'editable'}>
        <Tooltip title="This component is always in Edit/Action mode">
          <EditOutlined />
        </Tooltip>
      </Show>
    </span>
  ), [
    styles.shaComponentIndicator, hiddenFx, componentEditModeFx, hidden, 
    componentEditMode, actionText1, actionText2
  ]);

  return (
    <div className={componentClassNames}>
      {renderIndicator()}

      {invalidConfiguration && <ValidationIcon validationErrors={componentModel.settingsValidationErrors} />}
      <div>
        <DragWrapper componentId={componentModel.id} componentRef={componentRef} readOnly={readOnly} >
          <div style={{ padding: '5px 3px' }}>
            <FormComponent componentModel={componentModel} componentRef={componentRef} />
          </div>
        </DragWrapper>
      </div>
      {settingsEditor}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.componentModel.id === nextProps.componentModel.id &&
    prevProps.selectedComponentId === nextProps.selectedComponentId &&
    prevProps.readOnly === nextProps.readOnly &&
    prevProps.hidden === nextProps.hidden &&
    prevProps.componentEditMode === nextProps.componentEditMode &&
    prevProps.componentModel.settingsValidationErrors === nextProps.componentModel.settingsValidationErrors &&
    prevProps.settingsPanelRef === nextProps.settingsPanelRef
  );
});

ConfigurableFormComponentDesignerInner.displayName = 'ConfigurableFormComponentDesignerInner';

const ConfigurableFormComponentDesignerMemo = memo(ConfigurableFormComponentDesignerInner);

export const ConfigurableFormComponentDesigner: FC<IConfigurableFormComponentDesignerProps> = memo((props) => {
  const allData = useAvailableConstantsData({ topContextId: 'all' });
  const { selectedComponentId, readOnly, settingsPanelRef } = useFormDesignerState();
  
  const derived = useMemo(() => {
    const hiddenValue = getActualPropertyValue(props.componentModel, allData, 'hidden');
    const editModeValue = getActualPropertyValue(props.componentModel, allData, 'editMode');
    
    return {
      hidden: hiddenValue?.hidden,
      componentEditMode: editModeValue?.editMode as EditMode
    };
  }, [props.componentModel, allData]);

  return (
    <ConfigurableFormComponentDesignerMemo 
      {...props} 
      selectedComponentId={selectedComponentId}
      readOnly={readOnly}
      settingsPanelRef={settingsPanelRef}
      hidden={derived.hidden}
      componentEditMode={derived.componentEditMode}
    />
  );
});

ConfigurableFormComponentDesigner.displayName = 'ConfigurableFormComponentDesigner';

export interface IConfigurableFormComponentProps {
  id: string;
  model?: IConfigurableFormComponent;
}

export const ConfigurableFormComponent: FC<IConfigurableFormComponentProps> = memo(({id, model}) => {
  const isDrawing = useIsDrawingForm();
  const componentRef = useRef(null);
  const componentMarkupModel = ShaForm.useComponentModel(id);
  
  const componentModel = useMemo(() => 
    model?.isDynamic ? model : componentMarkupModel,
    [model, componentMarkupModel]
  );

  const ComponentRenderer = useMemo(() => 
    !isDrawing || componentModel?.isDynamic ? FormComponent : ConfigurableFormComponentDesigner,
    [isDrawing, componentModel?.isDynamic]
  );

  return (
    <ComponentRenderer componentModel={componentModel} componentRef={componentRef}  />
  );
}, (prevProps, nextProps) => {
  // Only re-render if id or model reference changes
  return prevProps.id === nextProps.id && prevProps.model === nextProps.model;
});

ConfigurableFormComponent.displayName = 'ConfigurableFormComponent';