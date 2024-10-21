import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import getProductNameById from "../products";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';



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
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga



  const loadClients = async () => {
    const storedClients = await AsyncStorage.getItem('clients');
    setClients(storedClients ? JSON.parse(storedClients) : []);
  };
  const loadProducts = async () => {
    const storedProducts = await AsyncStorage.getItem('products');
    setProducts(storedProducts ? JSON.parse(storedProducts) : []);
  };

  // Usamos useFocusEffect para cargar datos cuando la pantalla entra en foco
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true); // Iniciamos la carga
          await loadProducts(); // Cargamos ventas
          await loadClients(); // Cargamos clientes
        } catch (error) {
          console.error('Error cargando datos:', error);
        } finally {
          setIsLoading(false); // Finalizamos la carga
        }
      };

      fetchData(); // Ejecutamos la función asíncrona al entrar en foco

      return () => {
        // Aquí puedes limpiar cualquier efecto si es necesario
      };
    }, [])
  );


  // Función para parsear la fecha en formato legible
  const parseDate = (fechaString) => {
    const date = new Date(fechaString);
    
    // Opciones de formato de fecha
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Para mostrar AM/PM
    };

    return date.toLocaleDateString('es-ES', options); // Formatear la fecha
  };


  function getNombreCompletoCliente(idCliente: string): string {
    const cliente = clients.find((client) => client.idCliente === idCliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente desconocido';
  }

  function getProducto(idProducto: string): string {
    const producto = products.find((product) => product.idProducto === idProducto);
    return producto ? `${producto.nombre} ` : 'Producto desconocido';
  }




  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles de la Venta</Text>
      <Text>Fecha: {parseDate(sale.fecha)}</Text>
      <Text>Total: ${sale.total}</Text>
      <Text>Cliente: {getNombreCompletoCliente(sale.idCliente)}</Text>
      <Text>ID Venta: {sale.idVenta}</Text>

      <FlatList
        data={sale.details}
        keyExtractor={(item) => item.idProducto}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Producto: {getProducto(item.idProducto)}</Text>
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
