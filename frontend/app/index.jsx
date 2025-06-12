import { Redirect } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";

export default function Index() {
  const { authState } = useContext(AuthContext);

  return authState?.authenticated ? (
    <Redirect href="/(tabs)/phrases" />
  ) : (
    <Redirect href="/login" />
  );
}
