import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

type Screen = "Login" | "Home" | "Restaurants" | "Details" | "Cart" | "Checkout" | "Orders" | "Favorites" | "Profile" | "Settings";
type FoodItem = { id: string; name: string; price: number; image: string; restaurant: string };
type CartItem = FoodItem & { quantity: number };

const restaurants = [
  {
    id: "stone",
    name: "Stone Grill Zanzibar",
    area: "Stone Town",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "dhow",
    name: "Dhow Bites",
    area: "Nungwi",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"
  }
];

const foods: FoodItem[] = [
  { id: "pilau", name: "Zanzibar Beef Pilau", price: 14000, restaurant: "Stone Grill Zanzibar", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80" },
  { id: "octopus", name: "Octopus Coconut Curry", price: 18000, restaurant: "Stone Grill Zanzibar", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80" },
  { id: "platter", name: "Beach Seafood Platter", price: 32000, restaurant: "Dhow Bites", image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=900&q=80" }
];

function money(value: number) {
  return `TZS ${value.toLocaleString("en-TZ")}`;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("Login");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["stone"]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + (cart.length ? 2500 : 0), [cart]);

  function addToCart(item: FoodItem) {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry);
      }
      return [...current, { ...item, quantity: 1 }];
    });
  }

  function toggleFavorite(id: string) {
    setFavoriteIds((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);
  }

  function content() {
    if (screen === "Login") return <LoginScreen setScreen={setScreen} />;
    if (screen === "Home") return <HomeScreen setScreen={setScreen} addToCart={addToCart} />;
    if (screen === "Restaurants") return <RestaurantsScreen setScreen={setScreen} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />;
    if (screen === "Details") return <DetailsScreen addToCart={addToCart} />;
    if (screen === "Cart") return <CartScreen cart={cart} total={total} setScreen={setScreen} />;
    if (screen === "Checkout") return <CheckoutScreen total={total} setScreen={setScreen} clearCart={() => setCart([])} />;
    if (screen === "Orders") return <OrdersScreen />;
    if (screen === "Favorites") return <FavoritesScreen favoriteIds={favoriteIds} setScreen={setScreen} />;
    if (screen === "Profile") return <ProfileScreen />;
    return <SettingsScreen />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        {content()}
        {screen !== "Login" ? <TabBar screen={screen} setScreen={setScreen} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} /> : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function LoginScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <View style={styles.loginScreen}>
      <View style={styles.logo}><Text style={styles.logoText}>Z</Text></View>
      <Text style={styles.loginTitle}>ZanMeal</Text>
      <Text style={styles.subtitle}>Good Food. Fast. Always.</Text>
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry />
      <Pressable style={styles.primaryButton} onPress={() => setScreen("Home")}><Text style={styles.primaryText}>Login</Text></Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => setScreen("Home")}><Text style={styles.secondaryText}>Create Account</Text></Pressable>
    </View>
  );
}

function HomeScreen({ setScreen, addToCart }: { setScreen: (screen: Screen) => void; addToCart: (item: FoodItem) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="ZanMeal" subtitle="Stone Town, Zanzibar" />
      <Pressable style={styles.search} onPress={() => setScreen("Restaurants")}><Ionicons name="search" size={18} /><Text>Search restaurants or meals</Text></Pressable>
      <Text style={styles.sectionTitle}>Popular Restaurants</Text>
      {restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} onPress={() => setScreen("Details")} />)}
      <Text style={styles.sectionTitle}>Recommended Meals</Text>
      {foods.map((food) => <FoodCard key={food.id} food={food} onAdd={() => addToCart(food)} />)}
    </ScrollView>
  );
}

function RestaurantsScreen({ setScreen, favoriteIds, toggleFavorite }: { setScreen: (screen: Screen) => void; favoriteIds: string[]; toggleFavorite: (id: string) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Restaurants" subtitle="Hotel, beach, student, and family delivery" />
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onPress={() => setScreen("Details")}
          favorite={favoriteIds.includes(restaurant.id)}
          onFavorite={() => toggleFavorite(restaurant.id)}
        />
      ))}
    </ScrollView>
  );
}

function DetailsScreen({ addToCart }: { addToCart: (item: FoodItem) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Stone Grill Zanzibar" subtitle="Swahili BBQ - 25-35 min" />
      {foods.filter((food) => food.restaurant === "Stone Grill Zanzibar").map((food) => <FoodCard key={food.id} food={food} onAdd={() => addToCart(food)} />)}
    </ScrollView>
  );
}

function CartScreen({ cart, total, setScreen }: { cart: CartItem[]; total: number; setScreen: (screen: Screen) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Cart" subtitle="Review items before checkout" />
      {cart.length === 0 ? <Text style={styles.empty}>Your cart is empty.</Text> : cart.map((item) => (
        <View style={styles.line} key={item.id}><Text>{item.quantity}x {item.name}</Text><Text>{money(item.price * item.quantity)}</Text></View>
      ))}
      <View style={styles.line}><Text style={styles.bold}>Total</Text><Text style={styles.bold}>{money(total)}</Text></View>
      <Pressable style={styles.primaryButton} onPress={() => setScreen("Checkout")}><Text style={styles.primaryText}>Checkout</Text></Pressable>
    </ScrollView>
  );
}

function CheckoutScreen({ total, setScreen, clearCart }: { total: number; setScreen: (screen: Screen) => void; clearCart: () => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Checkout" subtitle="Mobile money and delivery details" />
      <TextInput style={styles.input} defaultValue="Mkunazini Street, Stone Town" />
      <TextInput style={styles.input} defaultValue="+255700000000" />
      <View style={styles.chipRow}><Text style={styles.chip}>M-Pesa</Text><Text style={styles.chip}>Airtel Money</Text><Text style={styles.chip}>Tigo Pesa</Text><Text style={styles.chip}>HaloPesa</Text></View>
      <Text style={styles.total}>Total: {money(total)}</Text>
      <Pressable style={styles.primaryButton} onPress={() => { clearCart(); setScreen("Orders"); }}><Text style={styles.primaryText}>Place Order</Text></Pressable>
    </ScrollView>
  );
}

function OrdersScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Orders" subtitle="Live tracking and order history" />
      <View style={styles.card}><Text style={styles.bold}>ZM-9041AA</Text><Text>Preparing - ETA 18 min</Text><Text>Live rider location will appear here.</Text></View>
      <View style={styles.mapMock}><Ionicons name="navigate" size={38} color="#fff" /><Text style={styles.mapText}>Rider tracking</Text></View>
    </ScrollView>
  );
}

function FavoritesScreen({ favoriteIds, setScreen }: { favoriteIds: string[]; setScreen: (screen: Screen) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Favorites" subtitle="Saved restaurants and meals" />
      {restaurants.filter((restaurant) => favoriteIds.includes(restaurant.id)).map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} onPress={() => setScreen("Details")} />)}
    </ScrollView>
  );
}

function ProfileScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Profile" subtitle="Amina Ali" />
      <View style={styles.card}><Text>+255 700 000 000</Text><Text>Language: English</Text><Text>Loyalty points: 1,240</Text></View>
    </ScrollView>
  );
}

function SettingsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Settings" subtitle="Language, notifications, and payments" />
      <View style={styles.card}><Text>Default payment: M-Pesa</Text><Text>Order notifications: Enabled</Text><Text>Language: English</Text></View>
    </ScrollView>
  );
}

function RestaurantCard({ restaurant, onPress, favorite, onFavorite }: { restaurant: typeof restaurants[number]; onPress: () => void; favorite?: boolean; onFavorite?: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: restaurant.image }} style={styles.image} />
      <View style={styles.rowBetween}><Text style={styles.bold}>{restaurant.name}</Text><Text>{restaurant.rating}</Text></View>
      <Text>{restaurant.area}</Text>
      {onFavorite ? <Pressable onPress={onFavorite}><Text style={styles.favorite}>{favorite ? "Saved" : "Save"}</Text></Pressable> : null}
    </Pressable>
  );
}

function FoodCard({ food, onAdd }: { food: FoodItem; onAdd: () => void }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: food.image }} style={styles.image} />
      <View style={styles.rowBetween}><Text style={styles.bold}>{food.name}</Text><Text>{money(food.price)}</Text></View>
      <Text>{food.restaurant}</Text>
      <Pressable style={styles.primaryButton} onPress={onAdd}><Text style={styles.primaryText}>Add to Cart</Text></Pressable>
    </View>
  );
}

function TabBar({ screen, setScreen, cartCount }: { screen: Screen; setScreen: (screen: Screen) => void; cartCount: number }) {
  const tabs: { screen: Screen; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { screen: "Home", icon: "home", label: "Home" },
    { screen: "Restaurants", icon: "search", label: "Browse" },
    { screen: "Cart", icon: "cart", label: `Cart ${cartCount}` },
    { screen: "Orders", icon: "receipt", label: "Orders" },
    { screen: "Profile", icon: "person", label: "Profile" }
  ];
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => <Pressable key={tab.screen} style={styles.tabItem} onPress={() => setScreen(tab.screen)}><Ionicons name={tab.icon} size={21} color={screen === tab.screen ? "#FF6B00" : "#6F737B"} /><Text style={[styles.tabText, screen === tab.screen && styles.tabActive]}>{tab.label}</Text></Pressable>)}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
  screen: { flex: 1 },
  content: { gap: 14, padding: 18, paddingBottom: 100 },
  loginScreen: { flex: 1, justifyContent: "center", padding: 24, gap: 14 },
  logo: { alignItems: "center", alignSelf: "center", backgroundColor: "#FF6B00", borderRadius: 8, height: 68, justifyContent: "center", width: 68 },
  logoText: { color: "#fff", fontSize: 32, fontWeight: "900" },
  loginTitle: { color: "#1A1A1A", fontSize: 30, fontWeight: "900", textAlign: "center" },
  header: { gap: 4 },
  title: { color: "#1A1A1A", fontSize: 26, fontWeight: "900" },
  subtitle: { color: "#6F737B" },
  sectionTitle: { color: "#1A1A1A", fontSize: 18, fontWeight: "900", marginTop: 6 },
  input: { backgroundColor: "#fff", borderColor: "#E7E8EC", borderRadius: 8, borderWidth: 1, minHeight: 48, paddingHorizontal: 14 },
  primaryButton: { alignItems: "center", backgroundColor: "#FF6B00", borderRadius: 8, justifyContent: "center", minHeight: 44, marginTop: 8 },
  primaryText: { color: "#fff", fontWeight: "900" },
  secondaryButton: { alignItems: "center", backgroundColor: "#fff", borderColor: "#E7E8EC", borderRadius: 8, borderWidth: 1, justifyContent: "center", minHeight: 44 },
  secondaryText: { color: "#1A1A1A", fontWeight: "800" },
  search: { alignItems: "center", backgroundColor: "#fff", borderRadius: 8, flexDirection: "row", gap: 10, minHeight: 48, paddingHorizontal: 14 },
  card: { backgroundColor: "#fff", borderColor: "#E7E8EC", borderRadius: 8, borderWidth: 1, gap: 8, overflow: "hidden", padding: 12 },
  image: { borderRadius: 8, height: 150, width: "100%" },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  bold: { color: "#1A1A1A", fontWeight: "900" },
  favorite: { color: "#D95700", fontWeight: "900" },
  line: { alignItems: "center", backgroundColor: "#fff", borderColor: "#E7E8EC", borderRadius: 8, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 14 },
  empty: { color: "#6F737B" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#FFF0E6", borderRadius: 8, color: "#D95700", fontWeight: "800", paddingHorizontal: 10, paddingVertical: 8 },
  total: { fontSize: 20, fontWeight: "900" },
  mapMock: { alignItems: "center", backgroundColor: "#127C83", borderRadius: 8, height: 240, justifyContent: "center" },
  mapText: { color: "#fff", fontSize: 20, fontWeight: "900", marginTop: 8 },
  tabBar: { alignItems: "center", backgroundColor: "#fff", borderColor: "#E7E8EC", borderTopWidth: 1, bottom: 0, flexDirection: "row", justifyContent: "space-around", left: 0, paddingBottom: 10, paddingTop: 10, position: "absolute", right: 0 },
  tabItem: { alignItems: "center", gap: 4 },
  tabText: { color: "#6F737B", fontSize: 11, fontWeight: "700" },
  tabActive: { color: "#FF6B00" }
});
