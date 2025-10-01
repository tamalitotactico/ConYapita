import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, MapPin, Clock, Pause, Play, X } from 'lucide-react-native';

interface Subscription {
  id: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string | null;
  delivery_address: string;
  delivery_time_preference: string;
  special_instructions: string | null;
  subscription_plans: {
    name: string;
    plan_type: string;
    price: number;
    meals_per_delivery: number;
    delivery_days: string[];
    providers: {
      business_name: string;
      city: string;
    };
  };
}

export default function Subscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            plan_type,
            price,
            meals_per_delivery,
            delivery_days,
            providers (
              business_name,
              city
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = async (subscriptionId: string, currentStatus: string) => {
    setActionLoading(subscriptionId);
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('id', subscriptionId);

      if (error) throw error;
      await loadSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    setActionLoading(subscriptionId);

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (error) throw error;
      await loadSubscriptions();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'paused':
        return '#FFB800';
      case 'cancelled':
        return '#FF3B30';
      case 'expired':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'paused':
        return 'Pausada';
      case 'cancelled':
        return 'Cancelada';
      case 'expired':
        return 'Expirada';
      default:
        return status;
    }
  };

  const getPlanTypeText = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'Semanal';
      case 'biweekly':
        return 'Quincenal';
      case 'monthly':
        return 'Mensual';
      default:
        return type;
    }
  };

  const SubscriptionCard = ({ subscription }: { subscription: Subscription }) => {
    const isLoading = actionLoading === subscription.id;
    const canModify = subscription.status === 'active' || subscription.status === 'paused';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.providerName}>
              {subscription.subscription_plans.providers.business_name}
            </Text>
            <Text style={styles.planName}>{subscription.subscription_plans.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
              {getStatusText(subscription.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#8E8E93" />
            <Text style={styles.detailText}>
              {getPlanTypeText(subscription.subscription_plans.plan_type)} - ${subscription.subscription_plans.price}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MapPin size={16} color="#8E8E93" />
            <Text style={styles.detailText} numberOfLines={1}>
              {subscription.delivery_address}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color="#8E8E93" />
            <Text style={styles.detailText}>
              {subscription.delivery_time_preference || 'Sin especificar'}
            </Text>
          </View>
        </View>

        {subscription.subscription_plans.delivery_days.length > 0 && (
          <View style={styles.deliveryDays}>
            <Text style={styles.deliveryDaysLabel}>Días de entrega:</Text>
            <View style={styles.daysContainer}>
              {subscription.subscription_plans.delivery_days.map((day, index) => (
                <View key={index} style={styles.dayChip}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {canModify && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => handlePauseResume(subscription.id, subscription.status)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#0066CC" />
              ) : (
                <>
                  {subscription.status === 'active' ? (
                    <Pause size={18} color="#0066CC" />
                  ) : (
                    <Play size={18} color="#0066CC" />
                  )}
                  <Text style={styles.actionButtonSecondaryText}>
                    {subscription.status === 'active' ? 'Pausar' : 'Reanudar'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={() => handleCancel(subscription.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <>
                  <X size={18} color="#FF3B30" />
                  <Text style={styles.actionButtonDangerText}>Cancelar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Suscripciones</Text>
        <Text style={styles.subtitle}>Gestiona tus planes activos</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
          </View>
        ) : subscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tienes suscripciones</Text>
            <Text style={styles.emptyText}>
              Explora los proveedores disponibles y suscríbete a tu plan favorito
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {subscriptions.map(subscription => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  planName: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  deliveryDays: {
    marginBottom: 12,
  },
  deliveryDaysLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
  },
  dayText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  actionButton: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#E5F2FF',
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '600',
  },
  actionButtonDanger: {
    backgroundColor: '#FFE5E5',
  },
  actionButtonDangerText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
});
