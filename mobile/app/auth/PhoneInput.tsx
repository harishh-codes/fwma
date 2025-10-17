import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { router } from "expo-router";
import client from "../../src/api/client";

export default function PhoneInput() {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("donor");

  async function requestOtp() {
    try {
      const res = await client.post("/auth/request-otp", { phone, role, name: "Demo" });
      Alert.alert("Demo OTP", res.data.otp);
      router.push({ pathname: "/auth/OtpScreen", params: { phone } });
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Enter phone" value={phone} onChangeText={setPhone} />
      <Button title="Request OTP" onPress={requestOtp} />
    </View>
  );
}
