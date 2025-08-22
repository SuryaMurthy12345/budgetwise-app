import React from "react";

const Button = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-full bg-[#4B2E05] text-white font-bold shadow-lg hover:bg-[#3A2203] transition duration-200"
    >
      {text}
    </button>
  );
};

export default Button;
