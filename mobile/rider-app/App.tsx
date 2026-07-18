import { useEffect, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Header, OrderCard, StatCard } from "./components";
import { createTrackingSocket, riderApi } from "./api";
import type { RiderOrder } from "./types";

type Screen = "Login" | "Home" | "Available" | "Accepted" | "Navigation" | "Earnings" | "Profile" | "Settings";

const tabs: { screen: Screen; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { screen: "Home", icon: "home", label: "Home" },
  { screen: "Available", icon: "list", label: "Available" },
  { screen: "Accepted", icon: "bag-check", label: "Accepted" },
  { screen: "Earnings", icon: "wallet", label: "Earnings" },
  { screen: "Profile", icon: "person", label: "Profile" }
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("Login");
  const [online, setOnline] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState<any | null>(null);
  const [rider, setRider] = useState<any | null>(null);
  const [availableOrders, setAvailableOrders] = useState<RiderOrder[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<RiderOrder[]>([]);
  const [statusMessage, setStatusMessage] = useState("Login to load live rider orders from the backend.");

  async function handleLogin(phone: string, password: string) {
    const tokens = await riderApi.login(phone, password);
    const [profile, riderProfile, liveAvailable, liveAccepted] = await Promise.all([
      riderApi.me(tokens.access_token),
      riderApi.riderProfile(tokens.access_token),
      riderApi.availableOrders(tokens.access_token),
      riderApi.acceptedOrders(tokens.access_token)
    ]);
    setToken(tokens.access_token);
    setUser(profile);
    setRider(riderProfile);
    setOnline(Boolean((riderProfile as any).is_online));
    setAvailableOrders(mapBackendOrders(liveAvailable as any[], "Available"));
    setAcceptedOrders(mapBackendOrders(liveAccepted as any[], "Accepted"));
    setStatusMessage("Connected to backend.");
    setScreen("Home");
  }

  async function handleOnlineChange(value: boolean) {
    setOnline(value);
    if (token && rider?.id) {
      try {
        const updated = await riderApi.updateRider(rider.id, { is_online: value, is_available: value }, token);
        setRider(updated);
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not update rider availability.");
      }
    }
  }

  function content() {
    if (screen === "Login") {
      return <LoginScreen onLogin={handleLogin} />;
    }
    if (screen === "Home") {
      return <HomeScreen online={online} setOnline={handleOnlineChange} setScreen={setScreen} message={statusMessage} orders={availableOrders} rider={rider} />;
    }
    if (screen === "Available") {
      return <AvailableOrdersScreen setScreen={setScreen} orders={availableOrders} token={token} riderId={rider?.id} setAcceptedOrders={setAcceptedOrders} />;
    }
    if (screen === "Accepted") {
      return <AcceptedOrdersScreen setScreen={setScreen} orders={acceptedOrders} />;
    }
    if (screen === "Navigation") {
      return <NavigationScreen setScreen={setScreen} token={token} riderId={rider?.id} order={acceptedOrders[0]} />;
    }
    if (screen === "Earnings") {
      return <EarningsScreen setScreen={setScreen} token={token} rider={rider} />;
    }
    if (screen === "Profile") {
      return <ProfileScreen setScreen={setScreen} user={user} rider={rider} />;
    }
    return <SettingsScreen setScreen={setScreen} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        {content()}
        {screen !== "Login" ? (
          <View style={styles.tabBar}>
            {tabs.map((tab) => (
              <Pressable key={tab.screen} style={styles.tabItem} onPress={() => setScreen(tab.screen)}>
                <Ionicons name={tab.icon} size={21} color={screen === tab.screen ? "#FF6B00" : "#6F737B"} />
                <Text style={[styles.tabText, screen === tab.screen && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function mapBackendOrders(orders: any[], fallbackStatus: RiderOrder["status"]): RiderOrder[] {
  return orders.map((order) => ({
    id: order.id,
    restaurant: order.restaurant_id?.slice(0, 8) || "Restaurant",
    customer: order.customer_id?.slice(0, 8) || "Customer",
    pickup: "Restaurant pickup",
    dropoff: order.delivery_address_id?.slice(0, 8) || "Customer address",
    distanceKm: Number(order.distance_km || 0),
    payout: Math.max(3500, Math.round(Number(order.delivery_fee || 0) * 0.75)),
    status: order.status ? order.status.replaceAll("_", " ").replace(/\b\w/g, (letter: string) => letter.toUpperCase()) : fallbackStatus,
    items: order.items?.length || 1
  }));
}

function formatMoney(value: number) {
  return `TZS ${value.toLocaleString("en-TZ")}`;
}

function LoginScreen({ onLogin }: { onLogin: (phone: string, password: string) => Promise<void> }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit() {
    setMessage("");
    try {
      await onLogin(phone, password);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    }
  }

  return (
    <View style={styles.loginScreen}>
      <View style={styles.loginCard}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>Z</Text>
        </View>
        <Text style={styles.loginTitle}>Zanmart Rider</Text>
        <Text style={styles.loginSubtitle}>Deliver with Swiggy-inspired speed across Zanzibar.</Text>
        <Text style={styles.loginTag}>Sign in and pick up your next delivery job in minutes.</Text>
        <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        {message ? <Text style={styles.errorText}>{message}</Text> : null}
        <Pressable style={styles.primaryButton} onPress={submit}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HomeScreen({
  online,
  setOnline,
  setScreen,
  message,
  orders,
  rider
}: {
  online: boolean;
  setOnline: (value: boolean) => void;
  setScreen: (screen: Screen) => void;
  message: string;
  orders: RiderOrder[];
  rider: any | null;
}) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Home" subtitle={rider?.service_area || "Stone Town service area"} onPress={() => setScreen("Home")} />
      <Text style={styles.muted}>{message}</Text>
      <View style={styles.onlinePanel}>
        <View>
          <Text style={styles.panelTitle}>{online ? "Online" : "Offline"}</Text>
          <Text style={styles.muted}>{online ? "Ready to receive orders" : "Go online to start deliveries"}</Text>
        </View>
        <Switch value={online} onValueChange={setOnline} thumbColor={online ? "#FF6B00" : "#FFFFFF"} />
      </View>
      <View style={styles.statsRow}>
        <StatCard icon="bicycle" label="Deliveries" value={String(rider?.total_deliveries || 0)} />
        <StatCard icon="star" label="Rating" value={String(rider?.average_rating || "0.0")} />
        <StatCard icon="cash" label="Earned" value={formatMoney(Number(rider?.total_earnings || 0))} />
      </View>
      {orders[0] ? <OrderCard order={orders[0]} actionLabel="Accept Order" onAction={() => setScreen("Available")} /> : <Text style={styles.muted}>No available orders yet.</Text>}
    </ScrollView>
  );
}

function AvailableOrdersScreen({
  setScreen,
  orders,
  token,
  riderId,
  setAcceptedOrders
}: {
  setScreen: (screen: Screen) => void;
  orders: RiderOrder[];
  token: string;
  riderId?: string;
  setAcceptedOrders: (updater: (orders: RiderOrder[]) => RiderOrder[]) => void;
}) {
  async function acceptOrder(order: RiderOrder) {
    if (token) {
      await riderApi.updateOrderStatus(order.id, "picked_up", token, riderId);
    }
    setAcceptedOrders((current) => [{ ...order, status: "Picked Up" }, ...current]);
    setScreen("Accepted");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Available Orders" subtitle="Nearby requests waiting for riders" onPress={() => setScreen("Home")} />
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} actionLabel="Accept Order" onAction={() => acceptOrder(order)} />
      ))}
    </ScrollView>
  );
}

function AcceptedOrdersScreen({ setScreen, orders }: { setScreen: (screen: Screen) => void; orders: RiderOrder[] }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Accepted Orders" subtitle="Pickup and delivery tasks" onPress={() => setScreen("Home")} />
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} actionLabel="Start Navigation" onAction={() => setScreen("Navigation")} />
      ))}
    </ScrollView>
  );
}

function NavigationScreen({ setScreen, token, riderId, order }: { setScreen: (screen: Screen) => void; token: string; riderId?: string; order?: RiderOrder }) {
  const orderId = process.env.EXPO_PUBLIC_TRACKING_ORDER_ID || order?.id || "";
  const socketRef = useRef<WebSocket | null>(null);
  const [trackingState, setTrackingState] = useState<"connecting" | "live" | "offline">("connecting");
  const [latitude, setLatitude] = useState("-6.162000");
  const [longitude, setLongitude] = useState("39.192000");
  const [destinationLatitude, setDestinationLatitude] = useState("-6.154000");
  const [destinationLongitude, setDestinationLongitude] = useState("39.203000");
  const [eta, setEta] = useState<{ distance_km: number; eta_minutes: number } | null>(null);
  const [message, setMessage] = useState("Enter rider coordinates, calculate ETA, then send a live tracking update.");
  const currentLatitude = Number(latitude);
  const currentLongitude = Number(longitude);
  const targetLatitude = Number(destinationLatitude);
  const targetLongitude = Number(destinationLongitude);
  const hasCurrentLocation = Number.isFinite(currentLatitude) && Number.isFinite(currentLongitude);
  const hasDestination = Number.isFinite(targetLatitude) && Number.isFinite(targetLongitude);

  useEffect(() => {
    if (!orderId) {
      setTrackingState("offline");
      return;
    }
    const socket = createTrackingSocket(orderId);
    socketRef.current = socket;
    socket.onopen = () => setTrackingState("live");
    socket.onerror = () => setTrackingState("offline");
    socket.onclose = () => setTrackingState("offline");

    return () => {
      socket.close();
    };
  }, [orderId]);

  async function calculateEta() {
    if (!hasCurrentLocation || !hasDestination) {
      setMessage("Add valid current and destination coordinates first.");
      return;
    }
    try {
      const result = await riderApi.getDistance({
        origin_latitude: currentLatitude,
        origin_longitude: currentLongitude,
        destination_latitude: targetLatitude,
        destination_longitude: targetLongitude
      });
      setEta(result);
      setMessage(`ETA ${result.eta_minutes} min, ${result.distance_km.toFixed(2)} km.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not calculate ETA.");
    }
  }

  async function sendLiveLocation(status = "on_the_way") {
    if (!orderId || !hasCurrentLocation) {
      setMessage("No active order or valid current coordinates.");
      return;
    }
    const payload = {
      order_id: orderId,
      rider_id: riderId,
      status,
      latitude: currentLatitude,
      longitude: currentLongitude,
      eta_minutes: eta?.eta_minutes,
      distance_km: eta?.distance_km,
      message: status === "delivered" ? "Delivery completed by rider" : "Rider location updated"
    };
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "location_update", ...payload }));
    }
    if (token) {
      await riderApi.sendTracking(payload, token);
      if (status === "on_the_way") {
        await riderApi.updateOrderStatus(orderId, "on_the_way", token, riderId);
      }
    }
    setMessage(status === "delivered" ? "Delivery completion sent." : "Live location sent to customer.");
  }

  function openGoogleMaps() {
    const url = hasCurrentLocation && hasDestination
      ? `https://www.google.com/maps/dir/?api=1&origin=${currentLatitude},${currentLongitude}&destination=${targetLatitude},${targetLongitude}&travelmode=driving`
      : "https://www.google.com/maps";
    Linking.openURL(url);
  }

  async function completeDelivery() {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "status_update",
          status: "delivered",
          rider_id: riderId,
          latitude: hasCurrentLocation ? currentLatitude : undefined,
          longitude: hasCurrentLocation ? currentLongitude : undefined,
          eta_minutes: 0,
          distance_km: 0,
          message: "Delivery completed by rider"
        })
      );
    }
    if (token && orderId) {
      await riderApi.sendTracking(
        {
          order_id: orderId,
          rider_id: riderId,
          status: "delivered",
          latitude: hasCurrentLocation ? currentLatitude : undefined,
          longitude: hasCurrentLocation ? currentLongitude : undefined,
          eta_minutes: 0,
          distance_km: 0,
          message: "Delivery completed by rider"
        },
        token
      );
      await riderApi.updateOrderStatus(orderId, "delivered", token, riderId);
    }
    setScreen("Earnings");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Navigation" subtitle={order ? `${order.restaurant} to ${order.dropoff}` : "Pickup to customer"} onPress={() => setScreen("Home")} />
      <View style={styles.navigationPanel}>
        <View style={styles.navigationHeader}>
          <Ionicons name="navigate" size={34} color="#FF6B00" />
          <View>
            <Text style={styles.panelTitle}>{eta ? `${eta.distance_km.toFixed(2)} km - ${eta.eta_minutes} min` : "Live navigation"}</Text>
            <Text style={styles.muted}>Tracking socket: {trackingState}</Text>
          </View>
        </View>
        <View style={styles.coordinateGrid}>
          <TextInput style={styles.input} placeholder="Current latitude" keyboardType="numbers-and-punctuation" value={latitude} onChangeText={setLatitude} />
          <TextInput style={styles.input} placeholder="Current longitude" keyboardType="numbers-and-punctuation" value={longitude} onChangeText={setLongitude} />
          <TextInput style={styles.input} placeholder="Destination latitude" keyboardType="numbers-and-punctuation" value={destinationLatitude} onChangeText={setDestinationLatitude} />
          <TextInput style={styles.input} placeholder="Destination longitude" keyboardType="numbers-and-punctuation" value={destinationLongitude} onChangeText={setDestinationLongitude} />
        </View>
        <Text style={styles.muted}>{message}</Text>
      </View>
      <View style={styles.stepList}>
        <Text style={styles.step}>1. Calculate ETA from rider location to customer destination</Text>
        <Text style={styles.step}>2. Open Google Maps for turn-by-turn navigation</Text>
        <Text style={styles.step}>3. Send live tracking updates until delivery is complete</Text>
      </View>
      <Pressable style={styles.secondaryButton} onPress={calculateEta}>
        <Text style={styles.secondaryButtonText}>Calculate ETA</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={openGoogleMaps}>
        <Text style={styles.secondaryButtonText}>Open Google Maps</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => sendLiveLocation()}>
        <Text style={styles.secondaryButtonText}>Send Live Location</Text>
      </Pressable>
      <Pressable style={styles.primaryButton} onPress={completeDelivery}>
        <Text style={styles.primaryButtonText}>Complete Delivery</Text>
      </Pressable>
    </ScrollView>
  );
}

function EarningsScreen({ setScreen, token, rider }: { setScreen: (screen: Screen) => void; token: string; rider: any | null }) {
  const [earnings, setEarnings] = useState<any | null>(null);

  useEffect(() => {
    if (!token) return;
    riderApi.earnings(token).then(setEarnings).catch(() => setEarnings(null));
  }, [token]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Earnings" subtitle="Today and weekly payout summary" onPress={() => setScreen("Home")} />
      <View style={styles.statsRow}>
        <StatCard icon="cash" label="Total" value={formatMoney(Number(earnings?.total_earnings || rider?.total_earnings || 0))} />
        <StatCard icon="calendar" label="Deliveries" value={String(earnings?.total_deliveries || rider?.total_deliveries || 0)} />
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Recent payouts</Text>
        <Text style={styles.detailLine}>Stone Town delivery - {formatMoney(5200)}</Text>
        <Text style={styles.detailLine}>Nungwi delivery - {formatMoney(7500)}</Text>
        <Text style={styles.detailLine}>SUZA campus delivery - {formatMoney(6800)}</Text>
      </View>
    </ScrollView>
  );
}

function ProfileScreen({ setScreen, user, rider }: { setScreen: (screen: Screen) => void; user: any | null; rider: any | null }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Profile" subtitle="Rider account and vehicle details" onPress={() => setScreen("Home")} />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{user?.full_name || "Rider"}</Text>
        <Text style={styles.detailLine}>{rider?.vehicle_type || "Vehicle"} - {rider?.vehicle_plate_number || "No plate"}</Text>
        <Text style={styles.detailLine}>Service area: {rider?.service_area || "Not set"}</Text>
        <Text style={styles.detailLine}>Total deliveries: {rider?.total_deliveries || 0}</Text>
      </View>
      <Pressable style={styles.secondaryButton} onPress={() => setScreen("Settings")}>
        <Text style={styles.secondaryButtonText}>Settings</Text>
      </Pressable>
    </ScrollView>
  );
}

function SettingsScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Settings" subtitle="Availability, language, and notifications" onPress={() => setScreen("Home")} />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Preferences</Text>
        <Text style={styles.detailLine}>Language: English</Text>
        <Text style={styles.detailLine}>Order alerts: Enabled</Text>
        <Text style={styles.detailLine}>Navigation: Google Maps</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7"
  },
  screen: {
    flex: 1
  },
  screenContent: {
    padding: 18,
    paddingBottom: 96
  },
  loginScreen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 14
  },
  logoMark: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FF6B00",
    borderRadius: 8,
    height: 68,
    justifyContent: "center",
    marginBottom: 8,
    width: 68
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900"
  },
  loginTitle: {
    color: "#1A1A1A",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center"
  },
  loginSubtitle: {
    color: "#6F737B",
    marginBottom: 4,
    textAlign: "center"
  },
  loginTag: {
    color: "#4A5568",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16
  },
  loginCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
    gap: 14
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E8EC",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 14
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#FF6B00",
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E8EC",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    marginBottom: 10
  },
  secondaryButtonText: {
    color: "#1A1A1A",
    fontWeight: "800"
  },
  onlinePanel: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E8EC",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    padding: 16
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E8EC",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16
  },
  panelTitle: {
    color: "#1A1A1A",
    fontSize: 17,
    fontWeight: "800"
  },
  muted: {
    color: "#6F737B"
  },
  errorText: {
    color: "#B42318",
    fontWeight: "700"
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14
  },
  navigationPanel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E8EC",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginBottom: 14,
    padding: 16
  },
  navigationHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  coordinateGrid: {
    gap: 10
  },
  stepList: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E8EC",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 14,
    padding: 16
  },
  step: {
    color: "#1A1A1A",
    fontWeight: "700"
  },
  detailLine: {
    color: "#515760"
  },
  tabBar: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E8EC",
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    left: 0,
    paddingBottom: 10,
    paddingTop: 10,
    position: "absolute",
    right: 0
  },
  tabItem: {
    alignItems: "center",
    gap: 4
  },
  tabText: {
    color: "#6F737B",
    fontSize: 11,
    fontWeight: "700"
  },
  tabTextActive: {
    color: "#FF6B00"
  }
});
