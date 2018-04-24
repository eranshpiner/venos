CREATE TABLE `order` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Order id',
  `total` double NOT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `issuer_name` varchar(45) NOT NULL,
  `issuer_last_name` varchar(45) NOT NULL,
  `issuer_phone` varchar(45) NOT NULL,
  `issuer_email` varchar(45) DEFAULT NULL,
  `issuer_id` varchar(45) DEFAULT NULL,
  `city` varchar(45) NOT NULL,
  `street` varchar(45) NOT NULL,
  `house_number` varchar(10) NOT NULL,
  `apartment` varchar(10) DEFAULT NULL,
  `company` varchar(45) DEFAULT NULL,
  `remarks` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
