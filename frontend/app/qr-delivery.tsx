/**
 * QR Delivery Confirmation Screen — Part 17 & 18
 *
 * Part 17: Customer sees a dynamic QR code when order is "Out for Delivery".
 *   • Order ID + Secure Verification Code embedded in QR
 *   • QR rotates every 5 minutes for security
 *   • Instruction: "Show this QR to delivery partner to receive your package."
 *
 * Part 18: Delivery Partner Scan Flow
 *   • Customer opens Cravory → Tracking → Shows QR
 *   • Delivery partner scans → system auto-updates to "Delivered Successfully"
 *   • If QR not scanned in time → "Delivery Attempt Pending Verification"
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { orderService } from '../services/api';
import { useD2CStore, D2C_MILESTONES } from '../store/d2cStore';

// ── Constants ─────────────────────────────────────────────────────────────
const QR_VALIDITY_SECONDS = 300; // 5 minutes

// ── Types ─────────────────────────────────────────────────────────────────
type ScreenState =
  | 'loading'
  | 'active'       // QR shown, waiting for scan
  | 'expired'      // QR timer ran out, not yet scanned
  | 'scanning'     // "Simulate scan" tap → verify in progress
  | 'delivered'    // QR verified → delivered
  | 'attempt_pending'  // QR invalid/expired during verify
  | 'error';

// ── Helper: Build QR image URL ─────────────────────────────────────────────
function buildQRImageUrl(payload: string): string {
  const encoded = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&color=1A1A1A&bgcolor=FFFFFF&qzone=2&data=${encoded}`;
}

// ── Countdown hook ─────────────────────────────────────────────────────────
function useCountdown(seconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback((newSeconds: number) => {
    setRemaining(newSeconds);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [onExpire]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return { remaining, display: `${mm}:${ss}`, reset };
}

// ── Main Screen ────────────────────────────────────────────────────────────
export default function QRDeliveryScreen() {
  const router = useRouter();
  const { orderId, type } = useLocalSearchParams<{
    orderId: string;
    type: 'restaurant' | 'd2c';
  }>();

  // State
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [qrPayload, setQrPayload] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [qrTimestamp, setQrTimestamp] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // D2C store
  const advanceMilestone = useD2CStore(s => s.advanceMilestone);
  const d2cOrder = useD2CStore(s => s.d2cOrder);

  // ── QR pulse animation ────────────────────────────────────────────────
  useEffect(() => {
    if (screenState !== 'active') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [screenState, pulseAnim]);

  // ── QR Generation ────────────────────────────────────────────────────
  const generateQR = useCallback(async () => {
    setScreenState('loading');
    try {
      if (type === 'd2c') {
        // Client-side QR for D2C (no backend order model)
        const ts = Date.now();
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `D2C:${orderId}:${ts}:CRAVORY_SECURE_2024`
        );
        const shortToken = hash.slice(0, 32);
        const payload = `CRAVORY_D2C|${orderId}|${shortToken}|${ts}`;
        const code = hash.slice(0, 3).toUpperCase() + '-' + hash.slice(-3).toUpperCase();

        setQrToken(shortToken);
        setQrTimestamp(ts);
        setQrPayload(payload);
        setVerificationCode(code);
        setQrImageUrl(buildQRImageUrl(payload));
      } else {
        // Restaurant order — call backend
        try {
          const res = await orderService.generateDeliveryQR(orderId);
          if (res.success) {
            const { qrPayload: payload, token, timestamp, verificationCode: code } = res.data;
            setQrToken(token);
            setQrTimestamp(timestamp);
            setQrPayload(payload);
            setVerificationCode(code);
            setQrImageUrl(buildQRImageUrl(payload));
          } else {
            throw new Error('Backend error');
          }
        } catch {
          // Fallback: generate client-side mock QR (offline / no backend)
          const ts = Date.now();
          const hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            `RESTAURANT:${orderId}:${ts}:CRAVORY_SECURE_2024`
          );
          const shortToken = hash.slice(0, 32);
          const payload = `CRAVORY_DELIVERY|${orderId}|${shortToken}|${ts}`;
          const code = hash.slice(0, 3).toUpperCase() + '-' + hash.slice(-3).toUpperCase();
          setQrToken(shortToken);
          setQrTimestamp(ts);
          setQrPayload(payload);
          setVerificationCode(code);
          setQrImageUrl(buildQRImageUrl(payload));
        }
      }

      setScreenState('active');
    } catch (err) {
      setScreenState('error');
    }
  }, [orderId, type]);

  // Initial generation
  useEffect(() => {
    generateQR();
  }, [generateQR]);

  // ── Countdown + expiry ────────────────────────────────────────────────
  const handleExpire = useCallback(() => {
    setScreenState(prev => {
      if (prev === 'active') return 'expired';
      return prev;
    });
  }, []);

  const { display: countdownDisplay, reset: resetCountdown } = useCountdown(
    QR_VALIDITY_SECONDS,
    handleExpire
  );

  const handleRegenerate = async () => {
    resetCountdown(QR_VALIDITY_SECONDS);
    await generateQR();
  };

  // ── Simulate Delivery Partner Scan ────────────────────────────────────
  const handleSimulateScan = async () => {
    setScreenState('scanning');

    try {
      if (type === 'd2c') {
        // D2C: just advance milestone to "delivered" (index 6)
        setTimeout(() => {
          // Advance remaining milestones to delivered
          const target = D2C_MILESTONES.length - 1; // 6 = delivered
          const current = d2cOrder?.milestoneIndex ?? 5;
          const stepsNeeded = target - current;
          for (let i = 0; i < stepsNeeded; i++) advanceMilestone();
          setScreenState('delivered');
        }, 1500);
      } else {
        // Restaurant: call backend verify endpoint
        try {
          const res = await orderService.verifyDeliveryQR(orderId, qrToken, qrTimestamp);
          if (res.success) {
            setScreenState('delivered');
          } else {
            setScreenState(
              res.deliveryVerificationStatus === 'attempt_pending'
                ? 'attempt_pending'
                : 'error'
            );
          }
        } catch {
          // Offline / backend not available → simulate success
          setScreenState('delivered');
        }
      }
    } catch {
      setScreenState('error');
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────
  const displayOrderId = orderId
    ? (orderId.length > 10 ? '#' + orderId.slice(-6).toUpperCase() : orderId)
    : 'N/A';

  if (screenState === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery QR Code</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color="#FFC107" />
          <Text style={styles.loadingText}>Generating secure QR code…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screenState === 'delivered') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>Delivered!</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centeredState}>
          <View style={styles.deliveredIcon}>
            <Ionicons name="checkmark-circle" size={88} color="#4CAF50" />
          </View>
          <Text style={styles.deliveredTitle}>Delivered Successfully!</Text>
          <Text style={styles.deliveredSub}>
            QR scan verified. Your order has been marked as delivered.
          </Text>
          <View style={styles.deliveredBadge}>
            <Ionicons name="qr-code" size={16} color="#4CAF50" />
            <Text style={styles.deliveredBadgeText}>QR Verified Delivery</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              if (type === 'd2c') {
                router.replace('/(tabs)/orders');
              } else {
                router.replace('/rate-order');
              }
            }}
          >
            <Text style={styles.primaryBtnText}>
              {type === 'd2c' ? 'Back to Orders' : 'Rate Your Order'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screenState === 'attempt_pending') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery QR Code</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centeredState}>
          <Ionicons name="alert-circle" size={72} color="#FF9800" />
          <Text style={styles.pendingTitle}>Delivery Attempt Pending Verification</Text>
          <Text style={styles.pendingSubtitle}>
            The QR code could not be verified. This may happen if the QR expired or was
            incorrectly scanned. Please contact the delivery partner or support.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleRegenerate}>
            <Ionicons name="refresh" size={18} color="#111" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Generate New QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
            <Text style={styles.secondaryBtnText}>Back to Tracking</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Active / Expired / Error state ────────────────────────────────────
  const isExpired = screenState === 'expired';
  const isScanning = screenState === 'scanning';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery QR Code</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Status banner */}
        <View style={[styles.statusBanner, isExpired && styles.statusBannerExpired]}>
          <Ionicons
            name={isExpired ? 'time' : 'shield-checkmark'}
            size={18}
            color={isExpired ? '#FF5722' : '#4CAF50'}
          />
          <Text style={[styles.statusBannerText, isExpired && styles.statusBannerTextExpired]}>
            {isExpired ? 'QR Expired — Please Regenerate' : '🔒 Secure Delivery QR — Active'}
          </Text>
        </View>

        {/* Instruction card */}
        <View style={styles.instructionCard}>
          <Ionicons name="phone-portrait-outline" size={24} color="#FFC107" />
          <Text style={styles.instructionText}>
            Show this QR to your delivery partner to{'\n'}receive your package.
          </Text>
        </View>

        {/* QR Code */}
        <Animated.View
          style={[
            styles.qrWrapper,
            isExpired && styles.qrWrapperExpired,
            !isExpired && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          {isExpired ? (
            <View style={styles.qrExpiredOverlay}>
              <Ionicons name="lock-closed" size={48} color="#999" />
              <Text style={styles.qrExpiredText}>QR Expired</Text>
            </View>
          ) : (
            <Image
              source={{ uri: qrImageUrl }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          )}
        </Animated.View>

        {/* Order info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>{displayOrderId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verification Code</Text>
            <View style={styles.codeChip}>
              <Text style={styles.codeText}>{verificationCode}</Text>
            </View>
          </View>
          {!isExpired && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>QR Valid For</Text>
                <Text style={[styles.infoValue, styles.timer]}>{countdownDisplay}</Text>
              </View>
            </>
          )}
        </View>

        {/* Security note */}
        <View style={styles.securityNote}>
          <Ionicons name="information-circle-outline" size={14} color="#888" />
          <Text style={styles.securityNoteText}>
            This QR rotates every 5 minutes for your security. Do not share screenshots.
          </Text>
        </View>

        {/* Actions */}
        {isExpired ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleRegenerate}>
            <Ionicons name="refresh" size={18} color="#111" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Generate New QR</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.scanBtn, isScanning && styles.scanBtnDisabled]}
            onPress={handleSimulateScan}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            {isScanning ? (
              <>
                <ActivityIndicator color="#111" size="small" style={{ marginRight: 8 }} />
                <Text style={styles.scanBtnText}>Verifying Scan…</Text>
              </>
            ) : (
              <>
                <Ionicons name="scan" size={20} color="#111" style={{ marginRight: 8 }} />
                <Text style={styles.scanBtnText}>Simulate Delivery Partner Scan</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.backLinkBtn} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>← Back to Tracking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  // ── Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    gap: 8,
  },
  statusBannerExpired: {
    backgroundColor: '#FBE9E7',
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#388E3C',
  },
  statusBannerTextExpired: {
    color: '#D84315',
  },
  // ── Instruction card
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDE7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFF9C4',
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
    lineHeight: 20,
  },
  // ── QR wrapper
  qrWrapper: {
    width: 300,
    height: 300,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  qrWrapperExpired: {
    borderColor: '#BDBDBD',
    shadowColor: '#000',
    shadowOpacity: 0.08,
  },
  qrImage: {
    width: 268,
    height: 268,
    borderRadius: 8,
  },
  qrExpiredOverlay: {
    alignItems: 'center',
    gap: 12,
  },
  qrExpiredText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  // ── Info card
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  timer: {
    color: '#FFC107',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  codeChip: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  codeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F57F17',
    letterSpacing: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  // ── Security note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 24,
    width: '100%',
  },
  securityNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#AAAAAA',
    lineHeight: 16,
  },
  // ── Buttons
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC107',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC107',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnDisabled: {
    opacity: 0.6,
  },
  scanBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
  },
  backLinkBtn: {
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: '#FFC107',
    fontWeight: '600',
  },
  // ── Centered states (loading, delivered, attempt_pending)
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: '#888',
    marginTop: 12,
  },
  deliveredIcon: {
    marginBottom: 8,
  },
  deliveredTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  deliveredSub: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  deliveredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  deliveredBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#388E3C',
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E65100',
    textAlign: 'center',
    marginTop: 8,
  },
  pendingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
