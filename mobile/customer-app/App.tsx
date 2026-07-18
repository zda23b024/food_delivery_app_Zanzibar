import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { CartItem, FoodItem, Restaurant, TrackingEvent, createTrackingSocket, customerApi, formatMoney } from "./api";

type Screen = "Login" | "Home" | "Restaurants" | "Details" | "Cart" | "Checkout" | "Orders" | "Favorites" | "Profile" | "Settings";

const fallbackImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";

export default function App() {
  const [screen, setScreen] = useState<Screen>("Login");
  const [token, setToken] = useState("");
  const [user, setUser] = useState<any | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("Login to connect the mobile app to the backend.");

  const selectedRestaurant = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) || restaurants[0];
  const cartRestaurantIds = Array.from(new Set(cart.map((item) => item.restaurant_id)));
  const deliveryFee = cart.length ? Number(restaurants.find((item) => item.id === cartRestaurantIds[0])?.delivery_fee || 2500) : 0;
  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) + deliveryFee, [cart, deliveryFee]);

  async function loadPublicData() {
    const [liveRestaurants, liveFoods] = await Promise.all([customerApi.restaurants(), customerApi.foodItems()]);
    setRestaurants(liveRestaurants);
    setFoods(liveFoods);
    setSelectedRestaurantId((current) => current || liveRestaurants[0]?.id || "");
  }

  async function loadPrivateData(nextToken = token) {
    if (!nextToken) return;
    const [profile, savedAddresses, liveOrders, savedFavorites] = await Promise.all([
      customerApi.me(nextToken),
      customerApi.addresses(nextToken),
      customerApi.orders(nextToken),
      customerApi.favorites(nextToken)
    ]);
    setUser(profile);
    setAddresses(savedAddresses);
    setOrders(liveOrders);
    setFavorites(savedFavorites);
  }

  useEffect(() => {
    loadPublicData().catch((error) => setMessage(error instanceof Error ? error.message : "Could not load backend data."));
  }, []);

  async function handleLogin(phone: string, password: string) {
    const tokens = await customerApi.login(phone, password);
    setToken(tokens.access_token);
    await loadPrivateData(tokens.access_token);
    setMessage("Connected to backend.");
    setScreen("Home");
  }

  async function handleRegister(name: string, phone: string, password: string) {
    await customerApi.register({ full_name: name, phone_number: phone, password });
    await handleLogin(phone, password);
  }

  function addToCart(item: FoodItem) {
    const restaurant = restaurants.find((entry) => entry.id === item.restaurant_id);
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry);
      }
      return [...current, { ...item, quantity: 1, restaurant_name: restaurant?.name }];
    });
  }

  async function toggleFavoriteRestaurant(restaurantId: string) {
    if (!token) {
      setScreen("Login");
      return;
    }
    const existing = favorites.find((favorite) => favorite.restaurant_id === restaurantId);
    if (existing) {
      await customerApi.removeFavorite(existing.id, token);
    } else {
      await customerApi.saveFavorite({ restaurant_id: restaurantId }, token);
    }
    setFavorites(await customerApi.favorites(token));
  }

  function content() {
    if (screen === "Login") return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} message={message} />;
    if (screen === "Home") return <HomeScreen setScreen={setScreen} setSelectedRestaurantId={setSelectedRestaurantId} restaurants={restaurants} foods={foods} addToCart={addToCart} message={message} />;
    if (screen === "Restaurants") return <RestaurantsScreen setScreen={setScreen} restaurants={restaurants} favorites={favorites} toggleFavorite={toggleFavoriteRestaurant} setSelectedRestaurantId={setSelectedRestaurantId} />;
    if (screen === "Details") return <DetailsScreen restaurant={selectedRestaurant} foods={foods.filter((food) => food.restaurant_id === selectedRestaurant?.id)} addToCart={addToCart} />;
    if (screen === "Cart") return <CartScreen cart={cart} total={total} setCart={setCart} setScreen={setScreen} />;
    if (screen === "Checkout") return <CheckoutScreen token={token} cart={cart} addresses={addresses} total={total} setScreen={setScreen} clearCart={() => setCart([])} reload={() => loadPrivateData()} />;
    if (screen === "Orders") return <OrdersScreen token={token} orders={orders} reload={() => loadPrivateData()} />;
    if (screen === "Favorites") return <FavoritesScreen restaurants={restaurants} favorites={favorites} setScreen={setScreen} setSelectedRestaurantId={setSelectedRestaurantId} />;
    if (screen === "Profile") return <ProfileScreen user={user} addresses={addresses} token={token} reload={() => loadPrivateData()} />;
    return <SettingsScreen user={user} onLogout={() => { setToken(""); setUser(null); setScreen("Login"); }} />;
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
  return <View style={styles.header}><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}

function LoginScreen({ onLogin, onRegister, message }: { onLogin: (phone: string, password: string) => Promise<void>; onRegister: (name: string, phone: string, password: string) => Promise<void>; message: string }) {
  const [name, setName] = useState("Zanmart Customer");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function submit(kind: "login" | "register") {
    setError("");
    try {
      if (kind === "login") await onLogin(phone, password);
      else await onRegister(name, phone, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  }
  return (
    <View style={styles.loginScreen}>
      <View style={styles.logo}><Text style={styles.logoText}>Z</Text></View>
      <Text style={styles.loginTitle}>Zanmart</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <TextInput style={styles.input} placeholder="Full name for register" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.primaryButton} onPress={() => submit("login")}><Text style={styles.primaryText}>Login</Text></Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => submit("register")}><Text style={styles.secondaryText}>Create Account</Text></Pressable>
    </View>
  );
}

function HomeScreen({ setScreen, setSelectedRestaurantId, restaurants, foods, addToCart, message }: { setScreen: (screen: Screen) => void; setSelectedRestaurantId: (id: string) => void; restaurants: Restaurant[]; foods: FoodItem[]; addToCart: (item: FoodItem) => void; message: string }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Zanmart" subtitle={message} />
      <Pressable style={styles.search} onPress={() => setScreen("Restaurants")}><Ionicons name="search" size={18} /><Text>Search restaurants or meals</Text></Pressable>
      <Text style={styles.sectionTitle}>Live Restaurants</Text>
      {restaurants.slice(0, 4).map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} onPress={() => { setSelectedRestaurantId(restaurant.id); setScreen("Details"); }} />)}
      <Text style={styles.sectionTitle}>Available Meals</Text>
      {foods.slice(0, 8).map((food) => <FoodCard key={food.id} food={food} restaurant={restaurants.find((item) => item.id === food.restaurant_id)} onAdd={() => addToCart(food)} />)}
    </ScrollView>
  );
}

function RestaurantsScreen({ setScreen, restaurants, favorites, toggleFavorite, setSelectedRestaurantId }: { setScreen: (screen: Screen) => void; restaurants: Restaurant[]; favorites: any[]; toggleFavorite: (id: string) => void; setSelectedRestaurantId: (id: string) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Restaurants" subtitle="Live backend restaurant browsing" />
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          favorite={favorites.some((favorite) => favorite.restaurant_id === restaurant.id)}
          onFavorite={() => toggleFavorite(restaurant.id)}
          onPress={() => { setSelectedRestaurantId(restaurant.id); setScreen("Details"); }}
        />
      ))}
    </ScrollView>
  );
}

function DetailsScreen({ restaurant, foods, addToCart }: { restaurant?: Restaurant; foods: FoodItem[]; addToCart: (item: FoodItem) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title={restaurant?.name || "Restaurant"} subtitle={`${restaurant?.area || "Zanzibar"} - live menu`} />
      {foods.length === 0 ? <Text style={styles.empty}>No menu items found for this restaurant.</Text> : foods.map((food) => <FoodCard key={food.id} food={food} restaurant={restaurant} onAdd={() => addToCart(food)} />)}
    </ScrollView>
  );
}

function CartScreen({ cart, total, setCart, setScreen }: { cart: CartItem[]; total: number; setCart: (items: CartItem[]) => void; setScreen: (screen: Screen) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Cart" subtitle="Review items before checkout" />
      {cart.length === 0 ? <Text style={styles.empty}>Your cart is empty.</Text> : cart.map((item) => (
        <View style={styles.line} key={item.id}>
          <Text>{item.quantity}x {item.name}</Text>
          <Text>{formatMoney(Number(item.price) * item.quantity)}</Text>
        </View>
      ))}
      <View style={styles.line}><Text style={styles.bold}>Total</Text><Text style={styles.bold}>{formatMoney(total)}</Text></View>
      <Pressable style={styles.secondaryButton} onPress={() => setCart([])}><Text style={styles.secondaryText}>Clear Cart</Text></Pressable>
      <Pressable style={styles.primaryButton} onPress={() => setScreen("Checkout")}><Text style={styles.primaryText}>Checkout</Text></Pressable>
    </ScrollView>
  );
}

function CheckoutScreen({ token, cart, addresses, total, setScreen, clearCart, reload }: { token: string; cart: CartItem[]; addresses: any[]; total: number; setScreen: (screen: Screen) => void; clearCart: () => void; reload: () => Promise<void> }) {
  const [address, setAddress] = useState(addresses[0]?.street_address || "Stone Town");
  const [area, setArea] = useState(addresses[0]?.area || "Stone Town");
  const [phone, setPhone] = useState("+255700000000");
  const [method, setMethod] = useState("M-Pesa");
  const [message, setMessage] = useState("");
  async function placeOrder() {
    if (!token || cart.length === 0) return;
    const restaurantIds = Array.from(new Set(cart.map((item) => item.restaurant_id)));
    if (restaurantIds.length > 1) {
      setMessage("Checkout one restaurant at a time.");
      return;
    }
    try {
      const saved = addresses[0] || await customerApi.createAddress({ street_address: address, area, city: "Zanzibar", island: "Unguja", is_default: true }, token);
      const order = await customerApi.createOrder({
        restaurant_id: restaurantIds[0],
        delivery_address_id: saved.id,
        payment_method: method,
        items: cart.map((item) => ({ food_item_id: item.id, quantity: item.quantity }))
      }, token);
      const payment = await customerApi.pay({ order_id: order.id, method, provider: method === "Cash" ? undefined : method, phone_number: method === "Cash" ? undefined : phone }, token);
      setMessage(payment.provider_message || `Payment status: ${payment.status}`);
      clearCart();
      await reload();
      setScreen("Orders");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not place order.");
    }
  }
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Checkout" subtitle="Real address, order, and payment initiation" />
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Delivery address" />
      <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="Area" />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Payment phone" />
      <View style={styles.chipRow}>{["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa", "Cash"].map((item) => <Pressable key={item} onPress={() => setMethod(item)}><Text style={[styles.chip, method === item && styles.chipActive]}>{item}</Text></Pressable>)}</View>
      <Text style={styles.total}>Total: {formatMoney(total)}</Text>
      {message ? <Text style={styles.subtitle}>{message}</Text> : null}
      <Pressable style={styles.primaryButton} onPress={placeOrder}><Text style={styles.primaryText}>Place Order</Text></Pressable>
    </ScrollView>
  );
}

function OrdersScreen({ token, orders, reload }: { token: string; orders: any[]; reload: () => Promise<void> }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Orders" subtitle="Live tracking and order history" />
      <Pressable style={styles.secondaryButton} onPress={reload}><Text style={styles.secondaryText}>Refresh Orders</Text></Pressable>
      {orders.length === 0 ? <Text style={styles.empty}>No backend orders yet.</Text> : orders.map((order) => <OrderCard key={order.id} token={token} order={order} />)}
    </ScrollView>
  );
}

function OrderCard({ order }: { token: string; order: any }) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const latest = events.find((event) => event.latitude && event.longitude);
  useEffect(() => {
    customerApi.tracking(order.id).then(setEvents).catch(() => undefined);
    const socket = createTrackingSocket(order.id);
    socketRef.current = socket;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents((current) => [{ status: data.status, latitude: data.latitude, longitude: data.longitude, eta_minutes: data.eta_minutes, distance_km: data.distance_km, message: data.message, created_at: new Date().toISOString() }, ...current]);
    };
    return () => socket.close();
  }, [order.id]);
  const openMap = () => {
    if (latest?.latitude && latest.longitude) Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latest.latitude},${latest.longitude}`);
  };
  return (
    <View style={styles.card}>
      <Text style={styles.bold}>{order.order_number}</Text>
      <Text>{order.status} - {formatMoney(Number(order.total_amount))}</Text>
      <Text>{order.items.map((item: any) => `${item.quantity}x ${item.item_name}`).join(", ")}</Text>
      {latest ? <Pressable style={styles.mapPanel} onPress={openMap}><Ionicons name="navigate" size={32} color="#fff" /><Text style={styles.mapText}>{latest.eta_minutes || 0} min ETA</Text><Text style={styles.mapSmall}>Open rider location</Text></Pressable> : <Text style={styles.empty}>Waiting for rider tracking events.</Text>}
    </View>
  );
}

function FavoritesScreen({ restaurants, favorites, setScreen, setSelectedRestaurantId }: { restaurants: Restaurant[]; favorites: any[]; setScreen: (screen: Screen) => void; setSelectedRestaurantId: (id: string) => void }) {
  const favoriteRestaurants = restaurants.filter((restaurant) => favorites.some((favorite) => favorite.restaurant_id === restaurant.id));
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Favorites" subtitle="Saved live restaurants" />
      {favoriteRestaurants.length === 0 ? <Text style={styles.empty}>No favorites saved yet.</Text> : favoriteRestaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} onPress={() => { setSelectedRestaurantId(restaurant.id); setScreen("Details"); }} />)}
    </ScrollView>
  );
}

function ProfileScreen({ user, addresses, token, reload }: { user: any | null; addresses: any[]; token: string; reload: () => Promise<void> }) {
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  async function saveAddress() {
    if (!token) return;
    try {
      await customerApi.createAddress({ street_address: street, area, city: "Zanzibar", island: "Unguja", is_default: addresses.length === 0 }, token);
      setStreet("");
      setArea("");
      await reload();
      setMessage("Address saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save address.");
    }
  }
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Profile" subtitle={user?.full_name || "Customer"} />
      <View style={styles.card}><Text>{user?.phone_number}</Text><Text>Language: {user?.preferred_language || "en"}</Text></View>
      <Text style={styles.sectionTitle}>Saved Addresses</Text>
      {addresses.map((item) => <View style={styles.line} key={item.id}><Text>{item.street_address || item.area}</Text><Text>{item.is_default ? "Default" : ""}</Text></View>)}
      <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder="Street / hotel / landmark" />
      <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="Area" />
      {message ? <Text style={styles.subtitle}>{message}</Text> : null}
      <Pressable style={styles.primaryButton} onPress={saveAddress}><Text style={styles.primaryText}>Save Address</Text></Pressable>
    </ScrollView>
  );
}

function SettingsScreen({ user, onLogout }: { user: any | null; onLogout: () => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title="Settings" subtitle="Language, notifications, and account" />
      <View style={styles.card}><Text>Role: {user?.role || "customer"}</Text><Text>Order notifications: Enabled</Text><Text>Maps: Google Maps links</Text></View>
      <Pressable style={styles.primaryButton} onPress={onLogout}><Text style={styles.primaryText}>Logout</Text></Pressable>
    </ScrollView>
  );
}

function RestaurantCard({ restaurant, onPress, favorite, onFavorite }: { restaurant: Restaurant; onPress: () => void; favorite?: boolean; onFavorite?: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: restaurant.image_url || fallbackImage }} style={styles.image} />
      <View style={styles.rowBetween}><Text style={styles.bold}>{restaurant.name}</Text><Text>{Number(restaurant.average_rating || 0).toFixed(1)}</Text></View>
      <Text>{restaurant.area || restaurant.island || "Zanzibar"}</Text>
      {onFavorite ? <Pressable onPress={onFavorite}><Text style={styles.favorite}>{favorite ? "Saved" : "Save"}</Text></Pressable> : null}
    </Pressable>
  );
}

function FoodCard({ food, restaurant, onAdd }: { food: FoodItem; restaurant?: Restaurant; onAdd: () => void }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: food.image_url || fallbackImage }} style={styles.image} />
      <View style={styles.rowBetween}><Text style={styles.bold}>{food.name}</Text><Text>{formatMoney(Number(food.price))}</Text></View>
      <Text>{restaurant?.name || "Restaurant"} - {food.preparation_time_minutes || 20} min</Text>
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
  return <View style={styles.tabBar}>{tabs.map((tab) => <Pressable key={tab.screen} style={styles.tabItem} onPress={() => setScreen(tab.screen)}><Ionicons name={tab.icon} size={21} color={screen === tab.screen ? "#FF6B00" : "#6F737B"} /><Text style={[styles.tabText, screen === tab.screen && styles.tabActive]}>{tab.label}</Text></Pressable>)}</View>;
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
  error: { color: "#B42318", fontWeight: "800" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#FFF0E6", borderRadius: 8, color: "#D95700", fontWeight: "800", paddingHorizontal: 10, paddingVertical: 8 },
  chipActive: { backgroundColor: "#111111", color: "#FFFFFF" },
  total: { fontSize: 20, fontWeight: "900" },
  mapPanel: { alignItems: "center", backgroundColor: "#127C83", borderRadius: 8, minHeight: 150, justifyContent: "center", gap: 4 },
  mapText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  mapSmall: { color: "#E7FEFF", fontWeight: "700" },
  tabBar: { alignItems: "center", backgroundColor: "#fff", borderColor: "#E7E8EC", borderTopWidth: 1, bottom: 0, flexDirection: "row", justifyContent: "space-around", left: 0, paddingBottom: 10, paddingTop: 10, position: "absolute", right: 0 },
  tabItem: { alignItems: "center", gap: 4 },
  tabText: { color: "#6F737B", fontSize: 11, fontWeight: "700" },
  tabActive: { color: "#FF6B00" }
});
