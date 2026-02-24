import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import ApiTesterPage from "./pages/ApiTesterPage";

const router = createBrowserRouter([
  { path:"/", element:<ApiTesterPage/>},
  { path:"*", element:<Navigate to="/" replace/>},
]);

export function App() {
  return (
    <RouterProvider router={router}/>
  )
}

export default App;
