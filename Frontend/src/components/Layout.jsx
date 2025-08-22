import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-[#F4F0E4] px-6 py-10 overflow-hidden text-[#2F1F0F]">
      {/* Top Left Blob */}
      <svg
        className="absolute -top-32 -left-32 w-[600px] h-[600px] text-orange-300 opacity-70"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M44.4,-64.2C58.6,-54.6,72.6,-44.2,79.5,-29.4C86.4,-14.7,86.3,4.3,79.2,20.1C72.2,36,58.3,48.8,43.3,59.8C28.4,70.7,12.2,79.8,-4.6,85.3C-21.4,90.8,-42.8,92.6,-55.8,81.4C-68.9,70.2,-73.7,46.1,-78,22.4C-82.2,-1.3,-85.8,-25.7,-76.4,-40.8C-67,-55.9,-44.7,-61.7,-24.1,-70.1C-3.5,-78.5,15.4,-89.4,30.9,-85.3C46.5,-81.1,58.6,-62.2,44.4,-64.2Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Bottom Right Blob */}
      <svg
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] text-orange-400 opacity-70"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M39.3,-58.3C52.4,-48.7,66.6,-40.1,72.9,-27.4C79.3,-14.7,77.8,2,70.9,16.1C64,30.3,51.8,41.8,38.5,51.7C25.3,61.5,10.6,69.6,-4.9,75.5C-20.3,81.5,-40.6,85.4,-52.7,75.4C-64.8,65.3,-68.8,41.3,-74.7,18.1C-80.6,-5.2,-88.4,-27.6,-81.5,-44.6C-74.6,-61.6,-53.1,-73.3,-32.4,-78.5C-11.8,-83.8,8.9,-82.6,25.2,-73.3C41.5,-64,52.5,-46.6,39.3,-58.3Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Page Content */}
      <div className="z-10 w-full max-w-sm">{children}</div>
    </div>
  );
};

export default Layout;
