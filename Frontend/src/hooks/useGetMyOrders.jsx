import React, { useEffect } from "react";
import axios from "axios";
import { SERVER_ORDER } from "../../utils/contanst.js";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../../redux/userSlice.js";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((store) => store.user);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${SERVER_ORDER}/my-orders`, {
          withCredentials: true,
        });
        const orders =
          res?.data?.orders || res?.data?.data || res?.data || [];
        dispatch(setMyOrders(orders));
        console.log("Fetched orders:", orders);
      } catch (error) {
        console.log(error.response?.data || error.message);
      }
    };

    fetchOrders();
  }, [userData]);

  return null; // ya <div>Loading...</div>
};

export default useGetMyOrders;
