import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export async function getUserRole() {
  const token = await AsyncStorage.getItem("token");
  if (!token) return null;
  const decoded: any = jwtDecode(token);
  return decoded.role;
}
