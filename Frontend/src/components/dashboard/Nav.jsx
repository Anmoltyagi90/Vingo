import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLocationDot, FaPlus } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { SERVER_ITEM, SERVER_URI } from "../../../utils/contanst.js";
import { setSearchItems, setUserData } from "../../../redux/userSlice.js";
import { setMyShopData } from "../../../redux/ownerSlice.js";
import { FiShoppingCart } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { TbReceipt } from "react-icons/tb";

const Nav = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData, currentCity, cartItems } = useSelector(
    (store) => store.user,
  );
  const { myShopData } = useSelector((store) => store.owner);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleLogout = async () => {
    try {
      await axios.post(`${SERVER_URI}/logout`, {}, { withCredentials: true });
      dispatch(setUserData(null));
      dispatch(setMyShopData(null));
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error?.response?.data || error);
    }
  };

  const handleSearchItems = async (nextQuery) => {
    try {
      const q = (nextQuery || "").trim();

      if (!q || !currentCity) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      const res = await axios.get(
        `${SERVER_ITEM}/search-items?query=${encodeURIComponent(
          q,
        )}&city=${encodeURIComponent(currentCity)}`,
        {
          withCredentials: true,
        },
      );
      const items = res?.data?.items || [];
      dispatch(setSearchItems(items));
    } catch (error) {
      console.log(error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearchItems(query);
    } else {
      dispatch(setSearchItems(null));
    }
  }, [query]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fff9f6] border-b border-orange-100/70 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto h-16 px-3 sm:px-4 flex items-center justify-between gap-8">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-2xl sm:text-3xl font-extrabold text-[#ff4d2d] tracking-tight">
            Vingo
          </span>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-gray-500">
            Food Delivery
          </span>
        </button>

        {/* Center Section */}
        <div className="hidden md:flex flex-1 justify-center">
          {userData?.role === "user" && (
            <div className="w-full max-w-xl h-11 bg-white shadow-md rounded-full flex items-center gap-3 px-3 border border-orange-100">
              {/* Location */}
              <div className="hidden md:flex items-center gap-2 pr-3 border-r border-gray-200 min-w-[140px]">
                <FaLocationDot size={18} className="text-[#ff4d2d]" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Deliver to
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {currentCity}
                  </span>
                </div>
              </div>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2 flex-1">
                <IoIosSearch size={20} className="text-[#ff4d2d]" />
                <input
                  type="text"
                  placeholder="Search delicious food, restaurants..."
                  className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
                  onChange={(e) => setQuery(e.target.value)}
                  value={query}
                />
              </div>
            </div>
          )}
        </div>

        {/* ❌ Search dropdown removed from here */}

        {/* Right Section */}
        <div className="flex items-center gap-7 md:gap-5 sm:gap-3">
          {userData?.role === "user" &&
            (showSearch ? (
              <RxCross2
                size={25}
                className="text-[#ff4d2d] md:hidden"
                onClick={() => setShowSearch(false)}
              />
            ) : (
              <IoIosSearch
                size={25}
                className="md:hidden text-[#ff4d2d]"
                onClick={() => setShowSearch((prev) => !prev)}
              />
            ))}

          {userData?.role === "owner" ? (
            <>
              {myShopData && (
                <>
                  <button
                    className="hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
                    onClick={() => navigate("/add-item")}
                  >
                    <FaPlus size={20} />
                    <span>Add Food Item</span>
                  </button>

                  <button
                    className="md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
                    onClick={() => navigate("/add-item")}
                  >
                    <FaPlus size={20} />
                  </button>
                </>
              )}

              <div className="relative hidden md:flex items-center gap-2 px-3 py-1 cursor-pointer rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium">
                <TbReceipt size={20} />
                <span onClick={() => navigate("/my-orders")}>My Order</span>
              
              </div>

              <div
                className="relative md:hidden flex items-center gap-2 px-3 py-1 cursor-pointer rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium"
                onClick={() => navigate("/my-orders")}
              >
                <TbReceipt size={20} />
              
              </div>
            </>
          ) : (
            <>
              {userData.role == "user" && (
                <div
                  className="relative cursor-pointer"
                  onClick={() => navigate("/cart")}
                >
                  <FiShoppingCart size={25} className="text-[#ff4d2d]" />
                  <span className="absolute right-[-9px] top-[-12px] text-[#ff4d2d] text-sm">
                    {cartItems?.length}
                  </span>
                </div>
              )}

              <button
                className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 space-x-2 text-[#ff4d2d] text-sm font-medium cursor-pointer"
                onClick={() => navigate("/my-orders")}
              >
                My Orders
              </button>
            </>
          )}

          {/* Profile */}
          <div
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            {userData?.fullName?.slice(0, 1)}
          </div>

          {showInfo && (
            <div className="fixed top-[85px] right-6 w-[220px] bg-white shadow-2xl rounded-2xl p-4 flex flex-col gap-3 z-50 border border-gray-100">
              {/* User Name */}
              <div className="text-[16px] font-semibold text-gray-800 border-b pb-2">
                {userData?.fullName}
              </div>

              {/* 👇 Show My Orders ONLY for user */}
              {userData?.role === "user" && (
                <div
                  className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] cursor-pointer transition"
                  onClick={() => {
                    navigate("/my-orders");
                    setShowInfo(false);
                  }}
                >
                  <TbReceipt size={18} />
                  <span>My Orders</span>
                </div>
              )}

              {/* Logout */}
              <div
                className="text-red-500 hover:text-red-600 font-medium cursor-pointer text-[15px]"
                onClick={handleLogout}
              >
                Log Out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      {showSearch && userData?.role === "user" && (
        <div className="px-3 pb-2 pt-0.5 bg-[#fff9f6] border-t border-orange-50">
          <div className="w-full h-10 bg-white shadow-sm rounded-full flex items-center gap-2 px-3 border border-orange-100">
            <IoIosSearch size={18} className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="Search food or restaurants"
              className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
