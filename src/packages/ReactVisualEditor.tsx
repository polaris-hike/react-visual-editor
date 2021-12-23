import  { ReactComponentElement, useMemo, useRef } from 'react';
import { useCallbackRef } from './hooks/useCallbackRef';
import { ReactVisualBlock } from './ReactVisualBlock';
import './ReactVisualEditor.scss';
import { createVisualBlock, ReactVisualConfig, ReactVisualEditorBlock, ReactVisualEditorComponent, ReactVisualEditorValue } from './ReactVisualEditor.utils';

const ReactVisualEditor: React.FC<{
    value: ReactVisualEditorValue,
    onChange: (val: ReactVisualEditorValue) => void,
    config: ReactVisualConfig
}> = (props) => {
    const {value,config} = props;
    const containerStyle = useMemo(() => {
        return {
            height: `${value.container.height}px`,
            width: `${value.container.width}px`,
        }
    }, [value.container.width, value.container.height])
    const containerRef = useRef({} as HTMLDivElement);

    const menuDraggier = (() => {
        const dragData = useRef({
            dragComponent: null as null | ReactVisualEditorComponent
        })
        const block = {
            dragstart: useCallbackRef((e:React.DragEvent<HTMLDivElement>,dragComponent: ReactVisualEditorComponent) => {
                containerRef.current.addEventListener('dragenter',container.dragenter);
                containerRef.current.addEventListener('dragover',container.dragover);
                containerRef.current.addEventListener('dragleave',container.dragleave);
                containerRef.current.addEventListener('drop',container.drop);
                dragData.current.dragComponent = dragComponent;
            }),
            dragend: useCallbackRef((e:React.DragEvent<HTMLDivElement>) => {
                containerRef.current.removeEventListener('dragenter',container.dragenter);
                containerRef.current.removeEventListener('dragover',container.dragover);
                containerRef.current.removeEventListener('dragleave',container.dragleave);
                containerRef.current.removeEventListener('drop',container.drop);
            }),

        };

        const container = {
            dragenter: useCallbackRef((e:DragEvent) => {
                e.dataTransfer!.dropEffect = 'move';
            }),
            dragover: useCallbackRef((e:DragEvent) => {
                e.preventDefault();
            }),
            dragleave: useCallbackRef((e:DragEvent) => {
                e.dataTransfer!.dropEffect = 'none';
            }),
            drop: useCallbackRef((e:DragEvent) => {
                props.onChange({
                    ...props.value,
                    blocks:[
                        ...props.value.blocks,
                        createVisualBlock({
                            top: e.offsetY,
                            left: e.offsetX,
                            component: dragData.current.dragComponent!,
                        })
                    ]
                })
                console.log('drop')
            }),
        }
        return {block}
    })();
    return (
        <div className="react-visual-editor">
            <section className="react-visual-editor-menu">
                {
                    config.componentArray.map((component, index) => (
                        <div className="react-visual-editor-menu-component" key={index}
                            draggable
                            onDragStart={ (e)=> menuDraggier.block.dragstart(e,component)}
                            onDragEnd={menuDraggier.block.dragend}
                        >
                            {component.preview()}
                            <div className="react-visual-editor-menu-component-name">
                                {component.name}
                            </div>
                        </div>
                    ))
                }
            </section>
            <section className="react-visual-editor-head">head</section>
            <section className="react-visual-editor-operator">operator</section>
            <section className="react-visual-editor-body">
                <div className='react-visual-editor-container' ref={containerRef} style={containerStyle}>
                    {
                        value.blocks.map((block, index) => (
                            <ReactVisualBlock key={index} block={block} config={config}/>
                        ))
                    }
                </div>
            </section>
        </div>
    )
}


export default ReactVisualEditor;