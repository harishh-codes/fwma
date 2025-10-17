import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../../src/api/client";

export default function OtpScreen() {
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState("");

  async function verifyOtp() {
    try {
      const res = await client.post("/auth/verify-otp", { phone, otp });
      await AsyncStorage.setItem("token", res.data.token);
      router.replace("/donor/DonorHome");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Enter OTP" value={otp} onChangeText={setOtp} />
      <Button title="Verify" onPress={verifyOtp} />
    </View>
  );
}
