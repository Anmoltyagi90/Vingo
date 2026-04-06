import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItemCard from "./CartItemCard";

const CartPage = () => {
  const { cartItems, totalAmount } = useSelector((store) => store.user);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6">
      <div className="w-full max-w-[800px]">
        <div className="flex items-center gap-[20px] mb-6">
          <div className=" z-[10]" onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-start">Your Cart</h1>
        </div>
        {cartItems?.length == 0 ? (
          <div>
            <p>Your Cart is Empty</p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 bg-[#ff4d2d] text-white px-6 py-2 rounded-full"
            >
              Go Shopping
            </button>
          </div>
        ) : (
          <>
            <div>
              {cartItems.map((item) => (
                <CartItemCard data={item} key={item.id} />
              ))}
            </div>
            <div className="mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border">
              <h1 className="text-lg font-semibold">Total Amount</h1>
              <span className="text-xl font-semibold text-red-500">
                ₹{totalAmount}
              </span>
            </div>

            <div className="mt-4 flex justify-end">
              <button  onClick={()=>navigate("/checkout")}className="bg-[#ff4d2d] px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer text-white">
                Proceed to CheckOut
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
