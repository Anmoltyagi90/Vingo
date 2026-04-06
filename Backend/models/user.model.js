import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "local"; // sirf normal signup me required
      },
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    mobile: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"],
      required: true,
      default: "user",
    },

    resetOtp: String,
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otpExpires: { type: Date },

    socketId: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: true   ,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

export const User = mongoose.model("User", userSchema);
export default User;
