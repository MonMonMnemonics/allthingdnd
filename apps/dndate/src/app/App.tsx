import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import HomePage from "./pages/Homepage";
import Poll from "./pages/Poll";
import CreatePoll from "./pages/CreatePoll";

const router = createBrowserRouter([
  { path:"/", element:<HomePage/>},
  { path:"/create-poll", element:<CreatePoll/>},
  { path:"/poll/:token", element:<Poll/>},
  { path:"*", element:<Navigate to="/" replace/>},
]);

export function App() {
  return (
    <RouterProvider router={router}/>
  )
}

export default App;
