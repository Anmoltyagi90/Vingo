import axios from "axios";
import React, { useState } from "react";
import { MdPhone } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { SERVER_ORDER } from "../../../utils/contanst.js";
import { updateOrderStatus } from "../../../redux/userSlice.js";

const OwnerOrderCard = ({ order }) => {
  const { userData } = useSelector((store) => store.user);
  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();

  const ownerId = userData?._id;
  const shopOrders = Array.isArray(order?.shopOrders)
    ? order.shopOrders
    : order?.shopOrders
      ? [order.shopOrders]
      : [];
  const shopOrder =
    shopOrders.find(
      (o) => o?.owner?._id === ownerId || o?.owner === ownerId,
    ) || shopOrders[0];

  const handleStatusChange = async (status, orderId, shopId) => {
    console.log("New Status:", status);

    try {
      const res = await axios.post(
        `${SERVER_ORDER}/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true },
      );

      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(res.data.availableBoys);
      if (res.data) {
        console.log("Status Updated:", res.data);
      }
    } catch (error) {
      console.error(
        "Error updating status:",
        error.response?.data || error.message,
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {order?.user?.fullName}
        </h2>

        <p className="text-sm text-gray-500">{order?.user?.email}</p>

        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <MdPhone />
          <span>{order?.user?.mobile}</span>
        </p>
        {order.paymentMethod == "online" ? (
          <p className="gap-2 text-sm text-gray-600">
            Payment:{order.payment ? "True" : "False"}
          </p>
        ) : (
          <p className="gap-2 text-sm text-gray-600">
            Payment Method:{order.paymentMethod}
          </p>
        )}

        <div className="flex flex-col text-gray-600 text-sm mt-2">
          <p>{order?.deliveryAddress?.text}</p>

          <p className="text-xs text-gray-500">
            Lat: {order?.deliveryAddress?.latitude}, Lon:{" "}
            {order?.deliveryAddress?.longitude}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mt-3 flex-wrap overflow-x-auto pb-2">
        {shopOrder?.shopOrderItems?.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white"
          >
            <img
              src={item.item?.image}
              alt={item.item?.name}
              className="w-full h-24 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
            />

            <p className="text-sm font-medium mt-1">{item.item?.name}</p>

            <p className="text-xs text-gray-500">
              Qty: {item.quantity} × ₹{item.price}
            </p>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-gray-700">Status:</span>
          <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
            {shopOrder?.status}
          </span>
        </div>

        <select
          value={shopOrder.status}
          onChange={(e) =>
            handleStatusChange(e.target.value, order._id, shopOrder.shop._id)
          }
        >
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out for delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {shopOrder?.status === "out for delivery" && (
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {shopOrder?.assignedDeliveryBoy ? (
            <p>Assigned Delivery Boy:</p>
          ) : (
            <p>Available Delivery Boys:</p>
          )}

          {availableBoys?.length > 0 ? (
            availableBoys.map((b, index) => (
              <div key={b._id || index} className="text-gray-400">
                {b.fullName} - {b.mobile}
              </div>
            ))
          ) : shopOrder?.assignedDeliveryBoy ? (
            <div>
              {shopOrder.assignedDeliveryBoy.fullName}-
              {shopOrder.assignedDeliveryBoy.mobile}
            </div>
          ) : (
            <div>Waiting for delivery boy assignment...</div>
          )}
        </div>
      )}

      <div className="text-right  font-bold text-gray-800 text-sm">
        Total:₹{shopOrder?.subtotal}
      </div>
    </div>
  );
};

export default OwnerOrderCard;
