export enum EReactVisualEditorPropsType {
    text = 'text',
    select = 'select',
    color = 'color',
}


export type ReactVisualEditorProps = ReactVisualEditorTextProp | ReactVisualEditorSelectProps | ReactVisualEditorColorProps;

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