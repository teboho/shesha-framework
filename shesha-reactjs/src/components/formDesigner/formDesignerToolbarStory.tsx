import React, { FC, useState } from 'react';
import { Button, Switch } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useForm } from '../../providers/form';
import { useFormDesigner } from '../../providers/formDesigner';
import FormSettingsEditor from './formSettingsEditor';

export interface IProps {}

export const FormDesignerToolbarStory: FC<IProps> = () => {
  const { setFormMode, formMode } = useForm();
  const { readOnly } = useFormDesigner();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const onModeSwitch = (mode: boolean) => {
    setFormMode(mode ? 'designer' : 'readonly');
  };

  const onSettingsClick = () => {
    setSettingsVisible(true);
  };

  console.log('formMode ::', formMode);
  return (
    <div className="sha-designer-toolbar">
      <div className="sha-designer-toolbar-left"></div>
      <div className="sha-designer-toolbar-right">
        <Switch checkedChildren="Edit Mode" unCheckedChildren="Read only" defaultChecked onChange={onModeSwitch} />
        <Button icon={<SettingOutlined />} type="link" onClick={onSettingsClick}>
          Settings
        </Button>
        <FormSettingsEditor
          readOnly={readOnly}
          isVisible={settingsVisible}
          close={() => {
            setSettingsVisible(false);
          }}
        />
      </div>
    </div>
  );
};

export default FormDesignerToolbarStory;
