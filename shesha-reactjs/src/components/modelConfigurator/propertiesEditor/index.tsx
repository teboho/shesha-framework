import React, { FC } from 'react';
import { Form } from 'antd';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { PropertiesEditorProvider } from './provider';
import { PropertiesEditorRenderer } from './renderer';

export interface IPropertiesEditorComponentProps {
}

export interface IPropertiesEditorProps extends IPropertiesEditorComponentProps {
    allowAdd?: Boolean;
    value?: IModelItem[];
    onChange?: (value: IModelItem[]) => void;
}

export const PropertiesEditor: FC<IPropertiesEditorProps> = (props) => {
    return (
        <PropertiesEditorProvider items={props.value} onChange={props.onChange}>
            <PropertiesEditorRenderer allowAdd={props.allowAdd} />
        </PropertiesEditorProvider>
    );
};

export const PropertiesEditorComponent: FC<IPropertiesEditorComponentProps> = () => {
    return (
        <Form.Item
        className='shaPropertiesEditorForm'
            name="properties"
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
        >
            <PropertiesEditor />
        </Form.Item>
    );
};