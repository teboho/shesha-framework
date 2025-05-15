import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = () => {
  const searchableTabsId = nanoid();
  const commonTabId = nanoid();
  const dataTypeTabId = nanoid();

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
                  propertyName: 'name',
                  label: 'Name',
                  parentId: commonTabId,
                  inputType: 'textField',
                  size: 'small',
                  validate: {
                    required: true,
                  },
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'label',
                  label: 'Label',
                  parentId: commonTabId,
                  size: 'small',
                  inputType: 'textField',
                  validate: {
                    required: true,
                  },
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'description',
                  label: 'Description',
                  parentId: commonTabId,
                  inputType: 'textArea',
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'propertySource',
                  label: 'Source',
                  parentId: commonTabId,
                  inputType: 'dropdown',
                  jsSetting: true,
                  dropdownOptions: [
                    { label: 'Configuration', value: 'configuration' },
                    { label: 'Code', value: 'code' },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'dynamicConfiguration',
                  label: 'Provider',
                  parentId: commonTabId,
                  inputType: 'dynamicItemsConfigurator',
                  hidden: {
                    _code: 'return data.propertySource !== "configuration";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  jsSetting: true,
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'dataType',
                  label: 'Data Type',
                  parentId: dataTypeTabId,
                  inputType: 'dropdown',
                  hidden: {
                    _code: 'return data.propertySource !== "configuration";',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  validate: {
                    required: true,
                  },
                  editMode: {
                    _value: 'inherited',
                    _mode: 'code',
                    _code: 'return data.source != 1;',
                  } as any,
                  jsSetting: true,
                  dropdownOptions: [
                    { label: 'string', value: 'string' },
                    { label: 'date', value: 'date' },
                    { label: 'time', value: 'time' },
                    { label: 'date time', value: 'date-time' },
                    { label: 'entity', value: 'entity' },
                    { label: 'file', value: 'file' },
                    { label: 'number', value: 'number' },
                    { label: 'reference list item', value: 'reference-list-item' },
                    { label: 'boolean', value: 'boolean' },
                    { label: 'array', value: 'array' },
                    { label: 'object', value: 'object' },
                  ],
                })
                .addSettingsInput({
                  id: nanoid(),
                  propertyName: 'dataFormat',
                  label: {
                    _code:
                      'return getSettingValue(data?.dataType) === "date" ? "Date format" : getSettingValue(data?.dataType) === "date-time" ? "Date time format" : "Time format";',
                    _mode: 'code',
                    _value: 'Date format',
                  } as any,
                  parentId: dataTypeTabId,
                  inputType: 'textField',
                  hidden: {
                    _code:
                      'return !(getSettingValue(data?.dataType) === "date" || getSettingValue(data?.dataType) === "date-time" || getSettingValue(data?.dataType) === "time");',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  description:
                    'Enter the format for this property. Also, note that you can use moment display options. See https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/',
                  jsSetting: true,
                })
                // Container for string type configuration
                .addContainer({
                  id: nanoid(),
                  propertyName: 'string-config',
                  label: 'String Configuration',
                  parentId: dataTypeTabId,
                  hidden: {
                    _code: 'return !(getSettingValue(data?.dataType) === "string");',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'dataFormat',
                        label: 'String format',
                        parentId: 'string-config',
                        inputType: 'dropdown',
                        dropdownOptions: [
                          { label: 'single line', value: 'singleline' },
                          { label: 'multiline', value: 'multiline' },
                          { label: 'html', value: 'html' },
                          { label: 'json', value: 'json' },
                          { label: 'javascript', value: 'javascript' },
                          { label: 'password', value: 'password' },
                          { label: 'email', value: 'email' },
                          { label: 'phone', value: 'phone' },
                        ],
                        jsSetting: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'minLength',
                        label: 'Min Length',
                        parentId: 'string-config',
                        inputType: 'numberField',
                        editMode: {
                          _value: 'inherited',
                          _mode: 'code',
                          _code: 'return !data.sizeHardcoded;',
                        } as any,
                        jsSetting: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'maxLength',
                        label: 'Max Length',
                        parentId: 'string-config',
                        inputType: 'numberField',
                        editMode: {
                          _value: 'inherited',
                          _mode: 'code',
                          _code: 'return !data.sizeHardcoded;',
                        } as any,
                        jsSetting: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'regExp',
                        label: 'Regular Expression',
                        parentId: 'string-config',
                        inputType: 'textField',
                        editMode: {
                          _value: 'inherited',
                          _mode: 'code',
                          _code: 'return !data.regExpHardcoded;',
                        } as any,
                        jsSetting: true,
                      })
                      .toJson(),
                  ],
                })
                // Container for number type configuration
                .addContainer({
                  id: nanoid(),
                  propertyName: 'number-config',
                  label: 'Number Configuration',
                  parentId: dataTypeTabId,
                  hidden: {
                    _code: 'return !(getSettingValue(data?.dataType) === "number");',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'dataFormat',
                        label: 'Number format',
                        parentId: 'number-config',
                        inputType: 'dropdown',
                        dropdownOptions: [
                          { label: 'currency', value: 'currency' },
                          { label: 'double', value: 'double' },
                          { label: 'round', value: 'round' },
                          { label: 'thousand separator', value: 'thousandSeparator' },
                        ],
                        jsSetting: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'min',
                        label: 'Min',
                        parentId: 'number-config',
                        inputType: 'numberField',
                        editMode: {
                          _value: 'inherited',
                          _mode: 'code',
                          _code: 'return !data.sizeHardcoded;',
                        } as any,
                        jsSetting: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'max',
                        label: 'Max',
                        parentId: 'number-config',
                        inputType: 'numberField',
                        editMode: {
                          _value: 'inherited',
                          _mode: 'code',
                          _code: 'return !data.sizeHardcoded;',
                        } as any,
                        jsSetting: true,
                      })
                      .toJson(),
                  ],
                })
                // Container for reference list item configuration
                .addContainer({
                  id: nanoid(),
                  propertyName: 'reflist-config',
                  label: 'Reference List Configuration',
                  parentId: dataTypeTabId,
                  hidden: {
                    _code: 'return !(getSettingValue(data?.dataType) === "reference-list-item");',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'referenceListName',
                        label: 'Reference List name',
                        parentId: 'reflist-config',
                        inputType: 'textField',
                        editMode: {
                          _value: 'inherited',
                          _mode: 'code',
                          _code: 'return data.source != 1;',
                        } as any,
                        jsSetting: true,
                      })
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'referenceListNamespace',
                        label: 'Reference List namespace',
                        parentId: 'reflist-config',
                        inputType: 'textField',
                        editMode: {
                          _value: 'inherited',
                          _mode: 'code',
                          _code: 'return data.source != 1;',
                        } as any,
                        jsSetting: true,
                      })
                      .toJson(),
                  ],
                })
                // Container for entity type configuration
                .addContainer({
                  id: nanoid(),
                  propertyName: 'entity-config',
                  label: 'Entity Configuration',
                  parentId: dataTypeTabId,
                  hidden: {
                    _code: 'return !(getSettingValue(data?.dataType) === "entity");',
                    _mode: 'code',
                    _value: false,
                  } as any,
                  components: [
                    ...new DesignerToolbarSettings()
                      .addSettingsInput({
                        id: nanoid(),
                        propertyName: 'entityType',
                        label: 'Entity Type',
                        parentId: 'entity-config',
                        inputType: 'autocomplete',
                        dataSourceType: 'url',
                        dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                        editMode: {
                          _value: 'inherited',
                          _mode: 'code',
                          _code: 'return data.source != 1;',
                        } as any,
                        jsSetting: true,
                      })
                      .toJson(),
                  ],
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
