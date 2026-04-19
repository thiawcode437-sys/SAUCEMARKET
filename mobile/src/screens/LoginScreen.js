import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthAPI } from '../services/api';
import { colors, spacing, radius, typography } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const normalized = () => {
    const digits = phone.replace(/\s/g, '');
    return digits.startsWith('+221') ? digits : `+221${digits}`;
  };

  const sendOtp = async () => {
    const p = normalized();
    if (!/^\+221[0-9]{9}$/.test(p)) {
      return Alert.alert('Numéro invalide', 'Ex : 77 123 45 67');
    }
    setLoading(true);
    try {
      await AuthAPI.requestOtp(p);
      navigation.navigate('Otp', { phone: p });
    } catch (e) {
      Alert.alert('Erreur', e.response?.data?.error?.message || 'Impossible d\'envoyer le code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.hero}>
          <Text style={styles.logo}>🛍️</Text>
          <Text style={styles.title}>Sauce Market</Text>
          <Text style={styles.subtitle}>Achète, vends, discute au Sénégal</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Entre ton numéro</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.flag}>🇸🇳 +221</Text>
            <TextInput
              style={styles.input}
              placeholder="77 123 45 67"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={12}
            />
          </View>

          <TouchableOpacity style={styles.cta} onPress={sendOtp} disabled={loading}>
            <Text style={styles.ctaText}>{loading ? '…' : 'Recevoir le code'}</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            En continuant, tu acceptes nos Conditions et notre Politique de confidentialité.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', paddingTop: spacing.xxl * 2 },
  logo: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.primary },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  form: { padding: spacing.xl, marginTop: spacing.xxl },
  label: { ...typography.body, marginBottom: spacing.sm, fontWeight: '600' },
  phoneRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  flag: { fontSize: 16, marginRight: spacing.sm, fontWeight: '600' },
  input: { flex: 1, fontSize: 18 },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '700' },
  legal: { ...typography.caption, textAlign: 'center', marginTop: spacing.lg },
});
