import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type SaleHeader = {
  idVenta: string;
  fecha: string;
  idCliente: string;
  total: number;
};

type RootStackParamList = {
  'sales/detalle': { sale: SaleHeader };
  'sales/ClientOrdersScreen': { clientId: string };
};

const ClientOrdersScreen = () => {
  const [clientSales, setClientSales] = useState<SaleHeader[]>([]);
  const route = useRoute<RouteProp<RootStackParamList, 'sales/ClientOrdersScreen'>>();
  const { clientId } = route.params;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadClientSales();
  }, [clientId]);

  const loadClientSales = async () => {
    const storedSales = await AsyncStorage.getItem('sales');
    const sales: SaleHeader[] = storedSales ? JSON.parse(storedSales) : [];

    // Filtrar las ventas del cliente
    const clientOrders = sales.filter((sale) => sale.idCliente === clientId);
    setClientSales(clientOrders);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Órdenes del Cliente</Text>

      {/* Lista de órdenes */}
      <FlatList
        data={clientSales}
        keyExtractor={(item) => item.idVenta}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('sales/detalle', { sale: item })}
          >
            <Text>Fecha: {item.fecha}</Text>
            <Text>Total: ${item.total}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
});

export default ClientOrdersScreen;
