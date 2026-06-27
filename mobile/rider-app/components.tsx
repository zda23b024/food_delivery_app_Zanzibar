import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RiderOrder } from "./types";
import { formatMoney } from "./data";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function StatCard({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color="#127C83" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function OrderCard({ order, actionLabel, onAction }: { order: RiderOrder; actionLabel: string; onAction?: () => void }) {
  return (
    <View style={styles.orderCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.orderId}>{order.id}</Text>
        <Text style={styles.payout}>{formatMoney(order.payout)}</Text>
      </View>
      <Text style={styles.restaurant}>{order.restaurant}</Text>
      <Text style={styles.detail}>Pickup: {order.pickup}</Text>
      <Text style={styles.detail}>Dropoff: {order.dropoff}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.chip}>{order.distanceKm} km</Text>
        <Text style={styles.chip}>{order.items} items</Text>
        <Text style={styles.chip}>{order.status}</Text>
      </View>
      <Pressable style={styles.button} onPress={onAction}>
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    marginBottom: 18
  },
  title: {
    color: "#1A1A1A",
    fontSize: 26,
    fontWeight: "800"
  },
  subtitle: {
    color: "#6F737B",
    fontSize: 14
  },
  statCard: {
    flex: 1,
    minWidth: 105,
    borderColor: "#E7E8EC",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
    gap: 8
  },
  statValue: {
    color: "#1A1A1A",
    fontSize: 18,
    fontWeight: "800"
  },
  statLabel: {
    color: "#6F737B",
    fontSize: 12
  },
  orderCard: {
    borderColor: "#E7E8EC",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 9,
    marginBottom: 12
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  orderId: {
    color: "#1A1A1A",
    fontWeight: "800"
  },
  payout: {
    color: "#FF6B00",
    fontWeight: "800"
  },
  restaurant: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "700"
  },
  detail: {
    color: "#6F737B"
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    backgroundColor: "#F1F3F4",
    borderRadius: 8,
    color: "#515760",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  button: {
    alignItems: "center",
    backgroundColor: "#FF6B00",
    borderRadius: 8,
    minHeight: 44,
    justifyContent: "center",
    marginTop: 4
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800"
  }
});
