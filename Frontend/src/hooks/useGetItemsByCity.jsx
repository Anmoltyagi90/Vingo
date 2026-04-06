import React, { useEffect } from "react";
import axios from "axios";
import { SERVER_ITEM, SERVER_SHOP, SERVER_USER } from "../../utils/contanst.js";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity, setShopInMyCity, setUserData } from "../../redux/userSlice.js";

const useGetItemsByCity = () => {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((store) => store.user);
  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!currentCity) return;
        const res = await axios.get(
          `${SERVER_ITEM}/get-by-city/${currentCity}`,
          {
            withCredentials: true,
          },
        );
        // API returns an array of shops for this city
        dispatch(setItemsInMyCity(res.data));
        console.log(res.data);
      } catch (error) {
        console.log(error.response?.data || error.message);
      }
    };

    fetchItems();
  }, [currentCity]);

  return null;
};

export default useGetItemsByCity;
