import classnames from 'classnames';
import { useEffect, useMemo, useRef } from 'react'
import { useUpdate } from './hooks/useUpdate';
import './ReactVisualEditor.scss'
import { ReactVisualConfig, ReactVisualEditorBlock } from './ReactVisualEditor.utils'

export const ReactVisualBlock: React.FC<{
    block: ReactVisualEditorBlock,
    config: ReactVisualConfig,
    onMouseDown?: (e:React.MouseEvent<HTMLDivElement>)=>void,
    onContextMenu?: (e:React.MouseEvent<HTMLDivElement>)=>void,
}> = (props) => {
    const { config,block } = props;
    const component = config.componentMap[block.componentKey];
    const {forceUpdate} = useUpdate();
    const blockStyle = useMemo(() => {
        return {
          left: `${block.left}px`,
          top: `${block.top}px`,
          zIndex: block.zIndex,
          opacity: block.adjustPosition ? '0' : '1'
        };
      }, [block.top, block.left, block.adjustPosition,block.zIndex]);
    const elRef = useRef({} as HTMLDivElement);

    const classes = useMemo(()=>classnames([
      'react-visual-editor-block',
      props.block.focus && 'react-visual-editor-block-focus'
      ]),[props.block.focus])

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
        <div className={classes} onMouseDown={props.onMouseDown} onContextMenu={props.onContextMenu} ref={elRef} style={blockStyle}>
            {component.preview()}
        </div>
    )
}