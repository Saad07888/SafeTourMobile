import * as Location from "expo-location";
import { Color } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { io, type Socket } from "socket.io-client";

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://10.153.217.207:5000";

const SOCKET_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://10.153.217.207:5000";

type TrackingState =
  | "idle"
  | "starting"
  | "tracking"
  | "stopping"
  | "error";

export default function MapScreen() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const [trackingState, setTrackingState] =
    useState<TrackingState>("idle");

  const [message, setMessage] = useState("");

  const locationSubscription =
    useRef<Location.LocationSubscription | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const userIdRef = useRef<string | null>(null);

  const mapRef = useRef<any>(null);

  /*
   * ==========================================
   * GET SAVED USER ID
   * ==========================================
   */

  const getUserId = async (): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return window.localStorage.getItem("userId");
      }

      return await SecureStore.getItemAsync("userId");
    } catch (error) {
      console.error("Unable to get user ID:", error);
      return null;
    }
  };

  /*
   * ==========================================
   * GET CURRENT REAL GPS LOCATION
   * ==========================================
   */

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setMessage("");

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      setPermissionDenied(false);

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(currentLocation);

      console.log(
        "REAL GPS LOCATION:",
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        "accuracy:",
        currentLocation.coords.accuracy
      );
    } catch (error) {
      console.error(
        "Real GPS location error:",
        error
      );

      setMessage(
        "Unable to get your current GPS location."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * MOVE MAP TO REAL LOCATION
   * ==========================================
   */

  const moveMapToLocation = (
    currentLocation: Location.LocationObject
  ) => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude:
          currentLocation.coords.latitude,

        longitude:
          currentLocation.coords.longitude,

        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  };

  /*
   * ==========================================
   * STOP LOCAL GPS WATCHER
   * ==========================================
   */

  const stopLocalLocationWatcher = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();

      locationSubscription.current = null;
    }
  };

  /*
   * ==========================================
   * INITIAL LOCATION
   * ==========================================
   */

  useEffect(() => {
    if (Platform.OS !== "web") {
      getCurrentLocation();
    } else {
      setLoading(false);
    }

    return () => {
      stopLocalLocationWatcher();

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  /*
   * ==========================================
   * CONNECT SOCKET.IO
   * ==========================================
   */

  const connectSocket = async (
    userId: string
  ) => {
    return new Promise<Socket>((resolve, reject) => {
      const socket = io(SOCKET_URL, {
        transports: ["websocket"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log(
          "Socket connected:",
          socket.id
        );

        socket.emit("tourist:start", {
          userId,
        });

        resolve(socket);
      });

      socket.on("connect_error", (error) => {
        console.error(
          "Socket connection error:",
          error
        );

        reject(error);
      });

      socket.on("disconnect", (reason) => {
        console.log(
          "Socket disconnected:",
          reason
        );
      });
    });
  };

  /*
   * ==========================================
   * SEND REAL LOCATION TO BACKEND
   * ==========================================
   */

  const sendLocationToBackend = async (
    currentLocation: Location.LocationObject,
    userId: string
  ) => {
    try {
      const latitude =
        currentLocation.coords.latitude;

      const longitude =
        currentLocation.coords.longitude;

      const accuracy =
        currentLocation.coords.accuracy ?? null;

      /*
       * REAL REST API UPDATE
       */

      const response = await fetch(
        `${API_URL}/api/location/update`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId,
            latitude,
            longitude,
            accuracy,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Location update response:",
        data
      );

      if (!response.ok) {
        console.error(
          "Location update failed:",
          data
        );

        return;
      }

      /*
       * REAL SOCKET.IO UPDATE
       */

      if (
        socketRef.current &&
        socketRef.current.connected
      ) {
        socketRef.current.emit(
          "tourist:location",
          {
            userId,
            latitude,
            longitude,
            accuracy,
          }
        );

        console.log(
          "Live location emitted:",
          latitude,
          longitude
        );
      }
    } catch (error) {
      console.error(
        "Location update error:",
        error
      );
    }
  };

  /*
   * ==========================================
   * START REAL SAFE TOUR
   * ==========================================
   */

  const startSafeTour = async () => {
    if (trackingState === "tracking") {
      return;
    }

    try {
      setTrackingState("starting");
      setMessage("");

      /*
       * Get REAL logged-in tourist ID.
       */

      const userId = await getUserId();

      if (!userId) {
        setTrackingState("error");

        setMessage(
          "Your login session was not found. Please login again."
        );

        return;
      }

      userIdRef.current = userId;

      console.log(
        "Starting real tour for user:",
        userId
      );

      /*
       * Request REAL GPS permission.
       */

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setPermissionDenied(true);
        setTrackingState("idle");

        setMessage(
          "Location permission is required to start Safe Tour."
        );

        return;
      }

      setPermissionDenied(false);

      /*
       * Get the REAL GPS position immediately.
       */

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(currentLocation);

      console.log(
        "START TOUR REAL GPS:",
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      /*
       * ======================================
       * SAVE FIRST REAL LOCATION
       * ======================================
       */

      const startResponse = await fetch(
        `${API_URL}/api/location/start`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId,

            latitude:
              currentLocation.coords.latitude,

            longitude:
              currentLocation.coords.longitude,

            accuracy:
              currentLocation.coords.accuracy ??
              null,
          }),
        }
      );

      const startData =
        await startResponse.json();

      console.log(
        "Start tour response:",
        startData
      );

      if (!startResponse.ok) {
        throw new Error(
          startData.message ||
            "Unable to start Safe Tour."
        );
      }

      /*
       * ======================================
       * CONNECT REAL SOCKET.IO
       * ======================================
       */

      try {
        await connectSocket(userId);
      } catch (socketError) {
        console.error(
          "Socket connection failed:",
          socketError
        );

        /*
         * REST tracking can still continue.
         * Database will still receive GPS updates.
         */
      }

      /*
       * ======================================
       * START REAL CONTINUOUS GPS TRACKING
       * ======================================
       */

      stopLocalLocationWatcher();

      locationSubscription.current =
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,

            /*
             * Request GPS update roughly every 5 seconds.
             */

            timeInterval: 5000,

            /*
             * Also update after approximately 5 metres.
             */

            distanceInterval: 5,
          },

          async (newLocation) => {
            console.log(
              "REAL GPS UPDATE:",
              newLocation.coords.latitude,
              newLocation.coords.longitude,
              "accuracy:",
              newLocation.coords.accuracy
            );

            setLocation(newLocation);

            moveMapToLocation(newLocation);

            if (userIdRef.current) {
              await sendLocationToBackend(
                newLocation,
                userIdRef.current
              );
            }
          }
        );

      setTrackingState("tracking");

      setMessage(
        "Your real-time location is now being shared."
      );

      console.log(
        "REAL SAFE TOUR TRACKING STARTED"
      );
    } catch (error) {
      console.error(
        "Start Safe Tour error:",
        error
      );

      stopLocalLocationWatcher();

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      setTrackingState("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start Safe Tour."
      );
    }
  };

  /*
   * ==========================================
   * STOP REAL SAFE TOUR
   * ==========================================
   */

  const stopSafeTour = async () => {
    if (
      !userIdRef.current ||
      trackingState !== "tracking"
    ) {
      return;
    }

    try {
      setTrackingState("stopping");

      const userId = userIdRef.current;

      console.log(
        "Stopping real tour for user:",
        userId
      );

      /*
       * Stop receiving GPS updates.
       */

      stopLocalLocationWatcher();

      /*
       * Tell backend to stop tracking.
       */

      const response = await fetch(
        `${API_URL}/api/location/stop`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Stop tour response:",
        data
      );

      /*
       * Tell Socket.IO/admin dashboard.
       */

      if (
        socketRef.current &&
        socketRef.current.connected
      ) {
        socketRef.current.emit(
          "tourist:stop",
          {
            userId,
          }
        );

        socketRef.current.disconnect();
        socketRef.current = null;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to stop Safe Tour."
        );
      }

      setTrackingState("idle");

      setMessage(
        "Safe Tour stopped. Location sharing is OFF."
      );

      console.log(
        "REAL SAFE TOUR TRACKING STOPPED"
      );
    } catch (error) {
      console.error(
        "Stop Safe Tour error:",
        error
      );

      /*
       * Even if server request fails,
       * stop local GPS watcher.
       */

      stopLocalLocationWatcher();

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      setTrackingState("error");

      setMessage(
        "Tour stopped on this device, but the server could not be updated."
      );
    }
  };

  /*
   * ==========================================
   * WEB
   * ==========================================
   */

  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webIcon}>
          <Text style={styles.webIconText}>
            MAP
          </Text>
        </View>

        <Text style={styles.webTitle}>
          SafeTour Map
        </Text>

        <Text style={styles.webText}>
          Real Google Maps and live GPS tracking
          are available in the Android app.
        </Text>

        <Text style={styles.webSmallText}>
          Run SafeTour on the Android device to
          use the phone's real GPS location.
        </Text>
      </View>
    );
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#1F70B1"
        />

        <Text style={styles.loadingText}>
          Getting your real GPS location...
        </Text>
      </View>
    );
  }

  /*
   * ==========================================
   * PERMISSION DENIED
   * ==========================================
   */

  if (permissionDenied) {
    return (
      <View style={styles.center}>
        <View style={styles.permissionIcon}>
          <Text style={styles.permissionIconText}>
            !
          </Text>
        </View>

        <Text style={styles.permissionTitle}>
          Location permission required
        </Text>

        <Text style={styles.permissionText}>
          SafeTour needs your real device location
          to provide live tourist safety tracking.
        </Text>

        <Pressable
          onPress={getCurrentLocation}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Allow location
          </Text>
        </Pressable>
      </View>
    );
  }

  /*
   * ==========================================
   * GOOGLE MAPS
   * ==========================================
   */

  const Maps = require("react-native-maps");

  const MapView = Maps.default;
  const Marker = Maps.Marker;
  const PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;

  /*
   * NEVER USE FAKE COORDINATES.
   */

  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>
          GPS location unavailable
        </Text>

        <Text style={styles.permissionText}>
          SafeTour could not obtain your real
          device location.
        </Text>

        <Pressable
          onPress={getCurrentLocation}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  const isTracking =
    trackingState === "tracking";

  const isBusy =
    trackingState === "starting" ||
    trackingState === "stopping";

  /*
   * ==========================================
   * MAIN SCREEN
   * ==========================================
   */

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            SafeTour Map
          </Text>

          <Text style={styles.subtitle}>
            Your real-time safety location
          </Text>
        </View>

        <View
          style={[
            styles.liveBadge,
            isTracking
              ? styles.liveBadgeOn
              : styles.liveBadgeOff,
          ]}
        >
          <View
            style={[
              styles.liveDot,
              isTracking
                ? styles.liveDotOn
                : styles.liveDotOff,
            ]}
          />

          <Text
            style={[
              styles.liveText,
              isTracking
                ? styles.liveTextOn
                : styles.liveTextOff,
            ]}
          >
            {isTracking ? "LIVE" : "OFF"}
          </Text>
        </View>
      </View>

      {/* MAP */}

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude:
              location.coords.latitude,

            longitude:
              location.coords.longitude,

            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsBuildings={true}
          zoomEnabled={true}
          scrollEnabled={true}
          rotateEnabled={true}
          pitchEnabled={true}
        >
          <Marker
            coordinate={{
              latitude:
                location.coords.latitude,

              longitude:
                location.coords.longitude,
            }}
            title="Your real location"
            description={
              isTracking
                ? "SafeTour is sharing your live location"
                : "SafeTour location tracking is OFF"
            }
          />
        </MapView>

        {/* LOCATION STATUS CARD */}

        <View style={styles.locationCard}>
          <View
            style={[
              styles.locationIcon,
              isTracking &&
                styles.locationIconActive,
            ]}
          >
            <Text
              style={[
                styles.locationIconText,
                isTracking &&
                  styles.locationIconTextActive,
              ]}
            >
              ●
            </Text>
          </View>

          <View style={styles.locationContent}>
            <Text style={styles.locationTitle}>
              {isTracking
                ? "Location sharing ON"
                : "Location sharing OFF"}
            </Text>

            <Text style={styles.locationText}>
              {isTracking
                ? "Your real GPS location is being sent to SafeTour."
                : "Start Safe Tour to share your real GPS location."}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isTracking
                ? styles.statusBadgeOn
                : styles.statusBadgeOff,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isTracking
                  ? styles.statusTextOn
                  : styles.statusTextOff,
              ]}
            >
              {isTracking ? "ON" : "OFF"}
            </Text>
          </View>
        </View>
      </View>

      {/* MESSAGE */}

      {message ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            {message}
          </Text>
        </View>
      ) : null}

      {/* START / STOP BUTTON */}

      <View style={styles.actionContainer}>

        {isTracking ||
        trackingState === "stopping" ? (
          <Pressable
            onPress={stopSafeTour}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.stopButton,

              pressed &&
                !isBusy &&
                styles.buttonPressed,

              isBusy &&
                styles.buttonDisabled,
            ]}
          >
            {trackingState === "stopping" ? (
              <View style={styles.actionLoading}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.stopButtonText}>
                  Stopping Safe Tour...
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.stopIcon}>
                  ■
                </Text>

                <View>
                  <Text style={styles.stopButtonText}>
                    Stop Safe Tour
                  </Text>

                  <Text style={styles.stopSubtext}>
                    Turn off live location sharing
                  </Text>
                </View>
              </>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={startSafeTour}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.startButton,

              pressed &&
                !isBusy &&
                styles.buttonPressed,

              isBusy &&
                styles.buttonDisabled,
            ]}
          >
            {trackingState === "starting" ? (
              <View style={styles.actionLoading}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.startButtonText}>
                  Starting Safe Tour...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.startIcon}>
                  <Text style={styles.startIconText}>
                    ●
                  </Text>
                </View>

                <View>
                  <Text style={styles.startButtonText}>
                    Start Safe Tour
                  </Text>

                  <Text style={styles.startSubtext}>
                    Share your real-time location
                  </Text>
                </View>
              </>
            )}
          </Pressable>
        )}

      </View>
    </View>
  );
}

/* ==================================================
   STYLES
================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4F8",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: "#19303F",
    fontSize: 24,
    fontWeight: "800",
  },

  subtitle: {
    color: "#748691",
    fontSize: 11,
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  liveBadgeOn: {
    backgroundColor: "#E6F6ED",
  },

  liveBadgeOff: {
    backgroundColor: "#EDF1F3",
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  liveDotOn: {
    backgroundColor: "#20A05A",
  },

  liveDotOff: {
    backgroundColor: "#84939C",
  },

  liveText: {
    fontSize: 10,
    fontWeight: "800",
  },

  liveTextOn: {
    color: "#20A05A",
  },

  liveTextOff: {
    color: "#71808A",
  },

  mapContainer: {
    flex: 1,
    overflow: "hidden",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  map: {
    flex: 1,
  },

  locationCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    padding: 12,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E0E8ED",

    elevation: 5,

    shadowColor: "#173646",
    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  locationIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,

    backgroundColor: "#EEF2F4",

    alignItems: "center",
    justifyContent: "center",
  },

  locationIconActive: {
    backgroundColor: "#E7F6ED",
  },

  locationIconText: {
    color: "#8797A0",
    fontSize: 12,
  },

  locationIconTextActive: {
    color: "#20A05A",
  },

  locationContent: {
    flex: 1,
    marginLeft: 10,
  },

  locationTitle: {
    color: "#304754",
    fontSize: 11,
    fontWeight: "800",
  },

  locationText: {
    color: "#8A98A1",
    fontSize: 9,
    marginTop: 3,
    lineHeight: 13,
  },

  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  statusBadgeOn: {
    backgroundColor: "#E5F5EC",
  },

  statusBadgeOff: {
    backgroundColor: "#EEF1F3",
  },

  statusText: {
    fontSize: 8,
    fontWeight: "800",
  },

  statusTextOn: {
    color: "#20A05A",
  },

  statusTextOff: {
    color: "#71808A",
  },

  messageBox: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE7EC",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  messageText: {
    color: "#536B79",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
  },

  actionContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#EEF4F8",
  },

  startButton: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: "#1F70B1",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,

    elevation: 4,

    shadowColor: "#1F70B1",
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.18,
    shadowRadius: 8,
  },

  stopButton: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: "#C84B4B",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,

    elevation: 4,

    shadowColor: "#C84B4B",
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.16,
    shadowRadius: 8,
  },

  startIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  startIconText: {
    color: "#FFFFFF",
    fontSize: 12,
  },

  stopIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 12,
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  stopButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  startSubtext: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 9,
    marginTop: 3,
  },

  stopSubtext: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 9,
    marginTop: 3,
  },

  actionLoading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    opacity: 0.78,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  center: {
    flex: 1,
    backgroundColor: "#EEF4F8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    color: "#607481",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },

  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EAF3FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  permissionIconText: {
    color: "#1F70B1",
    fontSize: 22,
    fontWeight: "800",
  },

  permissionTitle: {
    color: "#243A48",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  permissionText: {
    color: "#718391",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#1F70B1",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  webContainer: {
    flex: 1,
    backgroundColor: "#EEF4F8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  webIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EAF3FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  webIconText: {
    color: "#1F70B1",
    fontSize: 12,
    fontWeight: "800",
  },

  webTitle: {
    color: "#19303F",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },

  webText: {
    color: "#607481",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  webSmallText: {
    color: "#8A98A1",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 10,
  },
});


