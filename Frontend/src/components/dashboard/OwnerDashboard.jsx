import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { FaPen, FaUtensils } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";
import { Key } from "lucide-react";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((store) => store.owner);
  const navigate = useNavigate();



  return (
    <div>
      <Nav />
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb04 text-sm sm:text-base">
                Join our food delivery platform and reach thousand of hungry
                customer every day.
              </p>

              <button
                className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 mt-3  cursor-pointer transition"
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {myShopData && (
        <div className="w-full flex flex-col items-center gap-8 px-4 sm:px-6 mt-10">
          {/* Heading */}
          <div className="flex items-center gap-3 text-center">
            <div className="bg-orange-100 p-3 rounded-full shadow-sm">
              <FaUtensils className="text-[#ff4d2d] text-2xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Welcome to{" "}
              <span className="text-[#ff4d2d]">{myShopData.name}</span>
            </h1>
          </div>

          {/* Card */}
          <div className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group border border-orange-100">
            {/* Image Section */}
            <div className="relative overflow-hidden">
              <button
                className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-md hover:bg-[#ff4d2d] hover:text-white transition-all duration-300 cursor-pointer"
                onClick={() => navigate("/create-edit-shop")}
              >
                <FaPen className="text-sm" />
              </button>

              <img
                src={myShopData.image}
                alt={myShopData.name}
                className="w-full h-56 sm:h-72 object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              {/* Shop Name Overlay */}
              <div className="absolute bottom-5 left-6 text-white z-10">
                <h2 className="text-2xl font-semibold drop-shadow-xl">
                  {myShopData.name}
                </h2>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {myShopData.name}
              </h2>

              {/* Location */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                  <span className="text-[#ff4d2d] font-medium">
                    📍 {myShopData.city}, {myShopData.state}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                  <span className="text-gray-700 text-sm">
                    🏠 {myShopData.address}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Manage your shop details, items, and grow your business with
                ease.
              </p>
            </div>
          </div>

          {myShopData.items.length == 0 && (
            <div className="flex justify-center items-center p-4 sm:p-6">
              <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:h-20 mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Add Your Food Item
                  </h2>
                  <p className="text-gray-600 mb04 text-sm sm:text-base">
                    Share your delicious creations with our customers by adding
                    them to the menu.
                  </p>

                  <button
                    className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 mt-3  cursor-pointer transition"
                    onClick={() => navigate("/add-item")}
                  >
                    Add food
                  </button>
                </div>
              </div>
            </div>
          )}

          {myShopData.items.length > 0 && (
            <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
              {myShopData.items.map((item, index) => (
                <OwnerItemCard data={item} key={index} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
