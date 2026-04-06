import { useEffect } from "react";
import axios from "axios";
import { SERVER_USER } from "../../utils/contanst.js";
import { useSelector } from "react-redux";

const useGetUpdateLocation = () => {
  const { userData } = useSelector((store) => store.user);

  useEffect(() => {
    if (!userData) return;

    const updateLocation = async (lat, lon) => {
      try {
        const res = await axios.post(
          `${SERVER_USER}/update-location`,
          { lat, lon },
          { withCredentials: true }
        );

        console.log(res.data);
      } catch (error) {
        console.log("Location update error:", error.response?.data || error);
      }
    };

    navigator.geolocation.getCurrentPosition((pos) => {
      updateLocation(pos.coords.latitude, pos.coords.longitude);
    });
  }, [userData]);
};

export default useGetUpdateLocation;