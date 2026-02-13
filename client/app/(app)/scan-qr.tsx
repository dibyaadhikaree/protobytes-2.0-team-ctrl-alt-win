import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  console.log('QRScannerScreen component rendering...');

  // Add a simple test view to see if component loads
  return (
    <View style={styles.container}>
      <Text style={{color: 'white', fontSize: 20, textAlign: 'center', marginTop: 100}}>
        QR Scanner Loaded Successfully!
      </Text>
      <TouchableOpacity 
        style={{backgroundColor: 'blue', padding: 20, margin: 20, borderRadius: 10}}
        onPress={() => router.back()}
      >
        <Text style={{color: 'white', textAlign: 'center'}}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  scanFrameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  resetButton: {
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#000000',
    textAlign: 'center',
  },
});