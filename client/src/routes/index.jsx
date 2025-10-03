
import { Login } from "@/pages/auth/login";
// import { Register } from "@/pages/auth/register";
import LandingPage from "@/pages/landing";
import { createBrowserRouter } from "react-router-dom";



const router = createBrowserRouter ([
  {
    path: '/',
    element: <LandingPage/>,
    
  },
  {
    path: '/login',
    element: <Login/>
  },
  // {
  //   path: '/register',
  //   element: <Register/>
  // }
])


export default router