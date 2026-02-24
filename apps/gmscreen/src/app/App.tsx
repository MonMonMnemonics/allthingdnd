import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Homepage from "./pages/Homepage";
import NewCharacter from "./pages/NewCharacter";

const router = createBrowserRouter([
  { path:"/", element:<Homepage/>},
  { path:"/new-character", element:<NewCharacter/>},
  { path:"*", element:<Navigate to="/" replace/>},
]);

export function App() {
  return (
    <div className="w-screen h-screen">
      <RouterProvider router={router}/>
    </div>    
  )
}

export default App;
