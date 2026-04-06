import mongoose from "mongoose";

const deliveryAssignmentSchema = new mongoose.Schema(
  {
    // Order for which this assignment is created
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    shopOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      requried: true,
    },

    brodcastedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["brodcasted", "assigned", "completed"],
      default: "brodcasted",
    },

    acceptedAt: Date,
  },
  { timestamps: true },
);

const DeliveryAssignment = mongoose.model(
  "DeliveryAssignment",
  deliveryAssignmentSchema,
);

export default DeliveryAssignment;
