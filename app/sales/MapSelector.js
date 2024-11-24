// MapSelector.js
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapSelector = ({ route, navigation }) => {
  const { onLocationSelected } = route.params;
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapPress = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      onLocationSelected(selectedLocation);
      navigation.goBack();
    } else {
      alert('Por favor, selecciona una ubicación en el mapa.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        onPress={handleMapPress}
        initialRegion={{
          latitude: 37.78825, // Latitud inicial
          longitude: -122.4324, // Longitud inicial
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation} />
        )}
      </MapView>
      <Button title="Guardar ubicación" onPress={handleSaveLocation} />
    </View>
  );
};

export default MapSelector;
