import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

type Category = {
  idCategoria: string;
  nombre: string;
  imagen: string;
};

const CategoriesScreen = () => {
  const [categoryName, setCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const storedCategories = await AsyncStorage.getItem("categories");
    setCategories(storedCategories ? JSON.parse(storedCategories) : []);
  };

  const storeCategory = async (newCategory: Category) => {
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    await AsyncStorage.setItem("categories", JSON.stringify(updatedCategories));
  };

  const addCategory = () => {
    if (!categoryName || !imageUrl) return;

    const newCategory = {
      idCategoria: `${categories.length + 1}`,
      nombre: categoryName,
      imagen: imageUrl,
    };

    storeCategory(newCategory);
    setCategoryName("");
    setModalVisible(false);
  };

  const editCategory = async () => {
    if (selectedCategory && categoryName && imageUrl) {
      const updatedCategories = categories.map((category) =>
        category.idCategoria === selectedCategory.idCategoria
          ? { ...category, nombre: categoryName, imagen: imageUrl }
          : category
      );
      setCategories(updatedCategories);
      await AsyncStorage.setItem(
        "categories",
        JSON.stringify(updatedCategories)
      );
      setEditModalVisible(false);
      setSelectedCategory(null);
      setCategoryName("");
      setImageUrl("");
    }
  };

  const deleteCategory = async () => {
    if (selectedCategory) {
      const updatedCategories = categories.filter(
        (category) => category.idCategoria !== selectedCategory.idCategoria
      );
      setCategories(updatedCategories);
      await AsyncStorage.setItem(
        "categories",
        JSON.stringify(updatedCategories)
      );
      setEditModalVisible(false);
      setSelectedCategory(null);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.nombre);
    setImageUrl(category.imagen);
    setEditModalVisible(true);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.nombre.includes(filter)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administrar Categorías</Text>
      <TextInput
        style={styles.input}
        placeholder="Filtrar por nombre"
        value={filter}
        onChangeText={setFilter}
      />
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.idCategoria}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCategoryClick(item)}>
            <View style={styles.item}>
              <Image
                source={{ uri: item.imagen }}
                style={styles.categoryImage}
                defaultSource={{ uri: 'https://avatar.oxro.io/avatar.svg?name=Camilo&background=6200ea&length=1' }}
              />
              <View style={styles.itemContent}>
                <MaterialIcons name="category" size={24} color="#6200ea" />
                <Text style={styles.itemText}>
                  {item.nombre} ({item.idCategoria})
                </Text>
              </View>
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

      {/* Modal para agregar categoría */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Categoría</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la categoría"
              value={categoryName}
              onChangeText={setCategoryName}
            />
            <TextInput
              style={styles.input}
              placeholder="URL de la imagen"
              value={imageUrl}
              onChangeText={setImageUrl}
            />
            <View style={styles.buttonContainer}>
              <Button title="Guardar" onPress={addCategory} color="#6200ea" />
              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                color="#999"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para editar/eliminar categoría */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar o Eliminar Categoría</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la categoría"
              value={categoryName}
              onChangeText={setCategoryName}
            />
            <TextInput
              style={styles.input}
              placeholder="URL de la imagen"
              value={imageUrl}
              onChangeText={setImageUrl}
            />
            <View style={styles.buttonContainer}>
              <Button title="Guardar" onPress={editCategory} color="#6200ea" />
              <Button
                title="Eliminar"
                onPress={deleteCategory}
                color="#d32f2f"
              />
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
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    marginLeft: 10,
    fontSize: 18,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#6200ea",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default CategoriesScreen;
