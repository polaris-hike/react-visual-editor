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

    // 删除
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

    // 全选
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
                    value.blocks.forEach(block => block.focus = true)
                    updateBlocks(deepcopy(blocks));
                }
            }
        },
        followQueue:false
    }); 

    // 置顶
    commander.useRegistry({
        name: 'placeTop',
        keyboard: 'ctrl+up',
        execute: () => {
            console.log('placeTop')
            let data = {
                before: deepcopy(value.blocks),
                after: deepcopy((() => {
                    const {focus, unFocus} = focusData;
                    const maxZIndex = unFocus.reduce((prev, block) => Math.max(prev, block.zIndex), -Infinity) + 1;
                    console.log(maxZIndex)
                    focus.forEach(block => block.zIndex = maxZIndex);
                    return value.blocks;
                })()),
            }
            return {
                redo: () => {
                    console.log(deepcopy(data.after))
                    updateBlocks(deepcopy(data.after))
                },
                undo: () => {
                    updateBlocks(deepcopy(data.before))
                },
            }
        }
    })

    // 置底
    commander.useRegistry({
        name: 'placeBottom',
        keyboard: 'ctrl+down',
        execute: () => {
            let data = {
                before: deepcopy(value.blocks),
                after: deepcopy((() => {
                    const {focus, unFocus} = focusData;
                    let minZIndex = unFocus.reduce((prev, block) => Math.min(prev, block.zIndex), Infinity) - 1
                    if (minZIndex < 0) {
                        const dur = Math.abs(minZIndex)
                        unFocus.forEach(block => block.zIndex += dur)
                        minZIndex = 0
                    }
                    focus.forEach(block => block.zIndex = minZIndex)
                    return deepcopy(value.blocks)
                })()),
            }
            return {
                redo: () => {
                    updateBlocks(deepcopy(data.after))
                },
                undo: () => {
                    updateBlocks(deepcopy(data.before))
                },
            }
        }
    });

    // 清空
    commander.useRegistry({
        name: 'clear',
        execute: () => {
            let data = {
                before: deepcopy(value.blocks),
                after: deepcopy([]),
            }
            return {
                redo: () => {
                    updateBlocks(deepcopy(data.after))
                },
                undo: () => {
                    updateBlocks(deepcopy(data.before))
                },
            }
        }
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
        placeTop: () => commander.state.commands.placeTop(),
        placeBottom: () => commander.state.commands.placeBottom(),
        clear: () => commander.state.commands.clear(),
    }
}