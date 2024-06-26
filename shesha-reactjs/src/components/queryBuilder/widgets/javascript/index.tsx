import React from 'react';
import { BaseWidget, BasicConfig, TextFieldSettings } from '@react-awesome-query-builder/antd';
import { JavaScriptEditor } from './javaScriptEditor';

type JavaScriptWidgetType = BaseWidget & TextFieldSettings;
const JavaScriptWidget: JavaScriptWidgetType = {
  ...BasicConfig.widgets.text,
  type: 'javascript',
  factory: (props) => {
    const { value, setValue } = props;

    return (
      <JavaScriptEditor
        value={value}
        onChange={value => {
          setValue(value);
        }}
      />
    );
  },
};

export { JavaScriptWidget };