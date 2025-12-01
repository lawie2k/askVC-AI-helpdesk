CREATE TABLE `vision_mission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` longtext NOT NULL,
  `admin_id` int NULL,
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  INDEX `vision_mission_admin_id_idx` (`admin_id`),
  CONSTRAINT `vision_mission_ibfk_1`
    FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`)
    ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `campus_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` longtext NOT NULL,
  `admin_id` int NULL,
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`),
  INDEX `campus_info_admin_id_idx` (`admin_id`),
  CONSTRAINT `campus_info_ibfk_1`
    FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`)
    ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optional: migrate existing categorized data from rules into new tables
INSERT INTO `vision_mission` (`description`, `admin_id`, `created_at`)
SELECT `description`, `admin_id`, `created_at`
FROM `rules`
WHERE `category` = 'vision_mission';

INSERT INTO `campus_info` (`description`, `admin_id`, `created_at`)
SELECT `description`, `admin_id`, `created_at`
FROM `rules`
WHERE `category` = 'campus_info';

-- Remove migrated entries from rules
DELETE FROM `rules` WHERE `category` IN ('vision_mission', 'campus_info');

-- Drop category column since rules now only stores actual rules
ALTER TABLE `rules`
DROP COLUMN `category`;




