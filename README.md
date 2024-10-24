# Trabajo Práctico: Carrito de Compras

![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-51.0.28-000020?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-007ACC?style=for-the-badge&logo=typescript)

Este proyecto es parte de la materia **Electiva: Programación Web Front End**. Está desarrollado utilizando **React Native** con **Expo** para la implementación del carrito de compras. Además, se han utilizado diversas bibliotecas para la navegación, manejo de almacenamiento y otras funcionalidades clave.

## Integrantes
- Kevin Galeano
- María José Duarte
- Tobías Otazu
- Ricardo Roledo
- Enrique Saldivar

## Requisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (versión 14 o superior)
- [Expo CLI](https://expo.dev/) (versión 51.0.28 o superior)

## Instalación

1. Clona este repositorio en tu máquina local:
```bash
   git clone https://github.com/kevinfpuna/shopping-cart-app.git
```
2. Navega al directorio del proyecto:
```bash
   cd shopping-cart-app
```
3. Instala las dependencias del proyecto:
```bash
   npm install
```
4. Ejecuta el proyecto en tu entorno de desarrollo:
```bash
   expo start
```
## Módulos Desarrollados

### 1. Administración de Categorías
Este módulo permite la gestión completa (CRUD) de las categorías de productos.
- **Campos:** `idCategoria`, `nombre`
- La pantalla de listado permite filtrar por nombre de la categoría.

### 2. Administración de Productos
Permite la administración (CRUD) de los productos disponibles para la compra.
- **Campos:** `idProducto`, `nombre`, `idCategoria`, `precioVenta`
- La pantalla de listado permite filtrar productos por nombre y categoría.

### 3. Módulo de Venta
Es el módulo principal donde los usuarios pueden realizar compras.
- **Cabecera de la venta:** `idVenta`, `fecha`, `idCliente`, `total`
- **Detalle de la venta:** `idDetalleVenta`, `idProducto`, `cantidad`, `precio`
- Funcionalidades clave:
  - Buscador de productos (por nombre y categoría)
  - Agregar productos al carrito con cantidades específicas
  - Visualización del carrito con los productos acumulados
  - Finalizar la orden, solicitando los datos del cliente (cedula, nombre, apellido). Si el cliente no está registrado, se agrega automáticamente.

### 4. Módulo de Consultas de Ventas
Permite la consulta de ventas registradas, con filtros por fecha y cliente.
- Al hacer clic en una venta, se pueden ver los detalles de los productos comprados, su precio y cantidad.

## Dependencias Principales

- **React Native:** 0.74.5
- **Expo:** 51.0.28
- **React Navigation:** 6.1.18
- **TypeScript:** 5.3.3
