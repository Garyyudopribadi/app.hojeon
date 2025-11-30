# Scope 2 Market Data Correction Summary

## Date: November 30, 2025

## Problem Identified
Mock data dalam file `mock_data_ts.txt` memiliki kesalahan pada 3 baris data dibandingkan dengan Excel source file "Hojeon Limited_Scope 1, 2 emissions calculation.xlsx" sheet "3-3. (Raw data) Scope 2_Market".

## Analysis Results

### Total Differences Found: 26 fields across 3 rows

#### Row 8 - PT. KAHOINDAH CITRAGARMENT (2024)
**9 fields incorrect:**
- october: Mock had 146.126, Excel has 84.126 (difference: -62 MWh)
- november: Mock had 130.336, Excel has 68.336 (difference: -62 MWh)
- december: Mock had 130.872, Excel has 6.872 (difference: -124 MWh)
- total_amount: Mock had 1509.659, Excel has 1261.659 (difference: -248 MWh)
- total_mj: Mock had 5,434,772.4, Excel has 4,541,972.4 (difference: -892,800 MJ)
- kgCO2: Mock had 1,163,494.19, Excel has 972,360.59 (difference: -191,133.6 kg)
- kgCH4: Mock had 57.51, Excel has 48.06 (difference: -9.45 kg)
- kgN2O: Mock had 19.48, Excel has 16.28 (difference: -3.2 kg)
- tCO2eq: Mock had 1313.40, Excel has 1097.64 (difference: -215.76 tCO2eq)

#### Row 15 - PT. YONGJIN JAVASUKA GARMENT (1공장) (2024)
**8 fields incorrect:**
- november: Mock had 142.541, Excel has 67.541 (difference: -75 MWh)
- december: Mock had 152.974, Excel has 77.974 (difference: -75 MWh)
- total_amount: Mock had 1546.421, Excel has 1396.421 (difference: -150 MWh)
- total_mj: Mock had 5,567,117.04, Excel has 5,027,117.04 (difference: -540,000 MJ)
- kgCO2: Mock had 1,191,826.97, Excel has 1,076,221.97 (difference: -115,605 kg)
- kgCH4: Mock had 58.91, Excel has 53.20 (difference: -5.71 kg)
- kgN2O: Mock had 19.95, Excel has 18.02 (difference: -1.93 kg)
- tCO2eq: Mock had 1345.39, Excel has 1214.89 (difference: -130.5 tCO2eq)

#### Row 16 - PT. YONGJIN JAVASUKA GARMENT (2,3공장) (2024)
**9 fields incorrect:**
- october: Mock had 865.089, Excel has 712.467 (difference: -152.62 MWh)
- november: Mock had 808.623, Excel has 350.247 (difference: -458.38 MWh)
- december: Mock had 854.780, Excel has 423.642 (difference: -431.14 MWh)
- total_amount: Mock had 9336.861, Excel has 8294.725 (difference: -1042.14 MWh)
- total_mj: Mock had 33,612,698.74, Excel has 29,861,009.50 (difference: -3,751,689 MJ)
- kgCO2: Mock had 7,195,918.59, Excel has 6,392,744.45 (difference: -803,174 kg)
- kgCH4: Mock had 355.69, Excel has 315.99 (difference: -39.7 kg)
- kgN2O: Mock had 120.48, Excel has 107.03 (difference: -13.45 kg)
- tCO2eq: Mock had 8123.07, Excel has 7216.41 (difference: -906.66 tCO2eq)

## Total Impact
- **Total MWh difference**: -1,440.14 MWh
- **Total tCO2eq difference**: -1,252.92 tCO2eq (approximately 3.4% of total scope 2 market emissions)

## Actions Taken

1. **Created analysis script** (`compare_scope2_market_data.py`):
   - Reads Excel file directly from source
   - Parses existing mock data
   - Compares all 28 rows field-by-field
   - Generates detailed difference report
   - Creates corrected mock data file

2. **Updated mock data** (`mock_data_ts.txt`):
   - Corrected Row 8 (PT. KAHOINDAH CITRAGARMENT 2024)
   - Corrected Row 15 (PT. YONGJIN JAVASUKA GARMENT 1공장 2024)
   - Corrected Row 16 (PT. YONGJIN JAVASUKA GARMENT 2,3공장 2024)

3. **Verification** (`verify_mock_data.py`):
   - Confirmed all 28 rows now match Excel source
   - Zero differences remaining
   - All empty rows (Row 5, 7) preserved as requested

## Verification Results
✅ **Status: ALL DATA MATCHES PERFECTLY!**
- Total rows checked: 28
- Total mock records: 28
- Total differences: 0

## Files Modified
1. `data/mock_data_ts.txt` - Main mock data file (corrected)
2. `data/mock_data_ts_corrected.txt` - New corrected version (backup)

## Files Created
1. `compare_scope2_market_data.py` - Detailed comparison script
2. `verify_mock_data.py` - Quick verification script
3. `SCOPE2_MARKET_DATA_CORRECTION_SUMMARY.md` - This summary

## Notes
- Empty rows (Row 5 and 7) with zero values were preserved as per requirement
- All decimal precision maintained from Excel source
- Monthly values (January-December) verified for all rows
- All calculated fields (total_amount, total_mj, kgCO2, kgCH4, kgN2O, tCO2eq) verified

## Recommendation
The corrected mock data is now accurate and ready for use in the application. Consider:
1. Running the verification script periodically if Excel source data changes
2. Implementing automated data sync from Excel to prevent future discrepancies
3. Adding unit tests to catch similar data inconsistencies
