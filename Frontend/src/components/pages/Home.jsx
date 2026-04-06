import React from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../dashboard/UserDashboard";
import OwnerDashboard from "../dashboard/OwnerDashboard";
import DeliveryBoy from "../dashboard/DeliveryBoy";

const Home = () => {
  const { userData } = useSelector((store) => store.user);
  return (
    <div className="w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#fff9f6]">
      {userData.role == "user" && <UserDashboard />}
      {userData.role == "owner" && <OwnerDashboard />}
      {userData.role == "deliveryBoy" && <DeliveryBoy />}
    </div>
  );
};

export default Home;
