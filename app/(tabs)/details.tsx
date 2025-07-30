import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { handleDelivered } from '../../utils/utils';
import { User } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Link, useRouter } from 'expo-router';

export default function Details() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [profile, setProfile] = useState<any | null>(null);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('water_deliveries')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) {
          console.error(error);
          return;
        }

        setProfile(data);

        const cords = data?.delivery_location;
        if (cords) {
          const [lngStr, latStr] = cords.replace(/[()]/g, "").split(",");
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          if (!isNaN(lat) && !isNaN(lng)) {
            setLocation({ latitude: lat, longitude: lng });
          }
        }
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const parsedAddress = profile?.delivery_address ? JSON.parse(profile.delivery_address) : {};

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.sectionTitle}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Details</Text>
        <TouchableOpacity onPress={() => router.push('/(pages)/profile')} style={styles.profilebuttonresp}>
          <User size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.subtitle}>Track your water delivery orders</Text>
      </View>

      {location && (
        <>
          <View style={styles.mapContainer}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                ...location,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={location} title="Order Location" />
            </MapView>
          </View>

          <TouchableOpacity
            style={styles.openMapButton}
            onPress={() => {
              const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
              Linking.openURL(url);
            }}
          >
            <Text style={styles.openMapText}>Open in Google Maps</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        <Text style={styles.sectionTitle1}>Name: {parsedAddress?.name ?? 'N/A'}</Text>
        <Text style={styles.sectionTitle1}>Phone Number: {parsedAddress?.number ?? 'N/A'}</Text>
        <Text style={styles.sectionTitle1}>Address: {parsedAddress?.address ?? 'N/A'}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => handleDelivered(parsedAddress?.id)} style={styles.completeButton}>
            <Text style={styles.completeButtonText}>Delivered</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${parsedAddress?.number}`)} style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>Call Customer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mapContainer: {
    height: 340,
    marginHorizontal: 20,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 0,
  },
  
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  sectionTitle1: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#111827',
    marginBottom: 12,
  },
  
  openMapButton: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  
  openMapText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  profilebuttonresp:{
    position: 'absolute',
    right: 20,
    top: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  amount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FF7A00',
  },
  orderDetails: {
    marginBottom: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,

    color: 'black',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  rejectButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  rejectButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  callButton: {
    backgroundColor: '#3B82F6',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedActions: {
    alignItems: 'center',
  },
  viewDetailsButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewDetailsText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});