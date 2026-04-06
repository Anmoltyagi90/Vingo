import User from "./models/user.model.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("identity", async ({ userId }) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          {
            socketId: socket.id,
            isOnline: true,
          },
          { new: true },
        );

        console.log("User updated:", user?.name);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("updateLocation", async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          isOnline: true,
          socketId: socket.id,
        });

        if (user) {
          io.emit("upadteDeliveryLocation", {
            deliveryBoyId: userId,
            latitude,
            longitude,
          });
        }
      } catch (error) {
        console.log(error)
      }
    });

    socket.on("disconnect", async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { isOnline: false, socketId: null },
        );

        console.log("User disconnected:", socket.id);
      } catch (error) {
        console.log(error);
      }
    });
  });
};
