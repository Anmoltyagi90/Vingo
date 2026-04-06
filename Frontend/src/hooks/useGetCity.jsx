import React, { useEffect } from "react";
import axios from "axios";
import { SERVER_USER } from "../../utils/contanst.js";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
  setUserData,
} from "../../redux/userSlice.js";
import { setAddress, setLocation } from "../../redux/mapSlice.js";

const useGetCity = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((store) => store.user);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  useEffect(() => {
    // If user profile has a city, prefer that over geolocation
    if (userData?.city) {
      dispatch(setCurrentCity(userData.city));
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      dispatch(setLocation({ lat: latitude, lon: longitude }));

      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`,
      );

      const result = res?.data?.results[0];

      dispatch(
        setCurrentCity(
          result?.city ||
            result?.town ||
            result?.village ||
            result?.county ||
            "",
        ),
      );

      dispatch(setCurrentState(result?.state || ""));
      dispatch(setCurrentAddress(result?.formatted || ""));
      dispatch(setAddress(result?.address_line2));
    });
  }, [userData]);
};

export default useGetCity;
