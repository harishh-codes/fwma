import React, { useState } from "react";
import { View, Button, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import client from "../../src/api/client";

export default function NgoProfile() {
  const [doc, setDoc] = useState<string | null>(null);

  async function uploadDoc() {
    const result = await ImagePicker.launchImageLibraryAsync();
    if (result.canceled || !result.assets?.length) return;
    const uri = result.assets[0].uri;

    const form = new FormData();
    form.append("file", { uri, name: "proof.jpg", type: "image/jpeg" } as any);

    await client.post("/ngo/upload-proof", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setDoc(uri);
    Alert.alert("Uploaded", "Document uploaded successfully");
  }

  return (
    <View style={{ padding: 20 }}>
      <Button title="Upload Proof Document" onPress={uploadDoc} />
      {doc && <Image source={{ uri: doc }} style={{ width: 200, height: 200, marginTop: 10 }} />}
    </View>
  );
}
