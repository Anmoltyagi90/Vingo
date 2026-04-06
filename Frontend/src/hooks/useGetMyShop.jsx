import React, { useEffect } from "react";
import axios from "axios";
import { SERVER_SHOP } from "../../utils/contanst.js";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../../redux/ownerSlice.js";

const useGetMyShop = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((store) => store.user);
  useEffect(() => {
    if (!userData || userData?.role !== "owner") {
      dispatch(setMyShopData(null));
      return;
    }

    const fetchShop = async () => {
      try {
        const res = await axios.get(`${SERVER_SHOP}/get-my`, {
          withCredentials: true,
        });
        dispatch(setMyShopData(res.data));
      } catch (error) {
        dispatch(setMyShopData(null));
      }
    };

    fetchShop();
  }, [userData, dispatch]);

  return null; // ya <div>Loading...</div>
};

export default useGetMyShop;
