import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Homepage from "./pages/Homepage";
import AttRollComparison from "./pages/AttRollComparison";
import PlayerRef from "./pages/PlayerRef";
import GmRef from "./pages/GMRef";

const router = createBrowserRouter([
  { path:"/", element:<Homepage/>},
  { path:"/att-roll-comparison", element:<AttRollComparison/>},
  { path:"/player-ref", element:<PlayerRef/>},
  { path:"/gm-ref", element:<GmRef/>},
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
