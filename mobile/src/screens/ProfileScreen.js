import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionAPI, SellerAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, radius, typography, formatFCFA } from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuthStore();
  const subQuery = useQuery({ queryKey: ['mySub'], queryFn: SubscriptionAPI.me });
  const statsQuery = useQuery({
    queryKey: ['sellerStats'],
    queryFn: SellerAPI.stats,
    enabled: subQuery.data?.isActive,
  });

  const confirmSignOut = () => {
    Alert.alert('Déconnexion', 'Tu veux te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.name}>{user.name}</Text>
              {user.isVerified && (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={styles.meta}>{user.phone}</Text>
            <Text style={styles.meta}>📍 {user.city}</Text>
          </View>
        </View>

        <View style={styles.subCard}>
          <Text style={styles.cardTitle}>💼 Abonnement vendeur</Text>
          {subQuery.data?.isActive ? (
            <>
              <Text style={styles.subActive}>✓ Actif</Text>
              <Text style={styles.subMeta}>
                Expire le {new Date(subQuery.data.subscription.endsAt).toLocaleDateString('fr-FR')}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.subInactive}>Non actif</Text>
              <TouchableOpacity
                style={styles.ctaInline}
                onPress={() => navigation.navigate('Subscription')}
              >
                <Text style={styles.ctaInlineText}>Devenir vendeur — 1 000 FCFA/mois</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {subQuery.data?.isActive && statsQuery.data && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={styles.cardTitle}>📊 Ce mois-ci</Text>
            <View style={styles.statsGrid}>
              <Stat label="Ventes" value={statsQuery.data.salesCount} />
              <Stat label="Vues" value={statsQuery.data.totalViews} />
              <Stat label="Revenu" value={formatFCFA(statsQuery.data.netRevenue)} small />
            </View>
          </View>
        )}

        <View style={styles.menu}>
          <MenuItem icon="pencil" label="Modifier profil" onPress={() => {}} />
          <MenuItem icon="heart-outline" label="Mes favoris" onPress={() => {}} />
          <MenuItem icon="bag-outline" label="Mes commandes" onPress={() => {}} />
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => {}} />
          <MenuItem icon="language-outline" label="Langue (Français)" onPress={() => {}} />
          <MenuItem icon="help-circle-outline" label="Aide" onPress={() => {}} />
          <MenuItem icon="log-out-outline" label="Se déconnecter" onPress={confirmSignOut} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, small }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, small && { fontSize: 16 }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color={danger ? colors.danger : colors.text} />
      <Text style={[styles.menuText, danger && { color: colors.danger }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: { width: 72, height: 72, borderRadius: 36 },
  avatarText: { color: 'white', fontSize: 28, fontWeight: '700' },
  name: { ...typography.h2 },
  meta: { ...typography.caption, marginTop: 2 },
  subCard: {
    marginTop: spacing.xl, padding: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { ...typography.h3, marginBottom: spacing.sm },
  subActive: { ...typography.body, color: colors.success, fontWeight: '700' },
  subInactive: { ...typography.body, color: colors.textMuted },
  subMeta: { ...typography.caption, marginTop: 2 },
  ctaInline: {
    marginTop: spacing.md, backgroundColor: colors.primary,
    padding: spacing.md, borderRadius: radius.md, alignItems: 'center',
  },
  ctaInlineText: { color: 'white', fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  statBox: {
    flex: 1, padding: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  statValue: { ...typography.h2, color: colors.primary },
  statLabel: { ...typography.caption, marginTop: 2 },
  menu: { marginTop: spacing.xl },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, backgroundColor: colors.surface,
    borderRadius: radius.md, marginBottom: spacing.sm,
  },
  menuText: { flex: 1, ...typography.body },
});
