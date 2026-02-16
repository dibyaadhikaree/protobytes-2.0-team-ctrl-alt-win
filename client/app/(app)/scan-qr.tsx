import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Alert, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CameraView, Camera } from "expo-camera";
import { COLORS } from "../theme/colors";
import { handleScannedQR } from "../services/offlinePayment";

export default function ScanQR() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: "sender" | "receiver" }>();
  const scanMode = useMemo(
    () => (mode === "receiver" ? "receiver" : "sender"),
    [mode]
  );

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (e) {
        setHasPermission(false);
      }
    })();
  }, []);

  const onScanned = async (data: string) => {
    if (scanned) return;
    setScanned(true);

    try {
      const result = await handleScannedQR(scanMode, data);

      if (result.action === "SHOW_ACK") {
        router.replace({
          pathname: "/(app)/qr-display",
          params: {
            title: "Show ACK QR",
            subtitle: "Let the sender scan this to complete payment",
            qr: encodeURIComponent(result.ackString),
          },
        });
        return;
      }

      if (result.action === "FINALIZED") {
        Alert.alert("Success ✅", "Payment completed offline. Pending sync.");
        router.replace("/(app)/home");
        return;
      }

      Alert.alert("Done", "QR processed.");
      router.replace("/(app)/home");
    } catch (e: any) {
      Alert.alert("Scan Error", e?.message || "Could not process scanned QR");
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: COLORS.text }}>
          Requesting camera permission…
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          padding: 16,
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "900" }}>
          Camera Permission Needed
        </Text>
        <Text style={{ color: COLORS.muted, textAlign: "center" }}>
          Enable camera permission to scan QR codes.
        </Text>

        <Pressable
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text style={{ color: COLORS.text, fontWeight: "800" }}>
            Grant Permission
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={{ paddingVertical: 10 }}
        >
          <Text style={{ color: COLORS.muted }}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => onScanned(String(data))}
      />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: 18,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>
          {scanMode === "receiver" ? "Scan PLEDGE QR" : "Scan ACK QR"}
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.75)",
            marginTop: 4,
            fontSize: 12,
          }}
        >
          {scanMode === "receiver"
            ? "Point camera at sender QR to receive money."
            : "Point camera at receiver ACK to finalize sending."}
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          backgroundColor: "rgba(0,0,0,0.35)",
          flexDirection: "row",
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Back</Text>
        </Pressable>

        <Pressable
          onPress={() => setScanned(false)}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
            alignItems: "center",
            opacity: scanned ? 1 : 0.7,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Scan Again</Text>
        </Pressable>
      </View>
    </View>
  );
}
