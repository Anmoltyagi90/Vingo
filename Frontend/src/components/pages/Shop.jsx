import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SERVER_ITEM } from "../../../utils/contanst";
import axios from "axios";
import { FaArrowLeft, FaStore, FaUtensils } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import FoodCard from "../dashboard/FoodCard";

const Shop = () => {
  const { shopId } = useParams();

  const [items, setItems] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchShopData = async () => {
    const safeShopId = shopId?.replace(":", "");
    if (!safeShopId) return;

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${SERVER_ITEM}/get-by-shop/${safeShopId}`,
        { withCredentials: true },
      );

      setItems(data.items || []);
      setShop(data.shop || null);
    } catch (err) {
      console.error("Error fetching shop:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, [shopId]);

  // 🔄 Loading UI
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-medium">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <button
        className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow transition"
        onClick={() => navigate("/")}
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* ❌ No Items */}
      {items.length === 0 ? (
        <div className="h-screen flex items-center justify-center text-gray-500 text-lg">
          No items found
        </div>
      ) : (
        <>
          {/* 🏪 Shop Banner */}
          {shop && (
            <div className="relative w-full h-[250px] md:h-[350px] lg:h-[400px]">
              <img
                src={shop.image}
                alt={shop.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center px-4">
                <FaStore className="text-white text-4xl mb-2" />

                <h1 className="text-3xl md:text-5xl font-bold text-white">
                  {shop.name}
                </h1>

                <div className="flex items-center gap-2 mt-2">
                  <FaLocationDot className="text-white" />
                  <p className="text-white text-sm md:text-base">
                    {shop.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 🍽 Menu Section */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
            <h2 className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-bold mb-8 text-gray-800">
              <FaUtensils className="text-red-500" />
              Our Menu
            </h2>

            {/* Grid Layout (Better UI) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <FoodCard key={item._id} data={item} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Shop;
