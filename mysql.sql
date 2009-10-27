CREATE TABLE `user` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(25)  NOT NULL,
  `hash` text  NOT NULL,
  `created` varchar(14)  NOT NULL,
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE `ClearPass`.`object` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int UNSIGNED NOT NULL,
	`title` text  NOT NULL,
	`tags` text NOT NULL,
  `object` text  NOT NULL,
  `created` varchar(14)  NOT NULL,
  `touched` varchar(14)  NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `user_constraint` FOREIGN KEY `user_constraint` (`user_id`)
    REFERENCES `user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)
ENGINE = InnoDB
CHARACTER SET utf8 COLLATE utf8_general_ci
COMMENT = 'Any encrypted object.';