import { NavLink } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import { BsListCheck } from "react-icons/bs";
import { FiBarChart2, FiUser } from "react-icons/fi";

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow-sm flex justify-around py-2">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-black font-semibold" : "text-yellow-700"
          }`
        }
      >
        <AiOutlineHome size={22} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/transactions/Transactions"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-black font-semibold" : "text-yellow-700"
          }`
        }
      >
        <BsListCheck size={22} />
        <span>Transactions</span>
      </NavLink>

      <NavLink
        to="/budget"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-black font-semibold" : "text-yellow-700"
          }`
        }
      >
        <FiBarChart2 size={22} />
        <span>Budget</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-black font-semibold" : "text-yellow-700"
          }`
        }
      >
        <FiUser size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
