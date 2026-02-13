import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, Share } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../theme/colors";
import { generatePaymentQRData } from "../services/qr";
import QRCode from 'react-native-qrcode-svg';
import AppButton from "../components/AppButton";
import { getCachedWallet } from "../services/walletCache";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function MyQR() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const amountNum = useMemo(() => {
    return Number(amount) || 0;
  }, [amount]);

  useEffect(() => {
    console.log("MyQR page mounted with amount:", amount);
    const loadWallet = async () => {
      try {
        setLoading(true);
        console.log("Loading wallet data...");
        const data = await getCachedWallet();
        console.log("Wallet data loaded:", data);
        setWalletData(data);
      } catch (error) {
        console.error("Error loading wallet:", error);
      } finally {
        setLoading(false);
      }
    };
    loadWallet();
  }, [amount]);

  const qrData = useMemo(() => {
    console.log("Generating QR for amount:", amountNum);
    
    // Use real wallet address if available, otherwise dummy
    const walletAddress = walletData?.address || 'dummy-wallet-address';
    const data = generatePaymentQRData(amountNum, 'NPR', walletAddress);
    const qrString = JSON.stringify(data);
    console.log("QR generated:", qrString);
    return qrString;
  }, [amountNum, walletData]);

  const onShare = async () => {
    try {
      await Share.share({
        message: `Send NPR ${formatMoney(amountNum)} - Scan this QR code`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  console.log("MyQR rendering with amount:", amount, "qrData length:", qrData?.length || 0);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.text, fontSize: 16 }}>Loading QR Code...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 18, gap: 14 }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: COLORS.text, fontSize: 18 }}>←</Text>
        </Pressable>
        <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "900" }}>
          Payment QR Code
        </Text>
      </View>

      {/* Amount */}
      <View style={{ 
        backgroundColor: COLORS.card, 
        padding: 16, 
        borderRadius: 18,
        alignItems: "center" 
      }}>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>Amount to Pay</Text>
        <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: "900" }}>
          NPR {formatMoney(amountNum)}
        </Text>
      </View>

      {/* QR Code */}
      <View style={{ 
        backgroundColor: COLORS.card, 
        padding: 20, 
        borderRadius: 18,
        alignItems: "center" 
      }}>
        <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "900" }}>
          Scan QR Code
        </Text>
        
        <View style={{ 
          backgroundColor: "white", 
          padding: 16, 
          borderRadius: 12,
          marginTop: 16 
        }}>
          <QRCode 
            value={qrData} 
            size={200}
            color="black"
            backgroundColor="white"
          />
        </View>

        <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 12 }}>
          QR contains payment details for NPR {formatMoney(amountNum)}
        </Text>
      </View>

      {/* Debug Info */}
      <View style={{ 
        backgroundColor: "rgba(84, 119, 146, 0.10)", 
        padding: 16, 
        borderRadius: 14 
      }}>
        <Text style={{ color: COLORS.text, fontWeight: "900", fontSize: 14 }}>
          Debug Info:
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>
          Amount: {amountNum}{'\n'}
          Wallet: {walletData?.address ? 'Real wallet' : 'Dummy wallet'}{'\n'}
          QR Length: {qrData?.length || 0}
        </Text>
      </View>

      <AppButton title="Share" onPress={onShare} />
    </ScrollView>
  );
}
