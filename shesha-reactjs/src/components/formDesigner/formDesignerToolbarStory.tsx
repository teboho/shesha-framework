import React, { FC, useState } from 'react';
import { Button, Radio } from 'antd';
import { EyeOutlined, SettingOutlined } from '@ant-design/icons';
import { useForm } from '../../providers/form';
import { useFormDesigner } from '../../providers/formDesigner';
import FormSettingsEditor from './formSettingsEditor';

export interface IProps {}

export const FormDesignerToolbarStory: FC<IProps> = () => {
  const { setFormMode, formMode } = useForm();
  const { readOnly } = useFormDesigner();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const onSettingsClick = () => {
    setSettingsVisible(true);
  };

  return (
    <div className="sha-designer-toolbar">
      <div className="sha-designer-toolbar-left"></div>
      <div className="sha-designer-toolbar-right">
        <Radio.Group value={formMode} onChange={(e) => setFormMode(e.target.value)}>
          <Radio.Button value="designer">Form Designer</Radio.Button>
          <Radio.Button value="edit">
            <EyeOutlined /> Preview Edit
          </Radio.Button>
          <Radio.Button value="readonly">
            <EyeOutlined />Preview  Readonly
          </Radio.Button>
        </Radio.Group>
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
