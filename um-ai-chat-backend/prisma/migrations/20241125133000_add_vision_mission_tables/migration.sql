CREATE TABLE `vision_mission` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` TEXT NOT NULL,
  `admin_id` INT NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `vision_mission_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE NO ACTION
);

CREATE TABLE `campus_info` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` TEXT NOT NULL,
  `admin_id` INT NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `campus_info_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE NO ACTION
);

