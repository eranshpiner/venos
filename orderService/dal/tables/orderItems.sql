CREATE TABLE `orderItems` (
  `itemId` int(11) NOT NULL,
  `itemName` varchar(150) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` double NOT NULL,
  `unitPrice` double NOT NULL,
  `orderId` varchar(64) NOT NULL,
  `remarks` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`itemId`,`itemName`,`orderId`),
  KEY `order_id_fk_idx` (`orderId`),
  CONSTRAINT `order_items_fk` FOREIGN KEY (`orderId`) REFERENCES `order` (`orderId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
