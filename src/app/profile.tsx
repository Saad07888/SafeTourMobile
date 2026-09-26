import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const BLUE = '#1769AA';
const DARK = '#1F2937';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F3F6F9';
const BORDER = '#E5E7EB';
const WHITE = '#FFFFFF';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={DARK} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>Saad</Text>
            <Text style={styles.role}>Tourist</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color={BLUE} />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.sectionCard}>
          <ProfileRow
            icon="person-outline"
            title="Personal Information"
            subtitle="Manage your basic details"
          />

          <View style={styles.divider} />

          <ProfileRow
            icon="shield-checkmark-outline"
            title="Digital ID"
            subtitle="View your verified tourist ID"
            onPress={() => router.push('/(tabs)/digital-id')}
          />
        </View>

        {/* Safety */}
        <Text style={styles.sectionTitle}>Safety</Text>

        <View style={styles.sectionCard}>
          <ProfileRow
            icon="people-outline"
            title="Emergency Contacts"
            subtitle="Manage your emergency contacts"
          />

          <View style={styles.divider} />

          <ProfileRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage safety notifications"
          />

          <View style={styles.divider} />

          <ProfileRow
            icon="document-text-outline"
            title="Incident Reports"
            subtitle="View your reported incidents"
          />
        </View>

        {/* App */}
        <Text style={styles.sectionTitle}>App</Text>

        <View style={styles.sectionCard}>
          <ProfileRow
            icon="information-circle-outline"
            title="About SafeTour"
            subtitle="Safety and tourism assistance"
          />

          <View style={styles.divider} />

          <ProfileRow
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help when you need it"
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() => router.replace('/login')}
        >
          <Ionicons name="log-out-outline" size={21} color="#C62828" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>SafeTour • Mobile App</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

function ProfileRow({
  icon,
  title,
  subtitle,
  onPress,
}: ProfileRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={21} color={BLUE} />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={19} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  header: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: DARK,
  },

  headerSpacer: {
    width: 42,
  },

  profileCard: {
    marginTop: 12,
    padding: 18,
    borderRadius: 16,
    backgroundColor: LIGHT_GRAY,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: WHITE,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },

  name: {
    fontSize: 19,
    fontWeight: '700',
    color: DARK,
  },

  role: {
    marginTop: 3,
    fontSize: 14,
    color: GRAY,
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '700',
    color: DARK,
  },

  sectionCard: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    overflow: 'hidden',
  },

  row: {
    minHeight: 74,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF3FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowContent: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },

  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: DARK,
  },

  rowSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: GRAY,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginLeft: 69,
  },

  logoutButton: {
    height: 52,
    marginTop: 26,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0CACA',
    backgroundColor: '#FFF7F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    marginLeft: 9,
    fontSize: 15,
    fontWeight: '700',
    color: '#C62828',
  },

  version: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
  },
});