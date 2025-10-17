import React from "react";
import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function DonorHome() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome, Donor!</Text>
      <Button title="Create Donation" onPress={() => router.push("/donor/CreateDonation")} />
    </View>
  );
}
