export enum EReactVisualEditorPropsType {
    text = 'text',
    select = 'select',
    color = 'color',
    table = 'table',
}


export type ReactVisualEditorProps = ReactVisualEditorTextProp | ReactVisualEditorSelectProps | ReactVisualEditorColorProps | ReactVisualEditorTableProps;

interface ReactVisualEditorTextProp {
    name: string;
    type: EReactVisualEditorPropsType.text
}

export function createTextProps(name:string): ReactVisualEditorTextProp {
    return {
        name,
        type: EReactVisualEditorPropsType.text
    }
}

export type ReactVisualEditorSelectProps = {
    name:string,
    options?: { label: string, value: string}[],
    type: EReactVisualEditorPropsType.select
}

export function createSelectProps(name:string,options:{ label: string, value: string}[]):ReactVisualEditorSelectProps {
    return {
        name,
        options,
        type: EReactVisualEditorPropsType.select
    }
}

export type ReactVisualEditorColorProps = {
    name:string,
    type: EReactVisualEditorPropsType.color
}

export function createColorProps(name:string):ReactVisualEditorColorProps {
    return {
        name,
        type: EReactVisualEditorPropsType.color
    }
}

export type ReactVisualEditorTableProps = {
    name:string,
    showField: string,
    type: EReactVisualEditorPropsType.table,
    columns: {
        name: string,
        field: string
    }[],
}

export function createTableProps(name:string,showField:string,columns:{
    name: string,
    field: string
}[]):ReactVisualEditorTableProps {
    return {
        name,
        type: EReactVisualEditorPropsType.table,
        columns,
        showField
    }
}


