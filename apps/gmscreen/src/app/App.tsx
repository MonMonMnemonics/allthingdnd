import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import AttRollComparison from "./pages/AttRollComparison";

const router = createBrowserRouter([
  { path:"/", element:<AttRollComparison/>},
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
