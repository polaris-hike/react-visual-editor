import './ReactVisualEditor.scss';
import { ReactVisualConfig, ReactVisualEditorValue } from './ReactVisualEditor.utils';

const ReactVisualEditor: React.FC<{
    value: ReactVisualEditorValue,
    onChange: (val: ReactVisualEditorValue) => void,
    config: ReactVisualConfig
}> = (props) => {
    console.log(props)
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
            <section className="react-visual-editor-body">body</section>
        </div>
    )
}


export default ReactVisualEditor;