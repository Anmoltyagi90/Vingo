import React, { useEffect } from "react";
import axios from "axios";
import { SERVER_USER } from "../../utils/contanst.js";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/userSlice.js";

const GetCurrentUser = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${SERVER_USER}/current`, {
          withCredentials: true,
        });
        // Store only the actual user object in Redux
        dispatch(setUserData(res.data.user));
        console.log(res);
      } catch (error) {
        console.log(error.response?.data || error.message);
      }
    };

    fetchUser();
  }, []);

  return null; // ya <div>Loading...</div>
};

export default GetCurrentUser;
