import { Routes, Route } from "react-router-dom";
import Page1 from "./page1";
import Page2 from "./page2";

function App(){
  return (
    <Routes>
      <Route path="/" element={<Page1 />} />
      <Route path="/room/:RoomId" element={<Page2 />} />
    </Routes>
  )
}

export default App;