import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

type Product = {
  idProducto: string;
  nombre: string;
  idCategoria: string;
  precioVenta: number;
};

const ProductsScreen = () => {
  const [productName, setProductName] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [price, setPrice] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const storedProducts = await AsyncStorage.getItem('products');
    setProducts(storedProducts ? JSON.parse(storedProducts) : []);
  };

  const storeProduct = async (newProduct: Product) => {
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const addProduct = () => {
    if (!productName || !categoryID || !price) return;
    const newProduct: Product = {
      idProducto: Date.now().toString(),
      nombre: productName,
      idCategoria: categoryID,
      precioVenta: parseFloat(price),
    };
    storeProduct(newProduct);
    setProductName('');
    setCategoryID('');
    setPrice('');
  };

  const filteredProducts = products.filter(
    (prod) => prod.nombre.includes(filter) || prod.idCategoria === filter
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administrar Productos</Text>
      <TextInput
        style={styles.input}
        placeholder="Filtrar por nombre o categoría"
        value={filter}
        onChangeText={setFilter}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="ID de la categoría"
        value={categoryID}
        onChangeText={setCategoryID}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio de venta"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <Button title="Agregar Producto" onPress={addProduct} color="#6200ea" />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.idProducto}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <MaterialIcons name="inventory" size={24} color="#6200ea" />
            <Text style={styles.itemText}>
              {item.nombre} - ${item.precioVenta} - Categoría: {item.idCategoria}
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemText: {
    marginLeft: 10,
    fontSize: 18,
  },
});

export default ProductsScreen;
