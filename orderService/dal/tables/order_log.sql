CREATE TABLE `order_log` (
  `transaction_id` varchar(45) NOT NULL,
  `timestamp` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `brand_id` varchar(45) NOT NULL COMMENT 'Brand ',
  `brand_location_id` varchar(45) NOT NULL COMMENT 'brand location id (branch)',
  `pos_vendor_id` varchar(45) NOT NULL COMMENT 'Vendor register (pos) id (beecomm for example)',
  `pos_id` varchar(45) NOT NULL COMMENT 'register (pos) id ',
  `order_status` int(11) NOT NULL COMMENT 'Public status (code of operation)',
  `pos_response_status` varchar(45) DEFAULT NULL COMMENT 'original pos status',
  `pos_response_code` int(11) DEFAULT NULL COMMENT 'Original pos response code',
  KEY `order_id_fk_idx` (`order_id`),
  CONSTRAINT `order_log_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
