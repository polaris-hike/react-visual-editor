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

    const blockDraggier = (() => {
        const dragData = useRef({
          startX: 0,                                             // 拖拽开始时，鼠标的left
          startY: 0,                                             // 拖拽开始时，鼠标的top
          startPosArray: [] as { top: number, left: number }[]   // 拖拽开始时， 所有选中的block元素的top，left值
        })
    
        const mousedown = useCallbackRef((e: React.MouseEvent<HTMLDivElement>) => {
          document.addEventListener('mousemove',mousemove);
          document.addEventListener('mouseup',mouseup);
          dragData.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosArray: focusData.focus.map(({top,left})=>({top,left}))
          }
        });
        const mousemove = useCallbackRef((e: MouseEvent) => {
          const { startX, startY, startPosArray } = dragData.current;
          const { clientX: moveX, clientY: moveY} = e;
          const durX = moveX - startX, durY = moveY - startY;
          focusData.focus.forEach((block,index)=>{
            const {left,top} = startPosArray[index]
            block.top = top + durY;
            block.left = left + durX;
            blockChoseMethods.updateBlocks(props.value.blocks)
          })
        });
        const mouseup = useCallbackRef((e: MouseEvent) => {
          document.removeEventListener('mousemove',mousemove);
          document.removeEventListener('mouseup',mouseup);
        });
    
        return {mousedown,mousemove,mouseup}
      })();

    const focusData = useMemo(() => {
        const focus: ReactVisualEditorBlock[] = [];
        const unFocus: ReactVisualEditorBlock[] = [];
        props.value.blocks.forEach(block => {(block.focus ? focus : unFocus).push(block);});
        return {focus, unFocus};
      }, [props.value.blocks]);

    const focusHandler = (() => {
        const mouseDownBlock = (e: React.MouseEvent<HTMLDivElement>, block: ReactVisualEditorBlock) => {
            e.stopPropagation();
            console.log('block')
          if (e.ctrlKey) {
            /*如果摁住了ctrl键，如果此时没有选中的block，就选中这个block，否则令这个block的选中状态取反*/
            if (focusData.focus.length <= 1) {
              block.focus = true;
            } else {
              block.focus = !block.focus;
            }
            blockChoseMethods.updateBlocks(props.value.blocks);
          } else {
            /*如果点击的这个block没有被选中，才清空其他选中的block。否则不做任何事情。*/
            if (!block.focus) {
              block.focus = true;
              blockChoseMethods.clearFocus(block);
            }
          }
          setTimeout(()=>blockDraggier.mousedown(e))
        };
        const mouseDownContainer = (e: React.MouseEvent<HTMLDivElement>) => {
            console.log('container')
        //   if (e.target != e.currentTarget) {return;}
          if (!e.shiftKey) {blockChoseMethods.clearFocus();}
        };
        return {mouseDownBlock, mouseDownContainer};
      })();
    
      const blockChoseMethods = {
        /**
         * 更新blocks，触发重新渲染
         * @author 邬绪威
         * @date 2021/3/7 17:40
         */
        updateBlocks: (blocks: ReactVisualEditorBlock[]) => {props.onChange({...props.value, blocks: [...blocks]});},
        /**
         * 清空选中的元素
         * @author 邬绪威
         * @date 2021/3/7 17:40
         */
        clearFocus: (external?: ReactVisualEditorBlock) => {
          (!!external ? focusData.focus.filter(item => item !== external) : focusData.focus).forEach(block => block.focus = false);
          blockChoseMethods.updateBlocks(props.value.blocks);
        }
      };
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
                <div className='react-visual-editor-container' onMouseDown={focusHandler.mouseDownContainer} ref={containerRef} style={containerStyle}>
                    {
                        value.blocks.map((block, index) => (
                            <ReactVisualBlock key={index} block={block} onMouseDown={e => focusHandler.mouseDownBlock(e, block)} config={config}/>
                        ))
                    }
                </div>
            </section>
        </div>
    )
}


export default ReactVisualEditor;