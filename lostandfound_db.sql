-- phpMyAdmin SQL Dump
-- Lost & Found Database Schema
-- 
-- Database: `lostandfound_db`
-- 

-- --------------------------------------------------------

--
-- Database: `lostandfound_db`
--
CREATE DATABASE IF NOT EXISTS `lostandfound_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `lostandfound_db`;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `status` enum('pending','verified','approved','rejected') DEFAULT 'pending',
  `verification_token` varchar(255) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `student_id`, `phone`, `is_admin`, `status`, `verified_at`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 'admin@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', NULL, NULL, 1, 'approved', '2025-09-06 09:24:00', '2025-09-06 09:24:00', '2025-09-06 09:24:00', '2025-09-06 09:24:00'),
(2, 'john.doe@norzagaraycollege.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', '2023-001234', '+63 912 345 6789', 0, 'approved', '2025-09-06 09:24:00', '2025-09-06 09:24:00', '2025-09-06 09:24:00', '2025-09-06 09:24:00'),
(3, 'jane.smith@student.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', '2023-001235', '+63 912 345 6790', 0, 'approved', '2025-09-06 09:24:00', '2025-09-06 09:24:00', '2025-09-06 09:24:00', '2025-09-06 09:24:00');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `date_reported` date NOT NULL,
  `type` enum('lost','found') NOT NULL,
  `status` enum('pending','confirmed','claimed','rejected') DEFAULT 'pending',
  `image_path` varchar(500) DEFAULT NULL,
  `contact_info` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `user_id`, `item_name`, `description`, `location`, `date_reported`, `type`, `status`, `image_path`, `contact_info`, `created_at`, `updated_at`) VALUES
(1, 2, 'iPhone 13 Pro', 'Black iPhone 13 Pro with blue case', 'Library', '2025-09-01', 'lost', 'pending', NULL, NULL, '2025-09-06 09:24:00', '2025-09-06 09:24:00'),
(2, 2, 'Blue Pen', 'Blue ballpoint pen', 'CLA', '2025-09-02', 'found', 'claimed', NULL, NULL, '2025-09-06 09:24:00', '2025-09-06 09:24:00'),
(3, 3, 'Wallet', 'Brown leather wallet', 'Cafeteria', '2025-08-28', 'lost', 'confirmed', NULL, NULL, '2025-09-06 09:24:00', '2025-09-06 09:24:00'),
(4, 3, 'Blue Backpack', 'Navy blue Jansport backpack', 'CLA Building', '2025-09-03', 'found', 'pending', NULL, NULL, '2025-09-06 09:24:00', '2025-09-06 09:24:00'),
(5, 1, 'Car Keys', 'Toyota keys with red keychain', 'Parking Lot', '2025-09-04', 'lost', 'pending', NULL, NULL, '2025-09-06 09:24:00', '2025-09-06 09:24:00'),
(6, 1, 'Umbrella', 'Black umbrella', 'Library', '2025-08-23', 'found', 'pending', NULL, NULL, '2025-09-06 09:24:00', '2025-09-06 09:24:00');

-- --------------------------------------------------------

--
-- Table structure for table `claims`
--

CREATE TABLE `claims` (
  `id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `claimer_id` int(11) NOT NULL,
  `claim_description` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 2, 'Your lost iPhone 13 has been found!', 'Someone reported finding your iPhone 13 at the Library. Contact admin to claim it.', 'success', 0, '2025-09-06 07:24:00'),
(2, 2, 'Your found item report was approved', 'Your report for the blue pen found at CLA has been approved by admin.', 'info', 0, '2025-09-06 08:24:00'),
(3, 2, 'Reminder: Update your profile', 'Please ensure your contact information is up to date for better communication.', 'warning', 0, '2025-09-03 09:24:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `claims`
--
ALTER TABLE `claims`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `claimer_id` (`claimer_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `claims`
--
ALTER TABLE `claims`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `claims`
--
ALTER TABLE `claims`
  ADD CONSTRAINT `claims_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `claims_ibfk_2` FOREIGN KEY (`claimer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

COMMIT;
