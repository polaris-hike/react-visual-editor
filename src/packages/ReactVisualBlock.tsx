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
    const { config,block,onMouseDown,onContextMenu,children } = props;
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
      block.focus && 'react-visual-editor-block-focus'
      ]),[block.focus])

    useEffect(() => {
        if (block.adjustPosition) {
          const {top, left} = block;
          const {height, width} = elRef.current.getBoundingClientRect();
          block.adjustPosition = false;
          block.top = top - height / 2;
          block.left = left - width / 2;
          block.width = elRef.current.offsetWidth;
          block.height = elRef.current.offsetHeight;
          forceUpdate();
        }
      }, []);

      let render:any;
      if (!!component) {
        render = component.render({
          size: block.hasResize && component.resize ? (()=>{
            let styles = {
              width: undefined as undefined | string,
              height: undefined as undefined | string
            }
            !!component.resize.width && (styles.width = `${block.width}px`);
            !!component.resize.height && (styles.height = `${block.height}px`);
            return styles;
          })() : {},
          props: block.props || {}
        })
      }

    return (
        <div className={classes} onMouseDown={onMouseDown} onContextMenu={onContextMenu} ref={elRef} style={blockStyle}>
            {render}
            {children}
        </div>
    )
}