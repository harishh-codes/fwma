// mobile/src/components/MapPicker.tsx
import React, { useState } from "react";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";

type Props = {
  onPick: (loc: { lat: number; lng: number }) => void;
  initial?: { latitude: number; longitude: number };
};

export default function MapPicker({ onPick, initial }: Props) {
  const [marker, setMarker] = useState(
    initial ? { latitude: initial.latitude, longitude: initial.longitude } : { latitude: 28.6139, longitude: 77.2090 }
  );

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: marker.latitude,
          longitude: marker.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setMarker({ latitude, longitude });
          onPick({ lat: latitude, lng: longitude });
        }}
      >
        <Marker coordinate={marker} />
      </MapView>
    </View>
  );
}
