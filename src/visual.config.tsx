import { Button, Input, Select } from "antd";
import { createColorProps, createSelectProps, createTableProps, createTextProps } from "./packages/ReactVisualEditor.props";
import { createVisualConfig } from "./packages/ReactVisualEditor.utils";


export const visualConfig = createVisualConfig();

visualConfig.registryComponent('text',{
    name: '文本',
    preview: ()=> <span>预览文本</span>,
    render: ({props}) =><span style={{
        color: !props.color ? '' : props.color.hex,
        fontSize: props.size,
    }}>
        {props.text || '默认文本'}
    </span>,
    props: {
        text: createTextProps('显示文本'),
        color: createColorProps('字体颜色'),
        size: createSelectProps('字体大小', [
            {label: '14px', value: '14px'},
            {label: '18px', value: '18px'},
            {label: '24px', value: '24px'},
        ])
    }
})

visualConfig.registryComponent('button',{
    name: '按钮',
    preview: ()=> <Button type='primary'>预览 button</Button>,
    render: ({props, size}) =>
    <Button type={props.type || 'primary'}
            size={props.size}
            style={size}>
        {props.label || '渲染的按钮'}
    </Button>,
    resize: {
        width: true,
        height: true   
    },
    props: {
        label: createTextProps('按钮文本'),
        type: createSelectProps('按钮类型',[
            {label:'默认',value:'default'},
            {label:'基础',value:'primary'},
            {label:'线框',value:'ghost'},
            {label:'虚线',value:'dashed'},
            {label:'链接',value:'link'},
            {label:'文本',value:'text'},
        ]),
        size: createSelectProps('按钮大小',[
            {label:'大',value:'large'},
            {label:'中',value:'middle'},
            {label:'小',value:'small'},
        ])
    }
})

visualConfig.registryComponent('input',{
    name: '输入框',
    preview: ()=> <Input />,
    render: ({size,model}) => <Input value={model.default.value} onChange={model.default.onChange} style={size} />,
    resize: {
        width: true
    },
    model: {
        default: '绑定字段'
    }
})

visualConfig.registryComponent('select', {
    name: '下拉框',
    preview: () => (
        <Select>
            <Select.Option value={1234}>蛋糕</Select.Option>
        </Select>
    ),
    render: ({props,size,model}) => (
        <Select 
            value={model.default.value}
            onChange={model.default.onChange}
            style={{
                width:size.width || '225px'
            }}
            key={(props.options || []).map(({label,value}:{label:string,value:string}) => `${label}_${value}`).join('.')}>
            {   
                (props.options || []).map((opt:any,index:number) => (
                    <Select.Option value={opt.val} key={index}>{opt.label}</Select.Option>
                ))
            }
        </Select>
    ),
    resize:{
        width: true
    },
    props: {
        options: createTableProps('下拉选项','label' , [
            {name:'选项显示值',field:'label'},
            {name:'选项值',field:'value'},
            {name:'备注',field:'comments'},
        ])
    },
    model: {
        default: '绑定字段'
    }
})