import { UserPlus } from "lucide-react";
import React from "react";
import { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { SERVER_URI } from "../../../utils/contanst";
import axios from "axios";
import { ClipLoader } from "react-spinners";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const borderColor = "#ddd";

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${SERVER_URI}/send-otp`,
        { email },
        { withCredentials: true },
      );
      setLoading(false);
      console.log(res);
      setErr("");
      setStep(2);
    } catch (error) {
      setErr(error?.response?.data?.message || "Firstly you Fill OTP");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${SERVER_URI}/verify-otp`,
        { email, otp },
        { withCredentials: true },
      );
      setLoading(false);

      console.log(res.data);
      setErr("");
      setStep(3);
    } catch (error) {
      setErr(error?.response?.data?.message || "please verify otp");
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);

    if (newPassword != confirmPassword) {
      return null;
    }
    try {
      const res = await axios.post(
        `${SERVER_URI}/reset-password`,
        { email, newPassword },
        { withCredentials: true },
      );
      setLoading(false);

      console.log(res);
      navigate("/login");
    } catch (error) {
      setErr(error?.response?.data?.message || "fillup the password");
      setLoading(false);
    }
  };
  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 ">
        <div className="flex items-center gap-4 mb-4">
          <IoIosArrowRoundBack
            size={20}
            className="text-[#ff4d2d] cursor-pointer"
            onClick={() => navigate("/login")}
          />
          <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">
            Forgot Password
          </h1>
        </div>

        {step == 1 && (
          <div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email:
              </label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter your Email"
                style={{ border: `1px solid ${borderColor}` }}
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <button
                className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 text-white cursor-pointer hover:bg-amber-800 bg-[#ff4d2d]"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ClipLoader size={20} color="#fff" />
                    <span>Please Wait...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Send otp</span>
                  </>
                )}
              </button>
              {err && (
                <p className="text-red-500 text-center my-[10px]">*{err}</p>
              )}{" "}
            </div>
          </div>
        )}

        {step == 2 && (
          <div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                OTP
              </label>
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter OTP"
                style={{ border: `1px solid ${borderColor}` }}
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                required
              />
              <button
                className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 text-white cursor-pointer hover:bg-amber-800 bg-[#ff4d2d]"
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {" "}
                {loading ? (
                  <>
                    <ClipLoader size={20} color="#fff" />
                    <span>Please Wait...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Verify otp</span>
                  </>
                )}
              </button>
              {err && (
                <p className="text-red-500 text-center my-[10px]">*{err}</p>
              )}{" "}
            </div>
          </div>
        )}

        {step == 3 && (
          <div>
            <div className="mb-4">
              <label
                htmlFor="New Password"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter New Password"
                style={{ border: `1px solid ${borderColor}` }}
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                required
              />

              <label
                htmlFor="Re-Enter Password"
                className="block text-gray-700 font-medium mb-1 mt-3"
              >
                Re-Enter Password
              </label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Re-Enter Your Password"
                style={{ border: `1px solid ${borderColor}` }}
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
              />

              <button
                className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 text-white cursor-pointer hover:bg-amber-800 bg-[#ff4d2d]"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ClipLoader size={20} color="#fff" />
                    <span>Please Wait...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
              {err && (
                <p className="text-red-500 text-center my-[10px]">*{err}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
