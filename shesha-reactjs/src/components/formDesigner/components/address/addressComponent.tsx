import React, { FC } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { HomeOutlined } from '@ant-design/icons';
import { InputProps } from 'antd/lib/input';
import ConfigurableFormItem from '../formItem';
import { AutoCompletePlaces } from '../../../';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useFormData } from '../../../../providers';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import { getSettings } from './settings';

export interface IAddressCompomentProps extends IConfigurableFormComponent {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  hideBorder?: boolean;
}

const AddressCompoment: IToolboxComponent<IAddressCompomentProps> = {
  type: 'address',
  name: 'Address',
  icon: <HomeOutlined />,
  factory: (model: IAddressCompomentProps) => {
    const { formMode } = useForm();

    const readOnly = model?.readOnly || formMode === 'readonly';

    return (
      <ConfigurableFormItem model={model}>
        {readOnly ? <ReadOnlyDisplayFormItem disabled={model?.disabled} /> : <AutoCompletePlacesField {...model} />}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: data => getSettings(data),
  validateSettings: model => validateConfigurableComponentSettings(getSettings(model), model),
};

interface IAutoCompletePlacesFieldProps extends IAddressCompomentProps {
  value?: any;
  onChange?: any;
}

const AutoCompletePlacesField: FC<IAutoCompletePlacesFieldProps> = props => {
  const { formMode } = useForm();
  const { data } = useFormData();

  const completeModel = { ...(props || {}) };

  if (typeof completeModel === 'object') {
    completeModel.readOnly = props?.readOnly || formMode === 'readonly';
  }

  const inputProps: InputProps = {
    placeholder: props?.placeholder,
    prefix: props?.prefix,
    suffix: props?.suffix,
    disabled: props?.disabled,
    bordered: !props?.hideBorder,
    readOnly: props?.readOnly,
    style: getStyle(props?.style, data),
    size: props?.size,
  };

  return (
    <AutoCompletePlaces
      className="search-input text-center"
      value={props.value}
      prefix={props?.prefix as any}
      onChange={props.onChange}
      {...inputProps}
    />
  );
};

export default AddressCompoment;
