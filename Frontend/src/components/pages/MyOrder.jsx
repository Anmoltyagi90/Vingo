import React, { useEffect } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../dashboard/UserOrderCard";
import OwnerOrderCard from "../dashboard/OwnerOrderCard";
import useGetMyOrders from "../../hooks/useGetMyOrders";
import {
  addMyOrder,
  updateRealtimeOrderStatus,
} from "../../../redux/userSlice.js";

const MyOrder = () => {
  useGetMyOrders();
  const { userData, myOrders, socket } = useSelector((store) => store.user);
  // console.log(myOrders);
  // console.log(userData);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      const incomingShopOrder = Array.isArray(data?.shopOrders)
        ? data.shopOrders[0]
        : data?.shopOrders;
      const ownerId =
        incomingShopOrder?.owner?._id || incomingShopOrder?.owner || null;
      if (ownerId && String(ownerId) === String(userData?._id)) {
        const normalizedOrder = {
          ...data,
          shopOrders: Array.isArray(data?.shopOrders)
            ? data.shopOrders
            : data?.shopOrders
              ? [data.shopOrders]
              : [],
        };
        dispatch(addMyOrder(normalizedOrder));
      }
    };

    const handleUpdateStatus = ({ orderId, shopId, status, userId }) => {
      // backend already emits only to the customer socket, but keep this guard
      if (!userData?._id || String(userId) !== String(userData._id)) return;
      dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }));
    };

    socket.on("update-status", handleUpdateStatus);
    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("update-status", handleUpdateStatus);
    };
  }, [socket, userData, dispatch]);
  return (
    <div className="min-h-screen w-full bg-[#fff9f6] flex justify-center px-4">
      <div className="w-full max-w-[800px] p-4">
        <div className="flex items-center gap-[20px] mb-6">
          <div className=" z-[10]" onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-3xl font-bold text-start">Your Orders</h1>
        </div>
        <div className="space-y-3">
          {Array.isArray(myOrders) && myOrders.length > 0 ? (
            <>
              {userData?.role === "user" &&
                myOrders.map((order) => (
                  <UserOrderCard key={order._id} order={order} />
                ))}

              {userData?.role === "owner" &&
                myOrders.map((order) => (
                  <OwnerOrderCard key={order._id} order={order} />
                ))}
            </>
          ) : (
            <p className="text-gray-500">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrder;
