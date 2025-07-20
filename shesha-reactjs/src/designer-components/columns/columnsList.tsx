import React, { FC, useEffect, useRef, useContext, useState, Fragment } from 'react';
import { 
  draggable, 
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import { IColumnProps } from './interfaces';
import { Table, Space, Popconfirm, Button, Form, InputNumber, Modal } from 'antd';
import { MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import { createNamedContext } from '@/utils/react';

export interface IProps {
  readOnly: boolean;
  value?: object;
  onChange?: any;
}

const EditableContext = createNamedContext(null, "EditableContext");

const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch {
      // console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const DraggableRow = ({ columns, className, style, onChange, ...restProps }) => {
  const [form] = Form.useForm();
  const rowRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const rowKey = restProps['data-row-key'];
  const actualIndex = columns.findIndex(x => x.id === restProps['data-row-key']);

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return undefined;

    return combine(
      draggable({
        element,
        getInitialData: () => ({ id: rowKey, index: actualIndex }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        getData: () => ({ id: rowKey, index: actualIndex }),
        onDragEnter: () => {
          element.style.backgroundColor = '#f0f0f0';
        },
        onDragLeave: () => {
          element.style.backgroundColor = '';
        },
        onDrop: () => {
          element.style.backgroundColor = '';
        },
      })
    );
  }, [rowKey, actualIndex]);

  const rowStyle = {
    ...style,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#f0f0f0' : 'inherit',
    border: isDragging ? '1px dashed #000' : 'none',
  };

  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr
          ref={rowRef}
          className="editable-row"
          style={rowStyle}
          {...restProps}
        />
      </EditableContext.Provider>
    </Form>
  );
};

const DragHandle = () => {
  return <MenuOutlined style={{ color: '#999', cursor: 'grab' }} />;
};

export const ColumnsList: FC<IProps> = ({ value, onChange, readOnly }) => {
  const columns = value as IColumnProps[];
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    return monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const sourceData = source.data;
        const destinationData = destination.data;

        if (sourceData.id === destinationData.id) return;

        const sourceIndex = sourceData.index as number;
        const destinationIndex = destinationData.index as number;

        const reorderedColumns = reorder({
          list: columns,
          startIndex: sourceIndex,
          finishIndex: destinationIndex,
        });

        onChange(reorderedColumns);
      },
    });
  }, [columns, onChange]);

  const handleDeleteTab = (key: string) => {
    const newColumns = columns.filter(column => column.id !== key);
    onChange(newColumns);
  };

  const handleAddColumn = () => {
    const newColumn: IColumnProps = {
      id: nanoid(),
      flex: 6,
      offset: 0,
      push: 0,
      pull: 0,
      components: [],
    };

    onChange([...columns, newColumn]);
  };

  const handleSave = (row: IColumnProps) => {
    const newData = [...columns];
    const index = newData.findIndex((item) => row.id === item.id);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
      onChange(newData);
    } else {
      newData.push(row);
      onChange(newData);
    }
  };

  const tableColumns: any[] = [
    {
      title: () => <DragHandle />,
      dataIndex: 'sort',
      width: 30,
      className: 'drag-visible',
      render: () => <DragHandle />,
    },
    {
      title: 'Width',
      dataIndex: 'flex',
      editable: !readOnly,
      width: '20%',
    },
    {
      title: 'Offset',
      dataIndex: 'offset',
      width: '20%',
      editable: !readOnly,
    },
    {
      title: 'Push',
      dataIndex: 'push',
      width: '20%',
      editable: !readOnly,
    },
    {
      title: 'Pull',
      dataIndex: 'pull',
      width: '20%',
      editable: !readOnly,
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_: any, record: IColumnProps) =>
        columns.length >= 1 ? (
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteTab(record.id)} disabled={readOnly}>
            <Button danger size="small">Delete</Button>
          </Popconfirm>
        ) : null,
    },
  ].map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: IColumnProps) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const [showDialog, setShowDialog] = useState(false);

  const toggleModal = () => setShowDialog(prevVisible => !prevVisible);

  return (
    <Fragment>
      <Button onClick={toggleModal}>{readOnly ? 'View Columns' : 'Configure Columns'}</Button>

      <Modal
        title={readOnly ? 'View Columns' : 'Configure Columns'}
        open={showDialog}
        width="650px"
        onOk={toggleModal}
        okButtonProps={{ hidden: readOnly }}
        onCancel={toggleModal}
        cancelText={readOnly ? 'Close' : undefined}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div ref={containerRef}>
            <Table
              bordered
              pagination={false}
              dataSource={columns}
              columns={tableColumns}
              rowKey={r => r.id}
              components={{
                body: {
                  row: ({ className, style, ...restProps }) => (
                    <DraggableRow columns={columns} className={className} style={style} onChange={onChange} {...restProps} />
                  ),
                  cell: EditableCell,
                },
              }}
            />
          </div>
          {!readOnly && (
            <div>
              <Button type="default" onClick={handleAddColumn} icon={<PlusOutlined />}>
                Add Column
              </Button>
            </div>
          )}
        </Space>
      </Modal>
    </Fragment>
  );
};

export default ColumnsList;
