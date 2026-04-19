import React, { useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ProductAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { colors, spacing, radius, typography } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState(null);

  const catsQuery = useQuery({
    queryKey: ['categories'],
    queryFn: ProductAPI.categories,
  });

  const productsQuery = useQuery({
    queryKey: ['products', { q, category }],
    queryFn: () => ProductAPI.list({ q, category }),
  });

  const products = productsQuery.data?.items || [];
  const promoted = products.filter((p) => p.isPromoted).slice(0, 5);
  const regular = products.filter((p) => !p.isPromoted);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationBtn}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.locationText}>Dakar</Text>
          <Ionicons name="chevron-down" size={16} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit…"
          value={q}
          onChangeText={setQ}
          returnKeyType="search"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Tous" active={!category} onPress={() => setCategory(null)} />
        {catsQuery.data?.items?.map((c) => (
          <Chip
            key={c.id}
            label={`${c.icon || ''} ${c.name}`}
            active={category === c.id}
            onPress={() => setCategory(c.id)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={regular}
        keyExtractor={(p) => p.id}
        numColumns={2}
        contentContainerStyle={{ padding: spacing.md }}
        columnWrapperStyle={{ gap: spacing.md }}
        refreshing={productsQuery.isFetching}
        onRefresh={productsQuery.refetch}
        ListHeaderComponent={
          promoted.length > 0 ? (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={styles.sectionTitle}>🔥 En promotion</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
                {promoted.map((p) => (
                  <View key={p.id} style={{ width: 150 }}>
                    <ProductCard
                      product={p}
                      onPress={() => navigation.navigate('ProductDetail', { id: p.id })}
                    />
                  </View>
                ))}
              </ScrollView>
              <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Près de toi</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
            />
          </View>
        )}
        ListEmptyComponent={
          !productsQuery.isLoading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun produit trouvé</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { ...typography.body, fontWeight: '600' },
  headerIcons: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { padding: spacing.sm },
  search: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    paddingHorizontal: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, padding: spacing.md, fontSize: 15 },
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.pill, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.body, fontSize: 13 },
  chipTextActive: { color: 'white', fontWeight: '600' },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  empty: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textMuted },
});
