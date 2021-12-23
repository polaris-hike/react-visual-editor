import { useMemo } from 'react'
import './ReactVisualEditor.scss'
import { ReactVisualConfig, ReactVisualEditorBlock } from './ReactVisualEditor.utils'

export const ReactVisualBlock: React.FC<{
    block: ReactVisualEditorBlock,
    config: ReactVisualConfig
}> = (props) => {
    const { config,block } = props;
    const component = config.componentMap[block.componentKey]
    const blockStyle = useMemo(() => {  
        return {
            left: `${block.left}px`,
            top: `${block.top}px`,
        }
    },[block.left,block.top])
    return (
        <div className='react-visual-editor-block' style={blockStyle}>
            {component.preview()}
        </div>
    )
}