import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchPaymentsForUser } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';

export default function PaymentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [payment, setPayment] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      if (!user || !id) return;
      const list = await fetchPaymentsForUser(user.id);
      const p = list.find((x: any) => x.id === id);
      setPayment(p || null);
    })();
  }, [user, id]);

  if (!payment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Payment Details</Text>
        <Text style={{ color: theme.colors.text.secondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>{payment.description}</Text>
      <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>Paid by {payment.paidByName}</Text>
      <Text style={[styles.amount]}>₡{payment.amount?.toLocaleString()}</Text>
      {payment.workStartedAt && (
        <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>Started: {new Date(payment.workStartedAt).toLocaleString()}</Text>
      )}
      {payment.workEndedAt && (
        <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>Ended: {new Date(payment.workEndedAt).toLocaleString()}</Text>
      )}
      {payment.paidAt && (
        <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>Paid: {new Date(payment.paidAt).toLocaleString()}</Text>
      )}

      {(payment.jobLatitude && payment.jobLongitude) && (
        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            pointerEvents="none"
            initialRegion={{
              latitude: payment.jobLatitude,
              longitude: payment.jobLongitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={{ latitude: payment.jobLatitude, longitude: payment.jobLongitude }} />
          </MapView>
          {!!payment.jobLocationText && (
            <Text style={[styles.caption, { color: theme.colors.text.secondary }]}>{payment.jobLocationText}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    marginVertical: 8,
  },
  mapCard: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  caption: {
    paddingTop: 8,
    fontSize: 12,
  },
});


