import React, { useEffect, useState } from "react";
import { View, Button, Text, ScrollView } from "react-native";
import client from "../../src/api/client";

export default function DeliveryHome() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    const res = await client.get("/donations/available");
    setOffers(res.data);
  }

  async function acceptOffer(id: string) {
    await client.post(`/donations/${id}/assign`);
    alert("Offer accepted!");
  }

  return (
    <ScrollView>
      {offers.map((offer, i) => (
        <View key={i} style={{ padding: 10 }}>
          <Text>{offer.title}</Text>
          <Button title="Accept" onPress={() => acceptOffer(offer._id)} />
        </View>
      ))}
    </ScrollView>
  );
}
