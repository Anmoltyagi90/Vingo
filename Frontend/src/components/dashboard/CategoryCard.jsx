import React from "react";

const CategoryCard = ({ name, image, onClick }) => {
  return (
    <div
      className="relative w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-2xl border-2 border-[#ff4d2d] shrink-0 overflow-hidden bg-white shadow-xl shadow-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={ onClick}
    >
      <img
        src={image}
        alt=""
        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
      />

      <div className="absolute bottom-0 w-full left-0 bg-[#ff4d2d]/90 px-3 py-1 text-center text-sm font-semibold text-white backdrop-blur-sm">
        {name}
      </div>
    </div>
  );
};

export default CategoryCard;
