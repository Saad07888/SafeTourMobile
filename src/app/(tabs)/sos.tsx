import * as Location from "expo-location";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";

import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://10.158.189.207:5000";

const getStorageItem = async (key: string) => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Unable to get ${key}:`, error);
    return null;
  }
};

export default function SOSScreen() {
  const [holding, setHolding] = useState(false);
  const [activated, setActivated] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSOS = async () => {
    setHolding(false);
    setErrorMessage("");
    setSending(true);

    try {
      // Get logged-in tourist
      const storedUserId = await getStorageItem("userId");

      if (!storedUserId) {
        throw new Error("Tourist session not found. Please login again.");
      }

      // Request GPS permission
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        throw new Error(
          "Location permission is required to send an SOS."
        );
      }

      // Get real current GPS location
      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const latitude = currentLocation.coords.latitude;
      const longitude = currentLocation.coords.longitude;
      const accuracy = currentLocation.coords.accuracy;

      console.log("=================================");
      console.log("REAL SOS LOCATION");
      console.log("User ID:", storedUserId);
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      console.log("Accuracy:", accuracy);
      console.log("=================================");

      // Send SOS to backend
      const response = await fetch(`${API_URL}/api/sos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(storedUserId),
          latitude,
          longitude,
          accuracy,
          message: "Emergency SOS activated by tourist.",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to send emergency SOS."
        );
      }

      console.log("SOS successfully sent:", data);

      setActivated(true);
    } catch (error) {
      console.error("SOS error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send SOS. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  // -------------------------------------------------------
  // SOS ACTIVATED SCREEN
  // -------------------------------------------------------

  if (activated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successIcon}>✓</Text>
          </View>

          <Text style={styles.successTitle}>
            SOS Sent Successfully
          </Text>

          <Text style={styles.successSubtitle}>
            Your emergency alert and current location
            have been sent to TourSafe.
          </Text>

          <View style={styles.activeCard}>
            <View style={styles.activeDot} />

            <View style={styles.activeContent}>
              <Text style={styles.activeTitle}>
                Emergency alert active
              </Text>

              <Text style={styles.activeText}>
                Help has been notified.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Text style={styles.primaryButtonText}>
              Return to Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => setActivated(false)}
          >
            <Text style={styles.secondaryButtonText}>
              Back to SOS
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------
  // MAIN SOS SCREEN
  // -------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Emergency SOS
          </Text>

          <View style={styles.headerRight} />
        </View>

        {/* Main content */}

        <View style={styles.mainContent}>
          <View style={styles.emergencyBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>
              EMERGENCY ASSISTANCE
            </Text>
          </View>

          <Text style={styles.title}>
            Need help?
          </Text>

          <Text style={styles.subtitle}>
            Hold the SOS button for 3 seconds
          </Text>

          {/* SOS BUTTON */}

          <Pressable
            onPressIn={() => {
              if (!sending) {
                setHolding(true);
              }
            }}
            onPressOut={() => {
              if (!sending) {
                setHolding(false);
              }
            }}
            onLongPress={handleSOS}
            delayLongPress={3000}
            disabled={sending}
            style={[
              styles.sosButton,
              holding && styles.sosButtonHolding,
              sending && styles.sosButtonDisabled,
            ]}
          >
            {sending ? (
              <>
                <ActivityIndicator
                  size="large"
                  color="#FFFFFF"
                />

                <Text style={styles.sosButtonSmallText}>
                  SENDING
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.sosButtonText}>
                  SOS
                </Text>

                <Text style={styles.sosButtonSmallText}>
                  HOLD
                </Text>
              </>
            )}
          </Pressable>

          <Text style={styles.holdInstruction}>
            {sending
              ? "Getting your location..."
              : "Hold for 3 seconds"}
          </Text>

          {/* ERROR */}

          {errorMessage ? (
            <View style={styles.errorCard}>
              <View style={styles.errorIconCircle}>
                <Text style={styles.errorIcon}>!</Text>
              </View>

              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  SOS not sent
                </Text>

                <Text style={styles.errorText}>
                  {errorMessage}
                </Text>
              </View>
            </View>
          ) : null}

          {/* GPS STATUS */}

          <View style={styles.locationCard}>
            <View style={styles.locationIconCircle}>
              <Text style={styles.locationIcon}>
                ⌖
              </Text>
            </View>

            <View style={styles.locationContent}>
              <Text style={styles.locationTitle}>
                Your location will be shared
              </Text>

              <Text style={styles.locationText}>
                TourSafe uses your current GPS position
                when an SOS is sent.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom emergency message */}

        <View style={styles.bottomArea}>
          <Text style={styles.bottomText}>
            In immediate danger? Contact local emergency services.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// STYLES
// -------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8FB",
  },

  container: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
  },

  // HEADER

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  backIcon: {
    color: "#19384D",
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 36,
  },

  headerTitle: {
    color: "#17384D",
    fontSize: 17,
    fontWeight: "800",
  },

  headerRight: {
    width: 42,
  },

  // MAIN

  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },

  emergencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFD4D4",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 16,
  },

  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E52D32",
    marginRight: 7,
  },

  badgeText: {
    color: "#C52A2F",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  title: {
    color: "#17384D",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#7A8B96",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },

  // SOS BUTTON

  sosButton: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#E52D32",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,

    shadowColor: "#D72C31",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },

  sosButtonHolding: {
    transform: [{ scale: 0.93 }],
    backgroundColor: "#C92227",
  },

  sosButtonDisabled: {
    opacity: 0.9,
  },

  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 1,
  },

  sosButtonSmallText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 2,
  },

  holdInstruction: {
    color: "#7E909B",
    fontSize: 11,
    marginTop: 13,
  },

  // LOCATION CARD

  locationCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E9EE",
    padding: 14,
    marginTop: 26,

    shadowColor: "#17384D",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  locationIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAF4FC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  locationIcon: {
    color: "#1976C8",
    fontSize: 24,
    fontWeight: "700",
  },

  locationContent: {
    flex: 1,
  },

  locationTitle: {
    color: "#294657",
    fontSize: 12,
    fontWeight: "800",
  },

  locationText: {
    color: "#82919B",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  // ERROR

  errorCard: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#FFF3F3",
    borderWidth: 1,
    borderColor: "#F3CCCC",
    borderRadius: 15,
    padding: 13,
    marginTop: 16,
  },

  errorIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFE0E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  errorIcon: {
    color: "#D92D32",
    fontSize: 16,
    fontWeight: "900",
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    color: "#A92329",
    fontSize: 12,
    fontWeight: "800",
  },

  errorText: {
    color: "#8A6265",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  // BOTTOM

  bottomArea: {
    paddingBottom: 18,
    alignItems: "center",
  },

  bottomText: {
    color: "#91A0A8",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 14,
  },

  // SUCCESS SCREEN

  successContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  successIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#E7F8EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  successIcon: {
    color: "#1FA463",
    fontSize: 38,
    fontWeight: "900",
  },

  successTitle: {
    color: "#17384D",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },

  successSubtitle: {
    color: "#7A8B96",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 310,
    marginTop: 9,
  },

  activeCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FAF5",
    borderWidth: 1,
    borderColor: "#CBEAD8",
    borderRadius: 15,
    padding: 15,
    marginTop: 24,
    marginBottom: 25,
  },

  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#20A05A",
    marginRight: 12,
  },

  activeContent: {
    flex: 1,
  },

  activeTitle: {
    color: "#176B3A",
    fontSize: 12,
    fontWeight: "800",
  },

  activeText: {
    color: "#668374",
    fontSize: 10,
    marginTop: 3,
  },

  primaryButton: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    backgroundColor: "#1976C8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  secondaryButton: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E2E8",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#536673",
    fontSize: 13,
    fontWeight: "700",
  },
});
