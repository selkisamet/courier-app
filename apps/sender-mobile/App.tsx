import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiRequest } from "./src/api-client";

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    role: string;
    phone: string;
  };
};

export default function App() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isCorporate, setIsCorporate] = useState(false);
  const [fullName, setFullName] = useState("Test Sender");
  const [phone, setPhone] = useState("+905550001111");
  const [email, setEmail] = useState("sender@example.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [organizationName, setOrganizationName] = useState("Selki Logistics");
  const [organizationTaxNumber, setOrganizationTaxNumber] = useState("1234567890");

  const [token, setToken] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [cityCode, setCityCode] = useState("34");
  const [distanceKm, setDistanceKm] = useState("5");
  const [quoteResult, setQuoteResult] = useState<string>("");

  const [pickupAddress, setPickupAddress] = useState("Levent, Istanbul");
  const [dropoffAddress, setDropoffAddress] = useState("Kadikoy, Istanbul");
  const [orderResult, setOrderResult] = useState<string>("");

  const authTitle = useMemo(() => {
    if (!isRegisterMode) {
      return "Sender Login";
    }

    return isCorporate ? "Corporate Sender Register" : "Individual Sender Register";
  }, [isCorporate, isRegisterMode]);

  const runAuth = async () => {
    setLoading(true);
    try {
      let result: AuthResponse;

      if (isRegisterMode) {
        if (isCorporate) {
          result = await apiRequest<AuthResponse>("/auth/register/sender-corporate", {
            method: "POST",
            body: {
              fullName,
              phone,
              email,
              password,
              organizationName,
              organizationTaxNumber,
            },
          });
        } else {
          result = await apiRequest<AuthResponse>("/auth/register/sender-individual", {
            method: "POST",
            body: { fullName, phone, email, password },
          });
        }
      } else {
        result = await apiRequest<AuthResponse>("/auth/login", {
          method: "POST",
          body: { phone, password },
        });
      }

      setToken(result.accessToken);
      setProfileName(result.user.fullName);
    } catch (error) {
      Alert.alert("Auth Error", error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequest<Record<string, unknown>>("/pricing/quote", {
        method: "POST",
        token,
        body: {
          cityCode,
          distanceKm: Number(distanceKm),
          boost: false,
        },
      });
      setQuoteResult(JSON.stringify(result, null, 2));
    } catch (error) {
      Alert.alert("Quote Error", error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequest<Record<string, unknown>>("/orders", {
        method: "POST",
        token,
        body: {
          pickupAddress,
          dropoffAddress,
          payerType: "sender",
          paymentType: isCorporate ? "corporate" : "cash",
          boost: true,
          package: {
            photoKey: "uploads/package-demo.jpg",
            weightKg: 1.5,
            sizeClass: "M",
            labels: ["fragile", "no_wet"],
            note: "Lutfen dikkatli tasiyin",
          },
        },
      });
      setOrderResult(JSON.stringify(result, null, 2));
    } catch (error) {
      Alert.alert("Order Error", error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const listOrders = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequest<Record<string, unknown>>("/orders", {
        method: "GET",
        token,
      });
      setOrderResult(JSON.stringify(result, null, 2));
    } catch (error) {
      Alert.alert("Orders Error", error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{authTitle}</Text>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Register Mode</Text>
            <Switch value={isRegisterMode} onValueChange={setIsRegisterMode} />
          </View>

          {isRegisterMode ? (
            <View style={styles.switchRow}>
              <Text style={styles.label}>Corporate</Text>
              <Switch value={isCorporate} onValueChange={setIsCorporate} />
            </View>
          ) : null}

          {isRegisterMode ? (
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full name" />
          ) : null}
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" />
          {isRegisterMode ? (
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" />
          ) : null}
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />

          {isRegisterMode && isCorporate ? (
            <>
              <TextInput
                style={styles.input}
                value={organizationName}
                onChangeText={setOrganizationName}
                placeholder="Organization name"
              />
              <TextInput
                style={styles.input}
                value={organizationTaxNumber}
                onChangeText={setOrganizationTaxNumber}
                placeholder="Tax number"
              />
            </>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={runAuth} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Sender Dashboard</Text>
          <Text style={styles.subtitle}>Hello, {profileName}</Text>

          <Text style={styles.sectionTitle}>Pricing Quote</Text>
          <TextInput style={styles.input} value={cityCode} onChangeText={setCityCode} placeholder="City code" />
          <TextInput
            style={styles.input}
            value={distanceKm}
            onChangeText={setDistanceKm}
            placeholder="Distance km"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={fetchQuote} disabled={loading}>
            <Text style={styles.buttonText}>Get Quote</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Create Order</Text>
          <TextInput style={styles.input} value={pickupAddress} onChangeText={setPickupAddress} placeholder="Pickup" />
          <TextInput style={styles.input} value={dropoffAddress} onChangeText={setDropoffAddress} placeholder="Dropoff" />
          <TouchableOpacity style={styles.button} onPress={createOrder} disabled={loading}>
            <Text style={styles.buttonText}>Create Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={listOrders} disabled={loading}>
            <Text style={styles.buttonText}>List My Orders</Text>
          </TouchableOpacity>

          {quoteResult ? <Text style={styles.result}>{quoteResult}</Text> : null}
          {orderResult ? <Text style={styles.result}>{orderResult}</Text> : null}

          <TouchableOpacity style={styles.logoutButton} onPress={() => setToken(null)}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  label: {
    fontSize: 14,
    color: "#374151",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#b91c1c",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  result: {
    marginTop: 8,
    fontFamily: "monospace",
    fontSize: 12,
    color: "#111827",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 8,
  },
});
