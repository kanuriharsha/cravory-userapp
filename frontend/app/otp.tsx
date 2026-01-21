import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/api';

export default function OTPScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentOtp, setSentOtp] = useState(''); // For development

  const handleSendOTP = async () => {
    if (!phone) {
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const response = await authService.sendOTP(formattedPhone);
      
      // In development, show OTP if returned
      if (response.otp) {
        setSentOtp(response.otp);
      }
      
      setStep('otp');
    } catch (error: any) {
      // Mock mode: ignore errors and proceed
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const response = await authService.verifyOTP(formattedPhone, otp);
      
      // Check if user is admin
      if (response.user?.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/location');
      }
    } catch (error: any) {
      // Mock mode: ignore errors and proceed anyway
      router.replace('/location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => step === 'otp' ? setStep('phone') : router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'phone' ? 'Enter Mobile Number' : 'Verify OTP'}
        </Text>
      </View>

      <View style={styles.content}>
        {step === 'phone' ? (
          <>
            <Text style={styles.title}>What's your mobile number?</Text>
            <Text style={styles.description}>
              We'll send you an OTP to verify your number
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                autoFocus
              />
            </View>

            {sentOtp && (
              <View style={styles.devOtpContainer}>
                <Text style={styles.devOtpLabel}>Development OTP:</Text>
                <Text style={styles.devOtpText}>{sentOtp}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, !phone && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={!phone || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.description}>
              We've sent a 6-digit code to {phone}
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="Enter any OTP"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />

            {sentOtp && (
              <View style={styles.devOtpContainer}>
                <Text style={styles.devOtpLabel}>Development OTP:</Text>
                <Text style={styles.devOtpText}>{sentOtp}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, !otp && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={!otp || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#1A1A1A',
  },
  otpInput: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 24,
    letterSpacing: 8,
    color: '#1A1A1A',
  },
  devOtpContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  devOtpLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  devOtpText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#FFB299',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
});
