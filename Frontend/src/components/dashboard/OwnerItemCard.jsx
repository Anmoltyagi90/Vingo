import axios from "axios";
import React from "react";
import { FaTrashAlt } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setMyShopData } from "../../../redux/ownerSlice.js";
import { SERVER_ITEM } from "../../../utils/contanst.js";

const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleDeleteItem = async () => {
    console.log("Delete clicked", data._id);

    try {
      const res = await axios.get(`${SERVER_ITEM}/delete/${data._id}`, {
        withCredentials: true,
      });

      console.log("Response:", res.data);

      dispatch(setMyShopData(res.data));
    } catch (error) {
      console.log("Error:", error.response?.data || error.message);
    }
  };
  return (
    <div className="flex bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-orange-100 w-full max-w-2xl overflow-hidden group">
      {/* Image */}
      <div className="w-40 h-36 flex-shrink-0 overflow-hidden">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-5 flex-1">
        {/* Top Info */}
        <div>
          <h2 className="text-lg font-bold text-[#ff4d2d] tracking-wide">
            {data.name}
          </h2>

          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-800">Category:</span>{" "}
              {data.category}
            </p>

            <p>
              <span className="font-medium text-gray-800">Food Type:</span>{" "}
              {data.foodType}
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between mt-4">
          {/* Price Badge */}
          <div className="bg-orange-50 text-[#ff4d2d] px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
            ₹ {data.price}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
              onClick={() => navigate(`/edit-item/${data._id}`)}
            >
              <FaPen size={14} />
            </button>

            <button
              className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
              onClick={handleDeleteItem}
            >
              <FaTrashAlt size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;
