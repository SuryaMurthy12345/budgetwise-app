import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function NavLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <Outlet />  
      </div>
      <div className="sticky bottom-0 w-full">
        <NavBar />
      </div>
    </div>
  );
}
