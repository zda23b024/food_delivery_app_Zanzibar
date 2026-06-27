import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Header, OrderCard, StatCard } from "./components";
import { acceptedOrders, availableOrders, formatMoney } from "./data";

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

  function content() {
    if (screen === "Login") {
      return <LoginScreen onLogin={() => setScreen("Home")} />;
    }
    if (screen === "Home") {
      return <HomeScreen online={online} setOnline={setOnline} setScreen={setScreen} />;
    }
    if (screen === "Available") {
      return <AvailableOrdersScreen setScreen={setScreen} />;
    }
    if (screen === "Accepted") {
      return <AcceptedOrdersScreen setScreen={setScreen} />;
    }
    if (screen === "Navigation") {
      return <NavigationScreen setScreen={setScreen} />;
    }
    if (screen === "Earnings") {
      return <EarningsScreen />;
    }
    if (screen === "Profile") {
      return <ProfileScreen setScreen={setScreen} />;
    }
    return <SettingsScreen />;
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

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <View style={styles.loginScreen}>
      <View style={styles.logoMark}>
        <Text style={styles.logoText}>Z</Text>
      </View>
      <Text style={styles.loginTitle}>ZanMeal Rider</Text>
      <Text style={styles.loginSubtitle}>Delivery partner app</Text>
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry />
      <Pressable style={styles.primaryButton} onPress={onLogin}>
        <Text style={styles.primaryButtonText}>Login</Text>
      </Pressable>
    </View>
  );
}

function HomeScreen({ online, setOnline, setScreen }: { online: boolean; setOnline: (value: boolean) => void; setScreen: (screen: Screen) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Home" subtitle="Stone Town service area" />
      <View style={styles.onlinePanel}>
        <View>
          <Text style={styles.panelTitle}>{online ? "Online" : "Offline"}</Text>
          <Text style={styles.muted}>{online ? "Ready to receive orders" : "Go online to start deliveries"}</Text>
        </View>
        <Switch value={online} onValueChange={setOnline} thumbColor={online ? "#FF6B00" : "#FFFFFF"} />
      </View>
      <View style={styles.statsRow}>
        <StatCard icon="bicycle" label="Deliveries" value="18" />
        <StatCard icon="star" label="Rating" value="4.8" />
        <StatCard icon="cash" label="Today" value="TZS 62K" />
      </View>
      <OrderCard order={availableOrders[0]} actionLabel="Accept Order" onAction={() => setScreen("Accepted")} />
    </ScrollView>
  );
}

function AvailableOrdersScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Available Orders" subtitle="Nearby requests waiting for riders" />
      {availableOrders.map((order) => (
        <OrderCard key={order.id} order={order} actionLabel="Accept Order" onAction={() => setScreen("Accepted")} />
      ))}
    </ScrollView>
  );
}

function AcceptedOrdersScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Accepted Orders" subtitle="Pickup and delivery tasks" />
      {acceptedOrders.map((order) => (
        <OrderCard key={order.id} order={order} actionLabel="Start Navigation" onAction={() => setScreen("Navigation")} />
      ))}
    </ScrollView>
  );
}

function NavigationScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Navigation" subtitle="Dhow Bites to Kendwa Rocks" />
      <View style={styles.mapMock}>
        <Ionicons name="navigate" size={42} color="#FFFFFF" />
        <Text style={styles.mapText}>4.7 km - 16 min</Text>
      </View>
      <View style={styles.stepList}>
        <Text style={styles.step}>1. Arrive at Dhow Bites</Text>
        <Text style={styles.step}>2. Confirm pickup code</Text>
        <Text style={styles.step}>3. Deliver to Kendwa Rocks reception</Text>
      </View>
      <Pressable style={styles.primaryButton} onPress={() => setScreen("Earnings")}>
        <Text style={styles.primaryButtonText}>Complete Delivery</Text>
      </Pressable>
    </ScrollView>
  );
}

function EarningsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Earnings" subtitle="Today and weekly payout summary" />
      <View style={styles.statsRow}>
        <StatCard icon="cash" label="Today" value={formatMoney(62500)} />
        <StatCard icon="calendar" label="Week" value={formatMoney(318000)} />
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

function ProfileScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Profile" subtitle="Rider account and vehicle details" />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Hassan Mussa</Text>
        <Text style={styles.detailLine}>Motorbike - ZNZ 204 B</Text>
        <Text style={styles.detailLine}>Service area: Stone Town</Text>
        <Text style={styles.detailLine}>Total deliveries: 312</Text>
      </View>
      <Pressable style={styles.secondaryButton} onPress={() => setScreen("Settings")}>
        <Text style={styles.secondaryButtonText}>Settings</Text>
      </Pressable>
    </ScrollView>
  );
}

function SettingsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Header title="Settings" subtitle="Availability, language, and notifications" />
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
    marginBottom: 10,
    textAlign: "center"
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
    justifyContent: "center"
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
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14
  },
  mapMock: {
    alignItems: "center",
    backgroundColor: "#127C83",
    borderRadius: 8,
    height: 280,
    justifyContent: "center",
    marginBottom: 14
  },
  mapText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 10
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
