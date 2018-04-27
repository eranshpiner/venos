CCREATE TABLE `orderLog` (
  `transactionId` varchar(100) NOT NULL,
  `transactionTimeCreation` bigint(20) NOT NULL,
  `orderId` varchar(64) NOT NULL,
  `brandId` varchar(60) NOT NULL COMMENT 'Brand ',
  `brandLocationId` varchar(60) NOT NULL COMMENT 'brand location id (branch)',
  `posVendorId` varchar(60) NOT NULL COMMENT 'Vendor register (pos) id (beecomm for example)',
  `posId` varchar(60) NOT NULL COMMENT 'register (pos) id ',
  `orderStatus` int(11) NOT NULL COMMENT 'Public status (code of operation)',
  `posResponseStatus` varchar(100) DEFAULT NULL COMMENT 'original pos status',
  `posResponseCode` int(11) DEFAULT NULL COMMENT 'Original pos response code',
  KEY `order_log_fk_idx` (`orderId`),
  CONSTRAINT `order_log_fk` FOREIGN KEY (`orderId`) REFERENCES `order` (`orderId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


