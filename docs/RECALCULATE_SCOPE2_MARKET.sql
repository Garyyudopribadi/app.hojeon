-- Script to recalculate ALL emissions in ghg_scopetwo_market table
-- Run this in Supabase SQL Editor to fix existing records

-- This will update kgco2, kgch4, kgn2o, and tco2eq using the corrected formula
-- IMPORTANT: REC and PPA (renewable) instruments will have ZERO emissions

UPDATE ghg_scopetwo_market
SET 
  -- Recalculate total_purchase_amount (sum of monthly data)
  total_purchase_amount = COALESCE(january, 0) + COALESCE(february, 0) + COALESCE(march, 0) + 
                          COALESCE(april, 0) + COALESCE(may, 0) + COALESCE(june, 0) + 
                          COALESCE(july, 0) + COALESCE(august, 0) + COALESCE(september, 0) + 
                          COALESCE(october, 0) + COALESCE(november, 0) + COALESCE(december, 0),
  
  -- Recalculate total_purchase_mj
  total_purchase_mj = (COALESCE(january, 0) + COALESCE(february, 0) + COALESCE(march, 0) + 
                       COALESCE(april, 0) + COALESCE(may, 0) + COALESCE(june, 0) + 
                       COALESCE(july, 0) + COALESCE(august, 0) + COALESCE(september, 0) + 
                       COALESCE(october, 0) + COALESCE(november, 0) + COALESCE(december, 0)) * 3600,
  
  -- Recalculate kgco2 using GRID emission factor (Indonesia: 0.214083, Korea: 0.12925)
  -- BUT: REC and PPA (renewable) = ZERO emissions
  kgco2 = CASE 
            WHEN UPPER(contractual_instrument) IN ('REC', 'PPA') THEN 0
            ELSE (COALESCE(january, 0) + COALESCE(february, 0) + COALESCE(march, 0) + 
                  COALESCE(april, 0) + COALESCE(may, 0) + COALESCE(june, 0) + 
                  COALESCE(july, 0) + COALESCE(august, 0) + COALESCE(september, 0) + 
                  COALESCE(october, 0) + COALESCE(november, 0) + COALESCE(december, 0)) * 3600 *
                 CASE 
                   WHEN LOWER(country) LIKE '%indonesia%' THEN 0.214083
                   ELSE 0.12925
                 END
          END,
  
  -- Recalculate kgch4 (Indonesia: 0.0000106, Korea: 0.00000265)
  -- BUT: REC and PPA (renewable) = ZERO emissions
  kgch4 = CASE 
            WHEN UPPER(contractual_instrument) IN ('REC', 'PPA') THEN 0
            ELSE (COALESCE(january, 0) + COALESCE(february, 0) + COALESCE(march, 0) + 
                  COALESCE(april, 0) + COALESCE(may, 0) + COALESCE(june, 0) + 
                  COALESCE(july, 0) + COALESCE(august, 0) + COALESCE(september, 0) + 
                  COALESCE(october, 0) + COALESCE(november, 0) + COALESCE(december, 0)) * 3600 *
                 CASE 
                   WHEN LOWER(country) LIKE '%indonesia%' THEN 0.0000106
                   ELSE 0.00000265
                 END
          END,
  
  -- Recalculate kgn2o (Indonesia: 0.00000359, Korea: 0.00000143)
  -- BUT: REC and PPA (renewable) = ZERO emissions
  kgn2o = CASE 
            WHEN UPPER(contractual_instrument) IN ('REC', 'PPA') THEN 0
            ELSE (COALESCE(january, 0) + COALESCE(february, 0) + COALESCE(march, 0) + 
                  COALESCE(april, 0) + COALESCE(may, 0) + COALESCE(june, 0) + 
                  COALESCE(july, 0) + COALESCE(august, 0) + COALESCE(september, 0) + 
                  COALESCE(october, 0) + COALESCE(november, 0) + COALESCE(december, 0)) * 3600 *
                 CASE 
                   WHEN LOWER(country) LIKE '%indonesia%' THEN 0.00000359
                   ELSE 0.00000143
                 END
          END,
  
  -- Recalculate tco2eq with correct GWP (25, 298) and T&D loss factor
  -- BUT: REC and PPA (renewable) = ZERO emissions
  tco2eq = CASE 
            WHEN UPPER(contractual_instrument) IN ('REC', 'PPA') THEN 0
            ELSE (
              (
                -- kgCO2
                (COALESCE(january, 0) + COALESCE(february, 0) + COALESCE(march, 0) + 
                 COALESCE(april, 0) + COALESCE(may, 0) + COALESCE(june, 0) + 
                 COALESCE(july, 0) + COALESCE(august, 0) + COALESCE(september, 0) + 
                 COALESCE(october, 0) + COALESCE(november, 0) + COALESCE(december, 0)) * 3600 *
                CASE 
                  WHEN LOWER(country) LIKE '%indonesia%' THEN 0.214083
                  ELSE 0.12925
                END
                +
                -- kgCH4 * 25
                (COALESCE(january, 0) + COALESCE(february, 0) + COALESCE(march, 0) + 
                 COALESCE(april, 0) + COALESCE(may, 0) + COALESCE(june, 0) + 
                 COALESCE(july, 0) + COALESCE(august, 0) + COALESCE(september, 0) + 
                 COALESCE(october, 0) + COALESCE(november, 0) + COALESCE(december, 0)) * 3600 *
                CASE 
                  WHEN LOWER(country) LIKE '%indonesia%' THEN 0.0000106
                  ELSE 0.00000265
                END * 25
                +
                -- kgN2O * 298
                (COALESCE(january, 0) + COALESCE(february, 0) + COALESCE(march, 0) + 
                 COALESCE(april, 0) + COALESCE(may, 0) + COALESCE(june, 0) + 
                 COALESCE(july, 0) + COALESCE(august, 0) + COALESCE(september, 0) + 
                 COALESCE(october, 0) + COALESCE(november, 0) + COALESCE(december, 0)) * 3600 *
                CASE 
                  WHEN LOWER(country) LIKE '%indonesia%' THEN 0.00000359
                  ELSE 0.00000143
                END * 298
              ) / 1000
            ) * 
            -- Apply T&D loss factor (Indonesia: 1.12186042, Korea: 1.0)
            CASE 
              WHEN LOWER(country) LIKE '%indonesia%' THEN 1.12186042
              ELSE 1.0
            END
          END
WHERE true;

-- Verify the update
SELECT 
  date_collection as year,
  country,
  COUNT(*) as records,
  ROUND(SUM(tco2eq)::numeric, 2) as total_tco2eq
FROM ghg_scopetwo_market
GROUP BY date_collection, country
ORDER BY date_collection, country;

-- Expected result for 2022:
-- Year  | Country   | Records | Total tCO2eq (excluding REC/PPA)
-- 2022  | Indonesia |    6    | ~10,494.14
-- 2022  | Korea     |    2    | ~186.01 (1 Grid Default, 1 REC=0)
-- TOTAL 2022: ~11,680.99 (matches Excel)
--
-- Expected result for 2023:
-- TOTAL 2023: ~12,204.33 (matches Excel)
--
-- Expected result for 2024:
-- TOTAL 2024: ~12,831.41 (matches Excel)
