import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    totalAmount: 0,
    myOrders: [],
    searchItems: null,
    socket: null,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setShopInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },

    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },

    addToCart: (state, action) => {
      const cartItem = action.payload;

      const existing = state.cartItems.find((i) => i.id === cartItem.id);

      if (existing) {
        existing.quantity += 1; // ya cartItem.quantity
      } else {
        state.cartItems.push({ ...cartItem, quantity: 1 });
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;

      const item = state.cartItems.find((i) => i.id === id);

      if (!item) return;

      if (quantity <= 0) {
        state.cartItems = state.cartItems.filter((i) => i.id !== id);
      } else {
        item.quantity = quantity;
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    removeFromCart: (state, action) => {
      const id = action.payload;

      state.cartItems = state.cartItems.filter((item) => item.id !== id);

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },

    addMyOrder: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders];
    },

    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload || {};

      const order = state.myOrders.find((o) => o._id === orderId);

      if (!order) return;

      const shopOrder = order.shopOrders.find(
        (s) => String(s.shop?._id || s.shop) === String(shopId),
      );

      if (shopOrder) {
        shopOrder.status = status;
      }
    },

    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find((o) => o._id === orderId);
      if (order) {
        const shopOrder = order.shopOrders.find(
          (so) => String(so.shop?._id || so.shop) === String(shopId),
        );
        if (shopOrder) {
          shopOrder.status = status;
        }
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },
  },
});

export const {
  setUserData,
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
  setShopInMyCity,
  setItemsInMyCity,
  addToCart,
  removeFromCart,
  updateQuantity,
  totalAmount,
  setMyOrders,
  addMyOrder,
  updateOrderStatus,
  setSearchItems,
  setSocket,
  updateRealtimeOrderStatus
} = userSlice.actions;

export default userSlice.reducer;
