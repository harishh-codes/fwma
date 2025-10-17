import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { View } from "react-native";
import { connectSocket, getSocket } from "../../src/services/socket";

export default function TrackDonation() {
  const [marker, setMarker] = useState({ latitude: 28.61, longitude: 77.21 });

  useEffect(() => {
    (async () => {
      await connectSocket();
      getSocket()?.on("location:update", (data) => {
        if (data.donationId === "demo123") {
          setMarker({ latitude: data.lat, longitude: data.lng });
        }
      });
    })();

    return () => getSocket()?.off("location:update");
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={{
          latitude: marker.latitude,
          longitude: marker.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={marker} />
      </MapView>
    </View>
  );
}
