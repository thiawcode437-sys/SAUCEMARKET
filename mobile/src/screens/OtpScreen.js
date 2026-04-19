import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, radius, typography } from '../theme/colors';

export default function OtpScreen({ route, navigation }) {
  const { phone } = route.params;
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const setSession = useAuthStore((s) => s.setSession);

  const onChange = (i, v) => {
    if (v.length > 1) v = v.slice(-1);
    const d = [...digits];
    d[i] = v.replace(/[^0-9]/g, '');
    setDigits(d);
    if (v && i < 5) inputs.current[i + 1]?.focus();
    if (d.every((x) => x)) submit(d.join(''));
  };

  const submit = async (code) => {
    setLoading(true);
    try {
      const data = await AuthAPI.verifyOtp(phone, code);
      await setSession(data);
    } catch (e) {
      Alert.alert('Code invalide', e.response?.data?.error?.message || 'Réessaye');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await AuthAPI.requestOtp(phone);
      Alert.alert('Code renvoyé', 'Vérifie tes SMS');
    } catch {
      Alert.alert('Erreur', 'Réessaye plus tard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={{ fontSize: 24 }}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Code de vérification</Text>
        <Text style={styles.subtitle}>Envoyé au {phone}</Text>

        <View style={styles.codeRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              style={styles.box}
              keyboardType="number-pad"
              maxLength={1}
              value={d}
              onChangeText={(v) => onChange(i, v)}
              onKeyPress={(e) => {
                if (e.nativeEvent.key === 'Backspace' && !d && i > 0) {
                  inputs.current[i - 1]?.focus();
                }
              }}
            />
          ))}
        </View>

        <TouchableOpacity onPress={resend}>
          <Text style={styles.resend}>Renvoyer le code</Text>
        </TouchableOpacity>

        {loading && <Text style={styles.loading}>Vérification…</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  back: { padding: spacing.lg },
  content: { padding: spacing.xl, alignItems: 'center' },
  title: { ...typography.h2, marginTop: spacing.xxl },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  codeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xxl },
  box: {
    width: 44, height: 56, borderWidth: 2, borderColor: colors.border,
    borderRadius: radius.md, textAlign: 'center', fontSize: 22, fontWeight: '700',
    backgroundColor: colors.surface,
  },
  resend: { color: colors.primary, marginTop: spacing.xl, fontWeight: '600' },
  loading: { color: colors.textMuted, marginTop: spacing.lg },
});
