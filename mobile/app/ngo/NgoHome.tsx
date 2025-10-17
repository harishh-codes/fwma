import React, { useEffect, useState } from "react";
import { View, Button, Text, ScrollView } from "react-native";
import * as Location from "expo-location";
import client from "../../src/api/client";

export default function NgoHome() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      const res = await client.get(`/donations/nearby?lng=${loc.coords.longitude}&lat=${loc.coords.latitude}&radius=5`);
      setDonations(res.data);
    })();
  }, []);

  async function acceptDonation(id: string) {
    await client.post(`/donations/${id}/accept`);
    alert("Donation accepted!");
  }

  return (
    <ScrollView>
      {donations.map((d, i) => (
        <View key={i} style={{ padding: 10 }}>
          <Text>{d.title}</Text>
          <Button title="Accept" onPress={() => acceptDonation(d._id)} />
        </View>
      ))}
    </ScrollView>
  );
}
