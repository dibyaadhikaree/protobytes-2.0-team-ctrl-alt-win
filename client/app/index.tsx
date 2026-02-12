import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { API_BASE_URL } from "./config";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fetchWelcome = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/`); // your index route
      const text = await res.text();
      setData(text);
    } catch (e: any) {
      setError(e?.message || "Network request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWelcome();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 10 }}>
        ChitoPay
      </Text>

      <Pressable
        onPress={fetchWelcome}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 10,
          borderWidth: 1,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 16 }}>Test Backend Connection</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={{ fontSize: 16 }}>❌ {error}</Text>
      ) : (
        <Text style={{ fontSize: 15 }}>✅ {data || "No response yet"}</Text>
      )}
    </View>
  );
}
