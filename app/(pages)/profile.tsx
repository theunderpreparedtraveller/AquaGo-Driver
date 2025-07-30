import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Mail, MapPin, Star, Settings, LogOut, Bell, Shield, FileText, Camera, CircleCheck as CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { uploadToCloudinary } from '../../utils/cloudinary';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    const userid = await AsyncStorage.getItem('userid');
    console.log("Userid from profile", userid);
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      console.log("No user found.");
      setLoading(false);
      return;
    }
  
    const { data, error } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('id', userid);
  
    if (data) {
      setProfile(data);
    }
  
    setLoading(false);
  };
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const fetchData = async () => {
      await getProfile();
    };
  
    // Initial fetch
    fetchData();
  
    // Set up polling every 5 seconds
    //intervalId = setInterval(fetchData, 10000);
  
    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logged out') }
      ]
    );
  };

  const navigateToDocument = (type: string) => {
    router.push(`/documents/${type}`);
  };
  if(loading === false){
    return ( 
      <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          
        </View>

        {/* Profile Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={32} color="#FFFFFF" />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.onlineIndicator} />
          </View>
          <Text style={styles.driverName}>{profile[0].name}</Text>
          <Text style={styles.driverRole}>Water Delivery Driver</Text>
          {/*
          <View style={styles.ratingContainer}>
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>4.8</Text>
            <Text style={styles.ratingText}>(127 reviews)</Text>
          </View>
          */}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile[0].total_deliveries}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>₹{profile[0].total_earnings}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statDivider} />
          
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <Phone size={20} color="#6B7280" />
            <Text style={styles.contactText}>{profile[0].phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <MapPin size={20} color="#6B7280" />
            <Text style={styles.contactText}>Guwahati, Assam</Text>
          </View>
        </View>

        {/* Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          
          <TouchableOpacity 
            style={styles.documentItem}
            onPress={() => router.push('/(tabs)/dl')}
          >
            <View style={styles.documentLeft}>
              <View style={styles.documentIcon}>
                <FileText size={20} color="#FF7A00" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>Driving License</Text>
                <Text
  style={[
    styles.documentStatus,
    profile[0].dl_status === 'approved'
      ? styles.documentStatus
      : profile[0].dl_status === 'pending'
      ? styles.documentStatusPending
      : styles.documentStatusMissing
  ]}
>
  {profile[0].dl_status}
</Text>
              </View>
            </View>
            <View style={styles.documentRight}>
              {profile[0].dl_status === 'approved' ? <CheckCircle size={20} color="#10B981" /> : <CheckCircle size={20} color="white" />}
              <Text style={styles.menuItemArrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.documentItem}
            onPress={() => router.push('/(tabs)/rc')}
          >
            <View style={styles.documentLeft}>
              <View style={styles.documentIcon}>
                <FileText size={20} color="#FF7A00" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>RC (Registration Certificate)</Text>
                <Text
  style={[
    styles.documentStatus,
    profile[0].rc_status === 'verified'
      ? styles.documentStatus
      : profile[0].rc_status === 'pending'
      ? styles.documentStatusPending
      : styles.documentStatusMissing
  ]}
>
  {profile[0].rc_status}
</Text>
              </View>
            </View>
            <View style={styles.documentRight}>
              <Text style={styles.menuItemArrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.documentItem}
            onPress={() => router.push('/(tabs)/insurance')}
          >
            <View style={styles.documentLeft}>
              <View style={styles.documentIcon}>
                <FileText size={20} color="#FF7A00" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>Vehicle Insurance</Text>
                <Text
  style={[
    styles.documentStatus,
    profile[0].insurance_status === 'verified'
      ? styles.documentStatus
      : profile[0].insurance_status === 'pending'
      ? styles.documentStatusPending
      : styles.documentStatusMissing
  ]}
>
  {profile[0].insurance_status}
</Text>
              </View>
            </View>
            <View style={styles.documentRight}>
              <Text style={styles.menuItemArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu Options 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Bell size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Shield size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Privacy & Security</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>App Settings</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>
        */}
        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
  }
  else{
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat-Regular',
    color: '#111827',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF7A00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 24,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  driverName: {
    fontSize: 24,
    fontFamily: 'Montserrat-Regular',
    color: '#111827',
    marginBottom: 4,
  },
  driverRole: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Montserrat-Regular',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  documentStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  documentStatusPending: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
  },
  documentStatusMissing: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
  },
  documentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
  bottomPadding: {
    height: 100,
  },
});