import React, { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import {
  FaDrumstickBite,
  FaLeaf,
  FaStar,
  FaRegStar,
  FaMinus,
  FaPlus,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../redux/userSlice";

const FoodCard = ({ data }) => {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();

  const { cartItems } = useSelector((store) => store.user);

  // ⭐ Rating Stars
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= roundedRating ? (
          <FaStar key={i} className="text-yellow-500 text-sm" />
        ) : (
          <FaRegStar key={i} className="text-yellow-500 text-sm" />
        )
      );
    }
    return stars;
  };

  // ➕ Increase
  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  // ➖ Decrease
  const handleDecrease = () => {
    setQuantity((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // 🛒 Add to cart
  const handleAddToCart = () => {
    if (quantity === 0) return;

    dispatch(
      addToCart({
        id: data._id,
        name: data.name,
        price: data.price,
        image: data.image,
        shop: data.shop,
        quantity,
        foodType: data.foodType,
      })
    );
  };

  const isAdded = cartItems.some((i) => i.id === data._id);

  return (
    <div className="w-full sm:w-[220px] md:w-[240px] rounded-2xl border border-orange-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Image Section */}
      <div className="relative w-full h-[140px] sm:h-[160px] overflow-hidden">
        <img
          src={data.image}
          alt={data.name}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
        />

        {/* Veg / Non-Veg Icon */}
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
          {data.foodType === "veg" ? (
            <FaLeaf size={16} className="text-green-600" />
          ) : (
            <FaDrumstickBite size={16} className="text-red-600" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-3">
        
        {/* Food Name */}
        <h1 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
          {data.name}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          {renderStars(data.rating?.average)}
          <span className="text-xs text-gray-500">
            ({data.rating?.count || 0})
          </span>
        </div>

        {/* Price + Controls */}
        <div className="flex items-center justify-between mt-3">
          
          {/* Price */}
          <span className="font-bold text-gray-900 text-base sm:text-lg">
            ₹{data.price}
          </span>

          {/* Quantity + Cart */}
          <div className="flex items-center gap-1">
            
            {/* Minus */}
            <button
              className="p-1 rounded-full border hover:bg-gray-100"
              onClick={handleDecrease}
            >
              <FaMinus size={12} />
            </button>

            {/* Quantity */}
            <span className="text-sm w-5 text-center">{quantity}</span>

            {/* Plus */}
            <button
              className="p-1 rounded-full border hover:bg-gray-100"
              onClick={handleIncrease}
            >
              <FaPlus size={12} />
            </button>

            {/* Add to Cart */}
            <button
              disabled={quantity === 0}
              onClick={handleAddToCart}
              className={`ml-1 p-2 rounded-full text-white transition ${
                quantity === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : isAdded
                  ? "bg-gray-800"
                  : "bg-[#ff4d2d] hover:bg-orange-600"
              }`}
            >
              <FaShoppingCart size={14} />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default FoodCard;