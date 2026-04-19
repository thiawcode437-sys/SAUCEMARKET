import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { SubscriptionAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, radius, typography, formatFCFA } from '../theme/colors';

const PROVIDERS = [
  { key: 'WAVE', label: 'Wave', color: '#1DC8CD', emoji: '🟦' },
  { key: 'ORANGE_MONEY', label: 'Orange Money', color: '#FF7900', emoji: '🟧' },
  { key: 'FREE_MONEY', label: 'Free Money', color: '#00A651', emoji: '🟩' },
];

export default function SubscriptionScreen({ navigation }) {
  const [provider, setProvider] = useState('WAVE');
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const { data } = useQuery({ queryKey: ['plans'], queryFn: SubscriptionAPI.plans });
  const plan = data?.items?.[0];

  const subscribe = useMutation({
    mutationFn: () => SubscriptionAPI.subscribe(provider),
    onSuccess: async (res) => {
      await Linking.openURL(res.paymentUrl);
      Alert.alert(
        'Paiement en cours',
        'Finalise le paiement dans l\'app de ton opérateur. Reviens ici ensuite.',
        [{ text: 'OK', onPress: () => { refreshUser(); navigation.goBack(); } }],
      );
    },
    onError: (e) => Alert.alert('Erreur', e.response?.data?.error?.message || 'Paiement impossible'),
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>💼</Text>
        <Text style={styles.title}>Devenir vendeur</Text>
        <Text style={styles.subtitle}>Publie des annonces et commence à vendre</Text>
      </View>

      <View style={styles.benefits}>
        {[
          { icon: 'infinite', text: 'Publications illimitées' },
          { icon: 'checkmark-circle', text: 'Badge vendeur vérifié' },
          { icon: 'stats-chart', text: 'Statistiques détaillées' },
          { icon: 'headset', text: 'Support prioritaire' },
        ].map((b) => (
          <View key={b.icon} style={styles.benefitRow}>
            <Ionicons name={b.icon} size={20} color={colors.primary} />
            <Text style={styles.benefitText}>{b.text}</Text>
          </View>
        ))}
      </View>

      {plan && (
        <View style={styles.priceBox}>
          <Text style={styles.price}>{formatFCFA(plan.amount)}</Text>
          <Text style={styles.period}>/ mois</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Moyen de paiement</Text>
      {PROVIDERS.map((p) => (
        <TouchableOpacity
          key={p.key}
          style={[styles.providerRow, provider === p.key && styles.providerActive]}
          onPress={() => setProvider(p.key)}
        >
          <Text style={styles.providerEmoji}>{p.emoji}</Text>
          <Text style={styles.providerLabel}>{p.label}</Text>
          <Ionicons
            name={provider === p.key ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={provider === p.key ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.cta}
        onPress={() => subscribe.mutate()}
        disabled={subscribe.isPending}
      >
        {subscribe.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.ctaText}>
            Confirmer {plan ? formatFCFA(plan.amount) : ''}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  hero: { alignItems: 'center', marginTop: spacing.md },
  emoji: { fontSize: 64 },
  title: { ...typography.h1, marginTop: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  benefits: { marginTop: spacing.xl, gap: spacing.md },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitText: { ...typography.body },
  priceBox: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center',
    marginTop: spacing.xl,
  },
  price: { ...typography.h1, color: colors.primary },
  period: { ...typography.body, color: colors.textMuted, marginLeft: 4 },
  sectionTitle: { ...typography.h3, marginTop: spacing.xl, marginBottom: spacing.sm },
  providerRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 2, borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  providerActive: { borderColor: colors.primary },
  providerEmoji: { fontSize: 24 },
  providerLabel: { flex: 1, ...typography.body, fontWeight: '600' },
  cta: {
    marginTop: 'auto', backgroundColor: colors.primary,
    padding: spacing.lg, borderRadius: radius.md, alignItems: 'center',
  },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
