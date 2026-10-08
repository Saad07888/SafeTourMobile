import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.logo}>
          <Text style={styles.logoText}>S</Text>
        </View>

        <Text style={styles.brand}>SafeTour</Text>

        {/* Welcome Card */}
        <View style={styles.card}>
          <Text style={styles.title}>
            Welcome to SafeTour
          </Text>

          <Text style={styles.subtitle}>
            Your personal travel safety companion.
          </Text>

          {/* Safety Info */}
          <View style={styles.infoBox}>
            <View style={styles.statusDot} />

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Stay safe while travelling
              </Text>

              <Text style={styles.infoText}>
                Location monitoring and emergency assistance
                when you need it.
              </Text>
            </View>
          </View>

          {/* Get Started */}
          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>
              Get Started
            </Text>
          </Pressable>

          {/* Sign In */}
          <View style={styles.signInRow}>
            <Text style={styles.signInText}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.push("/login")}
            >
              <Text style={styles.signInLink}>
                Sign in
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          SafeTour • Travel safely
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF4F8",
  },

  container: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 42,
  },

  logo: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#2879C7",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

  brand: {
    color: "#1F6EAE",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 9,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginTop: 30,

    borderWidth: 1,
    borderColor: "#E1E9EE",

    shadowColor: "#5D7482",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,

    elevation: 3,
  },

  title: {
    color: "#18232D",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#7B8993",
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
  },

  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F5F8FA",
    borderRadius: 14,
    padding: 14,
    marginTop: 24,
    marginBottom: 22,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#20A05A",
    marginTop: 4,
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#263640",
    fontSize: 13,
    fontWeight: "700",
  },

  infoText: {
    color: "#7B8993",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  button: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3182ED",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    opacity: 0.78,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  signInText: {
    color: "#89959D",
    fontSize: 12,
  },

  signInLink: {
    color: "#2879C7",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },

  footer: {
    color: "#98A4AC",
    fontSize: 10,
    marginTop: 20,
  },
});
