-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: askVC
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password_hashed` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (3,'admin','$2b$10$D9PtweaulFmzqggjk5q9yeeo83PwuYlhqu.MgLx9hHNIYchozhGZ6','2025-11-24 17:38:40');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buildings`
--

DROP TABLE IF EXISTS `buildings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buildings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `admin_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `buildings_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buildings`
--

LOCK TABLES `buildings` WRITE;
/*!40000 ALTER TABLE `buildings` DISABLE KEYS */;
INSERT INTO `buildings` VALUES (1,'main building','2025-10-07 20:14:12','2025-10-07 20:14:12',NULL),(2,'LIC Building','2025-10-08 19:51:04','2025-10-08 19:51:04',NULL),(3,'Faculty Building','2025-10-08 19:56:31','2025-11-27 21:49:11',3);
/*!40000 ALTER TABLE `buildings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campus_info`
--

DROP TABLE IF EXISTS `campus_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campus_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `campus_info_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campus_info`
--

LOCK TABLES `campus_info` WRITE;
/*!40000 ALTER TABLE `campus_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `campus_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `short_name` varchar(50) DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'department of computing education','DCE',NULL,'2025-10-07 20:50:13'),(2,'department of electrical education','DEE',NULL,'2025-10-08 19:56:12');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historyChats`
--

DROP TABLE IF EXISTS `historyChats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historyChats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `history_chats_user_idx` (`user_id`),
  KEY `history_chats_created_idx` (`created_at`),
  CONSTRAINT `history_chats_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historyChats`
--

LOCK TABLES `historyChats` WRITE;
/*!40000 ALTER TABLE `historyChats` DISABLE KEYS */;
INSERT INTO `historyChats` VALUES (5,1,'what are the rules of UM','Here are some of the rules at UM:\n\n1. Always wear your uniform.\n2. No smoking/vaping.\n3. Male students are not allowed to wear earrings inside the campus.\n4. Always wear your ID. 😊','2025-11-28 03:17:31'),(6,1,'Hi','Hey there! 😊 How can I assist you today?','2025-11-28 03:17:56'),(7,1,'Hi','Hey there! 😊 How can I assist you today?','2025-11-28 03:18:17'),(8,1,'Fuck you','I’m here to help, so if you\'re feeling frustrated, let me know how I can assist you better! 😊','2025-11-28 03:18:40'),(9,1,'Bisaya','Kumusta! Unsa man akong matabang nimo karon? 😊','2025-11-28 03:18:54'),(10,1,'Asshole','I\'m here to help! If there\'s something on your mind or if you need assistance, just let me know. 😊','2025-11-28 03:19:03'),(11,1,'Retartd','I\'m here to assist you! If you have any questions or need help, feel free to ask. 😊','2025-11-28 03:19:06'),(12,1,'What is the vision of UM Tagum Visayan Campus?','The vision of UM Visayan Campus is to be a leading globally engaged university creating sustainable impact in society. 🌍✨','2025-11-28 12:01:07'),(13,1,'Hi','Hey there! 😊 How can I assist you today?','2025-11-28 12:04:03'),(14,1,'What is the vision of UM Tagum Visayan Campus?','The vision of the University of Mindanao is to be a leading globally engaged university creating sustainable impact in society. 🌍✨','2025-11-28 12:07:39'),(15,1,'Hi','Hello! 😊 How can I assist you today?','2025-11-28 12:20:33'),(16,1,'Hi','Hey there! 😊 How can I assist you today?','2025-11-28 13:23:18'),(17,1,'\"Hey I have concerns about my class schedule where can I go and settle this?\"','Hey there! You can visit the Registrar\'s Office to settle any concerns about your class schedule. They\'ll be happy to help you out! 😊','2025-11-29 05:20:40'),(18,1,'BSIT','Hey there! Are you looking for information about the Bachelor of Science in Information Technology (BSIT) program? 😊','2025-11-29 05:31:56'),(19,1,'I have concerns about my class schedule where','For concerns about your class schedule or subjects, please go to your BSIT department head. Their contact is BSIT Department Head (bsit.head@umindanao.edu.ph).','2025-11-29 05:32:14'),(20,1,'BSCS','For concerns about your class schedule or subjects in BSCS, please reach out to your department head. 😊','2025-11-29 05:32:29'),(21,1,'Who is the head of BSCS?','I don\'t have the specific name for the head of BSCS, but you can ask your department head for that information! 😊','2025-11-29 05:33:24'),(22,1,'Is the cashier still open?','No, the cashier is closed now; it closes at 4:00 PM. 😊','2025-11-29 05:51:23');
/*!40000 ALTER TABLE `historyChats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
INSERT INTO `logs` VALUES (1,NULL,'CREATE','CREATE on departments: Department: department of computing education (DCE)','2025-10-07 20:02:59'),(2,NULL,'CREATE','CREATE on professors: Professor: lowel jay','2025-10-07 20:03:34'),(3,NULL,'UPDATE','UPDATE on professors: Professor: lowel jay','2025-10-07 20:03:40'),(4,NULL,'UPDATE','UPDATE on professors: Professor: lowel jay','2025-10-07 20:03:55'),(5,NULL,'CREATE','CREATE on buildings: Building: main building','2025-10-07 20:14:12'),(6,NULL,'CREATE','CREATE on rooms: Room: room 301','2025-10-07 20:44:10'),(7,NULL,'UPDATE','UPDATE on rooms: Room: room 301','2025-10-07 20:44:12'),(8,NULL,'UPDATE','UPDATE on rooms: Room: room 301','2025-10-07 20:44:14'),(9,NULL,'UPDATE','UPDATE on rooms: Room: room 301','2025-10-07 20:44:15'),(10,NULL,'CREATE','CREATE on offices: Office: faculty','2025-10-07 20:45:37'),(11,NULL,'CREATE','CREATE on rules: Rule: always wear your uniform...','2025-10-07 20:46:19'),(12,NULL,'UPDATE','UPDATE on professors: Professor: lowel jay','2025-10-07 20:50:02'),(13,NULL,'UPDATE','UPDATE on professors: Professor: lowel jay','2025-10-07 20:56:37'),(14,NULL,'UPDATE','UPDATE on professors: Professor: lowel jay','2025-10-07 20:58:18'),(15,NULL,'UPDATE','UPDATE on professors: Professor: lowel jay','2025-10-07 20:59:57'),(16,NULL,'CREATE','CREATE on rooms: Room: room 302','2025-10-07 22:54:59'),(17,NULL,'CREATE','CREATE on rules: Rule: no smoking/vaping...','2025-10-07 23:01:12'),(18,NULL,'UPDATE','UPDATE on rooms: Room: room 301','2025-10-07 23:02:03'),(19,NULL,'CREATE','CREATE on professors: Professor: art laurence','2025-10-07 23:03:19'),(20,NULL,'UPDATE','UPDATE on professors: Professor: art laurence','2025-10-08 00:01:22'),(21,NULL,'UPDATE','UPDATE on professors: Professor: lowel jay','2025-10-08 00:01:47'),(22,NULL,'UPDATE','UPDATE on professors: Professor: art laurence','2025-10-08 00:14:36'),(23,NULL,'UPDATE','UPDATE on professors: Professor: art laurence','2025-10-08 00:15:41'),(24,NULL,'UPDATE','UPDATE on rooms: Room: room 301','2025-10-08 19:34:04'),(25,NULL,'CREATE','CREATE on rules: Rule: wdawdadawd...','2025-10-08 19:35:37'),(26,NULL,'CREATE','CREATE on rules: Rule: adwdawda...','2025-10-08 19:37:33'),(61,3,'UPDATE','UPDATE on rooms: Room: AVR ','2025-11-24 17:40:32'),(62,3,'UPDATE','UPDATE on rooms: Room: Com Lab V1','2025-11-24 13:11:16'),(63,3,'UPDATE','UPDATE on rooms: Room: Com Lab V1','2025-11-24 13:11:17'),(64,3,'UPDATE','UPDATE on rooms: Room: Com Lab V1','2025-11-24 13:13:27'),(65,3,'CREATE','CREATE on professors: Professor: art','2025-11-25 12:56:37'),(66,3,'DELETE','DELETE on professors: Professor ID: 4','2025-11-25 12:56:43'),(67,3,'DELETE','DELETE on professors: Professor ID: 5','2025-11-25 12:58:56'),(68,3,'DELETE','DELETE on professors: Professor ID: 2','2025-11-25 12:59:02'),(69,3,'UPDATE','UPDATE on professors: Professor: lowel jay Orcullo','2025-11-25 12:59:13'),(70,3,'CREATE','CREATE on rules: Rule: hi...','2025-11-25 13:08:54'),(71,3,'UPDATE','UPDATE on rules: Rule: hi...','2025-11-25 13:09:05'),(72,3,'UPDATE','UPDATE on rules: Rule: hi...','2025-11-25 13:09:11'),(73,3,'CREATE','CREATE on rules: Rule: hello...','2025-11-25 13:09:19'),(74,3,'DELETE','DELETE on rules: Rule ID: 8','2025-11-25 13:09:22'),(75,3,'DELETE','DELETE on rules: Rule ID: 7','2025-11-25 13:09:25'),(76,3,'CREATE','CREATE on rules: Rule: adawdawdm...','2025-11-25 13:18:05'),(77,3,'DELETE','DELETE on rules: Rule ID: 9','2025-11-25 13:18:12'),(78,3,'CREATE','CREATE on rules: Rule: hi...','2025-11-25 13:53:35'),(79,3,'CREATE','CREATE on rules: Rule: hi...','2025-11-25 13:53:41'),(80,3,'CREATE','CREATE on rules: Rule: hi...','2025-11-25 13:55:41'),(81,3,'DELETE','DELETE on rules: Rule ID: 10','2025-11-25 13:59:55'),(82,3,'DELETE','DELETE on rules: Rule ID: 11','2025-11-25 13:59:57'),(83,3,'DELETE','DELETE on rules: Rule ID: 12','2025-11-25 14:00:00'),(84,3,'CREATE','CREATE on vision_mission: Vision/Mission entry','2025-11-25 14:01:52'),(85,3,'CREATE','CREATE on vision_mission: Vision/Mission entry','2025-11-25 14:02:15'),(86,3,'CREATE','CREATE on vision_mission: Vision/Mission entry','2025-11-25 14:02:38'),(87,3,'CREATE','CREATE on vision_mission: Vision/Mission entry','2025-11-25 14:03:01'),(88,3,'CREATE','CREATE on vision_mission: Vision/Mission entry','2025-11-25 14:03:36'),(89,3,'CREATE','CREATE on vision_mission: Vision/Mission entry','2025-11-25 14:03:59'),(90,3,'UPDATE','UPDATE on professors: Professor: lowel jay Orcullo','2025-11-25 14:58:47'),(91,3,'UPDATE','UPDATE on professors: Professor: lowel jay Orcullo','2025-11-25 14:58:59'),(92,3,'UPDATE','UPDATE on rooms: Room: AVR ','2025-11-26 09:31:39'),(93,3,'UPDATE','UPDATE on rooms: Room: AVR ','2025-11-26 09:31:40'),(94,3,'CREATE','CREATE on non_teaching_staff: Staff: art','2025-11-27 09:08:37'),(95,3,'UPDATE','UPDATE on buildings: Building: Faculty Building','2025-11-27 13:49:12'),(96,3,'UPDATE','UPDATE on offices: Office: Cashier','2025-11-29 04:30:14');
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `non_teaching_staff`
--

DROP TABLE IF EXISTS `non_teaching_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `non_teaching_staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `non_teaching_staff_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `non_teaching_staff`
--

LOCK TABLES `non_teaching_staff` WRITE;
/*!40000 ALTER TABLE `non_teaching_staff` DISABLE KEYS */;
INSERT INTO `non_teaching_staff` VALUES (1,'art','Cashier',3,'2025-11-27 09:08:37');
/*!40000 ALTER TABLE `non_teaching_staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offices`
--

DROP TABLE IF EXISTS `offices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `building_id` int DEFAULT NULL,
  `floor` varchar(50) NOT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `close_time` varchar(10) DEFAULT NULL,
  `lunch_end` varchar(10) DEFAULT NULL,
  `lunch_start` varchar(10) DEFAULT NULL,
  `open_time` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `building_id` (`building_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `offices_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `offices_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offices`
--

LOCK TABLES `offices` WRITE;
/*!40000 ALTER TABLE `offices` DISABLE KEYS */;
INSERT INTO `offices` VALUES (1,'faculty',1,'1st floor',NULL,'2025-10-07 20:50:13',NULL,NULL,NULL,NULL),(3,'Student of Affairs',2,'1st floor',NULL,'2025-10-08 19:57:05',NULL,NULL,NULL,NULL),(4,'Cashier',2,'1st floor',3,'2025-10-08 19:57:22','16:00','13:00','12:00','07:00'),(5,'Library',2,'1st floor',NULL,'2025-10-08 19:57:32',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `offices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `code_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `password_resets_user_idx` (`user_id`),
  CONSTRAINT `password_resets_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (1,1,'$2b$10$gt1FIyU6mzZfnrNVDKJQQe9uTEQmJpHKPGPVhsWfHkqx5akRSaTNu','2025-11-27 11:08:48.778',1,'2025-11-27 11:03:49'),(2,1,'$2b$10$k0KZ9ZnwTTXfaI58jghgbONHVbnXAnoYqIfnfjuUp0Dz4xK0JVJ8G','2025-11-27 11:13:02.260',1,'2025-11-27 11:08:02'),(3,1,'$2b$10$xRq/2fV4u6r4RdQq7rDlieilwHQ0MYpwUh4AZMbNKnLkUvsFuzHUW','2025-11-27 11:23:32.101',1,'2025-11-27 11:13:32'),(4,1,'$2b$10$Q255wZOuDtRV9lP1Dss4gecdKzVG2GppNfxLPRQXLO2CZIVCucZJy','2025-11-27 11:28:01.440',1,'2025-11-27 11:18:01'),(5,1,'$2b$10$jexRzriQEPm7edniMsOIDOZyaS4XQgbP9RmBMOAmCaOY3PoNGaGFC','2025-11-27 13:27:47.727',1,'2025-11-27 13:17:48'),(6,1,'$2b$10$4wv1826w3klagFZIgdn0w.Fod3tpWlPMtzlLufLe.qZaoH2NRjlse','2025-11-27 13:33:47.584',1,'2025-11-27 13:23:48'),(7,1,'$2b$10$0778oPB0/vNQC2K1ltDwsuLLw6lvjBuxp5GGvYNsbCENQe/pnWEAW','2025-11-27 13:36:41.403',0,'2025-11-27 13:26:41');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professors`
--

DROP TABLE IF EXISTS `professors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `program` varchar(50) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nickname` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `professors_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `professors_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professors`
--

LOCK TABLES `professors` WRITE;
/*!40000 ALTER TABLE `professors` DISABLE KEYS */;
INSERT INTO `professors` VALUES (1,'lowel jay Orcullo','Instructor I','lowel.jay.tc@umindanao.edu.ph','BSCS',1,3,'2025-10-07 20:50:13',NULL),(3,'Carla Zozobrado','Instructor I','carla.01@umindanao.edu.ph','BSIT',1,NULL,'2025-10-08 20:00:08',NULL);
/*!40000 ALTER TABLE `professors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `building_id` int DEFAULT NULL,
  `floor` varchar(50) NOT NULL,
  `admin_id` int DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'Lecture',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `building_id` (`building_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rooms_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'room 301',1,'1st floor',NULL,'Vacant','Lecture','2025-10-07 20:50:13'),(2,'room 302',1,'3rd floor',NULL,'Vacant','Lecture','2025-10-07 22:54:59'),(5,'AVR ',1,'3rd floor',3,'Vacant','Lecture','2025-10-08 19:57:56'),(6,'Com Lab V1',1,'2nd floor',3,'Vacant','ComLab','2025-10-08 19:58:10'),(7,'Com Lab v2',1,'2nd floor',NULL,'Vacant','ComLab','2025-10-08 19:58:28'),(8,'Com Lab V3',1,'2nd floor',NULL,'Vacant','ComLab','2025-10-08 19:58:42');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rules`
--

DROP TABLE IF EXISTS `rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `rules_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rules`
--

LOCK TABLES `rules` WRITE;
/*!40000 ALTER TABLE `rules` DISABLE KEYS */;
INSERT INTO `rules` VALUES (1,'always wear your uniform',NULL,'2025-10-07 20:50:13'),(2,'no smoking/vaping',NULL,'2025-10-07 23:01:12'),(5,'Male Student is Not Allowed to wear earrings inside the campus.',NULL,'2025-10-08 20:00:52'),(6,'always wear your id',NULL,'2025-10-09 09:33:46');
/*!40000 ALTER TABLE `rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key_name` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_name` (`key_name`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hashed` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'a.siojo.143903.tc@umindanao.edu.ph','$2b$10$J0gNcuM/G1eD9DEA4ALV/O18fTfu1R747Y2XbzlEBmXYxemPHkhja','2025-10-07 20:52:17'),(2,'k.hibaya.143368.tc@umindanao.edu.ph','$2b$10$XPoCW7S9qtMF3Yh5wRfm1eSc.GRojqAK3lGjThIA/dqPK4BY.OEpm','2025-10-09 09:27:35'),(3,'w.mahinay.143902.tc@umindanao.edu.ph','$2b$10$83SBC29gqmKU104KKScXo.fqchmxKz3fTpCjMH3JeoFv51rIPkSZ2','2025-11-22 20:35:53');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vision_mission`
--

DROP TABLE IF EXISTS `vision_mission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vision_mission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `vision_mission_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vision_mission`
--

LOCK TABLES `vision_mission` WRITE;
/*!40000 ALTER TABLE `vision_mission` DISABLE KEYS */;
INSERT INTO `vision_mission` VALUES (1,'Vision - The University of Mindanao envisions to be a leading globally engaged university creating sustainable impact in society.',3,'2025-11-25 14:01:52'),(2,'Mission - The University of Mindanao seeks to provide a dynamic learning environment through the highest standard of instruction, research, extension, and production in a private non-sectarian institution committed to democratizing access to education.',3,'2025-11-25 14:02:15'),(3,'Core Values\nExcellence- We are committed to world-class customer service and quality as we\nexcel for the mutual success of our stakeholders. We ensure that our products and services are on par with the global standards to ensure its responsiveness and impact on our stakeholders and the community and country in general.\nHonesty and Integrity - Our organization establishes utmost trust and ensures\npractical transparency in dealing with our stakeholders. We practice accountability in all our undertakings especially those that involve our stakeholders. Professionalism is at the core of our thrust as an academic institution.\nInnovation- We always think outside the box to be of prime service to our\nstakeholders. We do this by continuously improving existing programs and introducing new initiatives as value added benefits to our clients.\nTeamwork - We believe in the concept that the whole is greater than the sum of\nits parts. We value the collective effort of every stakeholder through synergy, cooperation, collaboration, and \'esprit de corps\' as it is integral to the success of the institution.',3,'2025-11-25 14:02:38'),(4,'Quality Policy - The University of Mindanao is committed to excellence in instruction, research, extension, and production with a global perspective through continuing improvement of the Quality Management System and meeting requirements of stakeholders.',3,'2025-11-25 14:03:01'),(5,'Core Competencies - Quality, affordable, and open education',3,'2025-11-25 14:03:36'),(6,'Philosophy of Education - Transformative education through polishing diamonds in the rough.',3,'2025-11-25 14:03:59');
/*!40000 ALTER TABLE `vision_mission` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-29 16:20:39
