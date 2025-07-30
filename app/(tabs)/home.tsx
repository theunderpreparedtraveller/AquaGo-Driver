import { View, Text, StyleSheet, ScrollView, TouchableOpacity,FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Clock, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { User } from "lucide-react-native";
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { useEffect, useState, useRef } from 'react';


interface Order {
  id: string;
  customerName: string;
  address: string;
  orderTime: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'confirmed' | 'cancelled';
  amount: string;
  waterType: string;
  quantity: string;
  phone: string;
}


/*confirmed - payment confirmed by customer
in_progress/pending - order accepted by driver
delivered - order delivered to customer
cancelled - order cancelled by customer
*/




const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'accepted': return '#3B82F6';
    case 'in_progress': return '#8B5CF6';
    case 'confirmed': return '#10B981';
    case 'completed': return '#10B981';
    case 'cancelled': return '#EF4444';
    default: return '#6B7280';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'accepted': return 'Accepted';
    case 'in_progress': return 'In Progress';
    case 'confirmed': return 'Confirmed';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Confirmed': return <CheckCircle size={16} color="#10B981" />;
    case 'cancelled': return <XCircle size={16} color="#EF4444" />;
    default: return <Clock size={16} color={getStatusColor(status)} />;
  }
};


export default function OrdersScreen() {
  const router = useRouter();
  async function getCurrentLocation() {
      
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    let latitude = location.coords.latitude
    let longitude = location.coords.longitude
    const latlong = {
      "latitude": latitude,
      "longitude": longitude
    }
    await AsyncStorage.setItem('location', JSON.stringify(latlong));
    setLocation(location);
    return location
  }
  const formatDateTime = (orderTime) => {
    const date = new Date(orderTime);
    if (isNaN(date.getTime())) return 'Invalid date';
  
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months start from 0
    const year = date.getFullYear();
  
    return `${day}/${month}/${year} ${hours}:${minutes}`;  
    // Output: "15/07/2025 14:30"
  };
  const toRad = (value) => (value * Math.PI) / 180;
  const getTravelDistance = async (originLat, originLng, destLat, destLng) => {
    const apiKey = 'AIzaSyCotfyZqn16dbPfICvQDhR6L7sk5GZUsnQ'; // Replace with your actual API key
  
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.status === 'OK') {
        const element = data.rows[0].elements[0];
  
        if (element.status === 'OK') {
          const distanceText = element.distance.text;
          const distanceValue = element.distance.value; // in meters
          const durationText = element.duration.text;  
          return {
            distanceText,
            distanceValue,
            durationText,
          };
        } else {
          console.warn('Element status:', element.status);
        }
      } else {
        console.warn('API status:', data.status);
      }
    } catch (error) {
      console.error('Error fetching distance:', error);
    }
  
    return null;
  };
  const viewdetails = (orderId: string) => {

    router.push({ pathname: '/(tabs)/details', params: { orderId: orderId } });
  };
  const [profile, setProfile] = useState<any[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [cLocation, setCLocation] = useState<Location.LocationObject | null>(null);
  const  handleAcceptOrder = async (orderId: string) => {
    const { data, error } = await supabase.rpc('update_order_status', {
      order_id: orderId,
      new_status: 'pending', 
    });
  
    if (error) {
      console.error('Error updating status:', error.message);
    } else {
      console.log('Status updated successfully.');
    }
    fetchProfile(location)
  };
  
  const fetchProfile = async (currentLocation) => {
    const MAX_DISTANCE_KM = 100
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let con_id  = user.id
      await AsyncStorage.setItem('userid', user.id);
      if (!user) {
        console.log("No user found.");
        return;
      }
  
      const { data, error } = await supabase
      .from('water_deliveries')
      .select('*')
      .eq('selected_container_id', con_id)
      .order('created_at', { ascending: false });
      if (error) throw error;
  
      const formattedData = await Promise.all(data.map(async (item) => {
        const [longitude, latitude] = item.delivery_location
          .replace(/[()]/g, "")
          .split(",")
          .map(Number);
  
        // Calculate distance using API
        
        const distanceInfo = await getTravelDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          latitude,
          longitude
        );
        let distance = distanceInfo.distanceText.replace(" km", "")
        distance = distanceInfo.distanceText.replace(",", "")
        let distanceKm = parseInt(distance)
        //const distanceKm = parseFloat(distanceInfo?.distanceText?.replace("km", "") || "0");
        if(distance > MAX_DISTANCE_KM){
          return null;
        }
        let waterType = '';
        if (item.volume === 1000) waterType = 'Small Tanker';
        else if (item.volume === 2000) waterType = 'Medium Tanker';
        else if (item.volume === 5000) waterType = 'Large Tanker';
  
        return {
          ...item,
          created_at: formatDateTime(item.created_at),
          distanceText: distanceInfo?.distanceText ?? 'N/A',
          durationText: distanceInfo?.durationText ?? 'N/A',
          deliveryRangeStatus: distanceKm > MAX_DISTANCE_KM ? 'Out of range' : 'In range',
          waterType
        };
      }));
      let filteredData = formattedData.filter(item => item.deliveryRangeStatus === 'In range');
      
      //filteredData = filteredData.filter(item => item.status === 'pending');
      //console.log(filteredData)
      setProfile(filteredData);
      return filteredData;
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      let currentLoc = await getCurrentLocation();
      if (currentLoc) {
        await fetchProfile(currentLoc);
      }
    };
    load();
  }, []);
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const fetchData = async () => {
      console.log("fetching data")
      let currentLoc = await getCurrentLocation();
      if (currentLoc) {
        await fetchProfile(currentLoc);
      }
    };
  
    // Initial fetch
    fetchData();
  
    // Set up polling every 5 seconds
    intervalId = setInterval(fetchData, 7000);
  
    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Orders</Text>
        <TouchableOpacity onPress={() => router.push('/(pages)/profile')} style={styles.profilebuttonresp}>
          <User size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.subtitle}>Track your water delivery orders</Text>
      </View>

      <FlatList
  data={profile} // <-- array
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    
    <View key={item.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.customerName}>{JSON.parse(item.delivery_address).name}</Text>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(item.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.amount}>₹{item.amount?.toString() || '₹0'}</Text>
              </View>
  
              {/* Order Details */}
              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{JSON.parse(item.delivery_address).address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Package size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {item.volume} Litres - {item.waterType}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{item.created_at}</Text>
                </View>
              </View>
  
              {/* Action Buttons */}
              {item.status === 'confirmed' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => handleAcceptOrder(item.id)} style={styles.acceptButton}>
                    <Text style={styles.acceptButtonText}>Accept Order</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton}>
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
  
              {item.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.completeButton}>
                    <Text style={styles.completeButtonText}>Delivered</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton}>
                    <Text onPress={() => viewdetails(item.id)} style={styles.rejectButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              )}
  
              {(item.status === 'completed' || item.status === 'cancelled') && (
                <View style={styles.completedActions}>
                  <TouchableOpacity style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
  )}
  showsVerticalScrollIndicator={false}
/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    fontSize: 28,
    fontFamily: 'Montserrat-Regular',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
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
    fontFamily: 'Montserrat-Medium',
  },
  amount: {
    fontSize: 20,
    fontFamily: 'Montserrat-Regular',
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
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
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
    fontFamily: 'Montserrat-Medium',
  },
});