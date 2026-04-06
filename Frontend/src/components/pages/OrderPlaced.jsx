import React from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const OrderPlaced = () => {
  const navigate = useNavigate();

  const orderId = "ORD123456"; // later API se lena
  const estimatedTime = "30-40 mins";

  return (
    <div className="min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden">
      {/* Success Icon */}
      <div className="bg-green-100 p-6 rounded-full mb-6 animate-bounce">
        <FaCircleCheck className="text-green-600 text-6xl" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Order Placed Successfully 🎉
      </h1>

      <p className="text-gray-600 max-w-md mb-6 ">
        Thank you for ypur purchase. Your order is being prepared.You can track
        your order status in the "My Orders" Section.
      </p>

      {/* Order ID */}
      <p className="text-gray-600 mb-2">
        Order ID: <span className="font-semibold">{orderId}</span>
      </p>

      {/* Estimated Delivery */}
      <p className="text-gray-600 mb-6">
        Estimated Delivery Time:{" "}
        <span className="font-semibold">{estimatedTime}</span>
      </p>

      {/* Button */}
      <button
        onClick={() => navigate("/my-orders")}
        className="bg-[#ff4d2d]  text-white px-6 py-3 rounded-lg hover:bg-[#e64526] transition duration-300"
      >
        View My Orders
      </button>
    </div>
  );
};

export default OrderPlaced;
