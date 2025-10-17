// mobile/app/donor/CreateDonation.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, ScrollView, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import client from "../../src/api/client";
import MapPicker from "../../src/components/MapPicker";

type UploadedImage = { uri: string; name: string; type: string };

export default function CreateDonation() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);

  // pick image using expo-image-picker
  async function pickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow photo access to attach images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.7,
      });

      // New expo-image-picker returns { canceled: boolean, assets: [...] }
      // handle both older and newer result shapes
      if ("canceled" in result && result.canceled) return;
      const asset = ("assets" in result ? result.assets[0] : (result as any));
      if (!asset || !asset.uri) return;

      const uri: string = asset.uri;
      const filename = uri.split("/").pop() || `photo_${Date.now()}.jpg`;
      const ext = filename.split(".").pop() || "jpg";
      const mime = ext === "png" ? "image/png" : "image/jpeg";

      setImages((prev) => [...prev, { uri, name: filename, type: mime }]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to pick image");
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  // called by MapPicker when user taps map
  function handlePickLocation({ lat, lng }: { lat: number; lng: number }) {
    setPickupCoords({ lat, lng });
  }

  // form validation
  function validate() {
    if (!title.trim()) { Alert.alert("Validation", "Please enter a title."); return false; }
    if (!quantity.trim()) { Alert.alert("Validation", "Enter quantity/packaging info."); return false; }
    if (!pickupCoords) { Alert.alert("Validation", "Pick a pickup location on the map."); return false; }
    return true;
  }

  async function submitDonation() {
    if (!validate()) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1) upload images (if any)
      let uploadedImageData: any[] = [];
      if (images.length > 0) {
        const form = new FormData();
        images.forEach((img, idx) => {
          // For Expo on Android/iOS, FormData expects { uri, name, type }
          form.append("images", {
            uri: img.uri,
            name: img.name,
            type: img.type,
          } as any);
        });

        const uploadRes = await client.post("/uploads", form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (p) => {
            if (p.total) {
              setUploadProgress(Math.round((p.loaded * 100) / p.total));
            }
          },
        });

        // expect backend returns array of image paths or objects
        uploadedImageData = uploadRes.data || [];
      }

      // 2) create donation record
      const payload = {
        title: title.trim(),
        description: description.trim(),
        quantity: quantity.trim(),
        pickupLat: pickupCoords!.lat,
        pickupLng: pickupCoords!.lng,
        images: uploadedImageData,
      };

      await client.post("/donations", payload);

      Alert.alert("Success", "Donation posted successfully!");
      // navigate back to DonorHome or donation list
      router.push("/donor/DonorHome");
    } catch (err: any) {
      // try to show server error
      Alert.alert("Upload failed", err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Create Donation</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} placeholder="Vegetables / Leftover rice / etc." value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Quantity / Packaging</Text>
      <TextInput style={styles.input} placeholder="2 boxes / 5 packets" value={quantity} onChangeText={setQuantity} />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput style={[styles.input, { height: 90 }]} placeholder="Additional notes (e.g. reheatable, contains dairy...)" value={description} onChangeText={setDescription} multiline />

      <Text style={styles.label}>Images (optional)</Text>
      <View style={styles.imageRow}>
        {images.map((img, i) => (
          <View key={i} style={styles.imageWrap}>
            <Image source={{ uri: img.uri }} style={styles.thumb} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
              <Text style={styles.removeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
          <Text style={{ fontSize: 32 }}>＋</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Pickup Location</Text>
      <View style={{ height: 260, width: "100%", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <MapPicker onPick={handlePickLocation} initial={pickupCoords ? { latitude: pickupCoords.lat, longitude: pickupCoords.lng } : undefined} />
      </View>
      {pickupCoords && <Text>Selected: {pickupCoords.lat.toFixed(5)}, {pickupCoords.lng.toFixed(5)}</Text>}

      {isUploading ? (
        <View style={styles.progressWrap}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>{uploadProgress}%</Text>
        </View>
      ) : (
        <Button title="Submit Donation" onPress={submitDonation} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: "stretch", gap: 8 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  label: { marginTop: 8, marginBottom: 4, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, backgroundColor: "#fff" },
  imageRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" } as any,
  imageWrap: { position: "relative", marginRight: 8 },
  thumb: { width: 100, height: 100, borderRadius: 8 },
  removeBtn: { position: "absolute", top: -8, right: -8, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center" },
  removeTxt: { color: "#fff", fontSize: 12 },
  addImageBtn: { width: 100, height: 100, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", justifyContent: "center", alignItems: "center", marginRight: 8 },
  progressWrap: { alignItems: "center", padding: 16 }
});
