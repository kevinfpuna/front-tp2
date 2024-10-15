import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

type Category = {
  idCategoria: string;
  nombre: string;
};

const CategoriesScreen = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const storedCategories = await AsyncStorage.getItem('categories');
    setCategories(storedCategories ? JSON.parse(storedCategories) : []);
  };

  const storeCategory = async (newCategory: Category) => {
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const addCategory = () => {
    if (!categoryName) return;
    const newCategory = { idCategoria: Date.now().toString(), nombre: categoryName };
    storeCategory(newCategory);
    setCategoryName('');
  };

  const filteredCategories = categories.filter((cat) => cat.nombre.includes(filter));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administrar Categorías</Text>
      <TextInput
        style={styles.input}
        placeholder="Filtrar por nombre"
        value={filter}
        onChangeText={setFilter}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre de la categoría"
        value={categoryName}
        onChangeText={setCategoryName}
      />
      <Button title="Agregar Categoría" onPress={addCategory} color="#6200ea" />
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.idCategoria}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <MaterialIcons name="category" size={24} color="#6200ea" />
            <Text style={styles.itemText}>{item.nombre}</Text>
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

export default CategoriesScreen;
