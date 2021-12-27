import { notification } from 'antd';
import classnames from 'classnames';
import { useMemo, useRef, useState } from 'react';
import { useCallbackRef } from './hooks/useCallbackRef';
import { createEvent } from './plugins/event';
import {$$dialog} from "./service/dialog";
import { ReactVisualBlock } from './ReactVisualBlock';
import { useVisualCommand } from './ReactVisualEditor.command';
import './ReactVisualEditor.scss';
import { createVisualBlock, ReactVisualConfig, ReactVisualEditorBlock, ReactVisualEditorComponent, ReactVisualEditorValue } from './ReactVisualEditor.utils';
import { $$dropdown, DropdownItem } from './service/dropdown';

const ReactVisualEditor: React.FC<{
  value: ReactVisualEditorValue,
  onChange: (val: ReactVisualEditorValue) => void,
  config: ReactVisualConfig
}> = (props) => {
  const { value, config, onChange } = props;
  const [preview, setPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dragstart] = useState(() => createEvent())
  const [dragend] = useState(() => createEvent())

  const containerStyle = useMemo(() => {
    return {
      height: `${value.container.height}px`,
      width: `${value.container.width}px`,
    }
  }, [value.container.width, value.container.height])

  const classes = useMemo(() => classnames([
    'react-visual-editor',
    preview && 'react-visual-editor-preview',
]), [preview])

  const containerRef = useRef({} as HTMLDivElement);

  const menuDraggier = (() => {
    const dragData = useRef({
      dragComponent: null as null | ReactVisualEditorComponent
    })
    const block = {
      dragstart: useCallbackRef((e: React.DragEvent<HTMLDivElement>, dragComponent: ReactVisualEditorComponent) => {
        containerRef.current.addEventListener('dragenter', container.dragenter);
        containerRef.current.addEventListener('dragover', container.dragover);
        containerRef.current.addEventListener('dragleave', container.dragleave);
        containerRef.current.addEventListener('drop', container.drop);
        dragData.current.dragComponent = dragComponent;
        dragstart.emit();
      }),
      dragend: useCallbackRef((e: React.DragEvent<HTMLDivElement>) => {
        containerRef.current.removeEventListener('dragenter', container.dragenter);
        containerRef.current.removeEventListener('dragover', container.dragover);
        containerRef.current.removeEventListener('dragleave', container.dragleave);
        containerRef.current.removeEventListener('drop', container.drop);
      }),

    };

    const container = {
      dragenter: useCallbackRef((e: DragEvent) => {
        e.dataTransfer!.dropEffect = 'move';
      }),
      dragover: useCallbackRef((e: DragEvent) => {
        e.preventDefault();
      }),
      dragleave: useCallbackRef((e: DragEvent) => {
        e.dataTransfer!.dropEffect = 'none';
      }),
      drop: useCallbackRef((e: DragEvent) => {
        blockChoseMethods.updateBlocks([
          ...props.value.blocks,
          createVisualBlock({
            top: e.offsetY,
            left: e.offsetX,
            component: dragData.current.dragComponent!,
          })
        ]);
        setTimeout(dragend.emit);
      }),
    }
    return { block }
  })();

  const blockDraggier = (() => {
    const dragData = useRef({
      startX: 0,                                             // 拖拽开始时，鼠标的left
      startY: 0,                                             // 拖拽开始时，鼠标的top
      startPosArray: [] as { top: number, left: number }[],   // 拖拽开始时， 所有选中的block元素的top，left值
      dragging: false,
    })

    const mousedown = useCallbackRef((e: React.MouseEvent<HTMLDivElement>) => {
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);
      dragData.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosArray: focusData.focus.map(({ top, left }) => ({ top, left })),
        dragging: false,
      }
    });
    const mousemove = useCallbackRef((e: MouseEvent) => {
      if (!dragData.current.dragging) {
        dragData.current.dragging = true;
        dragstart.emit();
      };  
      const { startX, startY, startPosArray } = dragData.current;
      const { clientX: moveX, clientY: moveY } = e;
      const durX = moveX - startX, durY = moveY - startY;
      focusData.focus.forEach((block, index) => {
        const { left, top } = startPosArray[index]
        block.top = top + durY;
        block.left = left + durX;
        blockChoseMethods.updateBlocks(props.value.blocks)
      });
    });
    const mouseup = useCallbackRef((e: MouseEvent) => {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
      if (dragData.current.dragging) {
        dragend.emit();
      }
    });

    return { mousedown, mousemove, mouseup }
  })();

  const focusData = useMemo(() => {
    const focus: ReactVisualEditorBlock[] = [];
    const unFocus: ReactVisualEditorBlock[] = [];
    props.value.blocks.forEach(block => { (block.focus ? focus : unFocus).push(block); });
    return { focus, unFocus };
  }, [props.value.blocks]);

  const focusHandler = (() => {
    const mouseDownBlock = (e: React.MouseEvent<HTMLDivElement>, block: ReactVisualEditorBlock) => {
      if (preview) return;
      if (e.button === 2) return;
      // e.stopPropagation();
      // e.preventDefault();
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
      setTimeout(() => blockDraggier.mousedown(e))
    };
    const mouseDownContainer = (e: React.MouseEvent<HTMLDivElement>) => {
      if (preview) return;
      e.preventDefault()
      if (e.currentTarget !== e.target) {
          return
      }
      if (!e.shiftKey) { blockChoseMethods.clearFocus(); }
    };
    return { mouseDownBlock, mouseDownContainer };
  })();

  const blockChoseMethods = {
    /**
     * 更新blocks，触发重新渲染
     * @author 邬绪威
     * @date 2021/3/7 17:40
     */
    updateBlocks: (blocks: ReactVisualEditorBlock[]) => { props.onChange({ ...props.value, blocks: [...blocks] }); },
    /**
     * 清空选中的元素
     * @author 邬绪威
     * @date 2021/3/7 17:40
     */
    clearFocus: (external?: ReactVisualEditorBlock) => {
      (!!external ? focusData.focus.filter(item => item !== external) : focusData.focus).forEach(block => block.focus = false);
      blockChoseMethods.updateBlocks(props.value.blocks);
    },
    showBlockData: (block: ReactVisualEditorBlock) => {
      $$dialog.textarea(JSON.stringify(block), {editReadonly: true, title: '导出的JSON数据'});
    },
    importBlockData: async (block: ReactVisualEditorBlock) => {
      const text = await $$dialog.textarea('', {title: '请输入导入的节点内容'})
      try {
        const data = JSON.parse(text || '');
        console.log(data)
        console.log(block)
        commander.updateBlock(data,block);
      } catch (e) {
        console.error(e)
        notification.open({
          message: '导入失败！',
          description: '导入的数据格式不正常，请检查！'
        })
      }
    },
  };

  const commander = useVisualCommand({
    value,
    updateBlocks: blockChoseMethods.updateBlocks,
    focusData,
    dragstart,
    dragend,
    onChange: onChange,
  })

  const handler = {
    onContextMenuBlock: (e:React.MouseEvent<HTMLDivElement>, block: ReactVisualEditorBlock) => {
      e.preventDefault();
      e.stopPropagation();

      $$dropdown({
        reference:e.nativeEvent,
        render: () => (
          <>
            <DropdownItem icon="icon-place-top" onClick={commander.placeTop}>置顶节点</DropdownItem>
            <DropdownItem icon="icon-place-bottom"  onClick={commander.placeBottom}>置底节点</DropdownItem>
            <DropdownItem icon="icon-delete" onClick={commander.delete}>删除节点</DropdownItem>
            <DropdownItem icon="icon-browse" onClick={() =>blockChoseMethods.showBlockData(block)}>查看数据</DropdownItem>
            <DropdownItem icon="icon-import" onClick={() =>blockChoseMethods.importBlockData(block)}>导入数据</DropdownItem>
          </>
        )
      })
    }
  }

  const buttons: {
    label: string | (() => string),
    icon: string | (() => string),
    tip?: string | (() => string),
    handler: () => void,
  }[] = [
      { label: '撤销', icon: 'icon-back', handler: () => commander.undo(), tip: 'ctrl+z' },
      { label: '重做', icon: 'icon-forward', handler: () => commander.redo() , tip: 'ctrl+y, ctrl+shift+z' },
      {
        label: () => preview ? '编辑' : '预览',
        icon: () => preview ? 'icon-edit' : 'icon-browse',
        handler: () => {
          if (!preview) {
            blockChoseMethods.clearFocus()
          }
          setPreview(!preview)
        },
      },
      {
        label: '导入', icon: 'icon-import', handler: async () => {
          const text = await $$dialog.textarea('', {title: '请输入导入的JSON字符串'})
          try {
            const data = JSON.parse(text || '')
            commander.updateValue(data);
          } catch (e) {
            console.error(e)
            notification.open({
              message: '导入失败！',
              description: '导入的数据格式不正常，请检查！'
            })
          }
        }
      },
      {
        label: '导出',
        icon: 'icon-export',
        handler: () => $$dialog.textarea(JSON.stringify(props.value), {editReadonly: true, title: '导出的JSON数据'})
    },
      {label: '置顶', icon: 'icon-place-top', handler: () => commander.placeTop(), tip: 'ctrl+up'},
      {label: '置底', icon: 'icon-place-bottom', handler: () => commander.placeBottom(), tip: 'ctrl+down'},
      { label: '删除', icon: 'icon-delete', handler: () => commander.delete() , tip: 'ctrl+d, backspace, delete' },
      { label: '清空', icon: 'icon-reset', handler: () => commander.clear() , },
      {
        label: '关闭', icon: 'icon-close', handler: () => {
          blockChoseMethods.clearFocus()
          setEditing(false)
        },
      },
    ]

  return (
    <div className={classes}>
      <section className="react-visual-editor-menu">
        {
          config.componentArray.map((component, index) => (
            <div className="react-visual-editor-menu-component" key={index}
              draggable
              onDragStart={(e) => menuDraggier.block.dragstart(e, component)}
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
      <section className="react-visual-editor-head">
        <div className="react-visual-editor-head">
          {buttons.map((btn, index) => {
            const label = typeof btn.label === 'function' ? btn.label() : btn.label
            const icon = typeof btn.icon === 'function' ? btn.icon() : btn.icon
            return (
              <div className="react-visual-editor-head-button" onClick={btn.handler} key={index}>
                <i className={`iconfont ${icon}`} />
                <span>{label}</span>
              </div>
            )
          })}
        </div>
      </section>
      <section className="react-visual-editor-operator">operator</section>
      <section className="react-visual-editor-body">
        <div className='react-visual-editor-container' onMouseDown={focusHandler.mouseDownContainer} ref={containerRef} style={containerStyle}>
          {
            value.blocks.map((block, index) => (
              <ReactVisualBlock key={index} block={block} onContextMenu={(e) => handler.onContextMenuBlock(e,block)} onMouseDown={e => focusHandler.mouseDownBlock(e, block)} config={config} />
            ))
          }
        </div>
      </section>
    </div>
  )
}


export default ReactVisualEditor;