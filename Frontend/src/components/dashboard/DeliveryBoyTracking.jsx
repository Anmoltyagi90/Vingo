import React from "react";
import scooter from "../../assets/scooter.png";
import home from "../../assets/home.png";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSelector } from "react-redux";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const DeliveryBoyTracking = ({ data }) => {
  if (!data) return <p>No tracking data</p>;

  const deliveryBoyLat = data?.deliveryBoyLocation?.lat;
  const deliveryBoylon = data?.deliveryBoyLocation?.lon;

  const customerLat = data?.customerLocation?.lat;
  const customerlon = data?.customerLocation?.lon;

  // 🔴 Safety check
  if (!deliveryBoyLat || !customerLat) {
    return <p className="text-gray-400">Location not available</p>;
  }

  // ✅ Positions
  const deliveryBoyPos = [deliveryBoyLat, deliveryBoylon];
  const customerPos = [customerLat, customerlon];

  // ✅ Path define karo
  const path = [deliveryBoyPos, customerPos];

  const center = deliveryBoyPos;

  


  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🚚 Delivery Boy */}
        <Marker position={deliveryBoyPos} icon={deliveryBoyIcon}>
          <Popup>Delivery Boy Location</Popup>
        </Marker>

        {/* 🏠 Customer */}
        <Marker position={customerPos} icon={customerIcon}>
          <Popup>Customer Location</Popup>
        </Marker>

        {/* 🟠 Path Line */}
        <Polyline positions={path} color="blue" />
      </MapContainer>
    </div>
  );
};

export default DeliveryBoyTracking;
