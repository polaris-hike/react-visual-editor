import {useRef, useState} from 'react';
import './app.scss';
import { useCallbackRef } from './packages/hooks/useCallbackRef';
import ReactVisualEditor from './packages/ReactVisualEditor';
import { ReactVisualEditorValue } from './packages/ReactVisualEditor.utils';
import { visualConfig } from './visual.config';
import editData from './edit.data.json';
import { notification } from 'antd';

function App() {
  const  [editorValue,setEditorValue] = useState<ReactVisualEditorValue>(editData as ReactVisualEditorValue);
  const [formData,onFormDataChange] = useState({
    username:'admin',
    minLevel: 100,
    maxLevel: 200
  } as any);  
  const customProps = {
    inputComponent: {
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            console.log(e)
        }
    },
    buttonComponent: {
        onClick: () => {
            notification.open({
                message: '执行提交逻辑，校验表单数据',
                description: JSON.stringify(formData)
            })
        }
    }
}

  return (
    <>
    <ReactVisualEditor 
    customProps={customProps} 
    formData={formData} 
    onFormDataChange={onFormDataChange} 
    config={visualConfig} 
    value={editorValue} 
    onChange={setEditorValue} >
      {{
        buttonComponent:formData.username.length > 5 ? undefined: () => <button>普通按钮</button>
      }
      }
    </ReactVisualEditor>
    </>
  );
}

export default App;
