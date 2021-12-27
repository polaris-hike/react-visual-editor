import { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import { useCallbackRef } from '../../hooks/useCallbackRef';
import './index.scss';

interface DropdownOption {
    reference: {x:number,y:number} | MouseEvent | HTMLElement,
    render: () => JSX.Element | JSX.Element[] | React.ReactFragment,
}

interface DropdownInstance {
    service: (option: DropdownOption) => void,
    state: {
        option: DropdownOption,
        showFlag: boolean,
    },
    handler: {
        onClickOption: () => void
    },
}

const DropdownContext = createContext<{onClick: () => void} | undefined>(undefined);

const Dropdown:React.FC<{
    option: DropdownOption,
    onRef: (ins:{show:(opt:DropdownOption) => void}) => void;
}> = (props) => {
    const elRef = useRef({} as HTMLDivElement)
    const [option,setOption] = useState(props.option);
    const [showFlag,setShowFlag] = useState(false);

    const styles = useMemo(() => {
        let top:number,left:number;
        const { reference } = option;

        if ( 'addEventListener' in reference) {
            const {top:y,left:x}  = reference.getBoundingClientRect();
            top = y;
            left = x;
        } else if ('target' in reference) {
            const {clientY:y,clientX:x}  = reference;
            top = y;
            left = x;
        } else {
            top = reference.y;
            left = reference.x;
        }

        return {
            top: `${top}px`,
            left: `${left}px`,
            display: showFlag ? 'inline-block' : 'none'
        }
    },[option.reference, showFlag]);

    const methods = {
        show: (opt:DropdownOption) => {
            setOption(opt);
            setShowFlag(true);
        },
        close: () => {
            setShowFlag(false);
        }
    }

    const handler = {
        onClickBody: useCallbackRef((e:MouseEvent) => {
            if (elRef.current.contains(e.target as Node)) {
                
            } else {
                methods.close()
            }
        }),
        onClickDropdown: useCallbackRef(() => {
            methods.close()
        })
    }

    props.onRef(methods);

    useEffect(() => {
        document.body.addEventListener('click', handler.onClickBody);
        return () => {
            document.body.removeEventListener('click', handler.onClickBody);
        }
    },[])

    return ( 
        <DropdownContext.Provider value={{onClick: handler.onClickDropdown}}>
          <div className='dropdown-service' style={styles} ref={elRef}>
                    {option.render()}
                </div>
        </DropdownContext.Provider>
        
    )
};

export const DropdownItem: React.FC<{
    onClick?: (e:React.MouseEvent<HTMLDivElement>) => void,
    icon?: string,
}> = (props) => {
    const dropdown = useContext(DropdownContext);

    const handler = {
        onClick: (e:React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            e.preventDefault();
            dropdown?.onClick && dropdown?.onClick();
            !!props.onClick && props.onClick(e);
        }
    }
    return (
        <div className='dropdown-item' onClick={handler.onClick}>
            {!!props.icon && <i className={`iconfont ${props.icon}`} />}
            {props.children}
        </div>
    )
} 

export const $$dropdown = (() => {
    let ins: any;
    return (option: DropdownOption) => {
        if (!ins) {
            const el = document.createElement('div');
            document.body.appendChild(el);
            ReactDOM.render(<Dropdown option={option} onRef={i => ins = i} />,el)
        };
        ins.show(option);
    }
})();