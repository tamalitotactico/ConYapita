import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Search, ListFilter as Filter, Star, MapPin, Leaf } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Provider {
  id: string;
  business_name: string;
  description: string;
  cuisine_types: string[];
  logo_url: string | null;
  city: string;
  average_rating: number;
  total_reviews: number;
  uses_eco_packaging: boolean;
  is_local: boolean;
  is_organic: boolean;
}

const CUISINE_FILTERS = ['Todos', 'Vegano', 'Vegetariano', 'Saludable', 'Orgánico', 'Sin gluten', 'Keto'];

export default function Discover() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const router = useRouter();

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [searchQuery, selectedFilter, providers]);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_active', true)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = [...providers];

    if (searchQuery) {
      filtered = filtered.filter(
        p =>
          p.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== 'Todos') {
      filtered = filtered.filter(p =>
        p.cuisine_types.some(
          type => type.toLowerCase() === selectedFilter.toLowerCase()
        )
      );
    }

    setFilteredProviders(filtered);
  };

  const ProviderCard = ({ provider }: { provider: Provider }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardImageContainer}>
        {provider.logo_url ? (
          <Image source={{ uri: provider.logo_url }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>
              {provider.business_name.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {provider.business_name}
          </Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFB800" fill="#FFB800" />
            <Text style={styles.rating}>
              {provider.average_rating.toFixed(1)}
            </Text>
            <Text style={styles.reviews}>({provider.total_reviews})</Text>
          </View>
        </View>

        {provider.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {provider.description}
          </Text>
        ) : null}

        <View style={styles.badges}>
          {provider.uses_eco_packaging && (
            <View style={styles.badge}>
              <Leaf size={12} color="#34C759" />
              <Text style={styles.badgeText}>Eco</Text>
            </View>
          )}
          {provider.is_local && (
            <View style={styles.badge}>
              <MapPin size={12} color="#0066CC" />
              <Text style={styles.badgeText}>Local</Text>
            </View>
          )}
          {provider.city && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{provider.city}</Text>
            </View>
          )}
        </View>

        {provider.cuisine_types.length > 0 && (
          <View style={styles.cuisineTypes}>
            {provider.cuisine_types.slice(0, 3).map((type, index) => (
              <Text key={index} style={styles.cuisineTag}>
                {type}
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Descubrir</Text>
        <Text style={styles.subtitle}>Encuentra tu comida favorita</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar restaurantes, comida..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {CUISINE_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === filter && styles.filterChipTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
          </View>
        ) : filteredProviders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {providers.length === 0
                ? 'No hay proveedores disponibles'
                : 'No se encontraron resultados'}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProviders.map(provider => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  filterChipActive: {
    backgroundColor: '#0066CC',
  },
  filterChipText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  grid: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#F2F2F7',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0066CC',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reviews: {
    fontSize: 12,
    color: '#8E8E93',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  cuisineTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cuisineTag: {
    fontSize: 12,
    color: '#0066CC',
    fontWeight: '500',
  },
});
