import { useEffect, useMemo, useRef } from 'react'
import { useUpdate } from './hooks/useUpdate';
import './ReactVisualEditor.scss'
import { ReactVisualConfig, ReactVisualEditorBlock } from './ReactVisualEditor.utils'

export const ReactVisualBlock: React.FC<{
    block: ReactVisualEditorBlock,
    config: ReactVisualConfig
}> = (props) => {
    const { config,block } = props;
    const component = config.componentMap[block.componentKey];
    const {forceUpdate} = useUpdate();
    const blockStyle = useMemo(() => {
        return {
          left: `${block.left}px`,
          top: `${block.top}px`,
          opacity: block.adjustPosition ? '0' : '1'
        };
      }, [block.top, block.left, block.adjustPosition]);
    const elRef = useRef({} as HTMLDivElement);

    useEffect(() => {
        if (block.adjustPosition) {
          const {top, left} = block;
          const {height, width} = elRef.current.getBoundingClientRect();
          block.adjustPosition = false;
          block.top = top - height / 2;
          block.left = left - width / 2;
          forceUpdate();
        }
      }, []);
    return (
        <div className='react-visual-editor-block' ref={elRef} style={blockStyle}>
            {component.preview()}
        </div>
    )
}