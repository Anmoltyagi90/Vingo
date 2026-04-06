import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { UserPlus } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER_URI } from "../../../utils/contanst.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./../../../firebase.js";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../../../redux/userSlice.js";

const SignUp = () => {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  // const role=["user","customer","delivery boy"]
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handlerSignUp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${SERVER_URI}/register`,
        {
          fullName,
          email,
          password,
          mobile,
          role,
        },
        { withCredentials: true },
      );
      // Store only the actual user object in Redux
      dispatch(setUserData(res.data.user));
      setLoading(false);
      setErr("");
      console.log(res.data);
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      setErr(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleGoogleAuth = async () => {
    if (!mobile) {
      setErr("Mobile no is required");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Firebase Google result:", result);

      const { data } = await axios.post(
        `${SERVER_URI}/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile,
          // providerId: result.user.uid,
        },
        { withCredentials: true },
      );
      // Store only the actual user object in Redux
      dispatch(setUserData(data.user));

      setErr("");
      console.log("Google auth backend response:", data);
      if (!data.success) {
        alert(data.message || "Google sign-in failed on server");
      } else {
        toast.success("Login Successful 🎉");

        // e.g. navigate("/") if you want
      }
    } catch (error) {
      console.error(
        "Google auth error (frontend):",
        error?.response?.data || error,
      );
      toast.error(data.message || "Google sign-in failed");
    }
  };

  return (
    <div
      className="min-h-screen flex w-full items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]"
        style={{
          border: `1px solid ${borderColor}`,
        }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
          Vingo
        </h1>
        <p className="text-gray-600 mb-8">
          Create your account to get started with delicious food deliveries{" "}
        </p>

        {/* fullName */}
        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-medium mb-1"
          >
            Full Name:
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter your Full Name"
            style={{ border: `1px solid ${borderColor}` }}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* email */}

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
            required
          />
        </div>

        {/* mobile */}

        <div className="mb-4">
          <label
            htmlFor="PhoneNumber"
            className="block text-gray-700 font-medium mb-1"
          >
            PhoneNumber:
          </label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter your PhoneNumber"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setMobile(e.target.value)}
            value={mobile}
            required
          />
        </div>

        {/* Password */}

        <div className="mb-4">
          <label
            htmlFor="Password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password:
          </label>
          <div className="relative">
            <input
              type={`${showPassword ? "text" : "password"}`}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              placeholder="Enter your PhoneNumber"
              style={{ border: `1px solid ${borderColor}` }}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        {/* Role */}

        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role:
          </label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role === r
                    ? { backgroundColor: primaryColor, color: "white" }
                    : { border: `1px solid ${primaryColor}`, color: "#333" }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <button
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 text-white cursor-pointer hover:bg-amber-800 bg-[#ff4d2d]"
          onClick={handlerSignUp}
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
              <span>Sign Up</span>
            </>
          )}
        </button>

        {err && <p className="text-red-500 text-center my-[10px]">*{err}</p>}
        <button
          className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg px-4 py-2 border
             transition duration-200 bg-white text-gray-700
             hover:bg-gray-100 hover:shadow-md"
          onClick={handleGoogleAuth}
        >
          <FcGoogle className="text-xl" />
          <span className="font-medium">Sign up with Google</span>
        </button>
        <p
          className="text-center mt-6 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Already have an account ?{" "}
          <span className="text-[#ff4d2d]">Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
