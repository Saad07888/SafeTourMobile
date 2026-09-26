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
    : "http://10.153.217.207:5000";

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
      /*
       * ==========================================
       * GET LOGGED-IN TOURIST
       * ==========================================
       */

      const storedUserId = await getStorageItem("userId");

      if (!storedUserId) {
        throw new Error("Tourist session not found. Please login again.");
      }

      /*
       * ==========================================
       * REQUEST REAL GPS PERMISSION
       * ==========================================
       */

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        throw new Error(
          "Location permission is required to send an SOS."
        );
      }

      /*
       * ==========================================
       * GET REAL CURRENT GPS LOCATION
       * ==========================================
       */

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

      /*
       * ==========================================
       * SEND SOS TO BACKEND
       * ==========================================
       *
       * The backend route will be created next.
       */

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

      /*
       * ==========================================
       * SOS SUCCESS
       * ==========================================
       */

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

  /*
   * ==========================================
   * ACTIVATED SCREEN
   * ==========================================
   */

  if (activated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.activatedContainer}>
          <View style={styles.successCircle}>
            <Text style={styles.successIcon}>✓</Text>
          </View>

          <Text style={styles.activatedTitle}>
            Emergency alert sent
          </Text>

          <Text style={styles.activatedText}>
            Your SOS has been sent to the SafeTour emergency
            system along with your current location.
          </Text>

          <View style={styles.statusBox}>
            <View style={styles.statusDot} />

            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                SOS Active
              </Text>

              <Text style={styles.statusText}>
                SafeTour has received your emergency request.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setActivated(false)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>
              Return to SOS
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/home")}
            style={styles.homeButton}
          >
            <Text style={styles.homeText}>
              Return to Home
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ==========================================
   * MAIN SOS SCREEN
   * ==========================================
   */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}

        <View style={styles.header}>
          <Pressable
            onPress={() => router.push("/(tabs)/home")}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Emergency SOS
          </Text>

          <View style={styles.headerSpace} />
        </View>

        {/* Main */}

        <View style={styles.main}>
          <Text style={styles.title}>
            Need emergency help?
          </Text>

          <Text style={styles.subtitle}>
            Press and hold the button for 3 seconds
            {"\n"}
            to activate an emergency alert.
          </Text>

          {/* SOS Button */}

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

                <Text style={styles.sendingText}>
                  SENDING
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.sosText}>
                  SOS
                </Text>

                <Text style={styles.holdText}>
                  HOLD
                </Text>
              </>
            )}
          </Pressable>

          <Text style={styles.instruction}>
            {sending
              ? "Getting your location and sending alert..."
              : "Hold for 3 seconds"}
          </Text>

          {/* Error */}

          {errorMessage ? (
            <View style={styles.errorBox}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>
                  !
                </Text>
              </View>

              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  SOS could not be sent
                </Text>

                <Text style={styles.errorText}>
                  {errorMessage}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Information */}

          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>
                i
              </Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                What happens next?
              </Text>

              <Text style={styles.infoText}>
                SafeTour will send your emergency request
                together with your current GPS location to
                the emergency system.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom message */}

        <View style={styles.bottom}>
          <Text style={styles.emergencyText}>
            If you are in immediate danger, contact your
            local emergency services.
          </Text>
        </View>
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
    paddingHorizontal: 20,
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  backText: {
    color: "#40515D",
    fontSize: 30,
    lineHeight: 30,
  },

  headerTitle: {
    color: "#263C4A",
    fontSize: 16,
    fontWeight: "700",
  },

  headerSpace: {
    width: 40,
  },

  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#1C303E",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#788995",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 300,
    marginTop: 8,
  },

  sosButton: {
    width: 175,
    height: 175,
    borderRadius: 88,
    backgroundColor: "#D92F2F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    shadowColor: "#D92F2F",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },

  sosButtonHolding: {
    transform: [{ scale: 0.94 }],
    backgroundColor: "#C52626",
  },

  sosButtonDisabled: {
    opacity: 0.85,
  },

  sosText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 1,
  },

  holdText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
    letterSpacing: 1,
  },

  sendingText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 8,
    letterSpacing: 1,
  },

  instruction: {
    color: "#87959E",
    fontSize: 11,
    marginTop: 14,
    textAlign: "center",
  },

  infoBox: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E1E9EE",
    padding: 15,
    marginTop: 25,
  },

  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EAF3FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoIconText: {
    color: "#2879C7",
    fontSize: 14,
    fontWeight: "800",
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#304552",
    fontSize: 12,
    fontWeight: "700",
  },

  infoText: {
    color: "#82909A",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

  errorBox: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#FFF5F5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F2CACA",
    padding: 14,
    marginTop: 18,
  },

  errorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FDE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  errorIconText: {
    color: "#D92F2F",
    fontSize: 14,
    fontWeight: "900",
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    color: "#A52727",
    fontSize: 12,
    fontWeight: "800",
  },

  errorText: {
    color: "#8B6262",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

  bottom: {
    paddingBottom: 22,
    alignItems: "center",
  },

  emergencyText: {
    color: "#8B989F",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    maxWidth: 300,
  },

  activatedContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E5F5EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  successIcon: {
    color: "#20A05A",
    fontSize: 32,
    fontWeight: "800",
  },

  activatedTitle: {
    color: "#1C303E",
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },

  activatedText: {
    color: "#788995",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 320,
    marginTop: 10,
    marginBottom: 20,
  },

  statusBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FAF4",
    borderWidth: 1,
    borderColor: "#CDEBD8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 25,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#20A05A",
    marginRight: 12,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    color: "#176B3A",
    fontSize: 12,
    fontWeight: "800",
  },

  statusText: {
    color: "#648273",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  cancelButton: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8E2E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  cancelText: {
    color: "#536673",
    fontSize: 13,
    fontWeight: "600",
  },

  homeButton: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    backgroundColor: "#2879C7",
    alignItems: "center",
    justifyContent: "center",
  },

  homeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});