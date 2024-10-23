import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import SalesScreen from './sales/index'; // Ruta corregida
import ConsultasScreen from './sales/consultas'; // Ruta corregida
import CategoriesScreen from './categories/index'; // Ruta corregida
import ProductsScreen from './products/index'; // Ruta corregida
import SaleDetailsScreen from './sales/detalle'; // Ruta corregida
import ClientOrdersScreen from './sales/ClientOrdersScreen'; // Importar la nueva pantalla


// Definir el componente del Drawer (sidebar)
const Drawer = createDrawerNavigator();

export default function RootLayout() {
  return (
    <Drawer.Navigator
      initialRouteName="sales/index"
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#f5f5f5',
          width: 240,
        },
        drawerActiveTintColor: '#6200ea',
        drawerInactiveTintColor: '#333',
        headerShown: true,
      }}
    >
      <Drawer.Screen
        name="sales/consultas"
        component={ConsultasScreen}
        options={{
          title: 'Consultas',
          drawerIcon: ({ color }) => (
            <MaterialIcons name="search" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="sales/index"
        component={SalesScreen}
        options={{
          title: 'Ventas',
          drawerIcon: ({ color }) => (
            <MaterialIcons name="shopping-cart" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="categories/index"
        component={CategoriesScreen}
        options={{
          title: 'Categorías',
          drawerIcon: ({ color }) => (
            <MaterialIcons name="category" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="products/index"
        component={ProductsScreen}
        options={{
          title: 'Productos',
          drawerIcon: ({ color }) => (
            <MaterialIcons name="inventory" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="sales/detalle"
        component={SaleDetailsScreen}
        options={{
          title: 'Detalles de la Venta',
          drawerItemStyle: { display: 'none' }, // Hacerlo invisible
        }}
      />

      {/* Nueva pantalla para órdenes de cliente */}
      <Drawer.Screen
        name="sales/ClientOrdersScreen"
        component={ClientOrdersScreen}
        options={{
          title: 'Órdenes del Cliente',
          drawerItemStyle: { display: 'none' }, // Ocultar del drawer
        }}
      />
    </Drawer.Navigator>
  );
}
