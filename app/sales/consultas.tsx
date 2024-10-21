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

type Client = {
  idCliente: string;
  cedula: string;
  nombre: string;
  apellido: string;
};

const SalesConsultasScreen = () => {
  const [sales, setSales] = useState<SaleHeader[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState({ fecha: '', cedula: '' });
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Estado de carga


  type RootStackParamList = {
    'sales/detalle': { sale: SaleHeader };
  };
  
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Usamos useFocusEffect para cargar datos cuando la pantalla entra en foco
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true); // Iniciamos la carga
          await loadSales(); // Cargamos ventas
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
    return byFecha && byCedula;
  });

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

  const handleClientSelect = (client: Client) => {
    setFilter({ ...filter, cedula: client.cedula });
    setClientModalVisible(false);
  };

     // Función para parsear la fecha en formato legible
    function parseDate(fechaString: string): string {
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

   
    
    

    

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consultas de Ventas</Text>

      <TextInput
        style={styles.input}
        placeholder="Filtrar por fecha (YYYY-MM-DD)"
        value={filter.fecha}
        onChangeText={(text) => setFilter({ ...filter, fecha: text })}
      />

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
            onPress={() =>
              navigation.navigate('sales/detalle', { sale: item })
            }
          >
            <Text>Fecha: {parseDate(item.fecha)}</Text>
            <Text>Total: ${item.total}</Text>
            <Text>Cliente: {getNombreCompletoCliente(item.idCliente)}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal para buscar cliente */}
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
                  <Text>
                    {item.nombre} {item.apellido} - {item.cedula}
                  </Text>
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
  clientButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  clientButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  clientItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});

export default SalesConsultasScreen;