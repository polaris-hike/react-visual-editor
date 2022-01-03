import { Button, Form, Input, InputNumber, Select } from 'antd';
import deepcopy from 'deepcopy';
import { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import { EReactVisualEditorPropsType, ReactVisualEditorProps } from './ReactVisualEditor.props';
import './ReactVisualEditor.scss';
import { ReactVisualConfig, ReactVisualEditorBlock, ReactVisualEditorValue } from './ReactVisualEditor.utils';

const ReactVisualEditorOperator: React.FC<{
    selectBlock?: ReactVisualEditorBlock,
    value: ReactVisualEditorValue,
    config: ReactVisualConfig,
    updateValue: (val: ReactVisualEditorValue) => void,
    updateBlock: (newBlock: ReactVisualEditorBlock, oldBlock: ReactVisualEditorBlock) => void,
}> = (props) => {
    const { selectBlock, value, config, updateBlock, updateValue } = props;
    const [editData, setEditData] = useState({} as any);
    const [form] = Form.useForm();

    const methods = {
        apply: () => {
            if (selectBlock) {
                updateBlock(deepcopy(editData),selectBlock)
            } else {
                updateValue({
                    ...value,
                    container: editData
                })
            }
        },
        reset: () => {
            let data: any;
            if (!!selectBlock) {
                data = deepcopy(selectBlock)
            } else {
                data = deepcopy(value.container)
            }
            setEditData(data);
            form.resetFields();
            form.setFieldsValue(data);
        },
        onFormValuesChange: (changeValues: any, values: any) => {
            setEditData({
                ...editData,
                ...values
            })
        }
    }

    let render: JSX.Element[] = [];
    if (!selectBlock) {
        render.push(
            <Form.Item label="宽度" name="width" key="container-width">
                <InputNumber step={100} min={0} precision={0} />
            </Form.Item>
        )
        render.push(
            <Form.Item label="高度" name="height" key="container-height">
                <InputNumber step={100} min={0} precision={0} />
            </Form.Item>
        )
    } else {
        const component = config.componentMap[selectBlock.componentKey];
        if (component) {
            render.push(...Object.entries(component.props || {}).map(([propName, propConfig]) => renderEditor(propName,propConfig)))
        }
    }

    useEffect(() => {
        methods.reset()
    }, [selectBlock])


    return (
        <div className='react-visual-editor-operator'>
            <div className='react-visual-editor-operator-title'>
                {selectBlock ? '编辑元素' : '编辑容器'}
            </div>
            <Form form={form} layout='vertical' onValuesChange={methods.onFormValuesChange}>
                {render}
                <Form.Item key={'operator'}>
                    <Button type='primary' onClick={methods.apply} style={{ marginRight: '8px' }}>应用</Button>
                    <Button onClick={methods.reset}>重置</Button>
                </Form.Item>
            </Form>
        </div>
    )
}

function renderEditor(propsName: string, propsConfig: ReactVisualEditorProps) {
    switch (propsConfig.type) {
        case EReactVisualEditorPropsType.text:
            return (
                <Form.Item label={propsConfig.name} name={['props',propsName]} key={`prop_${propsName}`}>
                    <Input />
                </Form.Item>
            )
        case EReactVisualEditorPropsType.select:
            return (
                <Form.Item label={propsConfig.name} name={['props',propsName]} key={`prop_${propsName}`}>
                    <Select>
                        {
                            propsConfig.options && propsConfig.options.map((opt, index) => (
                                <Select.Option value={opt.value} key={index}>
                                    {opt.label}
                                </Select.Option>
                            ))
                        }
                    </Select>
                </Form.Item>
            )
        case EReactVisualEditorPropsType.color:
            return (
                <Form.Item label={propsConfig.name} name={['props',propsName]} key={`prop_${propsName}`}>
                     <SketchPicker />
                </Form.Item>
            )
    }
}


export default ReactVisualEditorOperator;