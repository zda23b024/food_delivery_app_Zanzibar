import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RiderOrder } from "./types";
import { formatMoney } from "./data";

export function Header({ title, subtitle, onPress }: { title: string; subtitle?: string; onPress?: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.titlePressable, pressed && styles.titlePressed]}>
        <Text style={styles.title}>{title}</Text>
      </Pressable>
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
        <View>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderStatus}>{order.status}</Text>
        </View>
        <Text style={styles.payout}>{formatMoney(order.payout)}</Text>
      </View>
      <Text style={styles.restaurant}>{order.restaurant}</Text>
      <Text style={styles.detail}>Pickup: {order.pickup}</Text>
      <Text style={styles.detail}>Dropoff: {order.dropoff}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.chip}>{order.distanceKm} km</Text>
        <Text style={styles.chip}>{order.items} items</Text>
      </View>
      <View style={styles.statusRow}>
        <Text style={styles.orderTag}>{order.status}</Text>
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
    color: "#111827",
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
    borderColor: "#D1FAE5",
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#F7FFFC",
    padding: 16,
    gap: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 4
  },
  statValue: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800"
  },
  statLabel: {
    color: "#6F737B",
    fontSize: 12
  },
  orderCard: {
    borderColor: "#FBBF24",
    borderLeftWidth: 4,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    padding: 18,
    gap: 10,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  orderId: {
    color: "#1A1A1A",
    fontWeight: "800",
    fontSize: 15
  },
  orderStatus: {
    color: "#FF6B00",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
    marginTop: 4
  },
  payout: {
    color: "#FF6B00",
    fontWeight: "800"
  },
  restaurant: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700"
  },
  detail: {
    color: "#475569"
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  statusRow: {
    flexDirection: "row",
    marginTop: 6
  },
  orderTag: {
    color: "#92400e",
    backgroundColor: "#ffedd5",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: "hidden"
  },
  chip: {
    backgroundColor: "#fff7ed",
    borderRadius: 10,
    color: "#92400e",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  button: {
    alignItems: "center",
    backgroundColor: "#FF6B00",
    borderRadius: 12,
    minHeight: 48,
    justifyContent: "center",
    marginTop: 4
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800"
  },
  titlePressable: {
    alignSelf: "flex-start"
  },
  titlePressed: {
    opacity: 0.6
  }
});
