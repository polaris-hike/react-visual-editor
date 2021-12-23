import { Button, Input } from "antd";
import { createVisualConfig } from "./packages/ReactVisualEditor.utils";


export const visualConfig = createVisualConfig();

visualConfig.registryComponent('text',{
    name: '文本',
    preview: ()=> <span>预览文本</span>,
    render: () => <span>render 文本</span>
})

visualConfig.registryComponent('button',{
    name: '按钮',
    preview: ()=> <Button>预览 button</Button>,
    render: () => <Button>render button</Button>
})

visualConfig.registryComponent('input',{
    name: '输入框',
    preview: ()=> <Input />,
    render: () => <Input />
})