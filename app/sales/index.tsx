import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

type Product = {
  idProducto: string;
  nombre: string;
  idCategoria: string;
  precioVenta: number;
};

type ProductInCart = {
  idProducto: string;
  nombre: string;
  cantidad: number;
  precio: number;
};

const SalesScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<ProductInCart[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const storedProducts = await AsyncStorage.getItem('products');
    setProducts(storedProducts ? JSON.parse(storedProducts) : []);
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const productExists = prevCart.find((p) => p.idProducto === product.idProducto);
      if (productExists) {
        return prevCart.map((p) =>
          p.idProducto === product.idProducto
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      } else {
        return [...prevCart, { ...product, cantidad: 1, precio: product.precioVenta }];
      }
    });
  };

  const filteredProducts = products.filter(
    (prod) => prod.nombre.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ventas</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar producto"
        value={filter}
        onChangeText={setFilter}
      />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.idProducto}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text>{item.nombre} - ${item.precioVenta}</Text>
            <Button
              title="Agregar"
              onPress={() => addToCart(item)}
              color="#6200ea"
              icon={<MaterialIcons name="add-shopping-cart" size={20} color="white" />}
            />
          </View>
        )}
      />
      <Text style={styles.cartTitle}>Carrito</Text>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.idProducto}
        renderItem={({ item }) => (
          <Text>{item.nombre} x {item.cantidad} - ${item.precio * item.cantidad}</Text>
        )}
      />
      <Button title="Finalizar Pedido" onPress={() => Alert.alert('Venta finalizada')} color="#6200ea" />
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
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
  },
});

export default SalesScreen;
