 CREATE TABLE `brandToPosvendor` (
  `brandId` varchar(45) NOT NULL,
  `brandLocationId` varchar(45) NOT NULL,
  `posVendorId` varchar(45) NOT NULL,
  `posId` varchar(45) NOT NULL,
  PRIMARY KEY (`brandId`,`brandLocationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
