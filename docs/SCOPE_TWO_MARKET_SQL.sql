-- Create table for Scope 2 Market-Based GHG Emissions
-- Market-based uses supplier/contract-specific emission factors

CREATE TABLE IF NOT EXISTS ghg_scopetwo_market (
  id BIGSERIAL PRIMARY KEY,
  
  -- Basic Information
  entity TEXT NOT NULL,
  facility TEXT NOT NULL,
  country TEXT NOT NULL,
  classification TEXT NOT NULL DEFAULT 'Electricity', -- Electricity, Steam
  
  -- Market-Based Specific Fields
  contractual_instrument TEXT NOT NULL DEFAULT 'Grid Default', -- REC, PPA, Green Tariff, Supplier Disclosure, Grid Default
  emission_factor NUMERIC(15,6) NOT NULL DEFAULT 0, -- Supplier-specific emission factor (kgCO2/MWh)
  emission_factor_unit TEXT DEFAULT 'kgCO2/MWh',
  certificate_id TEXT, -- Optional: REC/PPA certificate identifier
  
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
  
  -- Unit Information
  unit TEXT DEFAULT 'MWh',
  currency_unit TEXT, -- KRW, IDR, etc.
  supplier_name TEXT,
  date_collection TEXT, -- Year as text
  
  -- Calculated Results (Auto-calculated based on market-based methodology)
  total_purchase_amount NUMERIC(15,6), -- Sum of monthly purchases
  total_purchase_mj NUMERIC(15,6), -- Total energy in MJ
  kgco2 NUMERIC(15,6), -- CO2 emissions using supplier-specific EF
  kgch4 NUMERIC(15,6), -- CH4 emissions
  kgn2o NUMERIC(15,6), -- N2O emissions
  tco2eq NUMERIC(15,6), -- Total CO2 equivalent
  
  -- Metadata
  updated_by TEXT,
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ghg_scopetwo_market_entity ON ghg_scopetwo_market(entity);
CREATE INDEX IF NOT EXISTS idx_ghg_scopetwo_market_country ON ghg_scopetwo_market(country);
CREATE INDEX IF NOT EXISTS idx_ghg_scopetwo_market_year ON ghg_scopetwo_market(date_collection);
CREATE INDEX IF NOT EXISTS idx_ghg_scopetwo_market_instrument ON ghg_scopetwo_market(contractual_instrument);
CREATE INDEX IF NOT EXISTS idx_ghg_scopetwo_market_created_at ON ghg_scopetwo_market(created_at);

-- Add comments for documentation
COMMENT ON TABLE ghg_scopetwo_market IS 'GHG Scope 2 Market-Based emissions data using supplier/contract-specific emission factors';
COMMENT ON COLUMN ghg_scopetwo_market.contractual_instrument IS 'Type of contractual arrangement: REC, PPA, Green Tariff, Supplier Disclosure, Grid Default';
COMMENT ON COLUMN ghg_scopetwo_market.emission_factor IS 'Supplier-specific emission factor in kgCO2/MWh. 0 for RECs and renewable PPAs';
COMMENT ON COLUMN ghg_scopetwo_market.certificate_id IS 'Optional identifier for REC or PPA certificate';
COMMENT ON COLUMN ghg_scopetwo_market.kgco2 IS 'CO2 emissions calculated using supplier-specific emission factor';
COMMENT ON COLUMN ghg_scopetwo_market.tco2eq IS 'Total GHG emissions in tCO2 equivalent (market-based)';

-- Enable Row Level Security (RLS)
ALTER TABLE ghg_scopetwo_market ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow authenticated users to read all records
CREATE POLICY "Allow read access for authenticated users" 
  ON ghg_scopetwo_market
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert records
CREATE POLICY "Allow insert for authenticated users" 
  ON ghg_scopetwo_market
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update records
CREATE POLICY "Allow update for authenticated users" 
  ON ghg_scopetwo_market
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete records (optional, comment out if not needed)
CREATE POLICY "Allow delete for authenticated users" 
  ON ghg_scopetwo_market
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data from Excel
INSERT INTO ghg_scopetwo_market (entity, facility, country, classification, contractual_instrument, emission_factor, emission_factor_unit, january, february, march, april, may, june, july, august, september, october, november, december, unit, currency_unit, supplier_name, date_collection, total_purchase_amount, total_purchase_mj, kgco2, kgch4, kgn2o, tco2eq) VALUES
('HOJEON LIMITED', 'HOJEON LIMITED Co., Ltd', 'Korea', 'Electricity', 'Grid Default', 465.29, 'kgCO2/MWh', 32.4612, 30.059866666666668, 28.296533333333333, 25.639733333333336, 31.623266666666666, 37.440533333333335, 45.29566666666666, 45.907333333333334, 35.6192, 24.90066666666667, 26.7502, 34.34066666666667, 'MWh', 'KRW', '한국전력공사 (KEPCO)', '2022', 398.33486666666664, 1434005.52, 185345.21346, 3.793665396825397, 2.055921892473118, 186.00890910235947),
('HOJEON LIMITED', 'HOJEON LIMITED Co., Ltd', 'Korea', 'Electricity', 'REC', 0, 'kgCO2/MWh', 10.5, 10.2, 9.8, 8.5, 11.2, 12.8, 15.2, 16.1, 13.5, 9.8, 10.5, 12.2, 'MWh', 'KRW', 'Korea Renewable Energy Certificate', '2022', 140.3, 505080, 0, 0, 0, 0),
('HOJEON LIMITED', 'HOJEON LIMITED Co., Ltd', 'Korea', 'Electricity', 'Grid Default', 465.29, 'kgCO2/MWh', 32.473866666666666, 28.42066666666667, 25.645533333333333, 23.438, 29.359466666666666, 37.70086666666667, 41.599333333333334, 45.36186666666667, 36.06686666666667, 23.910066666666665, 27.96346666666667, 31.8156, 'MWh', 'KRW', '한국전력공사 (KEPCO)', '2023', 383.7556, 1381520.16, 178561.48068, 3.654815238095239, 1.9806740645161292, 179.20088471104148),
('HOJEON LIMITED', 'HOJEON LIMITED Co., Ltd', 'Korea', 'Electricity', 'PPA', 0, 'kgCO2/MWh', 15.2, 14.8, 13.5, 12.2, 16.5, 18.2, 20.5, 22.1, 18.8, 14.2, 15.5, 17.8, 'MWh', 'KRW', 'Solar PPA Provider Korea', '2023', 199.3, 717480, 0, 0, 0, 0),
('HOJEON LIMITED', 'HOJEON LIMITED Co., Ltd', 'Korea', 'Electricity', 'Grid Default', 465.29, 'kgCO2/MWh', 32.705466666666666, 27.023, 26.4106, 23.9218, 29.436466666666668, 38.2186, 46.06347356321839, 48.95535862068965, 37.55745747126437, 26.013724137931035, 26.052039080459775, 33.084220689655176, 'MWh', 'KRW', '한국전력공사 (KEPCO)', '2024', 395.44220689655174, 1423591.9448275862, 183999.25886896552, 3.766116256157636, 2.0409920355951057, 184.65813483359923),
('HOJEON LIMITED', 'HOJEON LIMITED Co., Ltd', 'Korea', 'Electricity', 'Green Tariff', 93.06, 'kgCO2/MWh', 8.5, 7.8, 7.2, 6.5, 8.8, 10.2, 12.5, 13.8, 11.2, 8.5, 9.2, 10.5, 'MWh', 'KRW', 'KEPCO Green Premium', '2024', 114.7, 412920, 10673.982, 1.092228571428571, 0.5918064516129032, 10.86525),
('PT. KAHOINDAH CITRAGARMENT', 'KAHOINDAH CITRAGARMENT', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 133.18, 126.64, 119.65, 143.57, 131.12, 117.15, 162.06, 163.09, 162.14, 137.82, 132.26, 133.74, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2022', 1662.42, 5984712, 1281227.094, 63.330285714285715, 21.45058064516129, 1289.24),
('PT. KAHOINDAH CITRAGARMENT', 'KAHOINDAH CITRAGARMENT', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 141.776, 119.616, 123.072, 117.15, 134.416, 131.472, 133.872, 141.408, 117.15, 125.584, 132.496, 117.808, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2023', 1535.82, 5528952, 1183656.474, 58.50742857142858, 19.81703225806452, 1191.32),
('PT. KAHOINDAH CITRAGARMENT', 'KAHOINDAH CITRAGARMENT', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 119.728, 100.352, 98.592, 82.368, 128.886, 131.966, 170.18, 152.259, 117.994, 146.126, 130.336, 130.872, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2024', 1509.659, 5434772.4, 1163494.1913, 57.51081904761905, 19.479470967741936, 1170.82),
('PT. KAHOINDAH CITRAGARMENT', 'KAHOINDAH CITRAGARMENT', 'Indonesia', 'Electricity', 'REC', 0, 'kgCO2/MWh', 25.5, 24.2, 22.8, 20.5, 28.2, 30.5, 35.2, 38.5, 32.1, 28.5, 26.8, 30.2, 'MWh', 'IDR', 'Indonesia Green Energy Certificate', '2024', 343.0, 1234800, 0, 0, 0, 0),
('PT. YONGJIN JAVASUKA GARMENT', 'PT. YONGJIN JAVASUKA GARMENT (1공장)', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 117.36, 108.192, 117.424, 85.792, 97.92, 117.456, 113.904, 109.104, 114.256, 109.52, 115.168, 109.296, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2022', 1315.392, 4735411.2, 1013772.614, 50.110171428571434, 16.9728, 1020.58),
('PT. YONGJIN JAVASUKA GARMENT', 'PT. YONGJIN JAVASUKA GARMENT (2,3공장)', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 595.192, 565.376, 711.232, 602.112, 591.392, 759.68, 690.112, 674.464, 614.112, 663.52, 683.52, 679.904, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2022', 7830.616, 28190217.6, 6035055.751, 298.309180952381, 101.0402064516129, 6073.25),
('PT. YONGJIN JAVASUKA GARMENT', 'PT. YONGJIN JAVASUKA GARMENT (1공장)', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 104.528, 113.152, 130.56, 82.24, 113.536, 98, 104.32, 85.712, 105.552, 114.192, 129.472, 114.56, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2023', 1295.824, 4664966.4, 998691.557, 49.36472380952381, 16.72030967741935, 1005.02),
('PT. YONGJIN JAVASUKA GARMENT', 'PT. YONGJIN JAVASUKA GARMENT (2,3공장)', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 724.192, 671.36, 718.56, 435.2, 827.04, 792.248, 858.528, 738.88, 678.36, 756.08, 726, 692.32, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2023', 8618.768, 31027564.8, 6642484.498, 328.33401904761905, 111.20990967741936, 6684.15),
('PT. YONGJIN JAVASUKA GARMENT', 'PT. YONGJIN JAVASUKA GARMENT (1공장)', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 108.967, 114.688, 104.992, 103.264, 138.6416, 140.3936, 98, 129.8288, 143.0336, 169.0976, 142.5408, 152.9744, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2024', 1546.4214, 5567117.04, 1191826.973, 58.91129142857144, 19.953824516129036, 1199.45),
('PT. YONGJIN JAVASUKA GARMENT', 'PT. YONGJIN JAVASUKA GARMENT (2,3공장)', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 742, 621.08, 663.68, 583.6, 812.332, 819.504, 797.248, 961.144, 807.78, 865.089, 808.6234, 854.7804, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2024', 9336.8608, 33612698.88, 7195918.588, 355.68993523809524, 120.47562322580645, 7240.89),
('PT. YONGJIN JAVASUKA GARMENT', 'PT. YONGJIN JAVASUKA GARMENT (2,3공장)', 'Indonesia', 'Electricity', 'PPA', 0, 'kgCO2/MWh', 85.5, 72.2, 78.5, 68.2, 95.5, 98.2, 92.5, 115.8, 95.2, 102.5, 98.5, 105.2, 'MWh', 'IDR', 'Solar PPA Provider Indonesia', '2024', 1107.8, 3988080, 0, 0, 0, 0),
('PT. HJL INDO NETWORKS', 'PT. HJL INDO NETWORKS', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 1.059, 0.707, 1.154, 1.252, 0.884, 1.061, 1.337, 1.137, 1.204, 1.147, 1.11, 1.043, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2022', 13.095, 47142, 10092.316, 0.49885714285714283, 0.16896774193548386, 10.15),
('PT. HJL INDO NETWORKS', 'PT. HJL INDO NETWORKS', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 1.0724, 1.0309, 1.2348, 1.0037, 1.2183, 1.4317, 1.1327, 1.2987, 1.1897, 1.1427, 1.186, 1.0902, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2023', 14.0318, 50514.48, 10814.308, 0.534544761904762, 0.18105548387096776, 10.88),
('PT. HJL INDO NETWORKS', 'PT. HJL INDO NETWORKS', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 1.139, 1.0363, 1.0418, 1.0033, 1.2437, 1.2002, 1.1058, 1.2131, 0.9668, 1.0708, 0.8009, 0.832, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2024', 12.6537, 45553.32, 9752.207, 0.48204571428571436, 0.1632735483870968, 9.81),
('PT.HOGA REKSA GARMENT', 'PT.HOGA REKSA GARMENT', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 172.208, 153.392, 206.144, 234.576, 187.504, 214.352, 215.616, 216.368, 219.536, 197.216, 188.48, 172.624, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2022', 2378.016, 8560857.6, 1832736.931, 90.59108571428573, 30.68407741935484, 1843.52),
('PT.HOGA REKSA GARMENT', 'PT.HOGA REKSA GARMENT', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 174.952, 168.376, 197.208, 127.458, 219.216, 195.541, 198.712, 196.904, 192.31, 220.582, 239.39, 217.043, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2023', 2347.692, 8451691.2, 1809366.224, 89.43588571428572, 30.2928, 1819.85),
('PT.HOGA REKSA GARMENT', 'PT.HOGA REKSA GARMENT', 'Indonesia', 'Electricity', 'Grid Default', 770.78, 'kgCO2/MWh', 245.784, 224.663, 259.904, 211.073, 306.658, 277.377, 316.565, 293.664, 330.514, 376.169, 348.079, 352.116, 'MWh', 'IDR', 'PLN (Perusahaan Listrik Negara)', '2024', 3542.566, 12753237.6, 2730255.616, 134.95489523809525, 45.710529032258066, 2745.25),
('PT.HOGA REKSA GARMENT', 'PT.HOGA REKSA GARMENT', 'Indonesia', 'Electricity', 'Supplier Disclosure', 650.5, 'kgCO2/MWh', 45.2, 42.5, 48.8, 38.5, 55.2, 52.8, 58.5, 55.2, 62.5, 68.2, 65.5, 62.8, 'MWh', 'IDR', 'Industrial Power Provider', '2024', 655.7, 2360520, 426467.85, 24.982476190476192, 8.461864516129032, 429.32),
('㈜엠파파', 'MFAFA Co., Ltd', 'Korea', 'Electricity', 'Grid Default', 465.29, 'kgCO2/MWh', 0.5648, 0.4961333333333333, 0.4504666666666666, 0.4212666666666667, 0.5317333333333334, 0.6534666666666668, 0.8313333333333334, 0.8866666666666666, 0.6337999999999999, 0.3423333333333333, 0.3638, 0.5463333333333333, 'MWh', 'KRW', '한국전력공사 (KEPCO)', '2022', 6.722133333333333, 24199.68, 3127.809, 0.06402031746031746, 0.03469488172043011, 3.14),
('㈜엠파파', 'MFAFA Co., Ltd', 'Korea', 'Electricity', 'Grid Default', 465.29, 'kgCO2/MWh', 0.48113333333333336, 0.4023333333333333, 0.3234666666666666, 0.275, 0.41153333333333336, 0.5851333333333333, 0.6236666666666666, 0.7741333333333333, 0.5221333333333333, 0.2879333333333333, 0.3815333333333334, 0.44739999999999996, 'MWh', 'KRW', '한국전력공사 (KEPCO)', '2023', 5.5154, 19855.44, 2566.316, 0.05252761904761905, 0.028466580645161287, 2.58),
('㈜엠파파', 'MFAFA Co., Ltd', 'Korea', 'Electricity', 'Grid Default', 465.29, 'kgCO2/MWh', 0.47653333333333336, 0.356, 0.3354, 0.2722, 0.3845333333333334, 0.5754, 0.7157333333333333, 0.8114, 0.5432666666666667, 0.333, 0.2991333333333333, 0.4734, 'MWh', 'KRW', '한국전력공사 (KEPCO)', '2024', 5.576, 20073.6, 2594.513, 0.05310476190476191, 0.02877935483870968, 2.6),
('㈜엠파파', 'MFAFA Co., Ltd', 'Korea', 'Electricity', 'REC', 0, 'kgCO2/MWh', 0.2, 0.18, 0.15, 0.12, 0.18, 0.25, 0.32, 0.35, 0.28, 0.15, 0.18, 0.22, 'MWh', 'KRW', 'Korea Renewable Energy Certificate', '2024', 2.58, 9288, 0, 0, 0, 0);
