import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { getUserRole } from "../src/utils/auth";

export default function RootLayout() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => setRole(await getUserRole()))();
  }, []);

  if (role === null) return null; // splash / loader placeholder

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {role === "donor" && <Stack.Screen name="donor/DonorHome" />}
      {role === "ngo" && <Stack.Screen name="ngo/NgoHome" />}
      {role === "delivery" && <Stack.Screen name="delivery/DeliveryHome" />}
      {!role && <Stack.Screen name="auth/PhoneInput" />}
    </Stack>
  );
}
