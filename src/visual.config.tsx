import { Button, Input } from "antd";
import { createVisualConfig } from "./packages/ReactVisualEditor.utils";


export const visualConfig = createVisualConfig();

visualConfig.registryComponent('text',{
    name: '文本',
    preview: ()=> <span>预览文本</span>,
    render: (data) => <span  style={data?.size}>render 文本</span>,
})

visualConfig.registryComponent('button',{
    name: '按钮',
    preview: ()=> <Button type='primary'>预览 button</Button>,
    render: (data) => <Button type='primary' style={data?.size}>render button</Button>,
    resize: {
        width: true,
        height: true   
    }
})

visualConfig.registryComponent('input',{
    name: '输入框',
    preview: ()=> <Input />,
    render: (data) => <Input style={data?.size} />,
    resize: {
        width: true
    }
})