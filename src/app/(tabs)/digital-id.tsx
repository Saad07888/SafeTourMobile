import { router } from "expo-router";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function DigitalIDScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push("/(tabs)/home")}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.headerTitle}>Digital ID</Text>
            <Text style={styles.headerSubtitle}>
              Your SafeTour identity
            </Text>
          </View>
        </View>

        {/* ID Card */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <View>
              <Text style={styles.brand}>SafeTour</Text>
              <Text style={styles.cardLabel}>DIGITAL TOURIST ID</Text>
            </View>

            <View style={styles.verified}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>S</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>Saad Patel</Text>
              <Text style={styles.idNumber}>ST-2026-00124</Text>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Country</Text>
              <Text style={styles.detailValue}>India</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>Active</Text>
            </View>
          </View>

          <View style={styles.qrBox}>
            <View style={styles.qr}>
              <Text style={styles.qrText}>
                ▦
              </Text>
            </View>

            <Text style={styles.qrTitle}>Scan to verify</Text>

            <Text style={styles.qrSubtitle}>
              Show this QR code when your identity
              needs to be verified.
            </Text>
          </View>
        </View>

        {/* Verification */}
        <View style={styles.statusBox}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>✓</Text>
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              Identity verified
            </Text>

            <Text style={styles.statusText}>
              Your SafeTour Digital ID is active and ready
              to use.
            </Text>
          </View>
        </View>

        {/* Information */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            About your Digital ID
          </Text>

          <Text style={styles.infoText}>
            Your Digital ID helps identify you while
            travelling and can be used with SafeTour
            safety services.
          </Text>
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

  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
  },

  backText: {
    color: "#526674",
    fontSize: 30,
  },

  headerTitle: {
    color: "#1D3342",
    fontSize: 20,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#81909A",
    fontSize: 11,
    marginTop: 2,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E0E8ED",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#1F70B1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  brand: {
    color: "#1D3342",
    fontSize: 14,
    fontWeight: "800",
  },

  cardLabel: {
    color: "#8998A2",
    fontSize: 8,
    marginTop: 2,
    letterSpacing: 0.7,
  },

  verified: {
    marginLeft: "auto",
    backgroundColor: "#EAF7EF",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  verifiedText: {
    color: "#199653",
    fontSize: 9,
    fontWeight: "700",
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E9F2F9",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#1F70B1",
    fontSize: 24,
    fontWeight: "800",
  },

  profileInfo: {
    marginLeft: 14,
  },

  name: {
    color: "#1D3342",
    fontSize: 18,
    fontWeight: "800",
  },

  idNumber: {
    color: "#82919B",
    fontSize: 10,
    marginTop: 4,
  },

  details: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EDF1F3",
    marginTop: 20,
    paddingTop: 15,
  },

  detailItem: {
    flex: 1,
  },

  detailLabel: {
    color: "#8A98A1",
    fontSize: 9,
  },

  detailValue: {
    color: "#344B59",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  qrBox: {
    alignItems: "center",
    backgroundColor: "#F6F9FB",
    borderRadius: 14,
    paddingVertical: 18,
    marginTop: 18,
  },

  qr: {
    width: 110,
    height: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E1E7EB",
  },

  qrText: {
    color: "#172B38",
    fontSize: 82,
    lineHeight: 90,
  },

  qrTitle: {
    color: "#334B5A",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
  },

  qrSubtitle: {
    color: "#8A98A1",
    fontSize: 9,
    textAlign: "center",
    maxWidth: 240,
    marginTop: 4,
  },

  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E8ED",
    padding: 14,
    marginTop: 14,
  },

  statusIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E7F6ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  statusIconText: {
    color: "#1B9A55",
    fontSize: 16,
    fontWeight: "800",
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    color: "#334B59",
    fontSize: 12,
    fontWeight: "700",
  },

  statusText: {
    color: "#87959E",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  infoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginTop: 14,
  },

  infoTitle: {
    color: "#334B59",
    fontSize: 12,
    fontWeight: "700",
  },

  infoText: {
    color: "#87959E",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 6,
  },
});
