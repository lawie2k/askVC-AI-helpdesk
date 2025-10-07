-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: 127.0.0.1    Database: um_ai_db
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
INSERT INTO `admins` VALUES (1,'admin','$2b$10$taBsIKlNKIpgoswEeh64TO6UQvMahQhZh8I7avciJTXhdaBcHwe2y','2025-09-27 17:16:22'),(2,'admin2','$2b$10$2seR1GhjWsdzd3y3E9GiY.KCHG9Gquw6lGtrtE4bmXjKTqHOp3b6a','2025-09-27 17:36:18'),(3,'admin3','$2b$10$4bgnLXGTwpYihi.xiTbbuO1UxtN9liA7BLUmOXlCqRo7ykIR5wPT6','2025-09-27 17:49:05');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buildings`
--

LOCK TABLES `buildings` WRITE;
/*!40000 ALTER TABLE `buildings` DISABLE KEYS */;
INSERT INTO `buildings` VALUES (1,'Main Building','2025-09-30 03:34:23','2025-09-30 03:34:23'),(2,'LIC Building','2025-09-30 03:34:35','2025-09-30 03:34:35');
/*!40000 ALTER TABLE `buildings` ENABLE KEYS */;
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (3,'Department of Computing Education','DCE',NULL,'2025-09-30 14:51:54');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
INSERT INTO `logs` VALUES (1,1,'CREATE_DEPARTMENT','CREATE_DEPARTMENT on departments: Created department: Test Department (TD)','2025-09-27 17:39:21'),(2,2,'CREATE_RULE','CREATE_RULE on rules: Created rule: Test rule created by admin2','2025-09-27 17:44:49'),(3,3,'CREATE_DEPARTMENT','CREATE_DEPARTMENT on departments: Created department: Computer Science (CS)','2025-09-27 17:49:18'),(4,3,'CREATE_ROOM','CREATE_ROOM on rooms: Created room: Room 101 at Building A','2025-09-27 17:49:22'),(5,3,'CREATE_OFFICE','CREATE_OFFICE on offices: Created office: Dean Office at Main Building','2025-09-27 17:49:26'),(6,3,'CREATE_PROFESSOR','CREATE_PROFESSOR on professors: Created professor: Dr. Smith (Professor) in Computer Science','2025-09-27 17:49:32'),(7,3,'CREATE_RULE','CREATE_RULE on rules: Created rule: New rule created by admin3','2025-09-27 17:49:35'),(8,2,'DELETE_ROOM','DELETE_ROOM on rooms: Deleted room ID 25','2025-09-27 17:53:24'),(9,2,'DELETE_OFFICE','DELETE_OFFICE on offices: Deleted office ID 6','2025-09-27 17:53:30'),(10,1,'DELETE_PROFESSOR','DELETE_PROFESSOR on professors: Deleted professor ID 15','2025-09-27 18:02:19'),(11,1,'DELETE_DEPARTMENT','DELETE_DEPARTMENT on departments: Deleted department ID 5','2025-09-27 18:02:31'),(12,1,'UPDATE_PROFESSOR','UPDATE_PROFESSOR on professors: Updated professor ID 5: Richard Vincent Misa (Professor I) in DCE','2025-09-27 18:13:32'),(13,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 4: Room 302 at main building second room in 3rd flr (Reserved, unchanged)','2025-09-28 20:59:48'),(14,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 4: Room 302 at main building second room in 3rd flr (Occupied, unchanged)','2025-09-28 21:00:01'),(15,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 4: Room 302 at main building second room in 3rd flr (Vacant, unchanged)','2025-09-28 21:00:34'),(16,2,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Vacant, unchanged)','2025-09-28 22:56:45'),(17,2,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Reserved, unchanged)','2025-09-28 22:57:03'),(18,2,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Occupied, unchanged)','2025-09-28 22:57:06'),(19,1,'DELETE_RULE','DELETE_RULE on rules: Deleted rule ID 63','2025-09-29 08:19:24'),(20,1,'DELETE_RULE','DELETE_RULE on rules: Deleted rule ID 62','2025-09-29 08:19:26'),(21,1,'CREATE_RULE','CREATE_RULE on rules: Created rule: wdawdybawd','2025-09-29 08:25:10'),(22,1,'UPDATE_RULE','UPDATE_RULE on rules: Updated rule ID 64: wdawdybawd','2025-09-29 08:25:16'),(23,1,'UPDATE_RULE','UPDATE_RULE on rules: Updated rule ID 64: 1','2025-09-29 08:25:22'),(24,1,'DELETE_RULE','DELETE_RULE on rules: Deleted rule ID 64','2025-09-29 08:25:40'),(25,1,'CREATE_PROFESSOR','CREATE_PROFESSOR on professors: Created professor: dawdawd (Assistant Professor I) in DCE','2025-09-29 08:26:49'),(26,1,'UPDATE_PROFESSOR','UPDATE_PROFESSOR on professors: Updated professor ID 7: Carl Zozobrado (Instructor I) in DCE','2025-09-29 08:27:08'),(27,1,'DELETE_PROFESSOR','DELETE_PROFESSOR on professors: Deleted professor ID 16','2025-09-29 08:27:15'),(28,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Vacant, unchanged)','2025-09-29 08:28:49'),(29,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Reserved, unchanged)','2025-09-29 08:28:50'),(30,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Occupied, unchanged)','2025-09-29 08:28:50'),(31,1,'CREATE_ROOM','CREATE_ROOM on rooms: Created room: CL v3 at faculty (Vacant, ComLab)','2025-09-29 08:29:27'),(32,1,'CREATE_OFFICE','CREATE_OFFICE on offices: Created office: registrar at entrance','2025-09-29 08:30:36'),(33,1,'CREATE_DEPARTMENT','CREATE_DEPARTMENT on departments: Created department: Department of arts and science (DASE)','2025-09-29 08:38:15'),(34,1,'DELETE_DEPARTMENT','DELETE_DEPARTMENT on departments: Deleted department ID 7','2025-09-29 08:38:28'),(35,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Vacant, unchanged)','2025-09-30 10:13:17'),(36,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Reserved, unchanged)','2025-09-30 10:13:35'),(37,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Occupied, unchanged)','2025-09-30 10:13:36'),(38,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Vacant, unchanged)','2025-09-30 10:13:39'),(39,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Reserved, unchanged)','2025-09-30 10:13:39'),(40,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Occupied, unchanged)','2025-09-30 10:13:39'),(41,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Vacant, unchanged)','2025-09-30 10:13:39'),(42,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Reserved, unchanged)','2025-09-30 10:13:40'),(43,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Occupied, unchanged)','2025-09-30 10:13:40'),(44,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Vacant, unchanged)','2025-09-30 10:13:40'),(45,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Reserved, unchanged)','2025-09-30 10:13:40'),(46,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Occupied, unchanged)','2025-09-30 10:13:41'),(47,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Vacant, unchanged)','2025-09-30 10:13:42'),(48,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Reserved, unchanged)','2025-09-30 10:13:43'),(49,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 at main building first room in 3rd flr   (Occupied, unchanged)','2025-09-30 10:13:44'),(50,1,'CREATE_BUILDING','CREATE_BUILDING on buildings: Created building: Main Building','2025-09-30 11:34:23'),(51,1,'CREATE_BUILDING','CREATE_BUILDING on buildings: Created building: LIC Building','2025-09-30 11:34:35'),(52,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 with building_id: 1, floor: 3rd floor (Occupied, Lecture)','2025-09-30 11:37:40'),(53,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 3: AVR with building_id: 1, floor: 3rd floor (Reserved, Lecture)','2025-09-30 11:37:53'),(54,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 4: Room 302 with building_id: 1, floor: 3rd floor (Vacant, Lecture)','2025-09-30 11:38:06'),(55,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 5: Comlab V1 with building_id: 1, floor: 2nd floor (Vacant, ComLab)','2025-09-30 11:38:19'),(56,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 26: Comlab V3 with building_id: 1, floor: 2nd floor (Vacant, ComLab)','2025-09-30 11:38:42'),(57,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 with building_id: 1, floor: 3rd floor (Occupied, Lecture)','2025-09-30 13:07:57'),(58,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: room 301 with building_id: 1, floor: 3rd floor (Occupied, Lecture)','2025-09-30 13:08:03'),(59,1,'UPDATE_ROOM','UPDATE_ROOM on rooms: Updated room ID 2: Room 301 with building_id: 1, floor: 3rd floor (Occupied, Lecture)','2025-09-30 13:08:14'),(60,NULL,'UPDATE','UPDATE on offices: Office: faculty','2025-09-30 17:55:39'),(61,NULL,'UPDATE','UPDATE on offices: Office: Library','2025-10-01 14:44:39'),(62,NULL,'CREATE','CREATE on professors: Professor: eduardo Catahuran','2025-10-04 12:44:14'),(63,NULL,'DELETE','DELETE on departments: Department ID: 6','2025-10-04 12:44:20'),(64,NULL,'UPDATE','UPDATE on rooms: Room: Comlab V3','2025-10-04 12:48:30'),(65,NULL,'UPDATE','UPDATE on rooms: Room: Comlab V3','2025-10-04 12:49:18'),(66,NULL,'UPDATE','UPDATE on rooms: Room: Comlab V3','2025-10-04 12:49:19'),(67,NULL,'UPDATE','UPDATE on offices: Office: Student of Affairs','2025-10-04 12:50:12'),(68,NULL,'UPDATE','UPDATE on offices: Office: Student of Affairs','2025-10-04 13:32:37'),(69,NULL,'UPDATE','UPDATE on offices: Office: cashier','2025-10-04 13:33:39'),(70,NULL,'UPDATE','UPDATE on offices: Office: cashier','2025-10-04 13:34:13'),(71,NULL,'UPDATE','UPDATE on offices: Office: cashier','2025-10-04 13:34:32'),(72,NULL,'UPDATE','UPDATE on rooms: Room: Room 301','2025-10-06 15:07:19'),(73,NULL,'UPDATE','UPDATE on rooms: Room: Room 301','2025-10-06 15:11:11'),(74,NULL,'UPDATE','UPDATE on rooms: Room: Room 301','2025-10-06 15:11:12'),(75,NULL,'UPDATE','UPDATE on rooms: Room: Room 302','2025-10-06 15:11:13'),(76,NULL,'UPDATE','UPDATE on rooms: Room: Room 301','2025-10-07 15:48:29'),(77,NULL,'UPDATE','UPDATE on rooms: Room: Room 301','2025-10-07 16:10:55'),(78,NULL,'UPDATE','UPDATE on professors: Professor: Carla Zozobrado','2025-10-07 17:11:24');
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
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
  `location` varchar(255) NOT NULL,
  `building_id` int DEFAULT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `fk_offices_building` (`building_id`),
  CONSTRAINT `fk_offices_building` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `offices_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offices`
--

LOCK TABLES `offices` WRITE;
/*!40000 ALTER TABLE `offices` DISABLE KEYS */;
INSERT INTO `offices` VALUES (1,'faculty','new buidling last room',1,'1st floor',NULL,'2025-09-30 14:51:54'),(2,'Library','LIC building 1st room',2,'1st floor',NULL,'2025-09-30 14:51:54'),(3,'Student of Affairs','Main Building 1st floor',2,'1st floor',NULL,'2025-09-30 14:51:54'),(4,'cashier','LIC building 3rd room',2,'1st floor',NULL,'2025-09-30 14:51:54'),(5,'Clinic','LIC building 4th room',NULL,NULL,NULL,'2025-09-30 14:51:54'),(7,'registrar','entrance',NULL,NULL,NULL,'2025-09-30 14:51:54');
/*!40000 ALTER TABLE `offices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professors`
--

DROP TABLE IF EXISTS `professors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `program` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professors`
--

LOCK TABLES `professors` WRITE;
/*!40000 ALTER TABLE `professors` DISABLE KEYS */;
INSERT INTO `professors` VALUES (5,'Richard Vincent Misa','Professor I','richardvincentmisa@gmail.com','DCE','BSIT','2025-09-22 05:32:18','2025-09-27 10:13:32'),(6,'Lowel Jay Orcullo','Instructor I','lowel.jay.orcullo@gmail.com','DCE','BSIT','2025-09-22 05:33:30','2025-09-24 16:12:54'),(7,'Carla Zozobrado','Instructor I','carla.zozobrado@gmail.com','DCE','BSCS','2025-09-22 05:34:15','2025-10-07 09:11:24'),(17,'eduardo Catahuran','Instructor I','edaurdo.Catahuran@umindanao.edu.ph','DCE','BSIT','2025-10-04 04:44:14','2025-10-04 04:44:14');
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
  `location` varchar(255) NOT NULL,
  `building_id` int DEFAULT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `office_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Vacant',
  `type` varchar(30) NOT NULL DEFAULT 'Lecture',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `fk_rooms_office` (`office_id`),
  KEY `fk_rooms_building` (`building_id`),
  CONSTRAINT `fk_rooms_building` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_rooms_office` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (2,'Room 301','main building first room in 3rd flr  ',1,'3rd floor',NULL,NULL,'Reserved','Lecture','2025-09-30 14:51:54'),(3,'AVR','main building 3rd/last room in 3rd flr',1,'3rd floor',NULL,NULL,'Reserved','Lecture','2025-09-30 14:51:54'),(4,'Room 302','main building second room in 3rd flr',1,'3rd floor',NULL,NULL,'Reserved','Lecture','2025-09-30 14:51:54'),(5,'Comlab V1','main building 1st room in 2nd flr',1,'2nd floor',NULL,NULL,'Vacant','ComLab','2025-09-30 14:51:54'),(26,'Comlab V3','faculty',1,'2nd floor',NULL,NULL,'Vacant','ComLab','2025-09-30 14:51:54');
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rules`
--

LOCK TABLES `rules` WRITE;
/*!40000 ALTER TABLE `rules` DISABLE KEYS */;
INSERT INTO `rules` VALUES (9,'always wear your id inside the campus',1,'2025-09-22 05:29:50','2025-09-22 05:29:50'),(10,'Wear proper clothes in wash days',1,'2025-09-22 05:30:24','2025-09-22 05:30:24'),(11,'No earrings allowed for male students',1,'2025-09-22 05:30:40','2025-09-22 05:30:40'),(12,'No smoking/vaping inside the campus',1,'2025-09-22 05:31:20','2025-09-22 05:31:20'),(61,'always wear your uniform in monday to friday except wednesday',1,'2025-09-27 09:43:07','2025-09-27 09:43:07');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_name` (`key_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'vision','The University of Mindanao envisions to be a leading globally engaged university creating sustainable impact in society.'),(2,'mission','The University of Mindanao seeks to provide a dynamic learning environment through the highest standard of instruction, research, extension, and production in a private non-sectarian institution committed to democratizing access to education.'),(3,'Philosophy of education','Transformative education through polishing diamonds in the rough.'),(4,'Core Competencies','Quality, affordable, and open education'),(5,'Core Values','Excellence\n\nWe are committed to world-class customer service and quality as we excel for the mutual success of our stakeholders. We ensure that our product and services are on par with the global standards to ensure its responsiveness and impact on our stakeholders and the community and country in general.\n\nHonesty and Integrity\n\nOur organization establishes utmost trust and ensures transparency in dealing with our stakeholders. We practice accountability in all our undertakings especially those that involve our stakeholders. Professionalism is at the core of our thrusts as an academic institution.\n\nInnovation\n\nWe always think outside the box to be of prime service to our stakeholders. We do this by continuously introducing new programs as value added benefits to our clients.\n\nTeamwork\n\nWe believe in the concept that \"the whole is greater than the sum of its parts.\" We value the collective effort of every stakeholder through synergy, cooperation, collaboration, and \'esprit de corps\' as it is integral to the success of the institution.');
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
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'connected.test@example.com','$2b$10$6Dn1H4nD2C2neRlxtWnJjeDmX9U/Bs8xoqbmY0L5mFp5VdWOxc9Mi','2025-09-17 06:42:02'),(2,'Rylecjaydaft@gmail.com','$2b$10$VCt9QNQsx8aGfLQkWd7HyeIMbWL/FSbDhoAqtofSKTwJIXpV772Wy','2025-09-17 06:43:36'),(4,'A.siojo.143903.tc@umindanao.edu.ph','$2b$10$V/dH6WY4fQZhW/UDb4/ML.oHYi6Zm9OJCWQbWn/mna82Mfgj/Z.tC','2025-09-19 04:25:25'),(5,'k.hibaya.143368.tc@umindanao.edu.ph','$2b$10$7klkTJ7lqudGzuXn3.UBouC2LbaXoDV9oqOdgmE9YTdMn.fO2ajO6','2025-09-22 04:28:56'),(6,'J.layno.142423.tc@umindanao.edu.ph','$2b$10$hBSbkxqqXABL1uW2dTazjeJtdlbBVcQWacJcx0GpeaLIeDm39weBC','2025-09-22 07:00:43'),(7,'P.gleyo.143883.tc@umindanao.edu.ph','$2b$10$rBAXdkRPQ3RBmAzAgffMaeGwNHN2WqiZIPYJGby3Gx8Iu7tQ/j0Lq','2025-09-22 07:07:28'),(8,'J.jayagan.146706.tc@umindanao.edu.ph','$2b$10$lFXhm1TzKRAah/mTDxuXL.f6PXefdw/d5.T2tjpL5ccKpDnOy6szK','2025-09-22 07:19:57'),(11,'w.mahinay.143903.tc@umindanao.edu.ph','$2b$10$/hHLF9TNfJoM0kcc8Drx9ex9WX/mw/KmGWW7Wl6EY/lxIM6XeGhwK','2025-09-30 12:20:41'),(12,'emanueldesales01@umindanao.edu.ph','$2b$10$BguBadXMmxOg6cd3mluikuKs84i0p5bG6ch1zRlNXeSL9VzfBJzHS','2025-10-07 07:33:15'),(13,'e.desales.143075.tc@umindanao.edu.ph','$2b$10$NHVbDmpTm7uyxEH9LdfzGu.tUtdmrgHbdVX.rdzpImVHWq4GECyye','2025-10-07 07:36:00'),(14,'e.ramirez.143833.tc@umindanao.edu.ph','$2b$10$7G8skDVBh325Q.rd0Hwhw.KszcKgY.tcJvKXHcJQGIT1pbZBRf4Fi','2025-10-07 07:42:53'),(15,'c.cabanero.143457.tc@umindanao.edu.ph','$2b$10$YRWGkGCNOpuR2q9Wg7RE3.e6mLUkCGMi9KD6.vTITx0E2TiyhJdMS','2025-10-07 07:45:29'),(16,'j.gozon.143104.tc@umindanao.edu.ph','$2b$10$qLENk2FbcUxnkAWCnHxx0O.4ACSvgluL78twOElIHdlaeSck8U2Oi','2025-10-07 07:56:16'),(17,'j.daray.142725.tc@umindanao.edu.ph','$2b$10$pxvXbCkLnlsctvbZZ9JOAeJ/DpMr0p8PIWwfw8K3me0XGLhT0JAZG','2025-10-07 08:06:58');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-07 18:40:34
