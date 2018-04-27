CREATE TABLE `order` (
  `orderId` varchar(64) NOT NULL COMMENT 'Order id',
  `total` double NOT NULL,
  `currency` varchar(10) NOT NULL,
  `brandId` varchar(60) NOT NULL,
  `brandLocationId` varchar(60) NOT NULL,
  `orderCreationTime` int(15) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `city` varchar(50) NOT NULL,
  `street` varchar(50) NOT NULL,
  `houseNumber` varchar(10) NOT NULL,
  `apartment` varchar(10) DEFAULT NULL,
  `floor` int(11) DEFAULT NULL,
  `company` varchar(60) DEFAULT NULL,
  `remarks` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;