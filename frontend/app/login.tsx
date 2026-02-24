import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { authService } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '586542487325-bail263eggih7jdm7pl349nf9r64m52f.apps.googleusercontent.com',
    iosClientId: '586542487325-bail263eggih7jdm7pl349nf9r64m52f.apps.googleusercontent.com',
    webClientId: '586542487325-bail263eggih7jdm7pl349nf9r64m52f.apps.googleusercontent.com',
    clientId: '586542487325-bail263eggih7jdm7pl349nf9r64m52f.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignInSuccess(authentication?.accessToken);
    }
  }, [response]);

  const handleGoogleSignInSuccess = async (accessToken: string | undefined) => {
    if (!accessToken) {
      Alert.alert('Error', 'Failed to get access token from Google');
      return;
    }

    setLoading(true);
    try {
      // Fetch user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      const userInfo = await userInfoResponse.json();

      // Send to backend
      const response = await authService.googleSignIn({
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        profilePhoto: userInfo.picture,
      });

      if (response.token) {
        router.replace('/location');
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Error', error.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error prompting Google Sign-In:', error);
      Alert.alert('Error', 'Failed to initiate Google Sign-In');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>CRAVORY</Text>
        <Text style={styles.subtitle}>Welcome Back!</Text>
      </View>

      <View style={styles.content}>
        <Image
          source={require('../assets/images/login-food.jpg')}
          style={styles.image}
        />
        
        <Text style={styles.title}>Login to Continue</Text>
        <Text style={styles.description}>Choose your preferred login method</Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/otp')}
          activeOpacity={0.8}
        >
          <Ionicons name="call-outline" size={24} color="#111111" />
          <Text style={styles.buttonText}>Continue with Mobile Number</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignIn}
          disabled={loading || !request}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#111111" />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color="#4285F4" />
              <Text style={[styles.buttonText, styles.googleButtonText]}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>
        By continuing, you agree to our Terms & Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111111',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 32,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC107',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginLeft: 12,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleButtonText: {
    color: '#111111',
  },
  terms: {
    fontSize: 12,
    color: '#111111',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});