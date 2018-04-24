CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` double NOT NULL,
  `unit_price` double NOT NULL,
  `order_id` int(11) NOT NULL,
  `remarks` varchar(200) DEFAULT NULL,
  KEY `order_id_fk_idx` (`order_id`),
  CONSTRAINT `order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
