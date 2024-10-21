import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';


type Product = {
  idProducto: string;
  nombre: string;
  idCategoria: string;
  precioVenta: number;
};

type Category = {
  idCategoria: string;
  nombre: string;
};

const ProductsScreen = () => {
  const [productName, setProductName] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [price, setPrice] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false); // Modal para editar/eliminar
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Producto seleccionado para editar/eliminar
  const [isLoading, setIsLoading] = useState(true); // Estado de carga


  useEffect(() => {
    loadProducts();
  }, []);

   // Recargar categorías cada vez que la pantalla se enfoque
   useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

  const loadProducts = async () => {
    const storedProducts = await AsyncStorage.getItem('products');
    setProducts(storedProducts ? JSON.parse(storedProducts) : []);
  };

  const loadCategories = async () => {
    const storedCategories = await AsyncStorage.getItem('categories');
    setCategories(storedCategories ? JSON.parse(storedCategories) : []);
  };

  const storeProduct = async (newProduct: Product) => {
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const addProduct = () => {
    if (!productName || !categoryID || !price) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    const newProduct: Product = {
      idProducto: `${products.length + 1}`,
      nombre: productName,
      idCategoria: categoryID,
      precioVenta: parseFloat(price),
    };

    storeProduct(newProduct);
    setProductName('');
    setCategoryID('');
    setPrice('');
    setModalVisible(false);
  };

  const deleteProduct = async () => {
    if (selectedProduct) {
      const updatedProducts = products.filter(
        (product) => product.idProducto !== selectedProduct.idProducto
      );
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      setEditModalVisible(false);
      setSelectedProduct(null);
    }
  };

  const editProduct = async () => {
    if (selectedProduct && productName && categoryID && price) {
      const updatedProducts = products.map((product) =>
        product.idProducto === selectedProduct.idProducto
          ? { ...product, nombre: productName, idCategoria: categoryID, precioVenta: parseFloat(price) }
          : product
      );
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      setEditModalVisible(false);
      setSelectedProduct(null);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product); // Guardar el producto seleccionado
    setProductName(product.nombre);
    setCategoryID(product.idCategoria);
    setPrice(product.precioVenta.toString());
    setEditModalVisible(true); // Mostrar el modal de edición/eliminación
  };

  const getCategoryNameById = (idCategoria: string) => {
    const category = categories.find((cat) => cat.idCategoria === idCategoria);
    return category ? `${category.nombre} (${category.idCategoria})` : 'Categoría desconocida';
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
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.idProducto}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleProductClick(item)}>
            <View style={styles.item}>
              <MaterialIcons name="inventory" size={24} color="#6200ea" />
              <Text style={styles.itemText}>
                {item.nombre} - ${item.precioVenta} - {getCategoryNameById(item.idCategoria)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Botón flotante para agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal para agregar producto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Producto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del producto"
              value={productName}
              onChangeText={setProductName}
            />
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Seleccionar categoría:</Text>
              <Picker
                selectedValue={categoryID}
                onValueChange={(itemValue) => setCategoryID(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione una categoría" value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.idCategoria}
                    label={`${category.nombre} (${category.idCategoria})`}
                    value={category.idCategoria}
                  />
                ))}
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Precio de venta"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
              <Button title="Aceptar" onPress={addProduct} color="#6200ea" />
              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                color="#999"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para editar/eliminar producto */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar o Eliminar Producto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del producto"
              value={productName}
              onChangeText={setProductName}
            />
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Seleccionar categoría:</Text>
              <Picker
                selectedValue={categoryID}
                onValueChange={(itemValue) => setCategoryID(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione una categoría" value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.idCategoria}
                    label={`${category.nombre} (${category.idCategoria})`}
                    value={category.idCategoria}
                  />
                ))}
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Precio de venta"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
              <Button title="Guardar" onPress={editProduct} color="#6200ea" />
              <Button title="Eliminar" onPress={deleteProduct} color="#d32f2f" />
              <Button
                title="Cancelar"
                onPress={() => setEditModalVisible(false)}
                color="#999"
              />
            </View>
          </View>
        </View>
      </Modal>
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6200ea',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ProductsScreen;
