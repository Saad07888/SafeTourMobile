import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://10.158.189.207:5000";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passport, setPassport] = useState("");
  const [destination, setDestination] = useState("");
  const [exploring, setExploring] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      console.log(
        "Registering with:",
        `${API_URL}/api/auth/register`
      );

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Register response:", data);

      if (!response.ok) {
        setError(
          data.message ||
            "Registration failed. Please try again."
        );
        return;
      }

      console.log(
        "Tourist successfully registered.",
        data.userId
      );

      router.replace("/login");
    } catch (registerError) {
      console.error(
        "Registration error:",
        registerError
      );

      setError(
        "Unable to connect to SafeTour server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>

          {/* Top Navigation */}
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.replace("/login")}
              style={styles.backButton}
              disabled={loading}
            >
              <Text style={styles.backIcon}>‹</Text>
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <View style={styles.safeBadge}>
              <View style={styles.safeDot} />
              <Text style={styles.safeBadgeText}>
                Safe & Secure
              </Text>
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <Text style={styles.brand}>SafeTour</Text>

            <Text style={styles.title}>
              Start your safe journey
            </Text>

            <Text style={styles.subtitle}>
              Tell us a little about yourself and your trip.
            </Text>
          </View>

          {/* Travel Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>✦</Text>
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Your travel plan
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Help SafeTour understand your journey
                </Text>
              </View>
            </View>

            {/* Destination */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Where are you going?
              </Text>

              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={(value) => {
                  setDestination(value);
                  setError("");
                }}
                placeholder="e.g. Raigad, Alibag"
                placeholderTextColor="#9AA6B2"
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            {/* Exploring */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  What are you exploring?
                </Text>

                <Text style={styles.optional}>
                  Optional
                </Text>
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                value={exploring}
                onChangeText={(value) => {
                  setExploring(value);
                  setError("");
                }}
                placeholder="e.g. Forts, beaches, trekking, sightseeing"
                placeholderTextColor="#9AA6B2"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>!</Text>
              </View>

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>●</Text>
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Personal information
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Used to identify and contact you
                </Text>
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Full name
              </Text>

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setError("");
                }}
                placeholder="Enter your full name"
                placeholderTextColor="#9AA6B2"
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Email address
              </Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setError("");
                }}
                placeholder="Enter your email"
                placeholderTextColor="#9AA6B2"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Phone */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Phone number
              </Text>

              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(value) => {
                  setPhone(value);
                  setError("");
                }}
                placeholder="Enter your phone number"
                placeholderTextColor="#9AA6B2"
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {/* Passport */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>
                  Passport / ID number
                </Text>

                <Text style={styles.optional}>
                  Optional
                </Text>
              </View>

              <TextInput
                style={styles.input}
                value={passport}
                onChangeText={(value) => {
                  setPassport(value);
                  setError("");
                }}
                placeholder="Enter passport or ID number"
                placeholderTextColor="#9AA6B2"
                autoCapitalize="characters"
                editable={!loading}
              />
            </View>
          </View>

          {/* Account Security */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>✓</Text>
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Account security
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Create a secure password
                </Text>
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Password
              </Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setError("");
                  }}
                  placeholder="Create a password"
                  placeholderTextColor="#9AA6B2"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />

                <Pressable
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                  hitSlop={10}
                >
                  <Text style={styles.showPassword}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.helperText}>
                Use at least 6 characters.
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Confirm password
              </Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setError("");
                  }}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#9AA6B2"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />

                <Pressable
                  onPress={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  disabled={loading}
                  hitSlop={10}
                >
                  <Text style={styles.showPassword}>
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Terms */}
          <Pressable
            onPress={() => setAgreed(!agreed)}
            style={styles.termsRow}
            disabled={loading}
          >
            <View
              style={[
                styles.checkbox,
                agreed && styles.checkboxChecked,
              ]}
            >
              {agreed && (
                <Text style={styles.checkmark}>
                  ✓
                </Text>
              )}
            </View>

            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.termsLink}>
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text style={styles.termsLink}>
                Privacy Policy
              </Text>
            </Text>
          </Pressable>

          {/* Create Account */}
          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.buttonText}>
                  Creating account...
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>
                  Create SafeTour account
                </Text>

                <Text style={styles.buttonArrow}>
                  →
                </Text>
              </View>
            )}
          </Pressable>

          {/* Login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.push("/login")}
              disabled={loading}
            >
              <Text style={styles.loginLink}>
                Sign in
              </Text>
            </Pressable>
          </View>

          {/* Security Footer */}
          <View style={styles.securityRow}>
            <View style={styles.securityDot} />

            <Text style={styles.securityText}>
              Your information is securely handled.
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F8FC",
  },

  scrollContent: {
    flexGrow: 1,
    paddingVertical: 18,
    paddingBottom: 40,
  },

  container: {
    width: "100%",
    maxWidth: 470,
    alignSelf: "center",
    paddingHorizontal: 20,
  },

  /* Top Bar */

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  backIcon: {
    fontSize: 27,
    lineHeight: 28,
    color: "#40515D",
    marginRight: 5,
  },

  backText: {
    fontSize: 14,
    color: "#52636E",
    fontWeight: "600",
  },

  safeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F8EE",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  safeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#20A05A",
    marginRight: 6,
  },

  safeBadgeText: {
    color: "#20784A",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Header */

  header: {
    alignItems: "center",
    marginBottom: 25,
  },

  logo: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: "#2879C7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2879C7",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "800",
  },

  brand: {
    color: "#1F6EAE",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 8,
  },

  title: {
    color: "#182B38",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 13,
    textAlign: "center",
  },

  subtitle: {
    color: "#7A8994",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 350,
  },

  /* Sections */

  section: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1EAF0",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#173B55",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#EAF4FC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  sectionIconText: {
    color: "#2879C7",
    fontSize: 15,
    fontWeight: "800",
  },

  sectionTitle: {
    color: "#203440",
    fontSize: 15,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#8998A3",
    fontSize: 11,
    marginTop: 2,
  },

  /* Fields */

  field: {
    marginBottom: 16,
  },

  fieldLast: {
    marginBottom: 0,
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#344650",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },

  optional: {
    color: "#9AA6B2",
    fontSize: 10,
    marginBottom: 7,
  },

  input: {
    height: 50,
    backgroundColor: "#F8FBFD",
    borderWidth: 1,
    borderColor: "#DDE7ED",
    borderRadius: 11,
    paddingHorizontal: 14,
    color: "#263640",
    fontSize: 14,
  },

  textArea: {
    height: 82,
    paddingTop: 13,
    paddingBottom: 13,
  },

  passwordContainer: {
    height: 50,
    backgroundColor: "#F8FBFD",
    borderWidth: 1,
    borderColor: "#DDE7ED",
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 13,
  },

  passwordInput: {
    flex: 1,
    color: "#263640",
    fontSize: 14,
  },

  showPassword: {
    color: "#2879C7",
    fontSize: 12,
    fontWeight: "700",
  },

  helperText: {
    color: "#9AA6B2",
    fontSize: 10,
    marginTop: 6,
  },

  /* Error */

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#F4CCCC",
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 16,
  },

  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D94B4B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  errorIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  errorText: {
    flex: 1,
    color: "#C43D3D",
    fontSize: 12,
    lineHeight: 17,
  },

  /* Terms */

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 1,
    marginBottom: 19,
    paddingHorizontal: 2,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#C8D3DA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    marginTop: 1,
  },

  checkboxChecked: {
    backgroundColor: "#2879C7",
    borderColor: "#2879C7",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  termsText: {
    flex: 1,
    color: "#87949D",
    fontSize: 11,
    lineHeight: 17,
  },

  termsLink: {
    color: "#2879C7",
    fontWeight: "700",
  },

  /* Button */

  button: {
    height: 53,
    borderRadius: 13,
    backgroundColor: "#287FC9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#287FC9",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 4,
  },

  buttonPressed: {
    opacity: 0.78,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 10,
  },

  /* Login */

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 21,
  },

  loginText: {
    color: "#89959D",
    fontSize: 13,
  },

  loginLink: {
    color: "#2879C7",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 5,
  },

  /* Footer */

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  securityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22A05A",
    marginRight: 6,
  },

  securityText: {
    color: "#98A4AC",
    fontSize: 10,
  },
});
