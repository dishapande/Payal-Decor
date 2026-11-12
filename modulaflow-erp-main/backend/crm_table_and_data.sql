-- ==============================================================================
-- PostgreSQL Script: Create Table "crm" & Insert All 84 Leads
-- Database: my_database.backup
-- Schema: public
-- Table: crm
-- Generated for Payal Decor ERP
-- ==============================================================================

-- 1. CREATE TABLE "crm"
CREATE TABLE IF NOT EXISTS "crm" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Meta Ads',
    "businessName" TEXT,
    "category" TEXT,
    "genderType" TEXT,
    "primaryPhone" TEXT,
    "secondaryEmail" TEXT,
    "website" TEXT,
    "address" TEXT,
    "locality" TEXT,
    "mapsUrl" TEXT,
    "sourceNote" TEXT,
    "sourceUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "notes" TEXT,
    "lastEmailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crm_pkey" PRIMARY KEY ("id")
);

-- 2. CREATE INDEXES FOR FAST FILTERING AND SEARCHING
CREATE INDEX IF NOT EXISTS "crm_source_idx" ON "crm"("source");
CREATE INDEX IF NOT EXISTS "crm_locality_idx" ON "crm"("locality");
CREATE INDEX IF NOT EXISTS "crm_status_idx" ON "crm"("status");
CREATE INDEX IF NOT EXISTS "crm_primaryPhone_idx" ON "crm"("primaryPhone");

-- 3. INSERT ALL 84 CRM RECORDS (19 FRESH META ADS LEADS + 65 VERIFIED PROPERTIES)
INSERT INTO "crm" ("id", "source", "businessName", "category", "genderType", "primaryPhone", "secondaryEmail", "website", "address", "locality", "mapsUrl", "sourceNote", "sourceUrl", "status", "notes", "createdAt", "updatedAt")
VALUES
('meta-001', 'Meta Ads', NULL, NULL, NULL, '8275304925', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-002', 'Meta Ads', NULL, NULL, NULL, '9845343187', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-003', 'Meta Ads', NULL, NULL, NULL, '8698301301', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-004', 'Meta Ads', NULL, NULL, NULL, '9653467212', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-005', 'Meta Ads', NULL, NULL, NULL, '9117005001', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-006', 'Meta Ads', NULL, NULL, NULL, '9421003388', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-007', 'Meta Ads', NULL, NULL, NULL, '9156786481', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-008', 'Meta Ads', NULL, NULL, NULL, '9096476594', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-009', 'Meta Ads', NULL, NULL, NULL, '9422463939', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-010', 'Meta Ads', NULL, NULL, NULL, '9795999393', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-011', 'Meta Ads', NULL, NULL, NULL, '9767378604', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-012', 'Meta Ads', NULL, NULL, NULL, '9423188915', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-013', 'Meta Ads', NULL, NULL, NULL, '9028735135', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-014', 'Meta Ads', NULL, NULL, NULL, '9921874376', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-015', 'Meta Ads', NULL, NULL, NULL, '9529463863', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-016', 'Meta Ads', NULL, NULL, NULL, '9356629105', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-017', 'Meta Ads', NULL, NULL, NULL, '9850440205', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T12:55:00.000Z', CURRENT_TIMESTAMP),
('meta-018', 'Meta Ads', NULL, NULL, NULL, '8275304925', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T13:05:00.000Z', CURRENT_TIMESTAMP),
('meta-019', 'Meta Ads', NULL, NULL, NULL, '9845343187', NULL, NULL, NULL, NULL, NULL, 'Meta Ads Campaign', NULL, 'New', NULL, '2026-11-12T13:05:00.000Z', CURRENT_TIMESTAMP),
('crm-001', 'Meta', 'Saraswati Boys Hostel', 'Boys hostel', 'Boys', '8308267049', NULL, NULL, '101, Sinhgad Institute Road, Ambegaon BK, Pune 411041', 'Ambegaon BK', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-002', 'Meta', 'Jijau Girls Hostel', 'Girls hostel', 'Girls', '9152363354', NULL, NULL, 'Ambegaon Budruk, Pune 411041', 'Ambegaon Budruk', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-003', 'Meta', 'MVPM Baner Boys Hostel', 'Boys hostel', 'Boys', '+91 98810 60565', 'admin@mvpm.org', NULL, 'Lane No. 6, Baner, Pune', 'Baner', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-004', 'Meta', 'Hostilo PG & Hostel for Boys & Girls', 'PG / hostel', 'Boys & Girls', '08401931815', NULL, NULL, 'Pune-Nashik Highway, Chakan, Pune', 'Chakan', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-005', 'Meta', 'K.P. Shevkari PG and Hostel', 'PG / hostel', 'Not stated', '09980646498', NULL, NULL, 'Chakan-Ambethan Road, Chakan, Pune', 'Chakan', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-006', 'Meta', 'Amruta Ladies Hostel', 'Ladies hostel', 'Girls', '08408862882', NULL, NULL, 'Near Chinchwad Station Road, Udyog Nagar, Chinchwad 411019', 'Chinchwad', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-007', 'Meta', 'Lokmanya Girls Hostel', 'Girls hostel', 'Girls', '09035236945', NULL, NULL, 'Near Unique Academy, Deccan Gymkhana, Pune', 'Deccan Gymkhana', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-008', 'Meta', 'Sai Siddha Hostel', 'Girls hostel', 'Girls', '08460548773', NULL, NULL, 'Jangali Maharaj Road, Deccan Gymkhana, Pune', 'Deccan Gymkhana', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-009', 'Meta', 'Sarang Premium PG Girls and Boys', 'PG accommodation', 'Boys & Girls', '08460395118', NULL, NULL, 'BMCC Road, Deccan Gymkhana, Pune', 'Deccan Gymkhana', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-010', 'Meta', 'Ruby Boys Hostel', 'Boys hostel', 'Boys', '7218989319', NULL, NULL, 'S.No. 48/25/5, opposite Bank of Maharashtra, Narhe Road, above Lalaji Sweets, Dhayari Phata, Pune 411041', 'Dhayari Phata', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-011', 'Meta', 'Youthville SB Road 1', 'Student housing / hostel', 'Boys & Girls', '+91 73857 77377', NULL, NULL, 'Senapati Bapat Road, Gokhalenagar, Pune 411016', 'Gokhalenagar', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-012', 'Meta', 'The Enrich Assets', 'PG accommodation', 'Not stated', '09035289797', NULL, NULL, 'Bhagirathi Nagar, Hadapsar, Pune', 'Hadapsar', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-013', 'Meta', 'Isquareit Girls Hostel (Mithila Hostel)', 'Institutional girls hostel', 'Girls', '', 'info@isquareit.edu.in', NULL, 'Blue Ridge Road, Phase 1, Hinjewadi, Pune', 'Hinjewadi', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-014', 'Meta', 'Kohinoor PG', 'PG accommodation', 'Not stated', '+91 98501 11113', NULL, NULL, 'Mukai Nagar, Hinjewadi Phase 1, Pune 411057', 'Hinjewadi', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-015', 'Meta', 'Sunrise PG Services', 'PG accommodation', 'Not stated', '09035136631', NULL, NULL, 'Mukai Nagar, Hinjewadi, Pune', 'Hinjewadi', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-016', 'Meta', 'Chaitanyas Paying Guest Services', 'Boys PG', 'Boys', '', NULL, NULL, 'Borate Nagar Road, Kharadi, Pune', 'Kharadi', NULL, 'Justdial listing; phone masked on source', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-017', 'Meta', 'Deshmukh PG', 'Boys PG / hostel', 'Boys', '09035266900', NULL, NULL, 'Downtown Road, Kharadi, Pune', 'Kharadi', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-018', 'Meta', 'Housemate', 'Boys hostel / PG', 'Boys', '09980028752', NULL, NULL, 'Samrat Ashok Road, Kharadi, Pune', 'Kharadi', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-019', 'Meta', 'OM SAI PG', 'PG / student hostel', 'Boys & Girls', '+91 99222 48255', NULL, NULL, 'Near OK Laundry, Lane 6, Tulaja Bhawani Nagar, Kharadi, Pune 411014', 'Kharadi', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-020', 'Meta', 'Hoshtel99 - Prime', 'Hostel / co-work / cafe', 'Mixed', '91752 27065', NULL, NULL, '302/63, C Lane, Ragvilas Society, Koregaon Park, Pune 411001', 'Koregaon Park', NULL, 'Google business listing; OpenAlfa', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-021', 'Meta', 'Jugglers Backpack', 'Backpacker / co-living', 'Mixed', '099993 09921', NULL, NULL, '25A, C Lane, beside Buddha Paradise Cafe, Ragvilas Society, Koregaon Park, Pune, Maharashtra 411001', 'Koregaon Park', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-022', 'Meta', 'The Pune Story Hostel', 'Hostel / co-work', 'Mixed', '+91 86260 18676', NULL, NULL, 'Pods House, White Flint Nest, Urban Nomads, Lane 5A, Meera Nagar, Koregaon Park, Pune 411001', 'Koregaon Park', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-023', 'Meta', 'The Voyage Cafe Hostel Co-work', 'Hostel / cafe / co-work', 'Mixed', '+91 75075 82162', NULL, NULL, 'A/2 The Voyage, Ashiyana Park, Lane 5, North Main Road, Koregaon Park, Pune 411001', 'Koregaon Park', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-024', 'Meta', 'Travotown Hostel and CoWork', 'Hostel / co-work', 'Mixed', '020 6743 0104', NULL, NULL, '32B, Lane C, North Main Road, beside Kasturba Gandhi School, Ragvilas Society, Koregaon Park, Pune 411001', 'Koregaon Park', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-025', 'Meta', 'CherryBerry PG Services', 'PG accommodation', 'Not stated', '+91 70382 49914', NULL, NULL, 'Nagras Estate, Pune', 'Nagras Estate', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-026', 'Meta', 'Gatha Girls Hostel', 'Girls hostel', 'Girls', '+91 97667 57465', NULL, NULL, 'Flat 102, 1st Floor, 495 Balkrishna Apartment, near Patrya Maruti Temple, Narayan Peth, Pune 411030', 'Narayan Peth', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-027', 'Meta', 'Swara Girls Hostel', 'Girls hostel', 'Girls', '+91 72628 69934', NULL, NULL, '253, Laxmi Road, Narayan Peth, Pune 411030', 'Narayan Peth', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-028', 'Meta', 'Swara Girls Hostels', 'Girls hostel', 'Girls', '09972415257', NULL, NULL, 'Laxmi Road, Narayan Peth, Pune', 'Narayan Peth', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-029', 'Meta', 'Trinity Girls Hostel', 'Girls hostel', 'Girls', '+91 83292 77060', NULL, NULL, 'Narayan Peth, Patrya Maruti Chowk, Bhatacha Bol, Pune 411030', 'Narayan Peth', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-030', 'Meta', 'Varada Girls Hostel LLP', 'Girls hostel', 'Girls', '+91 75177 98999', NULL, NULL, 'Varada Heights, CTS 386A, Patrya Maruti Chowk, near Modi Ganpati Temple, Narayan Peth, Pune 411030', 'Narayan Peth', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-031', 'Meta', 'Ganesh Krupa Hostel', 'Boys hostel', 'Boys', '9422006094', NULL, NULL, 'FR4C+36G, Narhe, Pune 411041', 'Narhe', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-032', 'Meta', 'Kunal Boys Hostel', 'Boys hostel', 'Boys', '9766976754', NULL, NULL, 'Tarangan Residency, A Wing, S.No. 34/1/1, near Zeal College, Narhe, Pune 411041', 'Narhe', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-033', 'Meta', 'Pratik Hostel', 'Boys hostel', 'Boys', '8149467000', NULL, NULL, 'Near Nawale Medical College, Narhe, Pune 411041', 'Narhe', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-034', 'Meta', 'Rushikesh Hostel', 'Boys hostel', 'Boys', '9561360057', NULL, NULL, 'Near Nawale Medical College, Narhe, Pune 411041', 'Narhe', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-035', 'Meta', 'SOFT Girls Hostel', 'Girls hostel', 'Girls', '020 6683 3700', NULL, NULL, 'Mahayogi Swami Mashindranath Road, Narhe, Pune 411041', 'Narhe', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-036', 'Meta', 'Saihyadri Girls Hostel', 'Girls hostel', 'Girls', '9974982202', 'saihyadrihostel@gmail.com', NULL, 'Narhe Road, near Sinhgad Institute of Technology and Science, Pune 411041', 'Narhe', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-037', 'Meta', 'Tara Srushti Girls Hostel', 'Girls hostel', 'Girls', '9850156316 / 9860953865', NULL, NULL, 'Survey No. 48/5, Narhe Gaon, opposite Ganpati Mandir, Manaji Nagar, Pune 411041', 'Narhe', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-038', 'Meta', 'Tarangan Girls Hostel', 'Girls hostel', 'Girls', '9766976754', NULL, NULL, 'Tarangan Residency, B Wing, S.No. 34/1/1, near Zeal College, Narhe, Pune 411041', 'Narhe', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-039', 'Meta', 'Vidhyarthini Girls Hostel', 'Girls hostel', 'Girls', '9152602797', NULL, NULL, 'Narhe Gaon, Pune 411041', 'Narhe', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-040', 'Meta', 'Yuva Girls Hostel', 'Girls hostel', 'Girls', '9850767690', NULL, NULL, 'S.No. 49/1, Westerly Bypass Road, Narhe, Pune 411041', 'Narhe', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-041', 'Meta', 'Asraya PG', 'PG accommodation', 'Not stated', '9028818464', NULL, NULL, 'Pune (street address not listed)', 'Not specified', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-042', 'Meta', 'Silver Homebase Executive Girls PG', 'Girls PG', 'Girls', '09035273964', NULL, NULL, 'BRT Road, Pimple Saudagar, Pune', 'Pimple Saudagar', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-043', 'Meta', 'Executive Training Centre and Hostel - Club House', 'Institutional hostel', 'Not stated', '', 'etch@cdsaindia.org', NULL, 'Pune (street address not listed)', 'Pune', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-044', 'Meta', 'Madhushalini Boys Hostel', 'Boys hostel', 'Boys', '+91 77759 72681', NULL, NULL, 'Pune 411048 (full street address not listed)', 'Pune', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-045', 'Meta', 'Smita PG - Kalate', 'PG accommodation', 'Not stated', '+91 97672 22333 / +91 95450 22111', NULL, NULL, 'Bharat Kalate Nagar Path, Pune', 'Pune', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-046', 'Meta', 'Jui Girls Hostel', 'Girls hostel / working women', 'Girls', '+91 88550 10401', NULL, NULL, 'B/5, Moreshwar, 209 Sharad Pandit Path, Rambag Colony, Sadashiv Peth, Pune 411030', 'Sadashiv Peth', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-047', 'Meta', 'Vidyarthi Nilaya Girls Hostel', 'Girls hostel', 'Girls', '+91 99871 89827', NULL, NULL, '3rd Floor, Erande Empire, CTS 1571, Tilak Road, Sadashiv Peth, Pune 411030', 'Sadashiv Peth', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-048', 'Meta', 'Youstel Girls Hostel', 'Girls hostel', 'Girls', '+91 98231 29806', NULL, NULL, 'Shree Parshwanath Building, 1342, Bharat Natya Mandir Lane, opposite Godbole Hospital, Sadashiv Peth, Pune 411030', 'Sadashiv Peth', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-049', 'Meta', 'Youstel Jain Luxurious Girls Hostel Pure Veg', 'Girls hostel', 'Girls', '08147851856', NULL, NULL, 'Bharat Natya Mandir Road, Sadashiv Peth, Pune', 'Sadashiv Peth', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-050', 'Meta', 'Hostells', 'Backpacker hostel / co-work', 'Mixed', '+91 84849 48200', NULL, NULL, 'Gold Field Plaza Chowk, Bund Garden Road, near Nowrosjee Wadia College, Sangamvadi, Pune 411001', 'Sangamvadi', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-051', 'Meta', 'Swamini Girls Hostel (P.G)', 'Girls hostel / PG', 'Girls', '+91 96073 15000', NULL, NULL, 'Building Tarawade, 1205/2 Pushkaraj Bungalow, Shirole Road, Shivajinagar, Pune 411004', 'Shivajinagar', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-052', 'Meta', 'Swarajya Girls Hostel', 'Girls hostel', 'Girls', '+91 97648 10495', NULL, NULL, '280B, behind Congress Bhavan, Pune 411005', 'Shivajinagar', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-053', 'Meta', 'Harita Comfort Inn PG', 'PG accommodation', 'Not stated', '+91 88060 09933 / +91 96408 36793', NULL, NULL, 'Shivneri Park Road, Pune', 'Shivneri Park', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-054', 'Meta', 'Sai Garuda PG', 'PG accommodation', 'Not stated', '+91 78430 79876 / +91 70382 28856', NULL, NULL, 'Shivneri Park Road, Pune', 'Shivneri Park', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-055', 'Meta', 'Sunshine Paradise PG', 'PG accommodation', 'Not stated', '+91 88569 69771', NULL, NULL, 'Shivneri Park Road, Pune', 'Shivneri Park', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-056', 'Meta', 'Boys Hostel - IIIT Pune', 'Institutional hostel', 'Boys', '', 'director@iiitp.ac.in', NULL, 'IIIT Pune campus, Talegaon, Pune district 410507', 'Talegaon', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-057', 'Meta', 'Girls Hostel - IIIT Pune', 'Institutional hostel', 'Girls', '', 'director@iiitp.ac.in', NULL, 'IIIT Pune campus, Talegaon, Pune district 410507', 'Talegaon', NULL, 'OpenAlfa directory', 'https://streets.openalfa.in/pune/accommodation', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-058', 'Meta', 'Pragati Girls Hostel', 'Girls hostel', 'Girls', '8390109802', NULL, NULL, 'Jadhav Nagar, Vadgaon Budruk, Pune 411041', 'Vadgaon Budruk', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-059', 'Meta', 'Samarth Hostel Girls', 'Girls hostel', 'Girls', '9822191835', NULL, NULL, 'S.No. 54/3+4B, Yashodeep, behind Hotel Dawat, Vadgaon Budruk, Pune 411041', 'Vadgaon Budruk', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-060', 'Meta', 'Shree Sai PG Boys Hostel', 'Boys hostel / PG', 'Boys', '9619436805', NULL, NULL, 'Aashirwad, S.No. 12/2/2, Anandnagar, Vadgaon Budruk, Suncity Road, near Makarand Park, Pune 411051', 'Vadgaon Budruk', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-061', 'Meta', 'Shriram Boys Hostel', 'Boys hostel', 'Boys', '9850133370', NULL, NULL, 'Vadgaon Budruk, Pune 411041', 'Vadgaon Budruk', NULL, 'Vidyasagar Academy hostel list', 'https://vidyasagaracademy.in/vhf', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-062', 'Meta', 'Goyal''s PG Viman Nagar', 'Girls PG / hostel', 'Girls', '+91 77096 81079', NULL, NULL, 'Row House 22/23, Riddhi Siddhi Park, Sakore Nagar, Viman Nagar, Pune 411014', 'Viman Nagar', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-063', 'Meta', 'The Orchid Homes', 'Girls hostel / student housing', 'Girls', '+91 90285 02358', NULL, NULL, 'Plot 29, near Viman Nagar Road, Sakore Nagar, Viman Nagar, Pune 411014', 'Viman Nagar', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-064', 'Meta', 'Zostel Pune (Viman Nagar)', 'Backpacker hostel', 'Mixed', '020 4855 2643', NULL, NULL, 'Row House 5, West Avenue, near Viman Nagar, Rajiv Nagar North, Pune 411014', 'Viman Nagar', NULL, 'Google business search result; listing details captured in this research', 'Google business search result; listing details captured in this research', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('crm-065', 'Meta', 'Rutuja Girls Hostel', 'Girls hostel', 'Girls', '06366408868', NULL, NULL, 'Bhagwan Nagar, Bhumkar Chowk, Wakad, Pune', 'Wakad', NULL, 'Justdial listing', 'https://www.justdial.com/Pune/Hostel-For-Girl-Students/nct-10852702', 'New', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "source" = EXCLUDED."source",
  "businessName" = EXCLUDED."businessName",
  "category" = EXCLUDED."category",
  "genderType" = EXCLUDED."genderType",
  "primaryPhone" = EXCLUDED."primaryPhone",
  "secondaryEmail" = EXCLUDED."secondaryEmail",
  "website" = EXCLUDED."website",
  "address" = EXCLUDED."address",
  "locality" = EXCLUDED."locality",
  "mapsUrl" = EXCLUDED."mapsUrl",
  "sourceNote" = EXCLUDED."sourceNote",
  "sourceUrl" = EXCLUDED."sourceUrl",
  "status" = EXCLUDED."status",
  "notes" = EXCLUDED."notes",
  "updatedAt" = CURRENT_TIMESTAMP;

-- 4. VERIFY INSERTION
SELECT COUNT(*) AS total_crm_leads FROM "crm";
SELECT id, source, "businessName", "primaryPhone", "secondaryEmail", locality FROM "crm" ORDER BY "createdAt" DESC LIMIT 10;
