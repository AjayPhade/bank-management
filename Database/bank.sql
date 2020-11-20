CREATE DATABASE  IF NOT EXISTS `bank` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bank`;
-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: bank
-- ------------------------------------------------------
-- Server version	8.0.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `acc_limit_int`
--

DROP TABLE IF EXISTS `acc_limit_int`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acc_limit_int` (
  `acc_type` varchar(20) NOT NULL,
  `min_bal` int NOT NULL,
  `int_rate` float NOT NULL,
  PRIMARY KEY (`acc_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `branch`
--

DROP TABLE IF EXISTS `branch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branch` (
  `ifsc_code` char(11) NOT NULL,
  `br_name` varchar(30) NOT NULL,
  `address` varchar(50) NOT NULL,
  PRIMARY KEY (`ifsc_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cash_counter`
--

DROP TABLE IF EXISTS `cash_counter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_counter` (
  `counter_no` int NOT NULL,
  `emp_id` int NOT NULL,
  `ifsc_code` char(11) NOT NULL,
  PRIMARY KEY (`counter_no`,`ifsc_code`),
  KEY `cc_empid_fk` (`emp_id`),
  KEY `cc_ifsc_fk` (`ifsc_code`),
  CONSTRAINT `cc_empid_fk` FOREIGN KEY (`emp_id`) REFERENCES `employee` (`emp_id`),
  CONSTRAINT `cc_ifsc_fk` FOREIGN KEY (`ifsc_code`) REFERENCES `branch` (`ifsc_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cust_account`
--

DROP TABLE IF EXISTS `cust_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cust_account` (
  `acc_no` int NOT NULL AUTO_INCREMENT,
  `cust_id` int NOT NULL,
  `ifsc_code` char(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `gender` char(1) NOT NULL,
  `dob` date NOT NULL,
  `address` varchar(50) NOT NULL,
  `city` varchar(20) NOT NULL,
  `state` varchar(20) NOT NULL,
  `zip` int NOT NULL,
  `acc_type` char(7) NOT NULL,
  `balance` float NOT NULL,
  `pan_no` varchar(30) DEFAULT NULL,
  `aadhaar_no` varchar(30) NOT NULL,
  `aadhaar` varchar(30) NOT NULL,
  `photo` mediumblob NOT NULL,
  `int_rate` float NOT NULL,
  `created_by` int NOT NULL,
  `status` varchar(20) NOT NULL,
  PRIMARY KEY (`acc_no`),
  KEY `cus_ifsc_fk` (`ifsc_code`),
  CONSTRAINT `cus_ifsc_fk` FOREIGN KEY (`ifsc_code`) REFERENCES `branch` (`ifsc_code`),
  CONSTRAINT `acc_type_chk` CHECK ((`acc_type` in (_utf8mb4'saving',_utf8mb4'current'))),
  CONSTRAINT `cus_gd_chk` CHECK ((`gender` in (_utf8mb4'M',_utf8mb4'F'))),
  CONSTRAINT `status_chk` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE')))
) ENGINE=InnoDB AUTO_INCREMENT=74001010 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `cust_info`
--

DROP TABLE IF EXISTS `cust_info`;
/*!50001 DROP VIEW IF EXISTS `cust_info`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `cust_info` AS SELECT 
 1 AS `acc_no`,
 1 AS `cust_id`,
 1 AS `ifsc_code`,
 1 AS `name`,
 1 AS `email`,
 1 AS `gender`,
 1 AS `dob`,
 1 AS `address`,
 1 AS `city`,
 1 AS `state`,
 1 AS `zip`,
 1 AS `acc_type`,
 1 AS `balance`,
 1 AS `pan_no`,
 1 AS `aadhaar_no`,
 1 AS `aadhaar`,
 1 AS `photo`,
 1 AS `int_rate`,
 1 AS `created_by`,
 1 AS `status`,
 1 AS `phone_no`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `cust_phone`
--

DROP TABLE IF EXISTS `cust_phone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cust_phone` (
  `acc_no` int NOT NULL,
  `phone_no` bigint NOT NULL,
  PRIMARY KEY (`acc_no`,`phone_no`),
  CONSTRAINT `cp_accno_fk` FOREIGN KEY (`acc_no`) REFERENCES `cust_account` (`acc_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `emp_info`
--

DROP TABLE IF EXISTS `emp_info`;
/*!50001 DROP VIEW IF EXISTS `emp_info`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `emp_info` AS SELECT 
 1 AS `emp_id`,
 1 AS `ifsc_code`,
 1 AS `name`,
 1 AS `designation`,
 1 AS `email`,
 1 AS `password`,
 1 AS `gender`,
 1 AS `dob`,
 1 AS `address`,
 1 AS `salary`,
 1 AS `aadhaar`,
 1 AS `photo`,
 1 AS `aadhaar_no`,
 1 AS `pan_no`,
 1 AS `city`,
 1 AS `state`,
 1 AS `zip`,
 1 AS `phone_no`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `emp_phone`
--

DROP TABLE IF EXISTS `emp_phone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emp_phone` (
  `emp_id` int NOT NULL,
  `phone_no` bigint NOT NULL,
  PRIMARY KEY (`emp_id`,`phone_no`),
  CONSTRAINT `ep_empid_fk` FOREIGN KEY (`emp_id`) REFERENCES `employee` (`emp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `emp_id` int NOT NULL AUTO_INCREMENT,
  `ifsc_code` char(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `designation` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `gender` char(1) NOT NULL,
  `dob` date NOT NULL,
  `address` varchar(50) NOT NULL,
  `salary` int NOT NULL,
  `aadhaar` varchar(30) NOT NULL,
  `photo` mediumblob NOT NULL,
  `aadhaar_no` varchar(30) NOT NULL,
  `pan_no` varchar(30) DEFAULT NULL,
  `city` varchar(20) NOT NULL,
  `state` varchar(20) NOT NULL,
  `zip` int NOT NULL,
  PRIMARY KEY (`emp_id`),
  UNIQUE KEY `email` (`email`),
  KEY `emp_ifsc_fk` (`ifsc_code`),
  CONSTRAINT `emp_ifsc_fk` FOREIGN KEY (`ifsc_code`) REFERENCES `branch` (`ifsc_code`),
  CONSTRAINT `emp_gen_chk` CHECK ((`gender` in (_utf8mb4'M',_utf8mb4'F')))
) ENGINE=InnoDB AUTO_INCREMENT=1028 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loan`
--

DROP TABLE IF EXISTS `loan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan` (
  `loan_type` varchar(20) NOT NULL,
  `amount` float NOT NULL,
  `mortgage` varchar(30) NOT NULL,
  `int_rate` float NOT NULL,
  `tenure` int NOT NULL,
  `acc_no` int NOT NULL,
  `time_stamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `rem_amt` float NOT NULL,
  `sanctioned_by` int NOT NULL,
  PRIMARY KEY (`acc_no`),
  KEY `ln_accno_fk` (`acc_no`),
  CONSTRAINT `ln_accno_fk` FOREIGN KEY (`acc_no`) REFERENCES `cust_account` (`acc_no`),
  CONSTRAINT `ln_amt_chk` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loan_history`
--

DROP TABLE IF EXISTS `loan_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_history` (
  `loan_type` varchar(20) NOT NULL,
  `amount` float NOT NULL,
  `mortgage` varchar(30) NOT NULL,
  `int_rate` float NOT NULL,
  `tenure` int NOT NULL,
  `acc_no` int NOT NULL,
  `time_stamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `rem_amt` float NOT NULL,
  `sanctioned_by` int NOT NULL,
  `loan_closed_on` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loan_trans`
--

DROP TABLE IF EXISTS `loan_trans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_trans` (
  `loan_trans_id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(30) NOT NULL,
  `amount` float NOT NULL,
  `time_stamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `int_amt` float NOT NULL,
  `total_amt` float NOT NULL,
  `acc_no` int NOT NULL,
  `rem_amt` float NOT NULL,
  `done_by` int NOT NULL,
  PRIMARY KEY (`loan_trans_id`),
  KEY `loan_accno_fk_idx` (`acc_no`),
  CONSTRAINT `loan_accno_fk` FOREIGN KEY (`acc_no`) REFERENCES `cust_account` (`acc_no`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci KEY_BLOCK_SIZE=1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `login_sessions`
--

DROP TABLE IF EXISTS `login_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_sessions` (
  `emp_id` int NOT NULL,
  `login_time` datetime NOT NULL,
  `logout_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `trans_no` int NOT NULL AUTO_INCREMENT,
  `counter_no` int DEFAULT NULL,
  `trans_type` varchar(10) NOT NULL,
  `amount` int NOT NULL,
  `time_stamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `acc_no` int NOT NULL,
  `ifsc_code` char(11) NOT NULL,
  `rem_bal` float NOT NULL,
  PRIMARY KEY (`trans_no`),
  KEY `trans_cntno_fk` (`counter_no`),
  KEY `trans_ifsc_fk` (`ifsc_code`),
  KEY `trans_ifsc_cntno_fk` (`counter_no`,`ifsc_code`),
  CONSTRAINT `trans_ifsc_cntno_fk` FOREIGN KEY (`counter_no`, `ifsc_code`) REFERENCES `cash_counter` (`counter_no`, `ifsc_code`),
  CONSTRAINT `amt_chk` CHECK ((`amount` > 0)),
  CONSTRAINT `tt_chk` CHECK ((`trans_type` in (_utf8mb4'debit',_utf8mb4'credit')))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `cust_info`
--

/*!50001 DROP VIEW IF EXISTS `cust_info`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `cust_info` AS select `cust_account`.`acc_no` AS `acc_no`,`cust_account`.`cust_id` AS `cust_id`,`cust_account`.`ifsc_code` AS `ifsc_code`,`cust_account`.`name` AS `name`,`cust_account`.`email` AS `email`,`cust_account`.`gender` AS `gender`,`cust_account`.`dob` AS `dob`,`cust_account`.`address` AS `address`,`cust_account`.`city` AS `city`,`cust_account`.`state` AS `state`,`cust_account`.`zip` AS `zip`,`cust_account`.`acc_type` AS `acc_type`,`cust_account`.`balance` AS `balance`,`cust_account`.`pan_no` AS `pan_no`,`cust_account`.`aadhaar_no` AS `aadhaar_no`,`cust_account`.`aadhaar` AS `aadhaar`,`cust_account`.`photo` AS `photo`,`cust_account`.`int_rate` AS `int_rate`,`cust_account`.`created_by` AS `created_by`,`cust_account`.`status` AS `status`,`cust_phone`.`phone_no` AS `phone_no` from (`cust_account` join `cust_phone` on((`cust_account`.`acc_no` = `cust_phone`.`acc_no`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `emp_info`
--

/*!50001 DROP VIEW IF EXISTS `emp_info`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `emp_info` AS select `employee`.`emp_id` AS `emp_id`,`employee`.`ifsc_code` AS `ifsc_code`,`employee`.`name` AS `name`,`employee`.`designation` AS `designation`,`employee`.`email` AS `email`,`employee`.`password` AS `password`,`employee`.`gender` AS `gender`,`employee`.`dob` AS `dob`,`employee`.`address` AS `address`,`employee`.`salary` AS `salary`,`employee`.`aadhaar` AS `aadhaar`,`employee`.`photo` AS `photo`,`employee`.`aadhaar_no` AS `aadhaar_no`,`employee`.`pan_no` AS `pan_no`,`employee`.`city` AS `city`,`employee`.`state` AS `state`,`employee`.`zip` AS `zip`,`emp_phone`.`phone_no` AS `phone_no` from (`employee` join `emp_phone` on((`employee`.`emp_id` = `emp_phone`.`emp_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-20 18:18:30
