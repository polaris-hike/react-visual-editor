import {useRef, useState} from 'react';
import './app.scss';
import { useCallbackRef } from './packages/hooks/useCallbackRef';
import ReactVisualEditor from './packages/ReactVisualEditor';
import { ReactVisualEditorValue } from './packages/ReactVisualEditor.utils';
import { visualConfig } from './visual.config';
import editData from './edit.data.json';

function App() {
  const  [editorValue,setEditorValue] = useState<ReactVisualEditorValue>(editData)

  return (
    <>
    <ReactVisualEditor config={visualConfig} value={editorValue} onChange={setEditorValue} />
    </>
  );
}

export default App;
