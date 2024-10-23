import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Client, Product as ImportedProduct } from ".";

type SaleDetail = {
  idProducto: string;
  cantidad: number;
  precio: number;
};

type ProductDetail = {
  idProducto: string;
  nombre: string;
};

type SaleHeader = {
  idVenta: string;
  fecha: string;
  idCliente: string;
  total: number;
  details: SaleDetail[];
};

const SaleDetailsScreen = () => {
  const route = useRoute<RouteProp<{ params: { sale: SaleHeader } }, "params">>();
  const { sale } = route.params;
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadClients = async () => {
    const storedClients = await AsyncStorage.getItem("clients");
    setClients(storedClients ? JSON.parse(storedClients) : []);
  };

  const loadProducts = async () => {
    const storedProducts = await AsyncStorage.getItem("products");
    setProducts(storedProducts ? JSON.parse(storedProducts) : []);
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          await loadProducts();
          await loadClients();
        } catch (error) {
          console.error("Error cargando datos:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const getNombreCompletoCliente = (idCliente: string) => {
    const cliente = clients.find((client) => client.idCliente === idCliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : "Cliente desconocido";
  };

  const getProducto = (idProducto: string) => {
    const producto = products.find((product) => product.idProducto === idProducto);
    return producto ? producto.nombre : "Producto desconocido";
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.h1}>{getNombreCompletoCliente(sale.idCliente)} - {new Date(sale.fecha).toLocaleDateString()}</Text>
        <Text style={styles.h3}><Text style={styles.span}>ID Venta:</Text> {sale.idVenta}</Text>
      </View>

      <FlatList
        data={sale.details}
        keyExtractor={(item, index) => `${item.idProducto}-${index}`}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text><Text style={styles.span}>ID:</Text> {item.idProducto}</Text>
            <Text><Text style={styles.span}>Producto:</Text> {getProducto(item.idProducto)}</Text>
            <Text><Text style={styles.span}>Precio:</Text> ${item.precio}</Text>
            <Text><Text style={styles.span}>Cantidad:</Text> {item.cantidad}</Text>
          </View>
        )}
        columnWrapperStyle={styles.row}
      />

      <Text style={styles.total}><Text style={styles.span}>Total:</Text> ${sale.total}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  h3: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  item: {
    flex: 1,
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  span: {
    fontWeight: "bold",
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
  },
  total: {
    backgroundColor: '#6200ea',
    color: 'white',
    padding: 20,
  }
});

export default SaleDetailsScreen;
