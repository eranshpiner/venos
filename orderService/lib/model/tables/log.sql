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