import { entitiesGet } from '@/apis/entities';
import { ConfigurableForm } from '@/components/';
import ValidationErrors from '@/components/validationErrors';
import { FormItemProvider, FormMarkupWithSettings, FormProvider, MetadataProvider, useSheshaApplication } from '@/providers';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { useFormConfiguration } from '@/providers/form/api';
import { FormIdentifier } from '@/providers/form/models';
import { getStyle } from '@/providers/form/utils';
import { get } from '@/utils/fetchers';
import {
  Button,
  notification,
  Popover,
  PopoverProps,
  Spin
} from 'antd';
import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useStyles } from '../entityReference/styles/styles';
import { getQuickViewInitialValues } from './utils';
import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';

export interface IQuickViewProps extends PropsWithChildren {
  /** The id or guid for the entity */
  entityId?: string;
  /** Identifier of the form to display on the modal */
  formIdentifier?: FormIdentifier;
  /** The Url that details of the entity are retreived */
  getEntityUrl?: string;
  /** The property froom the data to use as the label and title for the popover */
  displayProperty: string;
  /** Metadata properties of value */
  dataProperties?: { [key in string]: any }[];
  /** The width of the quickview */
  width?: number;

  className?: string;

  formType?: string;

  displayName?: string;

  initialFormData?: any;

  popoverProps?: PopoverProps;

  style?: string;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    md: { span: 8 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    md: { span: 16 },
    sm: { span: 16 },
  },
};

const QuickView: FC<Omit<IQuickViewProps, 'formType'>> = ({
  children,
  entityId,
  className,
  formIdentifier,
  getEntityUrl,
  displayProperty,
  displayName,
  initialFormData,
  width = 600,
  popoverProps,
  dataProperties = [],
  style
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [formTitle, setFormTitle] = useState(displayName);
  const [formMarkup, setFormMarkup] = useState<FormMarkupWithSettings>(null);
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const { refetch: fetchForm } = useFormConfiguration({ formId: formIdentifier, lazy: true });
  const { styles } = useStyles();

  const cssStyle = getStyle(style, formData);

  const shaFormRef = useShaFormRef();

  useEffect(() => {
    if (formIdentifier) {
      fetchForm().then((response) => {
        setFormMarkup(response);
        shaFormRef.current?.initByRawMarkup({ rawMarkup: response, initialValues: formData });
      });
    }
  }, [formIdentifier]);

  useEffect(() => {
    if (!formData && entityId && formMarkup) {
      const getUrl = getEntityUrl ?? formMarkup?.formSettings?.getUrl;
      const fetcher = getUrl
        ? get(getUrl, { id: entityId }, { base: backendUrl, headers: httpHeaders })
        : entitiesGet({ id: entityId, entityType: className }, { base: backendUrl, headers: httpHeaders });
      fetcher
        .then((resp) => {
          setFormData(resp.result);
          if (resp.result[displayProperty]) setFormTitle(resp.result[displayProperty]);
        })
        .catch((reason) => {
          notification.error({ message: <ValidationErrors error={reason} renderMode="raw" /> });
        });
    }
  }, [entityId, getEntityUrl, formMarkup]);

  const formContent = useMemo(() => {
    return formMarkup && formData ? (
      <FormItemProvider namePrefix={undefined}>
        <MetadataProvider id="dynamic" modelType={formMarkup?.formSettings.modelType}>
          <ConfigurableForm
            mode="readonly"
            {...formItemLayout}
            markup={formMarkup}
            initialValues={getQuickViewInitialValues(formData, dataProperties)}
          />
        </MetadataProvider>
      </FormItemProvider>
    ) : (
      <></>
    );
  }, [formMarkup, formData, dataProperties]);

  const render = () => {
    if (children) {
      return <div style={cssStyle}>{children}</div>;
    }

    return (
      <Button className={styles.entityReferenceBtn} style={formTitle ? cssStyle : null} type="link">
        {formTitle ?? (
          <span>
            <Spin size="small" /> Loading...
          </span>
        )}
      </Button>
    );
  };

  return (
    <Popover
      content={<div style={{ width }}>{formContent}</div>}
      title={formTitle ?? 'Quickview not configured properly'}
      {...popoverProps}
    >
      {render()}
    </Popover>
  );
};

export const GenericQuickView: FC<IQuickViewProps> = (props) => {
  const { getEntityFormId } = useConfigurationItemsLoader();
  const [formConfig, setFormConfig] = useState<FormIdentifier>(props.formIdentifier);

  useEffect(() => {
    if (props.className && !formConfig)
      getEntityFormId(props.className, props.formType ?? 'Quickview').then((formFullName) => {
        setFormConfig(formFullName);
      });
  }, [props.className, props.formType, formConfig]);

  return formConfig ? (
    <QuickView {...props} formIdentifier={formConfig} />
  ) : (
    <Button type="link">
      <span>
        <Spin size="small" /> Loading...
      </span>
    </Button>
  );
};

export default QuickView;
