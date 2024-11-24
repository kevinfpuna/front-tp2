import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import { Picker } from '@react-native-picker/picker'; //picker


type SaleHeader = {
  idVenta: string;
  fecha: string;
  idCliente: string;
  total: number;
  tipoOperacion: string; // Agregar este campo
  details: SaleDetail[];
};

type SaleDetail = {
  idProducto: string;
  cantidad: number;
  precio: number;
};

type Client = {
  idCliente: string;
  cedula: string;
  nombre: string;
  apellido: string;
};

type RootStackParamList = {
  'sales/detalle': { sale: SaleHeader };
  'sales/ClientOrdersScreen': { clientId: string }; // Ruta para la pantalla de órdenes del cliente
};

const SalesConsultasScreen = () => {
  const [sales, setSales] = useState<SaleHeader[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState({ fecha: '', cedula: '', tipoOperacion: '' });
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  console.log('sales:', sales);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          await loadSales();
          await loadClients();
        } catch (error) {
          console.error('Error cargando datos:', error);
        }
      };

      fetchData();
    }, [])
  );

  const loadSales = async () => {
    const storedSales = await AsyncStorage.getItem('sales');
    setSales(storedSales ? JSON.parse(storedSales) : []);
  };

  const loadClients = async () => {
    const storedClients = await AsyncStorage.getItem('clients');
    setClients(storedClients ? JSON.parse(storedClients) : []);
  };

  const filteredSales = sales.filter((sale) => {
    const byFecha = filter.fecha ? sale.fecha.includes(filter.fecha) : true;
    const byCedula = filter.cedula ? sale.idCliente.includes(filter.cedula) : true;
    const byTipoOperacion = filter.tipoOperacion ? sale.tipoOperacion === filter.tipoOperacion : true;


    return byFecha && byCedula && byTipoOperacion;
  });

  const handleOpenMap = (location: { latitude: number; longitude: number }) => {
    setSelectedLocation(location);
    setMapModalVisible(true);
  };

  const handleClientSearch = (text: string) => {
    setClientSearch(text);
    const filtered = clients.filter(
      (client) =>
        client.cedula.includes(text) ||
        client.nombre.toLowerCase().includes(text.toLowerCase()) ||
        client.apellido.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  // Restauramos la navegación a `ClientOrdersScreen`
  const handleClientSelect = (client: Client) => {
    setClientModalVisible(false);
    // Navegar a la pantalla 'ClientOrdersScreen' pasando el ID del cliente
    navigation.navigate('sales/ClientOrdersScreen', { clientId: client.idCliente });
  };

  function parseDate(fechaString: string): string {
    const date = new Date(fechaString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return date.toLocaleDateString('es-ES', options);
  }

  function getNombreCompletoCliente(idCliente: string): string {
    const cliente = clients.find((client) => client.idCliente === idCliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente desconocido';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consultas de Ventas</Text>

      <TextInput
        style={styles.input}
        placeholder="Filtrar por fecha (YYYY-MM-DD)"
        value={filter.fecha}
        onChangeText={(text) => setFilter({ ...filter, fecha: text })}
      />

      <Picker
        selectedValue={filter.tipoOperacion}
        onValueChange={(itemValue) => {
          // Forzar la actualización del estado incluso si es el mismo valor
          if (filter.tipoOperacion !== itemValue) {
            setFilter({ ...filter, tipoOperacion: itemValue });
          }
        }}
        style={styles.picker}
      >
              <Picker.Item label="Seleccionar tipo de operación" value="" />
              <Picker.Item label="Pickup" value="pickup" />
              <Picker.Item label="Delivery" value="delivery" />
              <Picker.Item label="Todos" value="" /> 


            </Picker>

      <TouchableOpacity
        style={styles.clientButton}
        onPress={() => setClientModalVisible(true)}
      >
        <Text style={styles.clientButtonText}>Buscar Cliente</Text>
      </TouchableOpacity>
      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item.idVenta}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('sales/detalle', { sale: item })}
          >
            <Text>Fecha: {parseDate(item.fecha)}</Text>
            <Text>Total: ${item.total}</Text>
            <Text>Cliente: {getNombreCompletoCliente(item.idCliente)}</Text>
            <Text>Tipo de Operación: {item.tipoOperacion || 'No especificado'}</Text>

          </TouchableOpacity>
        )}
      />

      <Modal visible={clientModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buscar Cliente</Text>
            <TextInput
              style={styles.input}
              placeholder="Buscar por cédula, nombre o apellido"
              value={clientSearch}
              onChangeText={handleClientSearch}
            />
            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.idCliente}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clientItem}
                  onPress={() => handleClientSelect(item)}
                >
                  <Text>{item.nombre} {item.apellido} - {item.cedula}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Cerrar" onPress={() => setClientModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 20 },
  item: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  clientButton: { backgroundColor: '#6200ea', padding: 10, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  clientButtonText: { color: 'white', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  clientItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  picker: {
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
});

export default SalesConsultasScreen;
