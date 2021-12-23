import { useMemo } from 'react';
import { ReactVisualBlock } from './ReactVisualBlock';
import './ReactVisualEditor.scss';
import { ReactVisualConfig, ReactVisualEditorValue } from './ReactVisualEditor.utils';

const ReactVisualEditor: React.FC<{
    value: ReactVisualEditorValue,
    onChange: (val: ReactVisualEditorValue) => void,
    config: ReactVisualConfig
}> = (props) => {
    const containerStyle = useMemo(() => {
        return {
            height: `${props.value.container.height}px`,
            width: `${props.value.container.width}px`,
        }
    }, [props.value.container.width, props.value.container.height])
    return (
        <div className="react-visual-editor">
            <section className="react-visual-editor-menu">
                {
                    props.config.componentArray.map((component, index) => (
                        <div className="react-visual-editor-menu-component" key={index}
                            draggable

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
                <div className='react-visual-editor-container' style={containerStyle}>
                    {
                        props.value.blocks.map((block, index) => (
                            <ReactVisualBlock key={index} block={block} config={props.config}/>
                        ))
                    }
                </div>
            </section>
        </div>
    )
}


export default ReactVisualEditor;