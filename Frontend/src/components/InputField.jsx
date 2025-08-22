import React from "react";

const InputField = ({ label, type = "text", placeholder, value, onChange, name }) => {
  return (
    <div className="flex flex-col w-full mb-4">
      <label className="text-sm text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 rounded-full border border-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
    </div>
  );
};

export default InputField;
