import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiRequest } from "./src/api-client";

type AuthResponse = {
  accessToken: string;
  user: {
    fullName: string;
    role: string;
  };
};

export default function App() {
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [fullName, setFullName] = useState("Courier Demo");
  const [phone, setPhone] = useState("+905550002222");
  const [email, setEmail] = useState("courier@example.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [taxNumber, setTaxNumber] = useState("9876543210");
  const [cityCode, setCityCode] = useState("34");
  const [vehicleType, setVehicleType] = useState("motorbike");

  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [orderId, setOrderId] = useState("");
  const [otp, setOtp] = useState("");
  const [output, setOutput] = useState("");

  const authenticate = async () => {
    setLoading(true);
    try {
      let result: AuthResponse;

      if (isRegisterMode) {
        result = await apiRequest<AuthResponse>("/auth/register/courier", {
          method: "POST",
          body: {
            fullName,
            phone,
            email,
            password,
            taxNumber,
            cityCode,
            vehicleType,
          },
        });
      } else {
        result = await apiRequest<AuthResponse>("/auth/login", {
          method: "POST",
          body: { phone, password },
        });
      }

      setToken(result.accessToken);
      setName(result.user.fullName);
    } catch (error) {
      Alert.alert("Auth Error", error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (path: string, method: "GET" | "POST" | "PATCH" = "POST", body?: unknown) => {
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const result = await apiRequest<Record<string, unknown>>(path, {
        method,
        token,
        body,
      });
      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      Alert.alert("Request Error", error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Courier {isRegisterMode ? "Register" : "Login"}</Text>
          <TouchableOpacity style={styles.linkButton} onPress={() => setIsRegisterMode((prev) => !prev)}>
            <Text style={styles.linkButtonText}>
              {isRegisterMode ? "Already have account? Login" : "No account? Register"}
            </Text>
          </TouchableOpacity>

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

          {isRegisterMode ? (
            <>
              <TextInput style={styles.input} value={taxNumber} onChangeText={setTaxNumber} placeholder="Tax number" />
              <TextInput style={styles.input} value={cityCode} onChangeText={setCityCode} placeholder="City code" />
              <TextInput style={styles.input} value={vehicleType} onChangeText={setVehicleType} placeholder="Vehicle" />
            </>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={authenticate} disabled={loading}>
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
          <Text style={styles.title}>Courier Dashboard</Text>
          <Text style={styles.subtitle}>Hello, {name}</Text>

          <TouchableOpacity style={styles.button} onPress={() => runAction("/courier/orders/available", "GET")}>
            <Text style={styles.buttonText}>Get Available Orders</Text>
          </TouchableOpacity>

          <TextInput style={styles.input} value={orderId} onChangeText={setOrderId} placeholder="Order ID" />

          <TouchableOpacity style={styles.button} onPress={() => runAction(`/courier/orders/${orderId}/accept`)}>
            <Text style={styles.buttonText}>Accept Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => runAction(`/courier/orders/${orderId}/picked-up`)}>
            <Text style={styles.buttonText}>Mark Picked Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => runAction(`/courier/orders/${orderId}/on-route`)}>
            <Text style={styles.buttonText}>Mark On Route</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => runAction(`/courier/orders/${orderId}/arrived`)}>
            <Text style={styles.buttonText}>Mark Arrived</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() =>
              runAction(`/orders/${orderId}/proofs/photo`, "POST", {
                fileKey: "uploads/delivery-proof.jpg",
                kind: "delivery",
              })
            }
          >
            <Text style={styles.buttonText}>Upload Delivery Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() =>
              runAction(`/orders/${orderId}/proofs/gps`, "POST", {
                lat: 41.01,
                lng: 29.03,
              })
            }
          >
            <Text style={styles.buttonText}>Upload GPS Proof</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={() => runAction(`/orders/${orderId}/proofs/otp/send`)}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            placeholder="OTP"
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => runAction(`/orders/${orderId}/proofs/otp/verify`, "POST", { otp })}
          >
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => runAction(`/orders/${orderId}/complete`)}>
            <Text style={styles.buttonText}>Complete Order</Text>
          </TouchableOpacity>

          {output ? <Text style={styles.result}>{output}</Text> : null}

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
    backgroundColor: "#eef2ff",
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
    backgroundColor: "#4338ca",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#b91c1c",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  linkButton: {
    alignItems: "flex-start",
  },
  linkButtonText: {
    color: "#1d4ed8",
    fontWeight: "600",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
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

