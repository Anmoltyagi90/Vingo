import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoLocationSharp, IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from "../../../redux/mapSlice";
import { MdDeliveryDining } from "react-icons/md";
import axios from "axios";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import { SERVER_ORDER } from "../../../utils/contanst.js";
import { addMyOrder } from "../../../redux/userSlice";

function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap();
    map.setView([location.lat, location.lon], 10, { animate: true });
  }
  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const { location, address } = useSelector((store) => store.map);
  const { cartItems, totalAmount, userData } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const AmountWithDeliveryFee = totalAmount + deliveryFee;

  const onDragEnd = (e) => {
    // console.log(e.target._latlng);
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
    // const map = useMap();
    // map.setView([lat, lng], 16, { animate: true });
  };

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`,
      );
      dispatch(setAddress(res?.data?.results[0].address_line2));
      // console.log(res?.data?.results[0].address_line2);
    } catch (error) {
      console.log(error);
    }
  };
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        dispatch(setLocation({ lat: latitude, lon: longitude }));
        getAddressByLatLng(latitude, longitude);
      },
      (error) => {
        console.error(error);
        alert("Location access denied or unavailable");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const getLatLngByAddress = async () => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`,
      );

      const lat = res?.data?.features[0]?.properties?.lat;
      const lon = res?.data?.features[0]?.properties?.lon;

      if (lat && lon) {
        dispatch(setLocation({ lat, lon }));
        dispatch(setAddress(addressInput));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (!cartItems?.length) {
        alert("Cart is empty");
        return;
      }

      if (!addressInput?.trim()) {
        alert("Please enter delivery address");
        return;
      }

      if (!location?.lat || !location?.lon) {
        alert("Please select your location on map");
        return;
      }

      const badItem = cartItems.find((i) => !i.shop);
      if (badItem) {
        alert("Some cart items are missing shop information. Please re-add items.");
        return;
      }

      // Same total as shown in Order Summary (subtotal + delivery fee)
      const payableTotal = AmountWithDeliveryFee;

      const res = await axios.post(
        `${SERVER_ORDER}/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
          totalAmount: payableTotal,
          cartItems,
        },
        { withCredentials: true },
      );

      if (paymentMethod == "cod") {
        dispatch(addMyOrder(res.data));
        navigate("/order-place");
      } else {
        const orderId = res.data.orderId;
        const razorOrder = res.data.razorOrder;

        if (!razorOrder?.id) {
          alert("Payment gateway is not ready. Please try again.");
          return;
        }

        openRazorpay(orderId, razorOrder);
      }

      console.log(res.data);
    } catch (error) {
      console.log("place-order error:", error.response?.data || error.message);
    }
  };

  const openRazorpay = (orderId, razorOrder) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Please refresh and try again.");
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert("Razorpay key missing in frontend env.");
      return;
    }

    // UPI / Google Pay / PhonePe / Cards / Netbanking appear in this modal when
    // they are turned ON in Razorpay Dashboard → Account & Settings → Payment methods.
    const options = {
      key: razorpayKey,
      amount: razorOrder.amount,
      currency: razorOrder.currency || "INR",
      name: "Vingo",
      description: "Food order payment",
      order_id: razorOrder.id,
      notes: {
        vingo_order_id: String(orderId),
      },
      config: {
        display: {
          preferences: {
            show_default_blocks: true,
          },
        },
      },
      prefill: {
        name: userData?.fullName || "",
        email: userData?.email || "",
        contact: userData?.mobile || "",
      },
      theme: {
        color: "#ff4d2d",
      },
      modal: {
        ondismiss: () => {
          // user closed the checkout without paying
        },
      },
      handler: async function (response) {
        try {
          const res = await axios.post(
            `${SERVER_ORDER}/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              orderId,
            },
            { withCredentials: true },
          );
          dispatch(addMyOrder(res.data));
          navigate("/order-place", { replace: true });
        } catch (error) {
          console.log("verify-payment error:", error.response?.data || error);
          alert(
            error.response?.data?.message ||
              "Payment verification failed. Contact support if money was deducted.",
          );
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    if (address) {
      setAddressInput(address);
    }
  }, [address]);
  return (
    <div className="relative min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      {/* Back Button */}
      <div
        className="absolute top-5 left-5 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>

      {/* Checkout Card */}
      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>

        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2 text-gray-800">
            <IoLocationSharp className="text-[#ff4d2d]" />
            Delivery Location
          </h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="w-full flex border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              placeholder="Enter Your Delivery Address"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={getLatLngByAddress}
            >
              <IoSearchOutline size={17} />
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600  text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={getCurrentLocation}
            >
              <TbCurrentLocation size={17} />
            </button>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
              {location?.lat && location?.lon ? (
                <MapContainer
                  className="w-full h-full"
                  center={[location.lat, location.lon]}
                  zoom={16}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap location={location} />
                  <Marker
                    position={[location.lat, location.lon]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  >
                    <Popup>Your current location</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="text-gray-500 text-sm">
                  Allow location access to see your current position on the map.
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Payment Method
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:grid-cols-2">
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${paymentMethod === "cod" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <MdDeliveryDining className="text-gray-600 text-xl" />
              </span>

              <div>
                <p className="font-medium text-gray-800">Cash On Delivery</p>
                <p className="text-xs text-gray-500">
                  Pay when your food arrives
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${paymentMethod === "online" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => setPaymentMethod("online")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <FaMobileScreenButton className="text-purple-700 text-xl" />
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FaCreditCard className="text-blue-700 text-xl" />
              </span>

              <div>
                <p className="font-medium text-gray-800">
                  UPI / Credit / Debit Card
                </p>
                <p className="text-xs text-gray-500">Pay Securely Online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Order Summary
          </h2>

          <div className="bg-white border-2 border-gray-300 rounded-2xl p-4 shadow-sm">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 text-sm text-gray-700"
              >
                <span className="font-medium">
                  {item.name} x {item.quantity}
                </span>

                <span className="font-semibold">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}

            {/* Divider Line */}
            <div className="border-t border-gray-300 my-2"></div>

            {/* Total */}
            <div className="space-y-2 mt-3">
              {/* Subtotal */}
              <div className="flex justify-between items-center font-medium text-gray-800">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>

              {/* Delivery Fee */}
              <div className="flex justify-between items-center text-sm text-gray-700">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
              </div>

              {/* Divider */}
              <div className="border-t my-2"></div>

              {/* Final Total */}
              <div className="flex justify-between items-center font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{AmountWithDeliveryFee}</span>
              </div>
            </div>
          </div>
        </section>

        <button
          className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white rounded-xl font-semibold py-2 cursor-pointer"
          onClick={handlePlaceOrder}
        >
          {paymentMethod == "cod" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CheckOut;
