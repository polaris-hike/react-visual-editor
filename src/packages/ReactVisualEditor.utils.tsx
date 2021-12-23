export interface ReactVisualEditorBlock {
    componentKey: string;
    top: number;
    left: number;
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