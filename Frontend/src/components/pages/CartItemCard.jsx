import React from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from "react-redux";
import {
  updateQuantity,
  removeFromCart,
} from "../../../redux/userSlice.js";

const CartItemCard = ({ data }) => {
  const dispatch = useDispatch();

  const handleIncrease = () => {
    dispatch(
      updateQuantity({
        id: data.id,
        quantity: data.quantity + 1,
      })
    );
  };

  const handleDecrease = () => {
    if (data.quantity > 1) {
      dispatch(
        updateQuantity({
          id: data.id,
          quantity: data.quantity - 1,
        })
      );
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(data.id));
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow border mb-4">
      <div className="flex items-center gap-4">
        <img
          src={data.image}
          alt={data.name}
          className="w-[120px] h-[120px] object-cover rounded-lg border"
        />

        <div>
          <h1 className="font-medium text-gray-800">
            {data.name}
          </h1>

          <p className="text-sm text-gray-500">
            ₹{data.price} × {data.quantity}
          </p>

          <p className="font-bold text-gray-900">
            ₹{data.price * data.quantity}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
          onClick={handleDecrease}
        >
          <FaMinus />
        </button>

        <span className="text-lg font-semibold">
          {data.quantity}
        </span>

        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
          onClick={handleIncrease}
        >
          <FaPlus />
        </button>

        <button
          onClick={handleRemove}
          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 cursor-pointer"
        >
          <CiTrash size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;