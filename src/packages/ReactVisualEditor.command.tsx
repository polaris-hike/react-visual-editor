import deepcopy from "deepcopy";
import { useCommander } from "./plugins/command";
import { ReactVisualEditorBlock, ReactVisualEditorValue } from "./ReactVisualEditor.utils";

export function useVisualCommand(
    {
        focusData,
        value,
        updateBlocks
    }:{
        focusData: {
            focus: ReactVisualEditorBlock[],
            unFocus: ReactVisualEditorBlock[]
        },
        value: ReactVisualEditorValue,
        updateBlocks: (blocks:ReactVisualEditorBlock[]) => void; 
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
            console.log('delet')
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

    commander.useInit();

    return {
        delete: () => commander.state.commands.delete(),
        undo: () => commander.state.commands.undo(),
        redo: () => commander.state.commands.redo(),
    }
}