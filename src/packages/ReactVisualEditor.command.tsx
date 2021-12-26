import deepcopy from "deepcopy";
import { useRef } from "react";
import { useCallbackRef } from "./hooks/useCallbackRef";
import { useCommander } from "./plugins/command";
import { ReactVisualEditorBlock, ReactVisualEditorValue } from "./ReactVisualEditor.utils";

export function useVisualCommand(
    {
        focusData,
        value,
        updateBlocks,
        dragstart,
        dragend,
    }:{
        focusData: {
            focus: ReactVisualEditorBlock[],
            unFocus: ReactVisualEditorBlock[]
        },
        value: ReactVisualEditorValue,
        updateBlocks: (blocks:ReactVisualEditorBlock[]) => void,
        dragstart: { on: (cb: () => void) => void, off: (cb: () => void) => void },
        dragend: { on: (cb: () => void) => void, off: (cb: () => void) => void },
    }
) {
    const commander = useCommander();
    commander.useRegistry({
        name: 'delete',
        keyboard: [
            'delete',
            'ctrl+d',
            'backspace',
        ],
        execute() {
            const before = deepcopy(value.blocks);
            const after = deepcopy(focusData.unFocus);
            return {
                redo: () => {
                    updateBlocks(deepcopy(after));
                },
                undo: () => {
                    updateBlocks(deepcopy(before))
                }
            }
        },
    });

    commander.useRegistry({
        name: 'selectAll',
        keyboard: 'ctrl+a',
        execute() {
            const blocks = deepcopy(value.blocks);
            blocks.forEach((item) =>{
                item.focus = true
            })
            return {
                redo: () => {
                    updateBlocks(deepcopy(blocks));
                }
            }
        },
        followQueue:false
    }); 

    (() => {
        const dragData = useRef({before: null as null | ReactVisualEditorBlock[]})
        const handler = {
            dragstart: useCallbackRef(() => dragData.current.before = deepcopy(value.blocks)),
            dragend: useCallbackRef(() => commander.state.commands.drag()),
        }
        /**
         * 拖拽命令，适用于三种情况：
         * - 从菜单拖拽组件到容器画布；
         * - 在容器中拖拽组件调整位置
         * - 拖拽调整组件的宽度和高度；
         */
        commander.useRegistry({
            name: 'drag',
            init() {
                console.log('init')
                dragData.current = {before: null}
                dragstart.on(handler.dragstart)
                dragend.on(handler.dragend)
                return () => {
                    dragstart.off(handler.dragstart)
                    dragend.off(handler.dragend)
                }
            },
            execute() {
                const before = deepcopy(dragData.current.before!)
                const after = deepcopy(value.blocks)
                return {
                    redo: () => {
                        updateBlocks(deepcopy(after))
                    },
                    undo: () => {
                        updateBlocks(deepcopy(before))
                    },
                }
            }
        })
    })();


    commander.useInit();

    return {
        delete: () => commander.state.commands.delete(),
        undo: () => commander.state.commands.undo(),
        redo: () => commander.state.commands.redo(),
    }
}