REATE TABLE IF NOT EXISTS `ORDER` (
  `orderId` varchar(64) NOT NULL COMMENT 'Order id',
  `total` double NOT NULL,
  `currency` varchar(10) NOT NULL,
  `brandId` varchar(60) NOT NULL,
  `brandLocationId` varchar(60) NOT NULL,
  `orderCreationTime` bigint(20) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `city` varchar(50) NOT NULL,
  `street` varchar(50) NOT NULL,
  `houseNumber` varchar(100) NOT NULL,
  `apartment` varchar(100) DEFAULT NULL,
  `floor` int(11) DEFAULT NULL,
  `company` varchar(60) DEFAULT NULL,
  `remarks` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;