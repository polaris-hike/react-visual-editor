import { ReactComponentElement } from "react";

export interface ReactVisualEditorBlock {
    componentKey: string;
    top: number;
    left: number;
    adjustPosition:boolean;
    focus: boolean;
}

export interface ReactVisualEditorValue {
    container: {
        width: number;
        height: number;
    },
    blocks: ReactVisualEditorBlock[]
}

export interface ReactVisualEditorComponent {
    key: string;
    name: string;
    preview: () => JSX.Element;
    render: () => JSX.Element;
}

export function createVisualBlock({top,left,component}:{top:number,left:number,component:ReactVisualEditorComponent}):ReactVisualEditorBlock {
    return {
        componentKey:component.key,
        left,
        top,
        adjustPosition: true,
        focus: false
    }
}

export function createVisualConfig() {
    const componentMap:{[key: string]:ReactVisualEditorComponent} = {};
    const componentArray: ReactVisualEditorComponent[] = [];

    function registryComponent(key:string,options:Omit<ReactVisualEditorComponent,'key'>) {
        const component = componentMap[key];
        if (component) {
            componentArray.splice(componentArray.indexOf(component,1))
        }
        const newComponent = {
            key,
            ...options
        }
        componentArray.push(newComponent);
        componentMap[key] = newComponent;
    }
    
    return {componentMap,componentArray,registryComponent}
}

export type ReactVisualConfig = ReturnType<typeof createVisualConfig>