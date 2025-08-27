import { NavLink } from "react-router-dom";
import page_not_found from "../assets/page_not_found.jpg";

const PageNotFound = () => {
  return (
    <div className="relative h-screen w-screen">
      {/* Background Image */}
      <img
        src={page_not_found}
        alt="Page not found"
        className="h-full w-full object-cover"
      />

      {/* Overlay Text + Button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
        <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-lg">
          Oops, sorry!!
        </h1>
        <p className="text-gray-200 mt-2 text-lg md:text-xl">
          The page you’re looking for doesn’t exist.
        </p>

        <NavLink
          to="/screen/profile"
          className="mt-6 px-6 py-2 bg-yellow-500 text-white text-lg rounded-lg hover:bg-yellow-600 transition"
        >
          Go Home
        </NavLink>
      </div>
    </div>
  );
};

export default PageNotFound;
