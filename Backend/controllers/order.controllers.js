import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop. model.js";
import { User } from "../models/user.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";

import Razorpay from "razorpay";

import dotenv from "dotenv";
dotenv.config();

/** Razorpay keys must be the matching pair from the same Razorpay dashboard (Test vs Live). */
const getRazorpayKeys = () => {
  const key_id = process.env.RAZORPAY_KEY_ID?.replace(
    /^["']|["']$/g,
    "",
  ).trim();
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.replace(
    /^["']|["']$/g,
    "",
  ).trim();
  return { key_id, key_secret };
};

const getRazorpayInstance = () => {
  const { key_id, key_secret } = getRazorpayKeys();
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
};

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (
      !deliveryAddress?.text ||
      !deliveryAddress?.latitude ||
      !deliveryAddress?.longitude
    ) {
      return res.status(400).json({ message: "Send complete deliveryAddress" });
    }

    const groupItemsByShop = {};

    cartItems.forEach((item) => {
      const shopId = item.shop.toString();
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        if (!shopId || shopId === "undefined" || shopId === "null") {
          throw new Error("Invalid cart item: shopId missing");
        }

        const shop = await Shop.findById(shopId).populate("owner");

        if (!shop) {
          throw new Error(`Shop not found: ${shopId}`);
        }

        const items = groupItemsByShop[shopId];

        const subtotal = items.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.quantity),
          0,
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      }),
    );

    // ✅ ONLINE PAYMENT (RAZORPAY)
    if (paymentMethod === "online") {
      const rp = getRazorpayInstance();
      if (!rp) {
        return res.status(500).json({
          message: "Razorpay keys are missing in backend env",
        });
      }

      const razorOrder = await rp.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorOrderId: razorOrder.id,
        payment: false,
      });

      return res.status(200).json({
        razorOrder,
        orderId: newOrder._id,
      });
    }

    // ✅ COD ORDER
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });

    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price",
    );

    await newOrder.populate("shopOrders.shop", "name");
    await newOrder.populate("shopOrders.owner", "name socketId");
    await newOrder.populate("user", "name email mobile");

    const io = req.app.get("io");

    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;

        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
            payment: newOrder.payment,
          });
        }
      });
    }

    res.status(200).json(newOrder);
  } catch (error) {
    console.log(error);
    const raw =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      error;
    const msg = typeof raw === "string" ? raw : JSON.stringify(raw);
    // send 400 for user-caused payload issues
    const isBadRequest =
      msg.includes("Shop not found") || msg.includes("shopId missing");

    res
      .status(isBadRequest ? 400 : 500)
      .json({ message: `Place order error ${msg}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    const rp = getRazorpayInstance();
    if (!rp) {
      return res
        .status(500)
        .json({ message: "Razorpay keys are missing in backend env" });
    }
    const payment = await rp.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status !== "captured") {
      return res.status(400).json({
        message: `Payment not successful (status: ${payment?.status || "unknown"})`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    await order.populate("shopOrders.shopOrderItems.item", "name image price");

    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.owner", "name socketId");
    await order.populate("user", "name email mobile");

    const io = req.app.get("io");
    if (io) {
      order.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner?.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            payment: order.payment,
          });
        }
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: `verify payment error ${error}` });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // ================= USER =================
    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate({
          path: "shopOrders.assignedDeliveryBoy",
          select: "fullName mobile",
        });

      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        deliveryAddress: order.deliveryAddress,

        shopOrders: order.shopOrders.map((shopOrder) => ({
          _id: shopOrder._id,
          shop: shopOrder.shop,
          subtotal: shopOrder.subtotal,
          status: shopOrder.status,

          // ✅ DELIVERY BOY ADDED
          assignedDeliveryBoy: shopOrder.assignedDeliveryBoy
            ? {
                _id: shopOrder.assignedDeliveryBoy._id,
                fullName: shopOrder.assignedDeliveryBoy.fullName,
                mobile: shopOrder.assignedDeliveryBoy.mobile,
              }
            : null,

          shopOrderItems: shopOrder.shopOrderItems.map((item) => ({
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            item: item.item,
          })),
        })),
      }));

      return res.status(200).json(filteredOrders);
    }

    // ================= OWNER =================
    else if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate({
          path: "shopOrders.assignedDeliveryBoy",
          select: "fullName mobile",
        });

      return res.status(200).json(orders);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `get User order error ${error.message}`,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    // find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // find shop order (shop may be ObjectId or populated doc)
    const shopOrder = order.shopOrders.find(
      (o) => String(o.shop?._id || o.shop) === String(shopId),
    );

    if (!shopOrder) {
      return res.status(400).json({
        success: false,
        message: "Shop order not found",
      });
    }

    // update status
    shopOrder.status = status;

    let deliveryBoysPayload = [];

    // assign delivery boy if status = out for delivery
    if (status === "out for delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;

      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });

      const nearByIds = nearByDeliveryBoys.map((b) => b._id);

      // busy delivery boys
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));

      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );

      const candidates = availableBoys.map((b) => b._id);

      if (candidates.length === 0) {
        await order.save();

        return res.status(200).json({
          success: true,
          message: "Order status updated but no delivery boys available nearby",
        });
      }

      // create delivery assignment
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates,
        status: "brodcasted",
      });

      // attach assignment
      shopOrder.assignment = deliveryAssignment._id;

      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile,
      }));

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");

      const io = req.app.get("io");
      if (io) {
        availableBoys.forEach((boy) => {
          const boySocketId = boy.socketId;
          if (boySocketId) {
            io.to(boySocketId).emit("newAssignment", {
              sentTo: boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order?._id,
              shopName: deliveryAssignment.shop?.name || "",

              // address fields
              deliveryAddressText:
                deliveryAssignment.order?.deliveryAddress?.text ??
                "Address not provided",
              latitude:
                deliveryAssignment.order?.deliveryAddress?.latitude ?? null,
              longitude:
                deliveryAssignment.order?.deliveryAddress?.longitude ?? null,

              items: deliveryAssignment?.order.shopOrders.find((so) =>
                so._id.equals(deliveryAssignment.shopOrderId),
              ),
              subtotal: deliveryAssignment.order.shopOrders.find((so) =>
                so._id.equals(deliveryAssignment.shopOrderId),
              )?.subtotal,
            });
          }
        });
      }
    }

    await order.save();

    const updatedShopOrder = order.shopOrders.find(
      (o) => String(o.shop?._id || o.shop) === String(shopId),
    );

    // populate fields
    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile",
    );

    await order.populate("user", "socketId");

    const io = req.app.get("io");
    if (io) {
      const userSocketId = order.user?.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("update-status", {
          orderId: order._id,
          shopId,
          status: updatedShopOrder?.status || status,
          userId: order.user._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy || null,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment || null,
    });
  } catch (error) {
    console.log("Order status update error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    const assignments = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: "brodcasted",
    })
      .populate("order")
      .populate("shop");

    const formatted = assignments.map((a) => {
      const shopOrder = a.order?.shopOrders?.find(
        (so) => so._id?.toString() === a.shopOrderId?.toString(),
      );

      return {
        assignmentId: a._id,
        orderId: a.order?._id,
        shopName: a.shop?.name || "",

        // address fields
        deliveryAddressText:
          a.order?.deliveryAddress?.text ?? "Address not provided",
        latitude: a.order?.deliveryAddress?.latitude ?? null,
        longitude: a.order?.deliveryAddress?.longitude ?? null,

        items: shopOrder?.shopOrderItems || [],
        subtotal: shopOrder?.subtotal || 0,
      };
    });

    return res.status(200).json({
      success: true,
      assignments: formatted,
    });
  } catch (error) {
    console.log("Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: `get Assignment ${error.message}`,
    });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" });
    }

    if (assignment.status !== "brodcasted") {
      return res.status(400).json({ message: "assignment is expired" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["brodcasted", "completed"] },
    });

    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "you are already assigned to another order" });
    }

    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();
    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    const shopOrder = order.shopOrders.find(
      (so) => so._id.toString() === assignment.shopOrderId.toString(),
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "shop order not found" });
    }

    shopOrder.assignedDeliveryBoy = req.userId;

    await order.save();

    return res.status(200).json({
      message: "orde accepted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `accept order ${error.message}`,
    });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [
          {
            path: "user",
            select: "fullName email location mobile",
          },
          {
            path: "shopOrders.shop", // ✅ FIXED
            select: "name",
          },
        ],
      });

    if (!assignment) {
      return res.status(200).json(null);
    }

    if (!assignment.order) {
      return res.status(400).json({ message: "order not found" });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => so._id.toString() === assignment.shopOrderId.toString(),
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "shopOrder not found" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo?.location?.coordinates?.length === 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }

    const customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `current order ${error.message}`,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy", // ✅ FIXED
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not Found" });
    }

    return res.status(200).json({
      success: true,
      order, // ✅ important
    });
  } catch (error) {
    console.log("ERROR:", error); // 👈 DEBUG
    return res.status(500).json({
      success: false,
      message: `get by id order ${error.message}`,
    });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;

    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!order || !shopOrder) {
      return (
        res.status(400),
        json({ message: "enter vaild order/shopOrder" })
      );
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
    await order.save();
    await sendDeliveryOtpMail(order.user, otp);

    return res
      .status(200)
      .json({ message: `otp sent successfully to ${order?.user?.fullName}` });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `delivery otp error ${error.message}`,
    });
  }
};

export const verifyDeliveryotp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;

    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!order || !shopOrder) {
      return (
        res.status(400),
        json({ message: "enter vaild order/shopOrder" })
      );
    }

    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return rs.status(400).json({ message: "Invaild/Expired Otp" });
    }

    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    await order.save();
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: orderId,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });

    return res.status(200).json({ message: "Order Delivered Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `verify delivery otp error ${error.message}`,
    });
  }
};

export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // $elemMatch: all conditions must match the SAME shopOrders subdocument
    const orders = await Order.find({
      shopOrders: {
        $elemMatch: {
          assignedDeliveryBoy: deliveryBoyId,
          status: "delivered",
          deliveredAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
    }).lean();

    let todayDeliveries = [];

    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        const boyId = shopOrder.assignedDeliveryBoy;
        if (
          String(boyId) === String(deliveryBoyId) &&
          shopOrder.status === "delivered" &&
          shopOrder.deliveredAt &&
          new Date(shopOrder.deliveredAt) >= startOfDay &&
          new Date(shopOrder.deliveredAt) <= endOfDay
        ) {
          todayDeliveries.push(shopOrder);
        }
      });
    });

    let stats = {};

    todayDeliveries.forEach((shopOrder) => {
      const hour = new Date(shopOrder.deliveredAt).getHours();
      stats[hour] = (stats[hour] || 0) + 1;
    });

    let formattedStats = Object.keys(stats).map((hour) => ({
      hour: parseInt(hour),
      count: stats[hour],
    }));

    formattedStats.sort((a, b) => a.hour - b.hour);

    return res.status(200).json({
      success: true,
      data: formattedStats,
    });

  } catch (error) {
    console.log("ERROR:", error); // ✅ debug
    return res.status(500).json({
      success: false,
      message: `today delivery error ${error.message}`,
    });
  }
};
