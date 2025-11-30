-- ==========================================
-- Supabase SQL Schema for GHG Scope Two Location
-- Generated: 2025-11-29
-- Data Source: Hojeon Limited_Scope 1, 2 emissions calculation.xlsx
-- Sheet: 3-2. (Raw Data) Scope2_Location
-- ==========================================

-- Drop table if exists (for clean recreation)
DROP TABLE IF EXISTS public.ghg_scopetwo_location CASCADE;

-- Create table: ghg_scopetwo_location
CREATE TABLE public.ghg_scopetwo_location (
    id BIGSERIAL PRIMARY KEY,
    
    -- Basic Information
    entity TEXT NOT NULL,
    facility TEXT NOT NULL,
    country TEXT NOT NULL,
    classification TEXT NOT NULL, -- 'Electricity' or 'Steam'
    
    -- Data Collection Year
    date_collection TEXT NOT NULL, -- Year (e.g., '2022', '2023', '2024')
    
    -- Monthly Purchase Data (MWh)
    january NUMERIC(15,6) DEFAULT 0,
    february NUMERIC(15,6) DEFAULT 0,
    march NUMERIC(15,6) DEFAULT 0,
    april NUMERIC(15,6) DEFAULT 0,
    may NUMERIC(15,6) DEFAULT 0,
    june NUMERIC(15,6) DEFAULT 0,
    july NUMERIC(15,6) DEFAULT 0,
    august NUMERIC(15,6) DEFAULT 0,
    september NUMERIC(15,6) DEFAULT 0,
    october NUMERIC(15,6) DEFAULT 0,
    november NUMERIC(15,6) DEFAULT 0,
    december NUMERIC(15,6) DEFAULT 0,
    
    -- Unit & Supplier Information
    unit TEXT DEFAULT 'MWh',
    currency_unit TEXT,
    supplier_name TEXT,
    
    -- Calculated Fields (Auto-calculated from monthly data)
    total_purchase_amount NUMERIC(15,6), -- Sum of all months
    total_purchase_mj NUMERIC(15,2), -- Total in MegaJoules (MWh × 3,600)
    
    -- Emissions (Auto-calculated based on country emission factors)
    kgCO2 NUMERIC(15,6),
    kgCH4 NUMERIC(15,6),
    kgN2O NUMERIC(15,6),
    tCO2eq NUMERIC(15,6), -- Total CO2 equivalent in tons
    
    -- Metadata
    updated_by TEXT,
    updated_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate entries
    CONSTRAINT unique_facility_year_classification UNIQUE (entity, facility, date_collection, classification)
);

-- Create indexes for better query performance
CREATE INDEX idx_scopetwo_location_year ON public.ghg_scopetwo_location(date_collection);
CREATE INDEX idx_scopetwo_location_entity ON public.ghg_scopetwo_location(entity);
CREATE INDEX idx_scopetwo_location_facility ON public.ghg_scopetwo_location(facility);
CREATE INDEX idx_scopetwo_location_country ON public.ghg_scopetwo_location(country);
CREATE INDEX idx_scopetwo_location_classification ON public.ghg_scopetwo_location(classification);

-- Add comments to table and columns
COMMENT ON TABLE public.ghg_scopetwo_location IS 'GHG Scope 2 Location-Based emissions from electricity and steam purchases';
COMMENT ON COLUMN public.ghg_scopetwo_location.classification IS 'Type of energy purchased: Electricity or Steam';
COMMENT ON COLUMN public.ghg_scopetwo_location.total_purchase_mj IS 'Total energy in MegaJoules (MWh × 3,600)';
COMMENT ON COLUMN public.ghg_scopetwo_location.tCO2eq IS 'Total CO2 equivalent emissions in tons';

ALTER TABLE public.ghg_scopetwo_location ENABLE ROW LEVEL SECURITY;

CREATE POLICY 'Allow all operations for authenticated users' 
ON public.ghg_scopetwo_location 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Optional: Create policy for specific roles (example: compliance department only)
-- CREATE POLICY 'Compliance department full access'
-- ON public.ghg_scopetwo_location
-- FOR ALL
-- TO authenticated
-- USING (auth.jwt() ->> 'department' = 'compliance')
-- WITH CHECK (auth.jwt() ->> 'department' = 'compliance');

-- ==========================================
-- Sample Data Insert (from Excel)
-- Note: You can insert all 28 records from the mock data
-- ==========================================

-- Example insert statements (first 3 records):
INSERT INTO public.ghg_scopetwo_location (
    entity, facility, country, classification,
    date_collection,
    january, february, march, april, may, june,
    july, august, september, october, november, december,
    unit, currency_unit, supplier_name,
    total_purchase_amount, total_purchase_mj,
    kgCO2, kgCH4, kgN2O, tCO2eq,
    updated_by
) VALUES
(
    'HOJEON LIMITED', 'HOJEON LIMITED Co., Ltd', 'Korea', 'Electricity',
    '2022',
    32.4612, 30.0599, 28.2965, 25.6397, 31.6233, 37.4405,
    45.2957, 45.9073, 35.6192, 24.9007, 26.7502, 34.3407,
    'MWh', 'KRW', '한국 Electricity',
    398.3349, 1434005.52,
    185345.21, 3.79, 2.06, 186.01,
    'System'
),
(
    'HOJEON LIMITED', 'HOJEON LIMITED Co., Ltd', 'Korea', 'Electricity',
    '2023',
    32.4739, 28.4207, 25.6455, 23.438, 29.3595, 37.7009,
    41.5993, 45.3619, 36.0669, 23.9101, 27.9635, 31.8156,
    'MWh', 'KRW', '한국 Electricity',
    383.7556, 1381520.16,
    178561.48, 3.65, 1.98, 179.20,
    'System'
),
(
    'HOJEON LIMITED', 'HOJEON LIMITED Co., Ltd', 'Korea', 'Electricity',
    '2024',
    32.7055, 27.023, 26.4106, 23.9218, 29.4365, 38.2186,
    46.0635, 48.9554, 37.5575, 26.0137, 26.052, 33.0842,
    'MWh', 'KRW', '한국 Electricity',
    395.4422, 1423591.94,
    183999.26, 3.77, 2.04, 184.66,
    'System'
);

-- Remaining records (4..28)
INSERT INTO public.ghg_scopetwo_location (
    entity, facility, country, classification,
    date_collection,
    january, february, march, april, may, june,
    july, august, september, october, november, december,
    unit, currency_unit, supplier_name,
    total_purchase_amount, total_purchase_mj,
    kgCO2, kgCH4, kgN2O, tCO2eq,
    updated_by
) VALUES
(
    'PT. KAHOINDAH CITRAGARMENT','KAHOINDAH CITRAGARMENT','Indonesia','Electricity',
    '2022',
    133.18,126.64,119.65,143.57,131.12,117.15,162.06,163.09,162.14,137.82,132.26,133.74,
    'MWh','IDR','PLN',
    1662.42,5984712.00,
    1281227.094,63.330285714285715,21.45058064516129,1446.3054,
    'System'
),
(
    'PT. KAHOINDAH CITRAGARMENT','KAHOINDAH CITRAGARMENT','Indonesia','Electricity',
    '2022',
    0,0,0,0,0,0,0,0,0,0,0,0,
    'MWh','','',
    0,0,0,0,0,0,
    'System'
),
(
    'PT. KAHOINDAH CITRAGARMENT','KAHOINDAH CITRAGARMENT','Indonesia','Electricity',
    '2023',
    141.776,119.616,123.072,117.15,134.416,131.472,133.872,141.408,117.15,125.584,132.496,117.808,
    'MWh','IDR','PLN',
    1535.82,5528952.00,
    1183656.474,58.50742857142858,19.81703225806452,1336.1634,
    'System'
),
(
    'PT. KAHOINDAH CITRAGARMENT','KAHOINDAH CITRAGARMENT','Indonesia','Electricity',
    '2023',
    0,0,0,0,0,0,0,0,0,0,0,0,
    'MWh','','',
    0,0,0,0,0,0,
    'System'
),
(
    'PT. KAHOINDAH CITRAGARMENT','KAHOINDAH CITRAGARMENT','Indonesia','Electricity',
    '2024',
    119.728,100.352,98.592,82.368,128.886,131.966,170.18,152.259,117.994,146.126,130.336,130.872,
    'MWh','IDR','PLN',
    1509.659,5434772.40,
    1163494.1913,57.51081904761905,19.479470967741936,1313.40333,
    'System'
),
(
    'PT. KAHOINDAH CITRAGARMENT','KAHOINDAH CITRAGARMENT','Indonesia','Electricity',
    '2024',
    0.747,0.796,0.558,0.733,0.617,0.677,0.761,0.946,0.706,1.055,0.777,0.821,
    'MWh','','',
    9.194,33098.40,
    7085.8158,0.35024761904761903,0.11863225806451612,7.99878,
    'System'
),
(
    'PT. KAHOINDAH CITRAGARMENT','KAHOINDAH CITRAGARMENT','Indonesia','Electricity',
    '2024',
    0.764,0.725,0.634,0.762,0.633,0.66,0.612,0.681,0.74,0.648,0.716,0.638,
    'MWh','','',
    8.213,29566.80,
    6329.7591,0.31287619047619053,0.10597419354838711,7.14531,
    'System'
),
(
    'PT. YONGJIN JAVASUKA GARMENT','PT. YONGJIN JAVASUKA GARMENT (1공장)','Indonesia','Electricity',
    '2022',
    117.36,108.192,117.424,85.792,97.92,117.456,113.904,109.104,114.256,109.52,115.168,109.296,
    'MWh','IDR','PLN',
    1315.392,4735411.20,
    1013772.6144,50.110171428571434,16.9728,1144.39104,
    'System'
),
(
    'PT. YONGJIN JAVASUKA GARMENT','PT. YONGJIN JAVASUKA GARMENT (2,3공장)','Indonesia','Electricity',
    '2022',
    595.192,565.376,711.232,602.112,591.392,759.68,690.112,674.464,614.112,663.52,683.52,679.904,
    'MWh','IDR','PLN',
    7830.616,28190217.60,
    6035055.7512,298.309180952381,101.0402064516129,6812.63592,
    'System'
),
(
    'PT. YONGJIN JAVASUKA GARMENT','PT. YONGJIN JAVASUKA GARMENT (1공장)','Indonesia','Electricity',
    '2023',
    104.528,113.152,130.56,82.24,113.536,98,104.32,85.712,105.552,114.192,129.472,114.56,
    'MWh','IDR','PLN',
    1295.824,4664966.40,
    998691.5568,49.36472380952381,16.72030967741935,1127.36688,
    'System'
),
(
    'PT. YONGJIN JAVASUKA GARMENT','PT. YONGJIN JAVASUKA GARMENT (2,3공장)','Indonesia','Electricity',
    '2023',
    724.192,671.36,718.56,435.2,827.04,792.248,858.528,738.88,678.36,756.08,726,692.32,
    'MWh','IDR','PLN',
    8618.768,31027564.80,
    6642484.4976,328.33401904761905,111.20990967741936,7498.32816,
    'System'
),
(
    'PT. YONGJIN JAVASUKA GARMENT','PT. YONGJIN JAVASUKA GARMENT (1공장)','Indonesia','Electricity',
    '2024',
    108.967,114.688,104.992,103.264,138.6416,140.3936,98,129.8288,143.0336,169.0976,142.5408,152.9744,
    'MWh','IDR','PLN',
    1546.4214,5567117.04,
    1191826.97298,58.91129142857144,19.953824516129036,1345.386618,
    'System'
),
(
    'PT. YONGJIN JAVASUKA GARMENT','PT. YONGJIN JAVASUKA GARMENT (2,3공장)','Indonesia','Electricity',
    '2024',
    742,621.08,663.68,583.6,812.332,819.504,797.248,961.144,807.78,865.089,808.62336,854.7804,
    'MWh','IDR','PLN',
    9336.86076,33612698.736,
    7195918.587732,355.68993371428576,120.47562270967741,8123.0688612,
    'System'
),
(
    'PT. HJL INDO NETWORKS','PT. HJL INDO NETWORKS','Indonesia','Electricity',
    '2022',
    1.059,0.707,1.154,1.252,0.884,1.061,1.337,1.137,1.204,1.147,1.11,1.043,
    'MWh','IDR','National Electric Company (PLN)',
    13.095,47142.00,
    10092.3165,0.49885714285714283,0.16896774193548386,11.39265,
    'System'
),
(
    'PT. HJL INDO NETWORKS','PT. HJL INDO NETWORKS','Indonesia','Electricity',
    '2022',
    0.8613,2.0097,0.8613,1.7226,0,0.2871,0.5742,0.8613,0.2871,0.8613,0.2871,0.8613,
    'MWh','IDR','National Electric Company (PLN)',
    9.4743,34107.48,
    7301.84301,0.36092571428571435,0.12224903225806454,8.242641,
    'System'
),
(
    'PT. HJL INDO NETWORKS','PT. HJL INDO NETWORKS','Indonesia','Electricity',
    '2023',
    1.0724,1.0309,1.2348,1.0037,1.2183,1.4317,1.1327,1.2987,1.1897,1.1427,1.186,1.0902,
    'MWh','IDR','National Electric Company (PLN)',
    14.0318,50514.48,
    10814.30826,0.534544761904762,0.18105548387096776,12.207666,
    'System'
),
(
    'PT. HJL INDO NETWORKS','PT. HJL INDO NETWORKS','Indonesia','Electricity',
    '2023',
    0.2871,0.5742,0.5742,0.5742,0.8613,0.2871,0.8613,0.5742,0.2871,0.5742,0.5742,0.8613,
    'MWh','IDR','National Electric Company (PLN)',
    6.8904,24805.44,
    5310.43128,0.26249142857142865,0.0889083870967742,5.994648,
    'System'
),
(
    'PT. HJL INDO NETWORKS','PT. HJL INDO NETWORKS','Indonesia','Electricity',
    '2024',
    1.139,1.0363,1.0418,1.0033,1.2437,1.2002,1.1058,1.2131,0.9668,1.0708,0.8009,0.832,
    'MWh','IDR','National Electricity Company',
    12.6537,45553.32,
    9752.20659,0.48204571428571436,0.1632735483870968,11.008719,
    'System'
),
(
    'PT. HJL INDO NETWORKS','PT. HJL INDO NETWORKS','Indonesia','Electricity',
    '2024',
    0.5766,0.8649,0.2883,0.5766,0.8649,0.8649,0.2883,0.8649,0.8649,0.5766,0.8649,0.5766,
    'MWh','IDR','National Electricity Company',
    8.0724,29060.64,
    6221.39868,0.30752,0.10416,7.022988,
    'System'
),
(
    'PT.HOGA REKSA GARMENT','PT.HOGA REKSA GARMENT','Indonesia','Electricity',
    '2022',
    172.208,153.392,206.144,234.576,187.504,214.352,215.616,216.368,219.536,197.216,188.48,172.624,
    'MWh','IDR','PLN',
    2378.016,8560857.60,
    1832736.9312,90.59108571428573,30.68407741935484,2068.87392,
    'System'
),
(
    'PT.HOGA REKSA GARMENT','PT.HOGA REKSA GARMENT','Indonesia','Electricity',
    '2023',
    174.952,168.376,197.208,127.458,219.216,195.541,198.712,196.904,192.31,220.582,239.39,217.043,
    'MWh','IDR','PLN',
    2347.692,8451691.20,
    1809366.2244,89.43588571428572,30.2928,2042.49204,
    'System'
),
(
    'PT.HOGA REKSA GARMENT','PT.HOGA REKSA GARMENT','Indonesia','Electricity',
    '2024',
    245.784,224.663,259.904,211.073,306.658,277.377,316.565,293.664,330.514,376.169,348.079,352.116,
    'MWh','IDR','PLN',
    3542.566,12753237.60,
    2730255.6162,134.95489523809525,45.710529032258066,3082.03242,
    'System'
),
(
    '㈜엠파파','MFAFA Co., Ltd','Korea','Electricity',
    '2022',
    0.5648,0.4961333333333333,0.4504666666666666,0.4212666666666667,0.5317333333333334,0.6534666666666668,0.8313333333333334,0.8866666666666666,0.6338,0.3423333333333333,0.3638,0.5463333333333333,
    'MWh','KRW','한국 Electricity',
    6.722133333333333,24199.68,
    3127.80864,0.06402031746031746,0.03469488172043011,3.1390088912811063,
    'System'
),
(
    '㈜엠파파','MFAFA Co., Ltd','Korea','Electricity',
    '2023',
    0.48113333333333336,0.4023333333333333,0.3234666666666666,0.275,0.41153333333333336,0.5851333333333333,0.6236666666666666,0.7741333333333333,0.5221333333333333,0.2879333333333333,0.3815333333333334,0.44739999999999996,
    'MWh','KRW','한국 Electricity',
    5.5154,19855.44,
    2566.31562,0.05252761904761905,0.028466580645161287,2.575505242230414,
    'System'
),
(
    '㈜엠파파','MFAFA Co., Ltd','Korea','Electricity',
    '2024',
    0.47653333333333336,0.356,0.3354,0.2722,0.3845333333333334,0.5754,0.7157333333333333,0.8114,0.5432666666666667,0.333,0.2991333333333333,0.4734,
    'MWh','KRW','한국 Electricity',
    5.576,20073.60,
    2594.5128,0.05310476190476191,0.02877935483870968,2.603803392442397,
    'System'
);

-- ==========================================
-- Helpful Queries
-- ==========================================

-- Query 1: Get total emissions by year
SELECT 
    date_collection AS year,
    COUNT(*) AS total_records,
    SUM(total_purchase_amount) AS total_purchase_mwh,
    SUM(tCO2eq) AS total_emissions_tco2eq
FROM public.ghg_scopetwo_location
GROUP BY date_collection
ORDER BY date_collection;

-- Query 2: Get emissions by entity and country
SELECT 
    entity,
    country,
    COUNT(*) AS total_records,
    SUM(tCO2eq) AS total_emissions_tco2eq
FROM public.ghg_scopetwo_location
GROUP BY entity, country
ORDER BY total_emissions_tco2eq DESC;

-- Query 3: Get monthly breakdown for a specific year
SELECT 
    entity,
    facility,
    january, february, march, april, may, june,
    july, august, september, october, november, december,
    total_purchase_amount,
    tCO2eq
FROM public.ghg_scopetwo_location
WHERE date_collection = '2024'
ORDER BY tCO2eq DESC;

-- Query 4: Compare emissions between countries
SELECT 
    country,
    classification,
    SUM(total_purchase_amount) AS total_purchase_mwh,
    SUM(tCO2eq) AS total_emissions_tco2eq,
    AVG(tCO2eq) AS avg_emissions_per_record
FROM public.ghg_scopetwo_location
GROUP BY country, classification
ORDER BY total_emissions_tco2eq DESC;

-- ==========================================
-- Emission Factors Reference (for documentation)
-- ==========================================
-- Korea Electricity: ~465 kgCO2/MWh
-- Indonesia Electricity: ~770 kgCO2/MWh
-- Calculation: MWh × 3,600 = MJ
-- Then apply country-specific emission factors
-- ==========================================
