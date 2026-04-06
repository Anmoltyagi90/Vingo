import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SERVER_ITEM } from "../../../utils/contanst.js";

const UserOrderCard = ({ order }) => {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState({}); //itemid:rating

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const shopOrder = order.shopOrders?.[0];
  const isDelivered =
    (shopOrder?.status || "").trim().toLowerCase() === "delivered";

  const getStatusColor = (status) => {
    const value = (status || "").toLowerCase();

    switch (value) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "preparing":
        return "text-blue-600 bg-blue-100";
      case "out of delivery":
      case "out for delivery":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleRating = async ({ itemId, rating }) => {
    try {
      await axios.post(
        `${SERVER_ITEM}/rating`,
        { itemId, rating },
        {
          withCredentials: true,
        },
      );

      setSelectedRating((prev) => ({
        ...prev,
        [String(itemId)]: rating,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 border">
      {/* Top Section */}
      <div className="flex justify-between items-start border-b pb-2">
        <div>
          <p className="font-semibold text-gray-800">
            Order #{order._id.slice(-6)}
          </p>
          <p className="text-sm text-gray-500">
            Date: {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="text-right">
          {order.paymentMethod == "cod" ? (
            <p className="text-sm text-gray-500">
              {order.paymentMethod?.toUpperCase()}
            </p>
          ) : (
            <p className="text-sm text-gray-500 font-semibold">
              {order.payment ? "true" : "false"}
            </p>
          )}

          <p
            className={`inline-block px-2 py-1 rounded text-sm font-medium capitalize ${getStatusColor(
              shopOrder?.status,
            )}`}
          >
            {shopOrder?.status}
          </p>
        </div>
      </div>

      {/* Shop Name */}
      <p className="font-medium text-gray-800 mt-3">{shopOrder?.shop?.name}</p>

      {/* Items */}
      <div className="flex gap-4 mt-3 flex-wrap overflow-x-auto pb-2">
        {shopOrder?.shopOrderItems?.map((lineItem, index) => {
          const product = lineItem.item;
          const productId = product?._id ?? product;
          const idKey =
            productId != null && productId !== "" ? String(productId) : null;
          const savedRating = idKey ? selectedRating[idKey] : undefined;

          return (
            <div
              key={idKey ?? index}
              className="shrink-0 w-40 border rounded-lg p-2 bg-white"
            >
              <img
                src={product?.image}
                alt={product?.name}
                className="w-full h-24 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
              />

              <p className="text-sm font-medium mt-1">
                {product?.name ?? lineItem.name}
              </p>

              <p className="text-xs text-gray-500">
                Qty: {lineItem.quantity} × ₹{lineItem.price}
              </p>

              {isDelivered && idKey && (
                <div
                  className="flex gap-0.5 mt-2"
                  role="group"
                  aria-label="Rate item"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        handleRating({ itemId: productId, rating: star })
                      }
                      disabled={!!savedRating}
                      className={`text-lg leading-none p-0 min-w-[1.25rem] disabled:opacity-60 disabled:cursor-not-allowed ${
                        savedRating >= star
                          ? "text-yellow-400"
                          : "text-gray-400 hover:text-yellow-300"
                      }`}

                    >
                      ★
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="flex justify-between items-center border-t mt-4 pt-2">
        <p className="font-medium">Subtotal: ₹{shopOrder?.subtotal}</p>
        <p
          className={`px-2 py-1 rounded text-sm font-medium capitalize ${getStatusColor(
            shopOrder?.status,
          )}`}
        >
          {shopOrder?.status}
        </p>
      </div>

      <div className="flex justify-between items-center border-t pt-2">
        <p className="font-semibold">Total:₹{order.totalAmount}</p>
        <button
          className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
          onClick={() => navigate(`/track-orders/${order._id}`)}
        >
          Track Order
        </button>
      </div>
    </div>
  );
};

export default UserOrderCard;
