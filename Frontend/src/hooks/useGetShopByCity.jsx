import React, { useEffect } from "react";
import axios from "axios";
import { SERVER_SHOP, SERVER_USER } from "../../utils/contanst.js";
import { useDispatch, useSelector } from "react-redux";
import { setShopInMyCity, setUserData } from "../../redux/userSlice.js";

const useGetShopByCity = () => {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((store) => store.user);
  useEffect(() => {
    const fetchShop = async () => {
      try {
        if (!currentCity) return;
        const res = await axios.get(
          `${SERVER_SHOP}/get-by-city/${currentCity}`,
          {
            withCredentials: true,
          },
        );
        // API returns an array of shops for this city
        dispatch(setShopInMyCity(res.data));
        console.log(res.data);
      } catch (error) {
        console.log(error.response?.data || error.message);
      }
    };

    fetchShop();
  }, [currentCity]);

  return null;
};

export default useGetShopByCity;
