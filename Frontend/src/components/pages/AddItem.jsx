import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FaUtensils } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setMyShopData } from "../../../redux/ownerSlice";
import { SERVER_ITEM, SERVER_SHOP } from "../../../utils/contanst";
import { ClipLoader } from "react-spinners";

const AddItem = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((store) => store.owner);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);

  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const dispatch = useDispatch();
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [loading, setLoading] = useState(false);
  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chines",
    "Fast Food",
    "Others",
  ];

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const res = await axios.post(`${SERVER_ITEM}/add-item`, formData, {
        withCredentials: true,
      });
      dispatch(setMyShopData(res.data));
      setLoading(false);
      navigate("/");
      console.log(res.data);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // When location loads from geolocation (useGetCity), fill city/state/address if not editing existing shop
  // useEffect(() => {
  //   if (myShopData) return;
  //   if (currentCity) setCity((prev) => prev || currentCity);
  //   if (currentState) setState((prev) => prev || currentState);
  //   if (currentAddress) setAddress((prev) => prev || currentAddress);
  // }, [currentCity, currentState, currentAddress, myShopData]);

  return (
    <div className="flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-white min-h-screen">
      <div
        className="absolute top-[20px] left-[20px] z-[10] mb-[10px]"
        onClick={() => navigate("/")}
      >
        <IoIosArrowBack size={35} className="text-[#ff4d2d]" />
      </div>

      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          <div className="text-[#ff4d2d] w-16 h-16 flex items-center justify-center text-4xl bg-[#ff4d2d]/10 rounded-full">
            <FaUtensils />
          </div>

          <div className="text-3xl font-extrabold text-gray-900 mt-3">
            Add Food
          </div>
        </div>

        <form className="space-y-5">
          <div className="">
            <label
              htmlFor=""
              className="block text-sm fobt-medium text-gray-700 mb-1 font-medium"
            >
              Name:
            </label>
            <input
              type="text"
              placeholder="Enter Food Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          <div className="">
            <label
              htmlFor=""
              className="block text-sm fobt-medium text-gray-700 mb-1 font-medium"
            >
              Food image:
            </label>
            <input
              type="file"
              accept="image/*"
              placeholder="Enter Shop Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={handleImage}
            />
            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg border "
                />
              </div>
            )}
          </div>

          <div className="">
            <label
              htmlFor=""
              className="block text-sm fobt-medium text-gray-700 mb-1 font-medium"
            >
              Price:
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </div>

          <div className="">
            <label
              htmlFor=""
              className="block text-sm fobt-medium text-gray-700 mb-1 font-medium"
            >
              Select Category:
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option>select Category</option>
              {categories.map((cate, index) => (
                <option value={cate} key={index}>
                  {cate}
                </option>
              ))}
            </select>
          </div>

          <div className="">
            <label
              htmlFor=""
              className="block text-sm fobt-medium text-gray-700 mb-1 font-medium"
            >
              Select Food Type:
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setFoodType(e.target.value)}
              value={foodType}
            >
              <option value="veg">veg</option>

              <option value="non-veg">Non Veg</option>
            </select>
          </div>

          <button
            className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all cursor-pointer"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <ClipLoader size={20} color="white" />
                <span>Updating...</span>
              </div>
            ) : (
              "Save"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
