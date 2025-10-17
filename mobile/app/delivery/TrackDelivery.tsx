import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import * as Location from "expo-location";
import { connectSocket, getSocket } from "../../src/services/socket";

export default function TrackDelivery() {
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    (async () => {
      await connectSocket();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          setCoords({ lat: latitude, lng: longitude });
          getSocket()?.emit("location:update", {
            donationId: "demo123", // replace dynamically
            lat: latitude,
            lng: longitude,
          });
        }
      );
    })();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Updating location...</Text>
      <Text>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</Text>
    </View>
  );
}
