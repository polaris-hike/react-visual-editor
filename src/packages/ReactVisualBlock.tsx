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
    formData: Record<string,any>,
    onFormDataChange: (formData: Record<string,any>) => void,
    customProps?: Record<string,Record<string,any>>,
    editorChildren: Record<string,undefined |( () => any)>
}> = (props) => {
    const { config,block,onMouseDown,onContextMenu,children,editorChildren } = props;
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
      if (!!block.slotName && !!editorChildren[block.slotName]){
        render = editorChildren[block.slotName]!()
      }else if (!!component) {
        render = component.render({
          block,
          custom: !block.slotName || !props.customProps ? {} :(props.customProps[block.slotName] || {}),
          size: block.hasResize && component.resize ? (()=>{
            let styles = {
              width: undefined as undefined | string,
              height: undefined as undefined | string
            }
            !!component.resize.width && (styles.width = `${block.width}px`);
            !!component.resize.height && (styles.height = `${block.height}px`);
            return styles;
          })() : {},
          props: block.props || {},
          model: Object.entries(component.model || {}).reduce((prev,item) => {
            const [modelProp,modelName] = item;
            prev[modelProp] = {
              value: !block.model || !block.model[modelProp] ? null : props.formData[block.model[modelProp]],
              onChange:(e) => {
                if (!block.model || !block.model[modelProp]) return;
                let val:any;
                if (!e ) {
                  val = e;
                } else {
                  if ( typeof e ==='object' && 'target' in e ) {
                    val = e.target.value
                  } else {
                    val = e;
                  }
                }
                props.onFormDataChange({
                  ...props.formData,
                  [block.model[modelProp]] : val
                })
              }
            }
            return prev;
          },{} as  Record<string,{value:any,onChange:(val:any) => void}>)
        })
      }

    return (
        <div className={classes} onMouseDown={onMouseDown} onContextMenu={onContextMenu} ref={elRef} style={blockStyle}>
            {render}
            {children}
        </div>
    )
}