import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { connectSocket, getSocket } from "../../src/services/socket";

export default function DonationTimeline() {
  const [statusList, setStatusList] = useState([
    { step: "Posted", time: null },
    { step: "Accepted", time: null },
    { step: "Assigned", time: null },
    { step: "Picked Up", time: null },
    { step: "Delivered", time: null },
  ]);

  useEffect(() => {
    (async () => {
      await connectSocket();
      getSocket()?.on("donation:status:update", (data) => {
        setStatusList((prev) =>
          prev.map((s) =>
            s.step === data.status ? { ...s, time: data.timestamp } : s
          )
        );
      });
    })();

    return () => getSocket()?.off("donation:status:update");
  }, []);

  return (
    <View style={{ padding: 20 }}>
      {statusList.map((s, i) => (
        <Text key={i}>
          {s.step} {s.time ? `✅ (${s.time})` : "⏳"}
        </Text>
      ))}
    </View>
  );
}
