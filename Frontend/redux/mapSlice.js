import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
  name: "map",   // ✔ slice name added
  initialState: {
    location: {
      lat: null,
      lon: null,
    },
    address: null,
  },
  reducers: {
    setLocation: (state, action) => {
      const { lat, lon } = action.payload;
      state.location = { lat, lon };
    },

    setAddress: (state, action) => {   // ✔ spelling fixed
      state.address = action.payload;
    },
  },
});

export const { setAddress, setLocation } = mapSlice.actions;
export default mapSlice.reducer;