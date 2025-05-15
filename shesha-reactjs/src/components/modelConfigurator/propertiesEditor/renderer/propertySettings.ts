import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = () => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTabId = nanoid();
  const validationTabId = nanoid();

  return {
    components: new DesignerToolbarSettings()
      .addSearchableTabs({
        id: searchableTabsId,
        propertyName: 'settingsTabs',
        parentId: 'root',
        label: 'Settings',
        hideLabel: true,
        labelAlign: 'right',
        size: 'small',
        tabs: [
          {
            key: 'common',
            title: 'Common',
            id: commonTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'suppress',
                  label: 'Suppress',
                  parentId: commonTabId,
                  inputType: 'switch',
                  customEnabled: 'return !data.suppressHardcoded;',
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'name',
                  label: 'Name',
                  parentId: commonTabId,
                  validate: {
                    required: true,
                  },
                  inputType: 'textField',
                  textType: 'text',
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'label',
                  label: 'Label',
                  parentId: commonTabId,
                  validate: {
                    required: true,
                  },
                  inputType: 'textField',
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'description',
                  label: 'Description',
                  parentId: commonTabId,
                  inputType: 'textArea',
                })
                .addSectionSeparator({
                  id: nanoid(),
                  parentId: commonTabId,
                  label: 'Attributes',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'audited',
                      label: 'Audited',
                      customEnabled: 'return !data.auditedHardcoded;',
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'required',
                      label: 'Required',
                      customEnabled: 'return !data.requiredHardcoded;',
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'readOnly',
                  label: 'ReadOnly',
                  parentId: commonTabId,
                  inputType: 'switch',
                  customEnabled: 'return !data.readOnlyHardcoded;',
                })
                .addSectionSeparator({
                  id: nanoid(),
                  parentId: commonTabId,
                  label: 'Cascade Update Rules',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: commonTabId,
                  hidden: {
                    _code: "return !(getSettingValue(data?.dataType) === 'entity');",
                    _mode: 'code',
                    _value: false,
                  },
                  inputs: [
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'cascadeCreate',
                      label: 'Cascade Create',
                      description: 'Allows to create child/nested entity',
                      customEnabled: 'return !data.cascadeCreateHardcoded;',
                    },
                    {
                      type: 'switch',
                      id: nanoid(),
                      propertyName: 'cascadeUpdate',
                      label: 'Cascade Update',
                      description: 'Allows to update child/nested entity',
                      customEnabled: 'return !data.cascadeUpdateHardcoded;',
                    },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'cascadeDeleteUnreferenced',
                  label: 'Cascade Delete Unreferenced',
                  parentId: commonTabId,
                  inputType: 'switch',
                  description:
                    "Delete child/nested entity if reference was removed and the child/nested entity doesn't have another references",
                  customEnabled: 'return !data.cascadeDeleteUnreferencedHardcoded;',
                })
                .toJson(),
            ],
          },
          {
            key: 'data',
            title: 'Data',
            id: dataTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'dataType',
                  label: 'Data Type',
                  parentId: dataTabId,
                  inputType: 'dropdown',
                  customEnabled: 'return data.source != 1;',
                  dropdownOptions: [
                    { label: 'String', value: 'string' },
                    { label: 'Date', value: 'date' },
                    { label: 'Time', value: 'time' },
                    { label: 'Date time', value: 'date-time' },
                    { label: 'Entity', value: 'entity' },
                    { label: 'File', value: 'file' },
                    { label: 'Number', value: 'number' },
                    { label: 'Reference list item', value: 'reference-list-item' },
                    { label: 'Boolean', value: 'boolean' },
                    { label: 'Array', value: 'array' },
                    { label: 'Object', value: 'object' },
                  ],
                  validate: {
                    required: true,
                  },
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'dataFormat',
                  label: {
                    _code:
                      "return getSettingValue(data?.dataType) === 'date' ? 'Date format' : getSettingValue(data?.dataType) === 'date-time' ? 'Date time format' : 'Time format';",
                    _mode: 'code',
                    _value: 'Date format',
                  } as any,
                  parentId: dataTabId,
                  inputType: 'textField',
                  hidden: {
                    _code:
                      "return !(getSettingValue(data?.dataType) === 'date' || getSettingValue(data?.dataType) === 'date-time' || getSettingValue(data?.dataType) === 'time');",
                    _mode: 'code',
                    _value: false,
                  },
                  description:
                    'Enter the format for this property. Also, note that you can use moment display options. See https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/',
                })
                .addSettingsInputRow({
                  id: nanoid(),
                  parentId: dataTabId,
                  hidden: {
                    _code: "return !(getSettingValue(data?.dataType) === 'entity');",
                    _mode: 'code',
                    _value: false,
                  },
                  inputs: [
                    {
                      id: nanoid(),
                      type: 'autocomplete',
                      propertyName: 'entityType',
                      label: 'Entity Type',
                      labelAlign: 'right',
                      parentId: 'root',
                      customEnabled: 'return data.source != 1;',
                      dataSourceType: 'url',
                      validate: {},
                      dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                      useRawValues: true,
                    },
                  ],
                })
                .addContainer({
                  id: nanoid(),
                  propertyName: 'string-config',
                  parentId: dataTabId,
                  hidden: {
                    _code: "return !(getSettingValue(data?.dataType) === 'string');",
                    _mode: 'code',
                    _value: false,
                  },
                  direction: 'vertical',
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'dataFormat',
                        label: 'String Format',
                        parentId: nanoid(),
                        inputType: 'dropdown',
                        dropdownOptions: [
                          { label: 'Single line', value: 'singleline' },
                          { label: 'Multiline', value: 'multiline' },
                          { label: 'Html', value: 'html' },
                          { label: 'Json', value: 'json' },
                          { label: 'Javascript', value: 'javascript' },
                          { label: 'Password', value: 'password' },
                          { label: 'Email', value: 'email' },
                          { label: 'Phone', value: 'phone' },
                        ],
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'minLength',
                        label: 'Min Length',
                        parentId: nanoid(),
                        inputType: 'numberField',
                        customEnabled: 'return !data.sizeHardcoded;',
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'maxLength',
                        label: 'Max Length',
                        parentId: nanoid(),
                        inputType: 'numberField',
                        customEnabled: 'return !data.sizeHardcoded;',
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'regExp',
                        label: 'Regular Expression',
                        parentId: nanoid(),
                        inputType: 'textField',
                        customEnabled: 'return !data.regExpHardcoded;',
                      })
                      .toJson(),
                  ],
                })
                .addContainer({
                  id: nanoid(),
                  propertyName: 'number-config',
                  parentId: dataTabId,
                  hidden: {
                    _code: "return !(getSettingValue(data?.dataType) === 'number');",
                    _mode: 'code',
                    _value: false,
                  },
                  direction: 'vertical',
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'dataFormat',
                        label: 'Number Format',
                        parentId: nanoid(),
                        inputType: 'dropdown',
                        dropdownOptions: [
                          { label: 'Currency', value: 'currency' },
                          { label: 'Double', value: 'double' },
                          { label: 'Round', value: 'round' },
                          { label: 'Thousand separator', value: 'thousandSeparator' },
                        ],
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'min',
                        label: 'Min',
                        parentId: nanoid(),
                        inputType: 'numberField',
                        customEnabled: 'return !data.sizeHardcoded;',
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'max',
                        label: 'Max',
                        parentId: nanoid(),
                        inputType: 'numberField',
                        customEnabled: 'return !data.sizeHardcoded;',
                      })
                      .toJson(),
                  ],
                })
                .addContainer({
                  id: nanoid(),
                  propertyName: 'reflist-config',
                  parentId: dataTabId,
                  hidden: {
                    _code: "return !(getSettingValue(data?.dataType) === 'reference-list-item');",
                    _mode: 'code',
                    _value: false,
                  },
                  direction: 'vertical',
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'referenceListName',
                        label: 'Reference List Name',
                        parentId: nanoid(),
                        inputType: 'textField',
                        customEnabled: 'return data.source != 1;',
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'referenceListNamespace',
                        label: 'Reference List Namespace',
                        parentId: nanoid(),
                        inputType: 'textField',
                        customEnabled: 'return data.source != 1;',
                      })
                      .toJson(),
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'entityType',
                  label: 'Entity Type',
                  parentId: dataTabId,
                  inputType: 'autocomplete',
                  hidden: {
                    _code: "return !(getSettingValue(data?.dataType) === 'entity');",
                    _mode: 'code',
                    _value: false,
                  },
                  customEnabled: 'return data.source != 1;',
                  dataSourceType: 'url',
                  dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                  useRawValues: true,
                })
                .toJson(),
            ],
          },
          {
            key: 'validation',
            title: 'Validation',
            id: validationTabId,
            components: [
              ...new DesignerToolbarSettings()
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'validationMessage',
                  label: 'Validation Message',
                  parentId: validationTabId,
                  inputType: 'textArea',
                })
                .toJson(),
            ],
          },
        ],
      })
      .toJson(),
    formSettings: {
      colon: false,
      layout: 'horizontal' as FormLayout,
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    },
  };
};
