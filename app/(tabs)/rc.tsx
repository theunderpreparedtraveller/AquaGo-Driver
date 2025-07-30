import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, FileText, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { uploadToCloudinary } from '../../utils/cloudinary';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function InsuranceScreen() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending' | 'rejected' | 'not_uploaded'>('not_uploaded');

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add your insurance certificate',
      [
        { text: 'Camera', onPress: () => takePhoto() },
        { text: 'Gallery', onPress: () => selectImage() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  const getStatus = async () => {
    const userid = await AsyncStorage.getItem('userid');
    const { data, error } = await supabase
    .from('driver_profiles')
    .select('*')
    .eq('id', userid);
    console.log(data[0].rc_status)
    setVerificationStatus(data[0].rc_status);
  }
  useEffect(() => {
    getStatus();
  }, []);
  const handleUpload = async (uri: string) => {
    try {
      setIsUploading(true);
      const result = await uploadToCloudinary(uri); // folder is optional
      setUploadedImage(result.secure_url);
      setVerificationStatus('pending');
      Alert.alert('Success', 'Insurance certificate uploaded!');
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        console.log("No user found.");
        return;
      }
      const userid = await AsyncStorage.getItem('userid');
      console.log(userid)
      const { data, error } = await supabase
      .from('driver_profiles')
      .update({ rc_status: 'pending' })
      .eq('id', userid);

    } catch (err) {
      console.log(err)
      Alert.alert('Upload Failed', 'Try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const selectImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (!permissionResult.granted) {
        alert("Permission to access media library is required!");
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
  
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await handleUpload(uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };
const takePhoto = async () => {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Camera permission is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await handleUpload(uri);
    }
  } catch (err) {
    console.error('Error launching camera:', err);
  }
};



  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verified': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending Verification';
      case 'rejected': return 'Rejected';
      default: return 'Not Uploaded';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified': return <AlertCircle size={20} color="#10B981" />;
      case 'pending': return <AlertCircle size={20} color="#F59E0B" />;
      case 'rejected': return <AlertCircle size={20} color="#EF4444" />;
      default: return <FileText size={20} color="#6B7280" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {getStatusIcon()}
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Registration Certificate</Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          {verificationStatus === 'verified' && (
            <Text style={styles.statusDescription}>
              Your registration certificate has been verified and approved.
            </Text>
          )}
          {verificationStatus === 'pending' && (
            <Text style={styles.statusDescription}>
              Your document is under review. This usually takes 24-48 hours.
            </Text>
          )}
          {verificationStatus === 'rejected' && (
            <Text style={styles.statusDescription}>
              Your document was rejected. Please upload a clear, valid registration certificate.
            </Text>
          )}
          {verificationStatus === 'not_uploaded' && (
            <Text style={styles.statusDescription}>
              Please upload your vehicle's insurance certificate for verification.
            </Text>
          )}
        </View>

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Document Image</Text>
          
          {uploadedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={handleImagePicker}
                disabled={isUploading}
              >
                <Camera size={16} color="#FFFFFF" />
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadArea}
              onPress={handleImagePicker}
              disabled={isUploading}
            >
              <View style={styles.uploadIcon}>
                {isUploading ? (
                  <Text style={styles.uploadingText}>Uploading...</Text>
                ) : (
                  <Upload size={32} color="#FF7A00" />
                )}
              </View>
              <Text style={styles.uploadTitle}>Upload Registration Certificate</Text>
              <Text style={styles.uploadSubtitle}>
                Take a photo or select from gallery
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Requirements */}
        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <View style={styles.requirementDot} />
              <Text style={styles.requirementText}>Clear, readable image</Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.requirementDot} />
              <Text style={styles.requirementText}>Valid and not expired</Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.requirementDot} />
              <Text style={styles.requirementText}>Policy details clearly visible</Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.requirementDot} />
              <Text style={styles.requirementText}>No glare or shadows</Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.requirementDot} />
              <Text style={styles.requirementText}>Vehicle registration number matches</Text>
            </View>
          </View>
        </View>

        {/* Important Note */}
        <View style={styles.noteSection}>
          <View style={styles.noteHeader}>
            <AlertCircle size={20} color="#F59E0B" />
            <Text style={styles.noteTitle}>Important</Text>
          </View>
          <Text style={styles.noteText}>
            Your registration certificate must be valid and cover commercial use for water delivery services. 
            Expired or invalid registration certificate will result in account suspension.
          </Text>
        </View>

        {/* Action Buttons */}
        {uploadedImage && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.reuploadButton}
              onPress={handleImagePicker}
              disabled={isUploading}
            >
              <Upload size={16} color="#FF7A00" />
              <Text style={styles.reuploadText}>Re-upload Document</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  uploadSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
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
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadingText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#FF7A00',
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  requirementsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF7A00',
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#374151',
    flex: 1,
  },
  noteSection: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#92400E',
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#92400E',
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  reuploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF7A00',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  reuploadText: {
    color: '#FF7A00',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
});