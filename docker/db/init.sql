CREATE DATABASE IF NOT EXISTS venosdb
CHARACTER SET utf8
COLLATE utf8_general_ci;

USE venosdb;

CREATE TABLE IF NOT EXISTS `ORDER` (
  `orderId` varchar(64) NOT NULL COMMENT 'Order id',
  `total` double NOT NULL,
  `subTotal` double NOT NULL,
  `currency` varchar(10) NOT NULL,
  `brandId` varchar(60) NOT NULL,
  `brandLocationId` varchar(60) NOT NULL,
  `tipPercentage` int(11) NOT NULL,
  `tipAmount` int(11) NOT NULL,
  `deliveryFee` int(11) NOT NULL,
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
  `postalCode` varchar(50) DEFAULT NULL,
  `company` varchar(60) DEFAULT NULL,
  `remarks` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

 CREATE TABLE IF NOT EXISTS `POS` (
  `brandId` varchar(45) NOT NULL,
  `brandLocationId` varchar(45) NOT NULL,
  `posVendorId` varchar(45) NOT NULL,
  `posId` varchar(45) NOT NULL,
  PRIMARY KEY (`brandId`,`brandLocationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ORDERITEMS` (
  `itemId` varchar(30) NOT NULL,
  `itemName` varchar(150) NOT NULL,
  `categoryId` varchar(30) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` double NOT NULL,
  `unitPrice` double NOT NULL,
  `orderId` varchar(64) NOT NULL,
  `remarks` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`itemId`,`itemName`,`orderId`),
  KEY `order_id_fk_idx` (`orderId`),
  CONSTRAINT `order_items_fk` FOREIGN KEY (`orderId`) REFERENCES `ORDER` (`orderId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ORDERLOG` (
  `transactionId` varchar(100) NOT NULL,
  `transactionCreationTime` bigint(20) NOT NULL,
  `orderId` varchar(64) NOT NULL,
  `brandId` varchar(60) NOT NULL COMMENT 'Brand ',
  `brandLocationId` varchar(60) NOT NULL COMMENT 'brand location id (branch)',
  `posVendorId` varchar(60) NOT NULL COMMENT 'Vendor register (pos) id (beecomm for example)',
  `posId` varchar(60) NOT NULL COMMENT 'register (pos) id ',
  `orderStatus` int(11) NOT NULL COMMENT 'Public status (code of operation)',
  `posResponseStatus` varchar(100) DEFAULT NULL COMMENT 'original pos status',
  `posResponseCode` int(11) DEFAULT NULL COMMENT 'Original pos response code',
  KEY `order_log_fk_idx` (`orderId`),
  CONSTRAINT `order_log_fk` FOREIGN KEY (`orderId`) REFERENCES `ORDER` (`orderId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `LOG` (
 `orderId` varchar(65) NOT NULL,
 `transactionId` varchar(100) DEFAULT NULL,
 `status` varchar(45) NOT NULL,
 `timestamp` bigint(20) DEFAULT NULL,
 `errorCode` varchar(10) NOT NULL,
 `errorText` varchar(200) NOT NULL,
 `componentName` varchar(100) NOT NULL,
 KEY `orderId_idx` (`orderId`),
 CONSTRAINT `orderId` FOREIGN KEY (`orderId`) REFERENCES `ORDER` (`orderId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into venosdb.POS values ('ניני הא׳צי תל אביב','6366','beecomm','584d68cc3f87fb5f7e31ec76');



