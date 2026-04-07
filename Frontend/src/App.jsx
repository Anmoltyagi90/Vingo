import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./components/pages/SignUp";
import SignIn from "./components/pages/SignIn";
import ForgotPassword from "./components/pages/ForgotPassword";
import GetCurrentUser from "./hooks/GetCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import Home from "./components/pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEdit from "./components/pages/CreateEdit";
import AddItem from "./components/pages/AddItem";
import EditItem from "./components/pages/EditItem";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import CartPage from "./components/pages/CartPage";
import CheckOut from "./components/pages/CheckOut";
import OrderPlaced from "./components/pages/OrderPlaced";
import MyOrder from "./components/pages/MyOrder";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useGetUpdateLocation from "./hooks/useGetUpdateUserLocation";
import TrackOrderPage from "./components/pages/TrackOrderPage";
import Shop from "./components/pages/Shop";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { SOCKET_BASE } from "../utils/contanst.js";
import { setSocket } from "../redux/userSlice";

function App() {
  const { userData } = useSelector((store) => store.user);

  const dispatch = useDispatch();
  GetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();
  useGetUpdateLocation();

  useEffect(() => {
    const socketInstance = io(SOCKET_BASE, { withCredentials: true });
    dispatch(setSocket(socketInstance));
    socketInstance.on("connect", () => {
      console.log("Socket connected. socket.id:", socketInstance.id);

      if (userData) {
        socketInstance.emit("identity", { userId: userData._id });
      }
    });

    socketInstance.on("connect_error", (err) => {
      console.log("Socket connect_error:", err?.message || err);
    });


  return () => {
    socketInstance.disconnect(); // ✅ VERY IMPORTANT
  };
  }, [userData]);

  return (
    <>
      <Routes>
        <Route
          path="/register"
          element={!userData ? <SignUp /> : <Navigate to={"/"} />}
        />
        <Route
          path="/login"
          element={!userData ? <SignIn /> : <Navigate to={"/"} />}
        />
        <Route
          path="/forgotpassword"
          element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to={"/login"} />}
        />

        <Route
          path="/create-edit-shop"
          element={userData ? <CreateEdit /> : <Navigate to={"/register"} />}
        />

        <Route
          path="/add-item"
          element={userData ? <AddItem /> : <Navigate to={"/register"} />}
        />

        <Route
          path="/edit-item/:itemId"
          element={userData ? <EditItem /> : <Navigate to={"/register"} />}
        />

        <Route
          path="/cart"
          element={userData ? <CartPage /> : <Navigate to={"/register"} />}
        />

        <Route
          path="/checkout"
          element={userData ? <CheckOut /> : <Navigate to={"/register"} />}
        />

        <Route
          path="/order-place"
          element={userData ? <OrderPlaced /> : <Navigate to={"/register"} />}
        />

        <Route
          path="/my-orders"
          element={userData ? <MyOrder /> : <Navigate to={"/register"} />}
        />

        <Route
          path="/track-orders/:orderId"
          element={
            userData ? <TrackOrderPage /> : <Navigate to={"/register"} />
          }
        />

        <Route
          path="/shop/:shopId"
          element={userData ? <Shop /> : <Navigate to={"/register"} />}
        />
      </Routes>
    </>
  );
}

export default App;
