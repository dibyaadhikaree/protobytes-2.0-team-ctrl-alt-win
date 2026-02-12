import { Stack } from "expo-router";
import { COLORS } from "../theme/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.bg },
        headerTitleStyle: { color: COLORS.text },
        headerTintColor: COLORS.text,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen name="otp" options={{ title: "OTP Verification" }} />
    </Stack>
  );
}
