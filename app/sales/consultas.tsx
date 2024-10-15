import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

type SaleHeader = {
  idVenta: string;
  fecha: string;
  idCliente: string;
  total: number;
  details: SaleDetail[];
};

type SaleDetail = {
  idProducto: string;
  cantidad: number;
  precio: number;
};

const SalesConsultasScreen = () => {
  const [sales, setSales] = useState<SaleHeader[]>([]);
  const [filter, setFilter] = useState({ fecha: '', cedula: '' });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const storedSales = await AsyncStorage.getItem('sales');
    setSales(storedSales ? JSON.parse(storedSales) : []);
  };

  const filteredSales = sales.filter((sale) => {
    const byFecha = filter.fecha ? sale.fecha.includes(filter.fecha) : true;
    const byCedula = filter.cedula ? sale.idCliente.includes(filter.cedula) : true;
    return byFecha && byCedula;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consultas de Ventas</Text>
      <TextInput
        style={styles.input}
        placeholder="Filtrar por cédula"
        value={filter.cedula}
        onChangeText={(text) => setFilter({ ...filter, cedula: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Filtrar por fecha (YYYY-MM-DD)"
        value={filter.fecha}
        onChangeText={(text) => setFilter({ ...filter, fecha: text })}
      />
      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item.idVenta}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Fecha: {item.fecha}</Text>
            <Text>Total: ${item.total}</Text>
            <Text>Cliente: {item.idCliente}</Text>
            <Button
              title="Ver Detalles"
              onPress={() =>
                Alert.alert(
                  'Detalles de la Venta',
                  item.details
                    .map(
                      (detail) =>
                        `${detail.cantidad} x ${detail.idProducto} - $${detail.precio}`
                    )
                    .join('\n')
                )
              }
              color="#6200ea"
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});

export default SalesConsultasScreen;
