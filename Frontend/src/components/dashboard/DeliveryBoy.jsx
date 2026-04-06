import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { SERVER_ORDER } from "../../../utils/contanst";
// import { BarChart, Trophy } from "lucide-react";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import { ClipLoader } from "react-spinners";

const DeliveryBoy = () => {
  const { userData, socket } = useSelector((store) => store.user);
  const [currentOrder, setCurrentOrder] = useState();
  const [showOtp, setShowOtp] = useState(false);
  const [availableAssignments, setAvailableAssignment] = useState([]);

  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [otp, setOtp] = useState("");
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy") return;

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setDeliveryBoyLocation({ lat: latitude, lon: longitude });

          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: userData._id,
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
        },
      );
    }

    // ✅ cleanup function (VERY IMPORTANT)
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [socket, userData]);

  const ratePerDelivery = 50;
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0,
  );

  const getAssignments = async () => {
    try {
      const res = await axios.get(`${SERVER_ORDER}/get-assignment`, {
        withCredentials: true,
      });
      console.log(res.data);
      setAvailableAssignment(res.data.assignments); // check your API response
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const res = await axios.get(`${SERVER_ORDER}/get-current-order`, {
        withCredentials: true,
      });

      setCurrentOrder(res.data);
    } catch (error) {
      console.log("ERROR:", error.response?.data); // ✅ correct place
    }
  };

  const handleSendOtp = (e) => {};

  const acceptOrder = async (assignmentId) => {
    try {
      const res = await axios.post(
        `${SERVER_ORDER}/accept-order/${assignmentId}`,
        {}, // ✅ empty body
        {
          withCredentials: true, // ✅ config yaha
        },
      );

      console.log(res.data);
      await getCurrentOrder();
    } catch (error) {
      console.log("ERROR:", error.response?.data); // ✅ correct place
    }
  };

  const sendOtp = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${SERVER_ORDER}/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        {
          withCredentials: true,
        },
      );
      setShowOtp(true);
      setLoading(false);

      console.log(res.data);
    } catch (error) {
      console.log("ERROR:", error.response?.data);
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setMessage("");
    try {
      const res = await axios.post(
        `${SERVER_ORDER}/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        {
          withCredentials: true, // ✅ config yaha
        },
      );

      console.log(res.data);
      setMessage(res.data.message);
      setCurrentOrder(null);
      setShowOtp(false);
      setOtp("");
      location.reload();
      await handleTodayDeliveries();
    } catch (error) {
      console.log("ERROR:", error.response?.data);
    }
  };

  const handleTodayDeliveries = async () => {
    try {
      const res = await axios.get(`${SERVER_ORDER}/get-today-deliveries`, {
        withCredentials: true,
      });
      console.log(res.data);
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setTodayDeliveries(rows);
    } catch (error) {
      console.log("ERROR:", error.response?.data);
      setTodayDeliveries([]);
    }
  };

  useEffect(() => {
    if (!socket || !userData) return;

    const handleNewAssignment = (data) => {
      if (data.sentTo == userData._id) {
        setAvailableAssignment((prev) => {
          const exists = prev.some(
            (item) => item.assignmentId === data.assignmentId,
          );
          if (exists) return prev; // ✅ prevent duplicate
          return [...prev, data];
        });
      }
    };

    socket.on("newAssignment", handleNewAssignment);

    return () => {
      socket.off("newAssignment", handleNewAssignment); // ✅ correct cleanup
    };
  }, [socket, userData]);

  useEffect(() => {
    getAssignments();
    getCurrentOrder();
    handleTodayDeliveries();
  }, [userData]);

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />

      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-2 items-center w-[90%] border border-orange-100 text-center">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome , {userData?.fullName}
          </h1>

          <p className="text-[#ff4d2d]">
            <span className="text-lg font-semibold">Latitude:</span>
            {deliveryBoyLocation?.lat || "Fetching..."},
            <span className="text-lg font-semibold"> Longitude:</span>
            {deliveryBoyLocation?.lon}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100">
          <h1 className="text-lg font-bold mb-3 text-[#ff4d2d]">
            Today Deliveries
          </h1>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={todayDeliveries}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />

              <YAxis allowDecimals={false} />

              <Tooltip
                formatter={(value) => [`${value} orders`, ""]}
                labelFormatter={(label) => `${label}:00`}
              />

              <Bar dataKey="count" fill="#ff4d2d" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center">
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Today's Earning
            </h1>
            <span className="text-3xl font-bold text-green-600">
              ₹ {totalEarning}
            </span>
          </div>
        </div>
        {!currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h1 className="text-lg font-bold mb-4">Available Orders</h1>

            <div className="space-y-4">
              {availableAssignments.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-sm">{a.shopName}</p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Delivery Address:</span>{" "}
                        {a.deliveryAddressText}
                      </p>
                      <p>
                        {a.items.length} items | {a.subtotal}
                      </p>
                      <p className="text-sm text-gray-500">
                        Order ID: {a.orderId}
                      </p>
                    </div>

                    <button
                      className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600 "
                      onClick={() => acceptOrder(a.assignmentId)}
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No Available Orders</p>
              )}
            </div>
          </div>
        )}

        {currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h2 className="text-lg font-bold mb-3">📦 Current Order</h2>

            <div className="border rounded-lg p-4 mb-3">
              <p className="font-semibold text-sm">
                {currentOrder?.shopOrder?.shop?.name}
              </p>

              <p className="text-xs text-gray-500">
                {currentOrder?.deliveryAddress?.text}
              </p>

              <p className="text-xs text-gray-400">
                {currentOrder?.shopOrder?.shopOrderItems?.length} items |{" "}
                {currentOrder?.shopOrder?.subtotal}
              </p>
            </div>
            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData?.location?.coordinates?.[1],
                  lon: userData?.location?.coordinates?.[0],
                },
                customerLocation: {
                  lat: currentOrder?.deliveryAddress?.latitude,
                  lon: currentOrder?.deliveryAddress?.longitude,
                },
              }}
            />
            {!showOtp ? (
              <button
                className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ClipLoader size={20} color="white" />
                    <span className="ml-2">Loading...</span>
                  </>
                ) : (
                  "Mark As Delivered"
                )}
              </button>
            ) : (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                <p
                  className="
                text-sm font-semibold mb-2"
                >
                  Enter Otp send to{" "}
                  <span className="text-orange-500">
                    {currentOrder.user.fullName}
                  </span>{" "}
                </p>

                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter Otp"
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                />

                {message && (
                  <p className="text-center text-gray-400">{message}</p>
                )}
                <button
                  className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all mt-4"
                  onClick={verifyOtp}
                >
                  Submit Otp
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoy;
