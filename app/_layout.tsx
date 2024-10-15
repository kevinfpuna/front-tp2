import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import SalesScreen from './sales/index'; // Ruta corregida
import ConsultasScreen from './sales/consultas'; // Ruta corregida
import CategoriesScreen from './categories/index'; // Ruta corregida
import ProductsScreen from './products/index'; // Ruta corregida

// Definir el componente del Drawer (sidebar)
const Drawer = createDrawerNavigator();

export default function RootLayout() {
  return (
    <Drawer.Navigator
      initialRouteName="sales/consultas"
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
          title: 'Consultas de Ventas',
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
          title: 'Administrar Categorías',
          drawerIcon: ({ color }) => (
            <MaterialIcons name="category" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="products/index"
        component={ProductsScreen}
        options={{
          title: 'Administrar Productos',
          drawerIcon: ({ color }) => (
            <MaterialIcons name="inventory" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
