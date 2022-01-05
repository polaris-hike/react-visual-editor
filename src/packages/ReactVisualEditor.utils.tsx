import React from "react";
import { ReactVisualEditorProps } from "./ReactVisualEditor.props";

export interface ReactVisualEditorBlock {
    componentKey: string;
    top: number;
    left: number;
    width: number;
    height: number;
    adjustPosition: boolean;
    focus: boolean;
    zIndex: number,
    props?: Record<string, any>,
    model?: Record<string, string>,
    hasResize: boolean;
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
    render: (
        data: {
            size: { height?: string, width?: string },
            props: Record<string, any>,
            model: Record<string,any>,
        }) => JSX.Element;
    resize?: {
        width?: boolean;
        height?: boolean;
    },
    props?: { [k: string]: ReactVisualEditorProps },
    model?: {[k:string]:string}
}

export function createVisualBlock({ top, left, component }: { top: number, left: number, component: ReactVisualEditorComponent }): ReactVisualEditorBlock {
    return {
        componentKey: component.key,
        left,
        top,
        width: 0,
        height: 0,
        adjustPosition: true,
        focus: false,
        zIndex: 0,
        hasResize: false
    }
}

export function createVisualConfig() {
    const componentMap: { [key: string]: ReactVisualEditorComponent } = {};
    const componentArray: ReactVisualEditorComponent[] = [];

    function registryComponent<
        Props extends { [k: string]: ReactVisualEditorProps },
        Model extends { [k: string]: string } = {}
    >(key: string, options: {
        name: string;
        preview: () => JSX.Element;
        render: (
            data: {
                size: { height?: string, width?: string },
                props: { [k in keyof Props]: any },
                model: { [k in keyof Model]: { value: any, onChange: (val: any) => void } }
            }) => JSX.Element;
        resize?: {
            width?: boolean;
            height?: boolean;
        },
        props?: Props,
        model?: Model
    }) {
        const component = componentMap[key];
        if (component) {
            componentArray.splice(componentArray.indexOf(component, 1))
        }
        const newComponent = {
            key,
            ...options
        }
        componentArray.push(newComponent as any);
        componentMap[key] = newComponent as any;
    }

    return { componentMap, componentArray, registryComponent }
}

export type ReactVisualConfig = ReturnType<typeof createVisualConfig>