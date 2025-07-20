'use strict';

var jsxRuntime = require('react/jsx-runtime');
var icons = require('@ant-design/icons');
var reactjs = require('@shesha-io/reactjs');
var antd = require('antd');
var nanoid = require('nanoid');
var react = require('react');

var components = [
	{
		id: "b8954bf6-f76d-4139-a850-c99bf06c8b69",
		type: "collapsiblePanel",
		propertyName: "pnlDisplay",
		label: "Display",
		labelAlign: "right",
		parentId: "root",
		hidden: false,
		isDynamic: false,
		version: 1,
		expandIconPosition: "start",
		collapsible: "header",
		collapsedByDefault: false,
		ghost: true,
		header: {
			id: "2JkE1UV7XdEQgLAcKGSq4",
			components: [
			]
		},
		content: {
			id: "pnl54bf6-f76d-4139-a850-c98bf06c8b69",
			components: [
				{
					id: "46d07439-4c18-468c-89e1-60c002ce96c5",
					type: "textField",
					propertyName: "componentName",
					parentId: "root",
					label: "ComponentName",
					version: 0,
					textType: "text",
					validate: {
						required: true
					},
					jsSetting: false
				},
				{
					id: "6d29cf2c-96fe-40ce-be97-32e9f5d0fe40",
					type: "dropdown",
					propertyName: "dividerType",
					parentId: "root",
					label: "Divider Type",
					values: [
						{
							label: "Horizontal",
							value: "horizontal",
							id: "03a48d1c-ad8a-4070-8d63-3bc7da9a61e3"
						},
						{
							label: "Vertical",
							value: "vertical",
							id: "896d291e-93f9-42c6-b5f6-7ad0dfb6d0e9"
						}
					],
					dataSourceType: "values"
				},
				{
					id: "89c6096e-c351-4185-ab49-9d98e1b638a5",
					type: "checkbox",
					propertyName: "dashed",
					parentId: "root",
					label: "Dashed"
				}
			]
		}
	},
	{
		id: "2046da88-f36d-430f-9bda-120a6325a794",
		type: "collapsiblePanel",
		propertyName: "pnlStyle",
		label: "Style",
		labelAlign: "right",
		parentId: "root",
		hidden: false,
		isDynamic: false,
		version: 1,
		expandIconPosition: "start",
		collapsible: "header",
		collapsedByDefault: false,
		ghost: true,
		header: {
			id: "2JkE1UV7XdEQgLAcKGSq3",
			components: [
			]
		},
		content: {
			id: "pnl54bf6-f76d-4139-a850-c99bf06c8b69",
			components: [
				{
					id: "dd8a6939-3071-4dd7-a630-17fba0f3451b",
					type: "codeEditor",
					propertyName: "style",
					label: "Style",
					labelAlign: "right",
					parentId: "root",
					hidden: false,
					autoSize: false,
					showCount: false,
					allowClear: false,
					validate: {
					},
					description: "A script that returns the style of the element as an object. This should conform to CSSProperties",
					exposedVariables: [
						{
							id: "6034ec34-2b5d-4320-90cd-6ed6a61a0481",
							name: "data",
							description: "Selected form values",
							type: "object"
						},
						{
							id: "4008f09b-c4dc-41cd-981c-4b0101d005c3",
							name: "globalState",
							description: "The global state of the application",
							type: "object"
						}
					]
				},
				{
					id: "d9adcd79-771f-4585-a09d-9b769f594490",
					type: "styleBox",
					propertyName: "stylingBox",
					parentId: "f47668c1-e424-4d18-850e-6d712e48211d",
					validate: {
					},
					settingsValidationErrors: [
					],
					jsSetting: false
				}
			]
		}
	}
];
var formSettings = {
	layout: "horizontal",
	colon: true,
	labelCol: {
		span: 8
	},
	wrapperCol: {
		span: 16
	},
	displayName: "DEFAULT_FORM_SETTINGS",
	__docgenInfo: {
		description: "Default form settings",
		displayName: "DEFAULT_FORM_SETTINGS",
		props: {
		}
	}
};
var settingsFormJson = {
	components: components,
	formSettings: formSettings
};

const settingsForm = settingsFormJson;
const DividerComponent = {
    type: 'divider',
    isInput: false,
    name: 'Divider',
    icon: jsxRuntime.jsx(icons.LineOutlined, {}),
    Factory: ({ model }) => {
        const { data } = reactjs.useFormData();
        const { globalState } = reactjs.useGlobalState();
        const props = {
            type: model?.dividerType,
            dashed: model?.dashed,
        };
        return (jsxRuntime.jsx(antd.Divider, { style: reactjs.getLayoutStyle(model, { data, globalState }), ...props }));
    },
    settingsFormMarkup: settingsForm,
    validateSettings: (model) => reactjs.validateConfigurableComponentSettings(settingsForm, model),
    initModel: (model) => ({
        dividerType: 'horizontal',
        dashed: false,
        ...model,
    }),
};

const getSettings = (data) => new reactjs.DesignerToolbarSettings(data)
    .addSectionSeparator({
    id: nanoid.nanoid(),
    componentName: 'separator1',
    parentId: 'root',
    label: 'Display',
})
    .addPropertyAutocomplete({
    id: nanoid.nanoid(),
    propertyName: 'name',
    componentName: 'name',
    parentId: 'root',
    label: 'Name',
    validate: { required: true },
})
    .addTextArea({
    id: nanoid.nanoid(),
    propertyName: 'description',
    componentName: 'description',
    parentId: 'root',
    label: 'Description',
    autoSize: false,
    showCount: false,
    allowClear: false,
})
    .addIconPicker({
    id: nanoid.nanoid(),
    propertyName: 'image',
    componentName: 'image',
    label: 'Image',
    description: 'Customize image. Will treat as image url when string provided',
})
    .addNumberField({
    id: nanoid.nanoid(),
    propertyName: 'imageSize',
    componentName: 'imageSize',
    label: 'Size',
    defaultValue: 45,
})
    .addTextArea({
    id: '03959ffd-cadb-496c-bf6d-b742f7f6edc6',
    propertyName: 'customVisibility',
    componentName: 'customVisibility',
    parentId: 'root',
    label: 'Custom Visibility',
    autoSize: false,
    showCount: false,
    allowClear: false,
    description: 'Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
})
    .toJson();

const EmptyComponent = {
    type: 'empty',
    isInput: false,
    name: 'Empty',
    icon: jsxRuntime.jsx(icons.FolderOpenOutlined, {}),
    Factory: ({ model }) => {
        const { description, image } = model;
        if (model.hidden)
            return null;
        return (jsxRuntime.jsx(antd.Empty, { description: description, image: image ? jsxRuntime.jsx(reactjs.ShaIcon, { iconName: image, size: 45 }) : antd.Empty.PRESENTED_IMAGE_DEFAULT }));
    },
    settingsFormMarkup: (data) => getSettings(data),
    validateSettings: (model) => reactjs.validateConfigurableComponentSettings(getSettings(model), model),
};

/* NEW_COMPONENT_IMPORT_GOES_HERE */
const formDesignerComponents = [
    {
        name: "Template",
        components: [DividerComponent, EmptyComponent],
        visible: true,
    },
];

const TEMPLATE_PLUGIN_NAME = "Shesha.Template";
const ApplicationPlugin = ({ children }) => {
    const { registerFormDesignerComponents } = reactjs.useSheshaApplication();
    react.useEffect(() => {
        registerFormDesignerComponents(TEMPLATE_PLUGIN_NAME, formDesignerComponents);
    }, []);
    return jsxRuntime.jsx(jsxRuntime.Fragment, { children: children });
};

exports.ApplicationPlugin = ApplicationPlugin;
exports.formDesignerComponents = formDesignerComponents;
//# sourceMappingURL=index.js.map
