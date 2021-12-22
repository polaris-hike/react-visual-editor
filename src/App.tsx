import {useRef, useState} from 'react';
import './app.scss';
import { useCallbackRef } from './packages/hooks/useCallbackRef';

function App() {
  const [pos,setPos] = useState({
    left: 0,
    top: 0
  });

  const moveDragger = (()=>{
    const dragData = useRef({
      startTop: 0,
      startLeft: 0,
      startX: 0,
      startY: 0,
    })

    const mousedown = useCallbackRef( (e:React.MouseEvent<HTMLDivElement>) => {
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup',mouseup);
      dragData.current = {
        startTop: pos.top,
        startLeft: pos.left,
        startX: e.clientX,
        startY: e.clientY
      }
    })

    const mousemove = useCallbackRef((e: MouseEvent) => {
      const { startLeft,startTop,startX,startY } = dragData.current;
      const durX = e.clientX - startX;
      const durY = e.clientY - startY;
      setPos({
        left: startLeft + durX,
        top: startTop + durY,
      })
    })

    const mouseup = useCallbackRef((e: MouseEvent) => {
      document.removeEventListener('mousemove',mousemove);
      document.removeEventListener('mouseup',mouseup);
    })


    return {mousedown}
  })()


  return (
    <div>
     <div  style={{
       width: '50px',
       height: '50px',
       position: 'absolute',
       left:`${pos.left}px`,
       top:`${pos.top}px`,
       background: 'black'
     }}
     onMouseDown={moveDragger.mousedown}
     ></div>
    </div>
  );
}

export default App;
