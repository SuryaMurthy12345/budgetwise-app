import { AiOutlineHome } from "react-icons/ai";
import { BsListCheck } from "react-icons/bs";
import { FiBarChart2, FiUser } from "react-icons/fi";
import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around py-3 
      bg-gradient-to-r from-gray-900/90 via-gray-800/80 to-gray-900/90 
      backdrop-blur-md border-t border-gray-700 shadow-lg">

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs transition-all duration-300 
          ${isActive ? "text-purple-400 scale-110" : "text-gray-400 hover:text-purple-300"}`
        }
      >
        <AiOutlineHome size={22} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/transactions/Transactions"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs transition-all duration-300 
          ${isActive ? "text-purple-400 scale-110" : "text-gray-400 hover:text-purple-300"}`
        }
      >
        <BsListCheck size={22} />
        <span>Transactions</span>
      </NavLink>

      <NavLink
        to="/budget"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs transition-all duration-300 
          ${isActive ? "text-purple-400 scale-110" : "text-gray-400 hover:text-purple-300"}`
        }
      >
        <FiBarChart2 size={22} />
        <span>Budget</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs transition-all duration-300 
          ${isActive ? "text-purple-400 scale-110" : "text-gray-400 hover:text-purple-300"}`
        }
      >
        <FiUser size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
