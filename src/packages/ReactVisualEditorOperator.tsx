import { Button, Form, InputNumber } from 'antd';
import deepcopy from 'deepcopy';
import { useEffect, useState } from 'react';
import './ReactVisualEditor.scss';
import { ReactVisualEditorBlock, ReactVisualEditorValue } from './ReactVisualEditor.utils';

const ReactVisualEditorOperator:React.FC<{
    selectBlock?:ReactVisualEditorBlock,
    value: ReactVisualEditorValue,
    updateValue:(val:ReactVisualEditorValue) => void,
    updateBlock: (newBlock:ReactVisualEditorBlock,oldBlock:ReactVisualEditorBlock) => void,
}> = (props) => {
    const { selectBlock, value, updateBlock, updateValue } = props;
    const [editData,setEditData] = useState({} as any);
    const [form] = Form.useForm();

    const methods = {
        apply:() => {
            if (props.selectBlock) {
                // updateBlock()
            } else {
                console.log(editData)
                updateValue({
                    ...value,
                    container:editData
                })
            }
        },
        reset:() => {
            let data:any;
            if (!!selectBlock) {
                data = deepcopy(props.selectBlock)
            } else {
                data = deepcopy(props.value.container)
            }
            setEditData(data);
            form.resetFields();
            form.setFieldsValue(data);
        },
        onFormValuesChange: (changeValues:any,values:any) => {
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
        render.push(<span>编辑block属性</span>)
    }

    useEffect(() => {
        methods.reset()
    },[selectBlock])


    return (
        <div className='react-visual-editor-operator'>
            <div className='react-visual-editor-operator-title'>
                {selectBlock ? '编辑元素' : '编辑容器'}
            </div>
            <Form form={form} layout='vertical' onValuesChange={methods.onFormValuesChange}>
                {render}
                <Form.Item key={'operator'}>
                    <Button type='primary' onClick={methods.apply} style={{marginRight:'8px'}}>应用</Button>
                    <Button onClick={methods.reset}>重置</Button>
                </Form.Item>
            </Form>
        </div>
    )
}


export default ReactVisualEditorOperator;