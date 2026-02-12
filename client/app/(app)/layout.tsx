import { Stack } from "expo-router";
import { COLORS } from "../theme/colors";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    />
  );
}
