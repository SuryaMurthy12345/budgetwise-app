import { createBrowserRouter } from "react-router-dom";

import NavLayout from "../pages/NavLayout";
import Home from "../pages/Home";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../auth/Login"
import Register from "../auth/Register"
import PageNotFound from "../pages/PageNotFound";
import Transactions from "../pages/transactions/Transactions"
import AddTransaction from "../pages/transactions/AddTransaction"
import Budget from "../pages/Budget"
import Profile from "../pages/profile/Profile"

const Routes = createBrowserRouter([
  {
    path: "/",
    element: <NavLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard/>
      },
      {
        path: "auth/login",
        element: (
            <Login />
        ),
      },
      {
        path: "auth/register",
        element: (
            <Register />
        ),
      },
      {
        path: "transactions/Transactions",
        element: (
            <Transactions />
        ),
      },
      {
        path: "transactions/AddTransaction",
        element: (
            <AddTransaction />
        ),
      },
      {
        path: "budget",
        element: (
            <Budget />
        ),
      },
      {
        path: "profile",
        element: (
            <Profile />
        ),
      },
     ],
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);

export default Routes;