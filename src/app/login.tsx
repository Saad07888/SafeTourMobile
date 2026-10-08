import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
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

/*
 * Store data correctly on both platforms.
 *
 * Web:
 *     localStorage
 *
 * Android/iOS:
 *     Expo SecureStore
 */
const saveStorageItem = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    window.localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * TESTING USER LOGIN
   *
   * This bypasses the backend connection for demo/testing.
   */
  const handleTestingUser = async () => {
    try {
      setLoading(true);
      setError("");

      const testingUser = {
        id: 5,
        tourist_id: "TS-00005",
        full_name: "RHK",
        email: "RHK@gmail.com",
        phone: "9879920490",
      };

      await saveStorageItem(
        "authToken",
        "testing-user-token"
      );

      await saveStorageItem(
        "user",
        JSON.stringify(testingUser)
      );

      await saveStorageItem(
        "userId",
        "5"
      );

      console.log("Testing User login successful");

      router.replace("/(tabs)/home");
    } catch (testingError) {
      console.error(
        "Testing User login error:",
        testingError
      );

      setError("Unable to start testing session.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * REAL LOGIN
   */
  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      console.log(
        "Connecting to:",
        `${API_URL}/api/auth/login`
      );

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login response:", data);

      if (!response.ok) {
        setError(
          data.message || "Invalid email or password."
        );
        return;
      }

      /*
       * Make sure backend returned
       * the real authentication data.
       */
      if (!data.token || !data.user) {
        setError("Invalid server response.");
        return;
      }

      /*
       * REAL JWT
       */
      await saveStorageItem(
        "authToken",
        data.token
      );

      /*
       * REAL USER INFORMATION
       */
      await saveStorageItem(
        "user",
        JSON.stringify(data.user)
      );

      /*
       * REAL USER ID
       *
       * Used for GPS location tracking,
       * SOS and other tourist features.
       */
      await saveStorageItem(
        "userId",
        String(data.user.id)
      );

      console.log(
        "Real login successful for user:",
        data.user.id
      );

      router.replace("/(tabs)/home");
    } catch (loginError) {
      console.error(
        "Mobile login error:",
        loginError
      );

      setError(
        "Unable to connect to SafeTour server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* TOP BAR */}

          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.replace("/")}
              disabled={loading}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>
                ‹
              </Text>

              <Text style={styles.backText}>
                Back
              </Text>
            </Pressable>

            <View style={styles.secureBadge}>
              <View style={styles.secureDot} />

              <Text style={styles.secureText}>
                Safe & Secure
              </Text>
            </View>
          </View>

          {/* BRAND */}

          <View style={styles.brandSection}>
            <View style={styles.logoOuter}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>
                  S
                </Text>
              </View>
            </View>

            <Text style={styles.brandName}>
              SafeTour
            </Text>

            <Text style={styles.brandTagline}>
              Travel safer. Stay connected.
            </Text>
          </View>

          {/* LOGIN CARD */}

          <View style={styles.card}>

            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue your safe journey.
            </Text>

            {/* ERROR */}

            {error ? (
              <View style={styles.errorBox}>
                <View style={styles.errorIcon}>
                  <Text style={styles.errorIconText}>
                    !
                  </Text>
                </View>

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* EMAIL */}

            <View style={styles.field}>
              <Text style={styles.label}>
                Email address
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  email.length > 0 &&
                    styles.inputContainerActive,
                ]}
              >
                <View style={styles.inputIcon}>
                  <Text style={styles.inputIconText}>
                    @
                  </Text>
                </View>

                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setError("");
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#9AAAB6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* PASSWORD */}

            <View style={styles.field}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>
                  Password
                </Text>

                <Pressable
                  disabled={loading}
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <Text style={styles.showPassword}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  password.length > 0 &&
                    styles.inputContainerActive,
                ]}
              >
                <View style={styles.inputIcon}>
                  <Text style={styles.inputIconText}>
                    •
                  </Text>
                </View>

                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9AAAB6"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* OPTIONS */}

            <View style={styles.optionsRow}>
              <Pressable
                onPress={() =>
                  setRememberMe(!rememberMe)
                }
                disabled={loading}
                style={styles.rememberRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe &&
                      styles.checkboxActive,
                  ]}
                >
                  {rememberMe ? (
                    <Text style={styles.checkmark}>
                      ✓
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.rememberText}>
                  Remember me
                </Text>
              </Pressable>

              <Pressable
                disabled={loading}
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            {/* LOGIN BUTTON */}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.loginButton,
                pressed &&
                  !loading &&
                  styles.loginButtonPressed,
                loading &&
                  styles.loginButtonDisabled,
              ]}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.loginButtonText}
                  >
                    Signing in...
                  </Text>
                </View>
              ) : (
                <View style={styles.loginButtonInner}>
                  <Text
                    style={styles.loginButtonText}
                  >
                    Sign in
                  </Text>

                  <Text
                    style={styles.loginArrow}
                  >
                    →
                  </Text>
                </View>
              )}
            </Pressable>

            {/* TESTING USER BUTTON */}

            <Pressable
              onPress={handleTestingUser}
              disabled={loading}
              style={({ pressed }) => [
                styles.testingButton,
                pressed &&
                  styles.testingButtonPressed,
                loading &&
                  styles.testingButtonDisabled,
              ]}
            >
              <Text style={styles.testingButtonText}>
                Continue as Testing User
              </Text>
            </Pressable>

            {/* DIVIDER */}

            <View style={styles.dividerRow}>
              <View style={styles.divider} />

              <Text style={styles.dividerText}>
                OR
              </Text>

              <View style={styles.divider} />
            </View>

            {/* REGISTER */}

            <View style={styles.registerSection}>
              <Text style={styles.registerText}>
                Don't have a SafeTour account?
              </Text>

              <Pressable
                onPress={() =>
                  router.push("/register")
                }
                disabled={loading}
              >
                <Text style={styles.registerLink}>
                  Create an account
                </Text>
              </Pressable>
            </View>
          </View>

          {/* TRUST SECTION */}

          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <View style={styles.trustIcon}>
                <Text style={styles.trustIconText}>
                  ✓
                </Text>
              </View>

              <View>
                <Text style={styles.trustTitle}>
                  Protected account
                </Text>

                <Text style={styles.trustText}>
                  Your login information is securely
                  handled.
                </Text>
              </View>
            </View>
          </View>

          {/* FOOTER */}

          <Text style={styles.footerText}>
            SafeTour • Your safety companion
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==================================================
   STYLES
================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F7FA",
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 35,
  },

  /* TOP BAR */

  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingRight: 10,
  },

  backArrow: {
    color: "#385665",
    fontSize: 25,
    lineHeight: 25,
    marginRight: 4,
    fontWeight: "400",
  },

  backText: {
    color: "#526B79",
    fontSize: 13,
    fontWeight: "600",
  },

  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F5ED",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#20A05A",
    marginRight: 6,
  },

  secureText: {
    color: "#258052",
    fontSize: 10,
    fontWeight: "700",
  },

  /* BRAND */

  brandSection: {
    alignItems: "center",
    marginBottom: 26,
  },

  logoOuter: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#DDEEF7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2178BC",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },

  brandName: {
    color: "#1B3343",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  brandTagline: {
    color: "#82949F",
    fontSize: 11,
    marginTop: 4,
  },

  /* LOGIN CARD */

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 23,

    borderWidth: 1,
    borderColor: "#E2EBF0",

    shadowColor: "#193B4D",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,

    elevation: 5,
  },

  title: {
    color: "#1B303F",
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 6,
  },

  subtitle: {
    color: "#80919D",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 23,
  },

  /* ERROR */

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#F3CCCC",
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginBottom: 19,
  },

  errorIcon: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#D95353",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  errorIconText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  errorText: {
    flex: 1,
    color: "#BE4141",
    fontSize: 11,
    lineHeight: 16,
  },

  /* FIELDS */

  field: {
    marginBottom: 19,
  },

  label: {
    color: "#344C5B",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },

  passwordLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  showPassword: {
    color: "#2178BC",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
  },

  inputContainer: {
    height: 51,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBFD",
    borderWidth: 1,
    borderColor: "#D9E4EA",
    borderRadius: 11,
    paddingHorizontal: 12,
  },

  inputContainerActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#9EC7E3",
  },

  inputIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E9F3F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  inputIconText: {
    color: "#247BBE",
    fontSize: 14,
    fontWeight: "800",
  },

  input: {
    flex: 1,
    height: "100%",
    color: "#263E4D",
    fontSize: 13,
    paddingVertical: 0,
  },

  /* OPTIONS */

  optionsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -2,
    marginBottom: 22,
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#B9CBD5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  checkboxActive: {
    backgroundColor: "#2178BC",
    borderColor: "#2178BC",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  rememberText: {
    color: "#738692",
    fontSize: 10,
    fontWeight: "500",
  },

  forgotButton: {
    paddingVertical: 4,
  },

  forgotText: {
    color: "#2178BC",
    fontSize: 10,
    fontWeight: "700",
  },

  /* LOGIN BUTTON */

  loginButton: {
    width: "100%",
    height: 51,
    borderRadius: 11,
    backgroundColor: "#2178BC",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#2178BC",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,

    elevation: 3,
  },

  loginButtonPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  loginButtonDisabled: {
    opacity: 0.65,
  },

  loginButtonInner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  loginArrow: {
    color: "#FFFFFF",
    fontSize: 19,
    marginLeft: 10,
    marginTop: -1,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  /* TESTING USER */

  testingButton: {
    width: "100%",
    height: 46,
    borderRadius: 11,
    backgroundColor: "#EAF3F8",
    borderWidth: 1,
    borderColor: "#B9D4E3",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  testingButtonPressed: {
    opacity: 0.7,
  },

  testingButtonDisabled: {
    opacity: 0.5,
  },

  testingButtonText: {
    color: "#2178BC",
    fontSize: 12,
    fontWeight: "800",
  },

  /* DIVIDER */

  dividerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 21,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E8ED",
  },

  dividerText: {
    color: "#A0ADB5",
    fontSize: 9,
    fontWeight: "700",
    marginHorizontal: 12,
  },

  /* REGISTER */

  registerSection: {
    alignItems: "center",
  },

  registerText: {
    color: "#84939C",
    fontSize: 11,
    marginBottom: 7,
  },

  registerLink: {
    color: "#2178BC",
    fontSize: 12,
    fontWeight: "800",
  },

  /* TRUST */

  trustSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 22,
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF6EF",
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 10,
    maxWidth: 380,
  },

  trustIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#25A660",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  trustIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  trustTitle: {
    color: "#327455",
    fontSize: 10,
    fontWeight: "800",
  },

  trustText: {
    color: "#75958A",
    fontSize: 9,
    marginTop: 2,
  },

  /* FOOTER */

  footerText: {
    color: "#A0ADB5",
    fontSize: 9,
    textAlign: "center",
    marginTop: 17,
  },
});