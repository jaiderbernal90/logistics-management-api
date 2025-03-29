-- Creación de base de datos si no existe
CREATE DATABASE IF NOT EXISTS logistics_db;

-- Usar la base de datos
USE logistics_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('CUSTOMER', 'ADMIN', 'DRIVER') NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para transportistas (incluye datos del vehículo)
CREATE TABLE IF NOT EXISTS transporters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  user_id INT,
  capacity DECIMAL(10, 2) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  plate VARCHAR(20) NOT NULL UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para rutas
CREATE TABLE IF NOT EXISTS routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para envíos
CREATE TABLE IF NOT EXISTS shipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  transporter_id INT,
  route_id INT,
  tracking_number VARCHAR(8) NOT NULL UNIQUE,
  state ENUM('En espera', 'En tránsito', 'Entregado') NOT NULL DEFAULT 'En espera',
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  delivery_date TIMESTAMP NULL,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transporter_id) REFERENCES transporters(id) ON DELETE SET NULL,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para estados de las órdenes
CREATE TABLE IF NOT EXISTS order_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  location TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para paquetes
CREATE TABLE IF NOT EXISTS packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id INT,
  user_id INT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  size VARCHAR(100),
  type_of_product VARCHAR(100),
  description TEXT,
  value DECIMAL(12, 2),
  state VARCHAR(20) NOT NULL DEFAULT 'Registrado',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para optimización de consultas
CREATE INDEX idx_shipments_tracking_number ON shipments (tracking_number);
CREATE INDEX idx_shipments_state ON shipments (state);
CREATE INDEX idx_shipments_user_id ON shipments (user_id);
CREATE INDEX idx_packages_user_id ON packages (user_id);
CREATE INDEX idx_packages_shipment_id ON packages (shipment_id);
CREATE INDEX idx_order_status_shipment_id ON order_status (shipment_id);
CREATE INDEX idx_transporters_is_available ON transporters (is_available);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);