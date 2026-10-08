import * as Location from "expo-location";
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

/* =========================================================
   SERVER
========================================================= */

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://10.158.189.207:5000";

const SOCKET_URL = API_URL;

/* =========================================================
   MAPLIBRE OSM STYLE
========================================================= */

const MAP_STYLE = JSON.stringify({
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
});

/* =========================================================
   TYPES
========================================================= */

type TrackingState =
  | "idle"
  | "starting"
  | "tracking"
  | "stopping"
  | "error";

/* =========================================================
   SCREEN
========================================================= */

export default function MapScreen() {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [permissionDenied, setPermissionDenied] =
    useState(false);

  const [trackingState, setTrackingState] =
    useState<TrackingState>("idle");

  const [message, setMessage] =
    useState("");

  const locationSubscription =
    useRef<Location.LocationSubscription | null>(null);

  const socketRef =
    useRef<Socket | null>(null);

  const userIdRef =
    useRef<string | null>(null);

  const cameraRef =
    useRef<any>(null);

  /* =========================================================
     GET USER ID
  ========================================================= */

  const getUserId = async (): Promise<string | null> => {
    try {
      if (Platform.OS === "web") {
        return window.localStorage.getItem("userId");
      }

      return await SecureStore.getItemAsync("userId");
    } catch (error) {
      console.error("USER ID ERROR:", error);
      return null;
    }
  };

  /* =========================================================
     GET REAL GPS
  ========================================================= */

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setMessage("");

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      setPermissionDenied(false);

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(current);

      console.log(
        "REAL GPS:",
        current.coords.latitude,
        current.coords.longitude
      );
    } catch (error) {
      console.error("GPS ERROR:", error);

      setMessage(
        "Unable to get your current GPS location."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     MOVE MAP
  ========================================================= */

  const moveMap = (
    currentLocation: Location.LocationObject
  ) => {
    if (!cameraRef.current) {
      return;
    }

    try {
      cameraRef.current.setCamera({
        centerCoordinate: [
          currentLocation.coords.longitude,
          currentLocation.coords.latitude,
        ],
        zoomLevel: 15,
        animationDuration: 500,
      });
    } catch (error) {
      console.log("CAMERA MOVE:", error);
    }
  };

  /* =========================================================
     STOP GPS WATCHER
  ========================================================= */

  const stopWatcher = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (Platform.OS !== "web") {
      getCurrentLocation();
    } else {
      setLoading(false);
    }

    return () => {
      stopWatcher();

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  /* =========================================================
     SOCKET CONNECTION
  ========================================================= */

  const connectSocket = async (
    userId: string
  ): Promise<Socket> => {
    return new Promise((resolve, reject) => {
      const socket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log(
          "SOCKET CONNECTED:",
          socket.id
        );

        socket.emit("tourist:start", {
          userId,
        });

        resolve(socket);
      });

      socket.on("connect_error", (error) => {
        console.error(
          "SOCKET ERROR:",
          error
        );

        reject(error);
      });

      socket.on("disconnect", (reason) => {
        console.log(
          "SOCKET DISCONNECTED:",
          reason
        );
      });
    });
  };

  /* =========================================================
     SEND LOCATION TO BACKEND
  ========================================================= */

  const sendLocation = async (
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
        "LOCATION API:",
        data
      );

      if (!response.ok) {
        return;
      }

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
      }
    } catch (error) {
      console.error(
        "SEND LOCATION ERROR:",
        error
      );
    }
  };

  /* =========================================================
     START SAFE TOUR
  ========================================================= */

  const startSafeTour = async () => {
    if (trackingState === "tracking") {
      return;
    }

    try {
      setTrackingState("starting");
      setMessage("");

      const userId = await getUserId();

      if (!userId) {
        setTrackingState("error");

        setMessage(
          "Login session not found. Please login again."
        );

        return;
      }

      userIdRef.current = userId;

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setPermissionDenied(true);
        setTrackingState("idle");

        setMessage(
          "Location permission is required."
        );

        return;
      }

      setPermissionDenied(false);

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation(current);

      console.log(
        "START GPS:",
        current.coords.latitude,
        current.coords.longitude
      );

      /* SAVE START LOCATION */

      const response = await fetch(
        `${API_URL}/api/location/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            latitude:
              current.coords.latitude,
            longitude:
              current.coords.longitude,
            accuracy:
              current.coords.accuracy ?? null,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "START RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to start Safe Tour."
        );
      }

      /* SOCKET */

      try {
        await connectSocket(userId);
      } catch (socketError) {
        console.error(
          "SOCKET CONNECTION FAILED:",
          socketError
        );
      }

      /* FIRST LOCATION */

      await sendLocation(
        current,
        userId
      );

      /* GPS WATCHER */

      stopWatcher();

      locationSubscription.current =
        await Location.watchPositionAsync(
          {
            accuracy:
              Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          async (newLocation) => {
            console.log(
              "LIVE GPS:",
              newLocation.coords.latitude,
              newLocation.coords.longitude
            );

            setLocation(newLocation);

            moveMap(newLocation);

            if (userIdRef.current) {
              await sendLocation(
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
        "SAFE TOUR STARTED"
      );
    } catch (error) {
      console.error(
        "START TOUR ERROR:",
        error
      );

      stopWatcher();

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

  /* =========================================================
     STOP SAFE TOUR
  ========================================================= */

  const stopSafeTour = async () => {
    if (
      !userIdRef.current ||
      trackingState !== "tracking"
    ) {
      return;
    }

    try {
      setTrackingState("stopping");

      const userId =
        userIdRef.current;

      stopWatcher();

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

      const data =
        await response.json();

      console.log(
        "STOP RESPONSE:",
        data
      );

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
        "SAFE TOUR STOPPED"
      );
    } catch (error) {
      console.error(
        "STOP TOUR ERROR:",
        error
      );

      stopWatcher();

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

  /* =========================================================
     WEB
  ========================================================= */

  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webTitle}>
          SafeTour Map
        </Text>

        <Text style={styles.webText}>
          MapLibre and real GPS tracking
          are available in the Android app.
        </Text>
      </View>
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

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

  /* =========================================================
     PERMISSION
  ========================================================= */

  if (permissionDenied) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>
          Location permission required
        </Text>

        <Text style={styles.permissionText}>
          SafeTour needs your real device
          location for live safety tracking.
        </Text>

        <Pressable
          onPress={getCurrentLocation}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Allow Location
          </Text>
        </Pressable>
      </View>
    );
  }

  /* =========================================================
     NO LOCATION
  ========================================================= */

  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>
          GPS location unavailable
        </Text>

        <Pressable
          onPress={getCurrentLocation}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  /* =========================================================
     MAPLIBRE
     
     IMPORTANT:
     Runtime require only happens on Android/iOS.
  ========================================================= */

  const MapLibre: any = require(
    "@maplibre/maplibre-react-native"
  );

  const Map: any = MapLibre.Map;
  const Camera: any = MapLibre.Camera;
  const Marker: any = MapLibre.Marker;

  /* =========================================================
     STATES
  ========================================================= */

  const isTracking =
    trackingState === "tracking";

  const isBusy =
    trackingState === "starting" ||
    trackingState === "stopping";

  /* =========================================================
     MAIN UI
  ========================================================= */

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
            {isTracking
              ? "LIVE"
              : "OFF"}
          </Text>
        </View>
      </View>

      {/* MAP */}

      <View style={styles.mapContainer}>
        <Map
          style={styles.map}
          mapStyle={MAP_STYLE}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [
                location.coords.longitude,
                location.coords.latitude,
              ],
              zoom: 15,
              pitch: 0,
              bearing: 0,
            }}
          />

          {/* REAL GPS MARKER */}

          <Marker
            id="tourist-location"
            lngLat={[
              location.coords.longitude,
              location.coords.latitude,
            ]}
            anchor="bottom"
          >
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.marker,
                  isTracking &&
                    styles.markerActive,
                ]}
              >
                <Text style={styles.markerText}>
                  T
                </Text>
              </View>

              <View
                style={[
                  styles.markerPointer,
                  isTracking &&
                    styles.markerPointerActive,
                ]}
              />
            </View>
          </Marker>
        </Map>

        {/* LOCATION CARD */}

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
                ? "Live Location Active"
                : "Location Sharing Off"}
            </Text>

            <Text style={styles.locationText}>
              {isTracking
                ? "Your real GPS location is being shared with SafeTour."
                : "Start Safe Tour to share your location."}
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
              {isTracking
                ? "ON"
                : "OFF"}
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

      {/* BUTTON */}

      <View style={styles.actionContainer}>
        {isTracking ||
        trackingState === "stopping" ? (
          <Pressable
            onPress={stopSafeTour}
            disabled={isBusy}
            style={[
              styles.stopButton,
              isBusy &&
                styles.buttonDisabled,
            ]}
          >
            {isBusy ? (
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
                <View style={styles.buttonIcon}>
                  <Text style={styles.buttonIconText}>
                    ■
                  </Text>
                </View>

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
            style={[
              styles.startButton,
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
                <View style={styles.buttonIcon}>
                  <Text style={styles.buttonIconText}>
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

/* =========================================================
   STYLES
========================================================= */

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

  /* MARKER */

  markerContainer: {
    alignItems: "center",
  },

  marker: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1F70B1",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  markerActive: {
    backgroundColor: "#20A05A",
  },

  markerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#1F70B1",
    marginTop: -1,
  },

  markerPointerActive: {
    borderTopColor: "#20A05A",
  },

  /* LOCATION CARD */

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

  /* MESSAGE */

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

  /* BUTTONS */

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
  },

  stopButton: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: "#C84B4B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    elevation: 4,
  },

  buttonIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  buttonIconText: {
    color: "#FFFFFF",
    fontSize: 12,
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

  buttonDisabled: {
    opacity: 0.65,
  },

  /* CENTER */

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

  /* WEB */

  webContainer: {
    flex: 1,
    backgroundColor: "#EEF4F8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
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
});
