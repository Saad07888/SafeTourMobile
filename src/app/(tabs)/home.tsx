import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://10.153.217.207:5000";

type StoredUser = {
  id?: number;
  tourist_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
};

type TrackingState = "loading" | "active" | "inactive";

const getStorageItem = async (key: string) => {
  if (Platform.OS === "web") {
    return window.localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
};

export default function HomeScreen() {
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [trackingState, setTrackingState] =
    useState<TrackingState>("loading");
  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = useCallback(async () => {
    try {
      const storedUser = await getStorageItem("user");

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }

      const storedUserId = await getStorageItem("userId");

      if (!storedUserId) {
        setTrackingState("inactive");
        return;
      }

      const response = await fetch(`${API_URL}/api/location/active`);
      const data = await response.json();

      if (!response.ok || !Array.isArray(data?.users)) {
        setTrackingState("inactive");
        return;
      }

      const currentTourist = data.users.find(
        (tourist: { user_id?: number | string }) =>
          String(tourist.user_id) === String(storedUserId)
      );

      setTrackingState(
        currentTourist?.is_online ? "active" : "inactive"
      );
    } catch (error) {
      console.error("Home data error:", error);
      setTrackingState("inactive");
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const displayName = useMemo(() => {
    const name = user?.full_name?.trim();

    if (!name) return "Tourist";

    return name.split(/\s+/)[0];
  }, [user]);

  const initials = useMemo(() => {
    const name = user?.full_name?.trim();

    if (!name) return "T";

    const parts = name.split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [user]);

  const isTracking = trackingState === "active";

  const openMap = () => {
    router.push("/(tabs)/map");
  };

  const openSOS = () => {
    router.push("/(tabs)/sos");
  };

  const openDigitalId = () => {
    router.push("/(tabs)/digital-id");
  };

  const openProfile = () => {
    router.push("/profile");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1677D2"
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <View style={styles.brandPin}>
                <Text style={styles.brandPinText}>●</Text>
              </View>
              <View style={styles.brandRoute} />
            </View>

            <View>
              <Text style={styles.brandName}>
                Safe<Text style={styles.brandAccent}>Tour</Text>
              </Text>
              <Text style={styles.tagline}>
                Travel Safe. Explore More.
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.notificationButton}>
              <Text style={styles.notificationIcon}>♧</Text>
              <View style={styles.notificationDot}>
                <Text style={styles.notificationDotText}>!</Text>
              </View>
            </View>

            <Pressable
              onPress={openProfile}
              style={({ pressed }) => [
                styles.avatar,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </Pressable>
          </View>
        </View>

        {/* TOURIST HERO */}
        <View style={styles.hero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroText}>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.name}>{displayName}</Text>

            <View
              style={[
                styles.safetyPill,
                isTracking
                  ? styles.safetyPillActive
                  : styles.safetyPillInactive,
              ]}
            >
              <View
                style={[
                  styles.safetyDot,
                  isTracking
                    ? styles.safetyDotActive
                    : styles.safetyDotInactive,
                ]}
              />

              <Text
                style={[
                  styles.safetyText,
                  isTracking
                    ? styles.safetyTextActive
                    : styles.safetyTextInactive,
                ]}
              >
                {isTracking ? "You're safe" : "Safety monitoring ready"}
              </Text>

              <Text style={styles.safetySeparator}>•</Text>

              <Text style={styles.monitoringText}>
                {isTracking
                  ? "Monitoring active"
                  : "Start Safe Tour to share location"}
              </Text>
            </View>
          </View>

          <View style={styles.travelIllustration}>
            <View style={styles.sun} />
            <View style={styles.mountainBack} />
            <View style={styles.mountainFront} />

            <View style={styles.traveler}>
              <View style={styles.travelerHead} />
              <View style={styles.travelerBody} />
              <View style={styles.travelerBag} />
              <View style={styles.travelerLegOne} />
              <View style={styles.travelerLegTwo} />
            </View>

            <View style={styles.mapPinDecoration}>
              <Text style={styles.mapPinText}>●</Text>
            </View>

            <Text style={styles.exploreText}>Explore{"\n"}Safely</Text>
          </View>
        </View>

        {/* SOS */}
        <View style={styles.sosCard}>
          <View style={styles.sosLeft}>
            <View style={styles.sosIconCircle}>
              <Text style={styles.sosIcon}>!</Text>
            </View>

            <View style={styles.sosCopy}>
              <Text style={styles.sosTitle}>Emergency SOS</Text>
              <Text style={styles.sosSubtitle}>
                Get immediate help from{"\n"}SafeTour Control Center
              </Text>
            </View>
          </View>

          <Pressable
            onPress={openSOS}
            style={({ pressed }) => [
              styles.sosButton,
              pressed && styles.sosButtonPressed,
            ]}
          >
            <Text style={styles.sosPhone}>●</Text>
            <Text style={styles.sosButtonText}>SOS</Text>
          </Pressable>

          <View style={styles.sosFeatures}>
            <View style={styles.sosFeature}>
              <Text style={styles.featureIcon}>⌖</Text>
              <Text style={styles.featureText}>Real-time location</Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.sosFeature}>
              <Text style={styles.featureIcon}>♙</Text>
              <Text style={styles.featureText}>Control Center alert</Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.sosFeature}>
              <Text style={styles.featureIcon}>ϟ</Text>
              <Text style={styles.featureText}>Faster assistance</Text>
            </View>
          </View>
        </View>

        {/* QUICK ACCESS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick access</Text>
          <Text style={styles.sectionHint}>Your safety tools</Text>
        </View>

        <View style={styles.quickRow}>
          <Pressable
            onPress={openDigitalId}
            style={({ pressed }) => [
              styles.quickCard,
              styles.idCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.quickIconBox, styles.idIconBox]}>
              <Text style={styles.quickIcon}>ID</Text>
            </View>

            <Text style={styles.quickTitle}>Digital ID</Text>
            <Text style={styles.quickSubtitle}>
              View your tourist identity
            </Text>

            <Text style={styles.quickArrow}>›</Text>
          </Pressable>

          <View style={[styles.quickCard, styles.reportCard]}>
            <View style={[styles.quickIconBox, styles.reportIconBox]}>
              <Text style={styles.reportIcon}>!</Text>
            </View>

            <Text style={styles.quickTitle}>Report Incident</Text>
            <Text style={styles.quickSubtitle}>
              Tell us what happened
            </Text>

            <Text style={styles.quickArrow}>›</Text>
          </View>

          <View style={[styles.quickCard, styles.contactsCard]}>
            <View
              style={[
                styles.quickIconBox,
                styles.contactsIconBox,
              ]}
            >
              <Text style={styles.contactsIcon}>+</Text>
            </View>

            <Text style={styles.quickTitle}>Emergency Contacts</Text>
            <Text style={styles.quickSubtitle}>
              Manage trusted contacts
            </Text>

            <Text style={styles.quickArrow}>›</Text>
          </View>
        </View>

        {/* LOCATION SHARING */}
        <Pressable
          onPress={openMap}
          style={({ pressed }) => [
            styles.locationCard,
            isTracking
              ? styles.locationCardActive
              : styles.locationCardInactive,
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[
              styles.locationIconBox,
              isTracking
                ? styles.locationIconBoxActive
                : styles.locationIconBoxInactive,
            ]}
          >
            <Text
              style={[
                styles.locationIcon,
                isTracking
                  ? styles.locationIconActive
                  : styles.locationIconInactive,
              ]}
            >
              ●
            </Text>
          </View>

          <View style={styles.locationCopy}>
            <Text style={styles.locationTitle}>Location Sharing</Text>
            <Text style={styles.locationSubtitle}>
              {isTracking
                ? "Your live location is shared with SafeTour"
                : "Start Safe Tour to share your real GPS location"}
            </Text>
          </View>

          <View
            style={[
              styles.switch,
              isTracking
                ? styles.switchActive
                : styles.switchInactive,
            ]}
          >
            <Text
              style={[
                styles.switchText,
                isTracking
                  ? styles.switchTextActive
                  : styles.switchTextInactive,
              ]}
            >
              {isTracking ? "ON" : "OFF"}
            </Text>
            <View
              style={[
                styles.switchKnob,
                isTracking
                  ? styles.switchKnobActive
                  : styles.switchKnobInactive,
              ]}
            />
          </View>
        </Pressable>

        {/* TRAVEL SAFETY CARD */}
        <Pressable
          onPress={openMap}
          style={({ pressed }) => [
            styles.travelCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.travelCardSky} />
          <View style={styles.travelCardMountainOne} />
          <View style={styles.travelCardMountainTwo} />
          <View style={styles.travelCardRoad} />

          <View style={styles.travelCardContent}>
            <Text style={styles.travelCardEyebrow}>
              SAFE JOURNEY
            </Text>
            <Text style={styles.travelCardTitle}>
              Explore More.
            </Text>
            <Text style={styles.travelCardSubtitle}>
              Your safety stays with you.
            </Text>
          </View>

          <Text style={styles.travelCardCompass}>✦</Text>
        </Pressable>

        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F9FC",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E9F3FF",
    marginRight: 9,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  brandPin: {
    width: 20,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1677D2",
    alignItems: "center",
    justifyContent: "center",
  },

  brandPinText: {
    color: "#FFFFFF",
    fontSize: 8,
  },

  brandRoute: {
    position: "absolute",
    width: 30,
    height: 8,
    borderTopWidth: 2,
    borderColor: "#16A34A",
    transform: [{ rotate: "-25deg" }],
    bottom: 6,
    right: 2,
  },

  brandName: {
    color: "#102A43",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  brandAccent: {
    color: "#1677D2",
  },

  tagline: {
    color: "#7890A4",
    fontSize: 9,
    marginTop: 1,
    fontWeight: "500",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  notificationButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E4EBF2",
  },

  notificationIcon: {
    color: "#24445D",
    fontSize: 22,
    fontWeight: "800",
    transform: [{ rotate: "180deg" }],
  },

  notificationDot: {
    position: "absolute",
    right: -1,
    top: -2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F6F9FC",
  },

  notificationDotText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#1677D2",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  hero: {
    height: 205,
    borderRadius: 25,
    backgroundColor: "#EAF5FF",
    overflow: "hidden",
    position: "relative",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DDECF8",
  },

  heroGlowOne: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#FFFFFF",
    opacity: 0.75,
    top: -120,
    right: -30,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#D4F2E0",
    opacity: 0.55,
    bottom: -100,
    left: -60,
  },

  heroText: {
    position: "absolute",
    left: 20,
    top: 22,
    zIndex: 10,
  },

  welcome: {
    color: "#6C8194",
    fontSize: 13,
    fontWeight: "600",
  },

  name: {
    color: "#102A43",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 2,
    letterSpacing: -0.8,
  },

  safetyPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginTop: 12,
    maxWidth: 255,
  },

  safetyPillActive: {
    backgroundColor: "#E0F7EA",
  },

  safetyPillInactive: {
    backgroundColor: "#FFFFFF",
  },

  safetyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  safetyDotActive: {
    backgroundColor: "#16A34A",
  },

  safetyDotInactive: {
    backgroundColor: "#94A3AE",
  },

  safetyText: {
    fontSize: 10,
    fontWeight: "800",
  },

  safetyTextActive: {
    color: "#15803D",
  },

  safetyTextInactive: {
    color: "#526A7D",
  },

  safetySeparator: {
    color: "#90A1AF",
    marginHorizontal: 6,
    fontSize: 10,
  },

  monitoringText: {
    color: "#6C8194",
    fontSize: 9,
    fontWeight: "600",
  },

  travelIllustration: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "58%",
    height: "75%",
  },

  sun: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFE6A7",
    top: 7,
    right: 38,
  },

  mountainBack: {
    position: "absolute",
    width: 210,
    height: 100,
    backgroundColor: "#B8D9EA",
    borderRadius: 90,
    right: -50,
    bottom: 12,
    transform: [{ rotate: "-12deg" }],
  },

  mountainFront: {
    position: "absolute",
    width: 205,
    height: 78,
    backgroundColor: "#79B9A1",
    borderRadius: 80,
    right: -20,
    bottom: -6,
    transform: [{ rotate: "-8deg" }],
  },

  traveler: {
    position: "absolute",
    right: 54,
    bottom: 12,
    width: 55,
    height: 105,
  },

  travelerHead: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#A96F50",
    top: 3,
    left: 15,
  },

  travelerBody: {
    position: "absolute",
    width: 37,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#1C4056",
    top: 25,
    left: 7,
  },

  travelerBag: {
    position: "absolute",
    width: 28,
    height: 45,
    borderRadius: 11,
    backgroundColor: "#345D72",
    top: 28,
    left: 29,
  },

  travelerLegOne: {
    position: "absolute",
    width: 11,
    height: 34,
    borderRadius: 6,
    backgroundColor: "#19354A",
    bottom: 0,
    left: 12,
    transform: [{ rotate: "8deg" }],
  },

  travelerLegTwo: {
    position: "absolute",
    width: 11,
    height: 34,
    borderRadius: 6,
    backgroundColor: "#19354A",
    bottom: 0,
    left: 31,
    transform: [{ rotate: "-7deg" }],
  },

  mapPinDecoration: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    right: 145,
    top: 38,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  mapPinText: {
    color: "#E53935",
    fontSize: 15,
  },

  exploreText: {
    position: "absolute",
    right: 7,
    top: 43,
    color: "#183B53",
    fontSize: 15,
    fontWeight: "900",
    fontStyle: "italic",
    lineHeight: 17,
    transform: [{ rotate: "-5deg" }],
  },

  sosCard: {
    backgroundColor: "#FFF3F3",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#FFD1D1",
    padding: 15,
    marginBottom: 17,
  },

  sosLeft: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 90,
  },

  sosIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E9232D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  sosIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },

  sosCopy: {
    flex: 1,
  },

  sosTitle: {
    color: "#102A43",
    fontSize: 18,
    fontWeight: "900",
  },

  sosSubtitle: {
    color: "#70859A",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  sosButton: {
    position: "absolute",
    right: 15,
    top: 24,
    height: 45,
    minWidth: 91,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: "#E9232D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E9232D",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  sosButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  sosPhone: {
    color: "#FFFFFF",
    fontSize: 11,
    marginRight: 7,
  },

  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  sosFeatures: {
    borderTopWidth: 1,
    borderTopColor: "#FFDCDC",
    marginTop: 14,
    paddingTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sosFeature: {
    flex: 1,
    alignItems: "center",
  },

  featureIcon: {
    color: "#B72A31",
    fontSize: 17,
    fontWeight: "900",
  },

  featureText: {
    color: "#61788D",
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 3,
  },

  featureDivider: {
    width: 1,
    height: 25,
    backgroundColor: "#FFD5D5",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#102A43",
    fontSize: 17,
    fontWeight: "900",
  },

  sectionHint: {
    color: "#8BA0B1",
    fontSize: 9,
    fontWeight: "600",
  },

  quickRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 12,
  },

  quickCard: {
    flex: 1,
    minHeight: 142,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },

  idCard: {
    backgroundColor: "#EFF7FF",
    borderColor: "#D7E9FA",
  },

  reportCard: {
    backgroundColor: "#FFF8ED",
    borderColor: "#F5E5C7",
  },

  contactsCard: {
    backgroundColor: "#F4F0FF",
    borderColor: "#E3D9FA",
  },

  quickIconBox: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  idIconBox: {
    backgroundColor: "#DDEEFF",
  },

  reportIconBox: {
    backgroundColor: "#FFF0D8",
  },

  contactsIconBox: {
    backgroundColor: "#E8DEFF",
  },

  quickIcon: {
    color: "#1677D2",
    fontSize: 11,
    fontWeight: "900",
  },

  reportIcon: {
    color: "#E58A00",
    fontSize: 21,
    fontWeight: "900",
  },

  contactsIcon: {
    color: "#6D3FE6",
    fontSize: 22,
    fontWeight: "500",
  },

  quickTitle: {
    color: "#17364D",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 15,
  },

  quickSubtitle: {
    color: "#7890A4",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 3,
  },

  quickArrow: {
    position: "absolute",
    right: 12,
    bottom: 9,
    color: "#6F879A",
    fontSize: 20,
    fontWeight: "400",
  },

  locationCard: {
    minHeight: 82,
    borderRadius: 19,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 12,
  },

  locationCardActive: {
    backgroundColor: "#EDFFF4",
    borderColor: "#BDEFD0",
  },

  locationCardInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1EAF1",
  },

  locationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  locationIconBoxActive: {
    backgroundColor: "#D7F7E2",
  },

  locationIconBoxInactive: {
    backgroundColor: "#EEF3F7",
  },

  locationIcon: {
    fontSize: 27,
    fontWeight: "900",
  },

  locationIconActive: {
    color: "#16A34A",
  },

  locationIconInactive: {
    color: "#9AAAB6",
  },

  locationCopy: {
    flex: 1,
    paddingRight: 7,
  },

  locationTitle: {
    color: "#15364D",
    fontSize: 14,
    fontWeight: "900",
  },

  locationSubtitle: {
    color: "#71879A",
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
  },

  switch: {
    width: 65,
    height: 35,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
    paddingRight: 4,
  },

  switchActive: {
    backgroundColor: "#16A34A",
  },

  switchInactive: {
    backgroundColor: "#E8EEF3",
  },

  switchText: {
    fontSize: 10,
    fontWeight: "900",
  },

  switchTextActive: {
    color: "#FFFFFF",
  },

  switchTextInactive: {
    color: "#778B9A",
  },

  switchKnob: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },

  switchKnobActive: {
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  switchKnobInactive: {
    backgroundColor: "#FFFFFF",
  },

  travelCard: {
    height: 115,
    borderRadius: 20,
    backgroundColor: "#DDEFFF",
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#D3E7F8",
  },

  travelCardSky: {
  ...StyleSheet.absoluteFill,
    backgroundColor: "#DCEEFF",
  },

  travelCardMountainOne: {
    position: "absolute",
    width: 280,
    height: 105,
    backgroundColor: "#8BB9A6",
    right: -65,
    bottom: -55,
    borderRadius: 90,
    transform: [{ rotate: "-12deg" }],
  },

  travelCardMountainTwo: {
    position: "absolute",
    width: 220,
    height: 85,
    backgroundColor: "#4F8B75",
    right: -15,
    bottom: -48,
    borderRadius: 70,
    transform: [{ rotate: "-17deg" }],
  },

  travelCardRoad: {
    position: "absolute",
    width: 190,
    height: 28,
    borderRadius: 20,
    backgroundColor: "#F7F2DF",
    right: 15,
    bottom: 0,
    transform: [{ rotate: "-10deg" }],
  },

  travelCardContent: {
    position: "absolute",
    left: 17,
    top: 17,
  },

  travelCardEyebrow: {
    color: "#1677D2",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  travelCardTitle: {
    color: "#143A54",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 3,
  },

  travelCardSubtitle: {
    color: "#678197",
    fontSize: 9,
    marginTop: 2,
  },

  travelCardCompass: {
    position: "absolute",
    right: 28,
    top: 18,
    color: "#FFFFFF",
    fontSize: 24,
  },

  pressed: {
    opacity: 0.78,
  },

  footerSpace: {
    height: 8,
  },
});
