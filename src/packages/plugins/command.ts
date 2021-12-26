import { useCallback, useEffect, useRef, useState } from "react";
import { useCallbackRef } from "../hooks/useCallbackRef";
import { KeyboardCode } from "./keyboard.code";

export interface CommandExecute {
    undo?: () => void;
    redo: () => void;
}

interface Command {
    name: string;
    keyboard?: string | string[];
    execute: (...args: any[]) => CommandExecute;
    followQueue?: boolean;                                          // 命令执行完毕后，是否需要将命令执行得到的undo redo 存入命令队列
    init?: () => ((() => void) | undefined), 
}

export function useCommander() {
    const [state] = useState(() => ({
        current: -1,
        queue: [] as CommandExecute[],
        commandArray: [] as {current:Command}[],
        commands: {} as Record<string, (...args: any[]) => void>,
        destroyList: [] as ((() => void) | undefined)[],
    }))

    const useRegistry = useCallback((command: Command) => {
        const commandRef = useRef(command);
        commandRef.current = command;

        useState(() => {
            if (state.commands[command.name]) {
                const existsIndex = state.commandArray.findIndex(item=>item.current.name === command.name);
                state.commandArray.splice(existsIndex,1)
            }
            state.commandArray.push(commandRef);
            state.commands[command.name] = (...args: any[]) => {
                const { redo, undo } = commandRef.current.execute(...args);
                redo();
                if (commandRef.current.followQueue === false) return;
                
                let {queue,current}  = state;
                if (queue.length > 0) {
                    queue = queue.slice(0, current + 1);
                    state.queue = queue
                }

                queue.push({undo,redo});
                state.current = current + 1;
            }
        })
    },[]);

    const [keyboardEvent] = useState(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement !== document.body) return;
            const { keyCode, shiftKey, altKey, ctrlKey, metaKey } = e;
            let keyString: string[] = [];
            if (ctrlKey || metaKey) keyString.push('ctrl');
            if (shiftKey) keyString.push('shift');
            if (altKey) keyString.push('alt');
            keyString.push(KeyboardCode[keyCode]);
            const keyNames = keyString.join('+');
            state.commandArray.forEach(({current:{keyboard,name}}) => {
                if (!keyboard) return;
                const keys = Array.isArray(keyboard) ? keyboard : [keyboard];
                if (keys.includes(keyNames)) {
                    state.commands[name]();
                    e.stopPropagation();
                    e.preventDefault();
                }
            })
        }
        const init = () => {
            window.addEventListener('keydown', onKeyDown, true);
            return () => {window.removeEventListener('keydown', onKeyDown, true)}
        }
        return {init};
    });

    const useInit = useCallback(() => {
        useState(() => {
            state.commandArray.forEach(command =>!!command.current.init && state.destroyList.push(command.current.init()));
            state.destroyList.push(keyboardEvent.init());
        });

        useRegistry({
            name: 'undo',
            keyboard: 'ctrl+z',
            followQueue: false,
            execute: () => {
                return {
                    redo: () => {
                        if (state.current === -1) return;
                        const queueItem = state.queue[state.current];
                        if (!!queueItem) {
                            !!queueItem.undo && queueItem.undo();
                            state.current--
                        }
                    },
                }
            }
        });

        useRegistry({
            name: 'redo',
            keyboard: [
                'ctrl+y',
                'ctrl+shift+z',
            ],
            followQueue: false,
            execute: () => {
                return {
                    redo: () => {
                        const queueItem = state.queue[state.current + 1];
                        if (!!queueItem) {
                            queueItem.redo();
                            state.current++;
                        }
                    },
                }
            }
        })
    },[])

    useEffect(() => {
        return () => {
            state.destroyList.forEach(fn => !!fn && fn())
        }
    },[])

    return {
        state,
        useRegistry,
        useInit
    }
}