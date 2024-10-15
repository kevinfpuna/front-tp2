import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import getProductNameById from "../products"

type SaleDetail = {
  idProducto: string;
  cantidad: number;
  precio: number;
};

type SaleHeader = {
  idVenta: string;
  fecha: string;
  idCliente: string;
  total: number;
  details: SaleDetail[];
};

const SaleDetailsScreen = () => {
  const route = useRoute<RouteProp<{ params: { sale: SaleHeader } }, 'params'>>();
  const { sale } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles de la Venta</Text>
      <Text>Fecha: {sale.fecha}</Text>
      <Text>Total: ${sale.total}</Text>
      <Text>Cliente: {sale.idCliente}</Text>
      <Text>ID Venta: {sale.idVenta}</Text>

      <FlatList
        data={sale.details}
        keyExtractor={(item) => item.idProducto}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Producto: {item.idProducto}</Text>
            <Text>Cantidad: {item.cantidad}</Text>
            <Text>Precio: ${item.precio}</Text>
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
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});

export default SaleDetailsScreen;
