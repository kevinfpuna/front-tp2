import React, { useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Button,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

import { Picker } from '@react-native-picker/picker';

import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';




export type Product = {
  idProducto: string;
  nombre: string;
  idCategoria: string;
  precioVenta: number;
  cantidadDisponible: number;
};

type ProductInCart = {
  idProducto: string;
  nombre: string;
  cantidad: number;
  precio: number;
};

export type Client = {
  idCliente: string;
  cedula: string;
  nombre: string;
  apellido: string;
};

type SaleHeader = {
  idVenta: string;
  fecha: string;
  idCliente: string;
  total: number;
  tipoOperacion: 'pickup' | 'delivery'; // Nuevo campo para el tipo de operación
  
};

type SaleDetail = {
  idVenta: string;
  idDetalleVenta: string;
  idProducto: string;
  cantidad: number;
  precio: number;
  location?: { latitude: number; longitude: number }; // Coordenadas 
  locationText?: string; // Texto de la ubicación 
};

const SalesScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<ProductInCart[]>([]);
  const [filter, setFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [operationType, setOperationType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryPosition, setDeliveryPosition] = useState<{ latitude: number, longitude: number } | null>(null);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const handleSelectLocation = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };


  

  
  useFocusEffect(
    React.useCallback(() => {
      const loadCategoriesOnFocus = async () => {
        const storedCategories = await AsyncStorage.getItem('categories');
        setCategories(storedCategories ? JSON.parse(storedCategories) : []);
      };
  
      loadCategoriesOnFocus();
    }, [])
  );
  
    // Usamos useFocusEffect para cargar datos cuando la pantalla entra en foco
    useFocusEffect(
      React.useCallback(() => {
        const fetchData = async () => {
          try {
            setIsLoading(true); // Iniciamos la carga
            await loadProducts(); // Cargamos productos
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
  

  const loadProducts = async () => {
    const storedProducts = await AsyncStorage.getItem('products');
    setProducts(storedProducts ? JSON.parse(storedProducts) : []);
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const productExists = prevCart.find((p) => p.idProducto === product.idProducto);
      const productInInventory = products.find((p) => p.idProducto === product.idProducto);
  
      if (!productInInventory || productInInventory.cantidadDisponible <= 0) {
        Alert.alert('Stock insuficiente', 'No hay suficiente stock para agregar este producto.');
        return prevCart;
      }
  
      if (productExists) {
        // Si ya existe en el carrito, verificar el stock antes de incrementar la cantidad
        if (productExists.cantidad < productInInventory.cantidadDisponible) {
          return prevCart.map((p) =>
            p.idProducto === product.idProducto
              ? { ...p, cantidad: p.cantidad + 1 }
              : p
          );
        } else {
          Alert.alert('Stock insuficiente', 'No hay suficiente stock para agregar más de este producto.');
          return prevCart;
        }
      } else {
        // Si no está en el carrito, agregarlo con cantidad 1 solo si hay stock disponible
        return [
          ...prevCart,
          {
            idProducto: product.idProducto,
            nombre: product.nombre,
            cantidad: 1,
            precio: product.precioVenta,
          },
        ];
      }
    });
  };

  const removeFromCart = (product: ProductInCart) => {
    setCart((prevCart) => {
      // Si la cantidad es mayor a 1, disminuir la cantidad
      const updatedCart = prevCart
        .map((p) =>
          p.idProducto === product.idProducto
            ? { ...p, cantidad: p.cantidad - 1 }
            : p
        )
        .filter((p) => p.cantidad > 0); // Filtrar para eliminar productos con cantidad 0
      return updatedCart;
    });
  };

  const validarStock = (cart: ProductInCart[], products: Product[]) => {
    const productosInsuficientes = cart.map(itemCart => {
      const product = products.find(p => p.idProducto === itemCart.idProducto);
      if (product && itemCart.cantidad > product.cantidadDisponible) {
        return {
          nombre: itemCart.nombre,
          cantidadPedida: itemCart.cantidad,
          cantidadDisponible: product.cantidadDisponible
        };
      }
      return null;
    }).filter(item => item !== null);
  
    return productosInsuficientes;
  };

  const finalizarPedido = async () => {
    if (!cedula || !nombre || !apellido || cart.length === 0) {
      Alert.alert(
        'Datos incompletos',
        'Debes ingresar los datos del cliente y tener productos en el carrito.'
      );
      return;
    }
  
    if (operationType === 'delivery' && !deliveryAddress) {
      Alert.alert(
        'Datos incompletos',
        'Para una entrega (delivery), debes proporcionar una dirección.'
      );
      return;
    }
  
    const storedClients = await AsyncStorage.getItem('clients');
    const storedProducts = await AsyncStorage.getItem('products');
    const products: Product[] = storedProducts ? JSON.parse(storedProducts) : [];
  
    const productosInsuficientes = validarStock(cart, products);
    if (productosInsuficientes.length > 0) {
      Alert.alert(
        'Productos insuficientes',
        `No hay suficiente stock para los siguientes productos:
        ${productosInsuficientes.map(item => `${item.nombre} (Pedida: ${item.cantidadPedida}, Disponible: ${item.cantidadDisponible})`).join('\n')}`
      );
      return;
    }
  
    const clients: Client[] = storedClients ? JSON.parse(storedClients) : [];
    let clientId = clients.find((client) => client.cedula === cedula)?.idCliente;
  
    if (!clientId) {
      clientId = `${clients.length + 1}`;
      clients.push({ idCliente: clientId, cedula, nombre, apellido });
      await AsyncStorage.setItem('clients', JSON.stringify(clients));
    }
  
    const idVenta = Date.now().toString();
    const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const saleHeader: SaleHeader = {
      idVenta,
      fecha: new Date().toISOString(),
      idCliente: clientId,
      total,
      tipoOperacion: operationType, // Agregamos el tipo de operación aquí
    };
  
    const saleDetails: SaleDetail[] = cart.map((item, index) => ({
      idVenta,
      idDetalleVenta: `${idVenta}-${index}`,
      idProducto: item.idProducto,
      cantidad: item.cantidad,
      precio: item.precio,
      location: operationType === 'delivery' ? selectedLocation : undefined, // Agregar latitud y longitud
      locationText: operationType === 'delivery' ? deliveryAddress : undefined, //agregar direccion aqui
      
    }));
  
    const storedSales = await AsyncStorage.getItem('sales');
    const sales = storedSales ? JSON.parse(storedSales) : [];
    console.log(saleHeader);
    sales.push({ ...saleHeader, details: saleDetails });
    await AsyncStorage.setItem('sales', JSON.stringify(sales));
    Alert.alert('Venta completada', `El total es $${total}`);
  
    // Disminuir la cantidad de productos en el inventario
    const updatedProducts = products.map((product) => {
      const productInCart = cart.find((p) => p.idProducto === product.idProducto);
      if (productInCart) {
        return {
          ...product,
          cantidadDisponible: product.cantidadDisponible - productInCart.cantidad,
        };
      }
      return product;
    });
  
    await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));


      // Limpieza de los campos
      setCedula('');
      setNombre('');
      setApellido('');
      setDeliveryAddress('');
      setSelectedLocation(null);
      setOperationType('pickup'); // Vuelve a la selección inicial
  
    setCart([]);
    setModalVisible(false);
  };
  

  const filteredProducts = products.filter((prod) =>
    prod.nombre.toLowerCase().includes(filter.toLowerCase()) &&
    (selectedCategory === '' || prod.idCategoria === selectedCategory)
  );
  

  const totalCarrito = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ventas</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar producto"
        value={filter}
        onChangeText={setFilter}
      />
    <Picker
  selectedValue={selectedCategory}
  onValueChange={(itemValue) => setSelectedCategory(itemValue)}
>
  <Picker.Item label="Todas las categorías" value="" />
  {categories.map((category) => (
    <Picker.Item key={category.idCategoria} label={category.nombre} value={category.idCategoria} />
  ))}
</Picker>


   
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.idProducto}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Image source={{ uri: item.imagen }} style={styles.productImage} />

            <Text>{item.nombre} - ${item.precioVenta}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, styles.removeButton]}
                onPress={() => {
                  const productInCart = cart.find((p) => p.idProducto === item.idProducto);
                  if (productInCart) {
                    removeFromCart(productInCart);
                  }
                }}
              >
                <MaterialIcons name="remove" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>
                {cart.find((p) => p.idProducto === item.idProducto)?.cantidad || 0}
              </Text>
              <TouchableOpacity
                style={[styles.quantityButton, styles.addButton]}
                onPress={() => addToCart(item)}
              >
                <MaterialIcons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Muestra el total del carrito en la pantalla principal */}
      <View style={styles.cartTotalContainer}>
        <Text style={styles.totalText}>Total carrito: ${totalCarrito}</Text>
      </View>

      {/* Botón flotante para ver el carrito */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="shopping-cart" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal del carrito */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Carrito</Text>
            {cart.map((item) => (
              <View key={item.idProducto} style={styles.cartItem}>
                <Text>
                  {item.nombre} x {item.cantidad} - ${item.precio * item.cantidad}
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, styles.removeButton]}
                    onPress={() => removeFromCart(item)}
                  >
                    <MaterialIcons name="remove" size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.quantityButton, styles.addButton]}
                    onPress={() =>
                      addToCart({
                        idProducto: item.idProducto,
                        nombre: item.nombre,
                        idCategoria: '',
                        precioVenta: item.precio,
                        cantidadDisponible: 1,
                      })
                    }
                  >
                    <MaterialIcons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Text style={styles.totalText}>Total: ${totalCarrito}</Text>
            <TextInput
              style={styles.input}
              placeholder="Cédula"
              value={cedula}
              onChangeText={setCedula}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={apellido}
              onChangeText={setApellido}
            />
            <Text style={styles.title}>Selecciona el tipo de operación</Text>
            <View style={styles.buttonContainer}>
              <Button title="Pickup" onPress={() => setOperationType('pickup')} color={operationType === 'pickup' ? '#6200ea' : '#999'} />
              <Button title="Delivery" onPress={() => setOperationType('delivery')} color={operationType === 'delivery' ? '#6200ea' : '#999'} />
            </View>
            {/* Campo de dirección, solo visible cuando se selecciona 'delivery' */}
            {operationType === 'delivery' && (
              <View>
                 <Button
            title="Seleccionar punto en el mapa"
            onPress={() => setIsMapVisible(true)}
            color="#6200ea"
          />

              <TextInput
                style={styles.input}
                placeholder="Dirección de entrega"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
              </View>

            )}
            <Modal visible={isMapVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            onPress={handleSelectLocation}
            initialRegion={{
              latitude: -25.2637, // Latitud inicial
              longitude: -57.5759, // Longitud inicial
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
              />
            )}
          </MapView>
          <View style={styles.modalButtonContainer}>
            <Button
              title="Confirmar"
              onPress={() => {
                setIsMapVisible(false);
              }}
              color="#6200ea"
            />
            <Button
              title="Cerrar"
              onPress={() => setIsMapVisible(false)}
              color="#999"
            />
          </View>
        </View>
      </Modal>
            
            <View style={styles.modalButtonContainer}>
              <Button title="Finalizar Pedido" onPress={finalizarPedido} color="#6200ea" />
              <Button title="Cerrar" onPress={() => setModalVisible(false)} color="#999" />
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
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#6200ea',
  },
  removeButton: {
    backgroundColor: '#d32f2f',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartTotalContainer: {
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
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
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default SalesScreen;
