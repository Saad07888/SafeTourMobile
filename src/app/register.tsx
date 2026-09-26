import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = "http://10.153.217.207:5000";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passport, setPassport] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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

      /*
       * Registration is successful.
       * The account now exists in MySQL.
       */
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
          {/* Back */}
          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.backButton}
            disabled={loading}
          >
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <Text style={styles.brand}>SafeTour</Text>

            <Text style={styles.title}>
              Create your account
            </Text>

            <Text style={styles.subtitle}>
              Join SafeTour and stay connected while you travel.
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>

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
                onChangeText={setPassport}
                placeholder="Enter passport or ID number"
                placeholderTextColor="#9AA6B2"
                autoCapitalize="characters"
                editable={!loading}
              />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>

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
                  <Text style={styles.checkmark}>✓</Text>
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
                <Text style={styles.buttonText}>
                  Create account
                </Text>
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
          </View>

          {/* Security */}
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
    backgroundColor: "#EEF4F8",
  },

  scrollContent: {
    flexGrow: 1,
    paddingVertical: 18,
  },

  container: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 6,
  },

  backIcon: {
    fontSize: 28,
    lineHeight: 29,
    color: "#40515D",
    marginRight: 5,
  },

  backText: {
    fontSize: 14,
    color: "#52636E",
    fontWeight: "600",
  },

  header: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 20,
  },

  logo: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2879C7",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  brand: {
    color: "#1F6EAE",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 7,
  },

  title: {
    color: "#18232D",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 17,
    textAlign: "center",
  },

  subtitle: {
    color: "#7A8791",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 340,
  },

  errorBox: {
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F4CACA",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },

  errorText: {
    color: "#C43D3D",
    fontSize: 12,
    lineHeight: 17,
  },

  form: {
    width: "100%",
  },

  field: {
    marginBottom: 15,
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#34434E",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },

  optional: {
    color: "#9AA6B2",
    fontSize: 10,
    marginBottom: 7,
  },

  input: {
    height: 49,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7EC",
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#263640",
    fontSize: 14,
  },

  passwordContainer: {
    height: 49,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E7EC",
    borderRadius: 10,
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

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
    marginBottom: 19,
  },

  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#C8D3DA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
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
    fontWeight: "600",
  },

  button: {
    height: 50,
    borderRadius: 11,
    backgroundColor: "#3182ED",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    opacity: 0.78,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

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
    fontWeight: "700",
    marginLeft: 5,
  },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
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