import _ from 'lodash';
import classNames from 'classnames';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';
import React, {
  FC,
  PropsWithChildren,
  useMemo,
  useCallback,
} from 'react';
import { ComponentsContainerForm } from '../formDesigner/containers/componentsContainerForm';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { Button, Form, Result } from 'antd';
import { ValidateErrorEntity } from '@/interfaces';
import { IConfigurableFormRendererProps } from './models';
import { ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useSheshaApplication } from '@/providers';
import { useStyles } from './styles/styles';
import Link from 'next/link';
import { useDelayedUpdate } from '@/providers/delayedUpdateProvider';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { ShaSpin } from '..';

const ConfigurableFormRendererComponent: FC<PropsWithChildren<IConfigurableFormRendererProps>> = ({
  children,
  form,
  parentFormValues,
  initialValues,
  beforeSubmit,
  onFinish,
  onFinishFailed,
  onSubmittedFailed,
  showDataSubmitIndicator = true,
  ...props
}) => {
  const { getPayload: getDelayedUpdates } = useDelayedUpdate(false) ?? {};

  const shaForm = useShaFormInstance();
  const { settings: formSettings, setValidationErrors } = shaForm;
  shaForm.setDataSubmitContext({ getDelayedUpdates });

  const { styles } = useStyles();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const isDragging = useFormDesignerStateSelector(x => x.isDragging) ?? false;

  // Memoize expensive computations
  const mergedProps = useMemo(() => ({
    layout: props.layout ?? formSettings.layout,
    labelCol: props.labelCol ?? formSettings.labelCol,
    wrapperCol: props.wrapperCol ?? formSettings.wrapperCol,
    colon: formSettings.colon,
  }), [props.layout, props.labelCol, props.wrapperCol, formSettings.layout, formSettings.labelCol, formSettings.wrapperCol, formSettings.colon]);

  // Memoize permission check
  const hasPermission = useMemo(() => {
    return formSettings?.access !== 4 || anyOfPermissionsGranted(formSettings?.permissions || []);
  }, [formSettings?.access, formSettings?.permissions, anyOfPermissionsGranted]);

  // Optimize event handlers with useCallback
  const onValuesChangeInternal = useCallback((_changedValues: any, values: any) => {
    shaForm.setFormData({ values: values, mergeValues: true });
  }, [shaForm]);

  const onFinishInternal = useCallback(async (): Promise<void> => {
    setValidationErrors(null);

    if (!shaForm)
      return;

    try {
      await shaForm.submitData();
    } catch (error) {
      onSubmittedFailed?.();
      setValidationErrors(error?.data?.error || error);
      console.error('Submit failed: ', error);
    }
  }, [shaForm, setValidationErrors, onSubmittedFailed]);

  const onFinishFailedInternal = useCallback((errorInfo: ValidateErrorEntity) => {
    setValidationErrors(null);
    onFinishFailed?.(errorInfo);
  }, [setValidationErrors, onFinishFailed]);

  if (!hasPermission) {
    return (
      <Result
        status="403"
        style={{ height: '100vh - 55px' }}
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary">
            <Link href={'/'}>
              Back Home
            </Link>
          </Button>
        }
      />
    );
  }

  const { /*dataLoadingState,*/ dataSubmitState } = shaForm ?? {};

  return (
    <ComponentsContainerProvider ContainerComponent={ComponentsContainerForm}>
      <ShaSpin spinning={showDataSubmitIndicator && dataSubmitState?.status === 'loading'} tip="Saving data...">
        <Form
          form={form}
          labelWrap
          size={props.size}
          onFinish={onFinishInternal}
          onFinishFailed={onFinishFailedInternal}
          onValuesChange={onValuesChangeInternal}
          initialValues={initialValues}
          className={classNames(styles.shaForm, { 'sha-dragging': isDragging }, props.className)}
          {...mergedProps}
          data-sha-form-id={shaForm.form.id}
          data-sha-form-name={`${shaForm.form.module}/${shaForm.form.name}`}
        >
          <ComponentsContainer containerId={ROOT_COMPONENT_KEY} />
          {children}
        </Form>
      </ShaSpin>
    </ComponentsContainerProvider>
  );
};

// Memoized ConfigurableFormRenderer for performance optimization
export const ConfigurableFormRenderer = React.memo<PropsWithChildren<IConfigurableFormRendererProps>>(
  ConfigurableFormRendererComponent,
  (prevProps, nextProps) => {
    // Custom comparison for optimal re-rendering
    return (
      prevProps.showDataSubmitIndicator === nextProps.showDataSubmitIndicator &&
      prevProps.layout === nextProps.layout &&
      prevProps.labelCol === nextProps.labelCol &&
      prevProps.wrapperCol === nextProps.wrapperCol &&
      prevProps.size === nextProps.size &&
      prevProps.className === nextProps.className &&
      JSON.stringify(prevProps.initialValues) === JSON.stringify(nextProps.initialValues) &&
      prevProps.onFinish === nextProps.onFinish &&
      prevProps.onFinishFailed === nextProps.onFinishFailed &&
      prevProps.onSubmittedFailed === nextProps.onSubmittedFailed &&
      prevProps.beforeSubmit === nextProps.beforeSubmit
    );
  }
);