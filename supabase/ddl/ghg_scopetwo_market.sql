-- ==========================================
-- Supabase SQL Schema for GHG Scope Two Market
-- Generated: 2025-12-04
-- Data Source: Hojeon Limited_Scope 1, 2 emissions calculation.xlsx
-- Sheet: 3-3. (Raw data) Scope 2_Market
-- ==========================================

-- Drop tables if exists (for clean recreation)
DROP TABLE IF EXISTS public.ghg_scopetwo_market_emission_factors CASCADE;
DROP TABLE IF EXISTS public.ghg_scopetwo_market CASCADE;

-- ==========================================
-- Table 1: Emission Factors Reference Table
-- This table stores all emission factors needed for Scope 2 Market calculations
-- ==========================================
CREATE TABLE public.ghg_scopetwo_market_emission_factors (
    id BIGSERIAL PRIMARY KEY,
    
    -- Reference Information
    country TEXT NOT NULL,
    classification TEXT NOT NULL, -- 'Electricity' or 'Steam'
    supplier_name TEXT, -- NULL for grid default factors
    contractual_instrument TEXT, -- 'Grid Default', 'REC', 'PPA', 'Green Tariff', etc.
    
    -- Emission Factors (per MJ basis)
    co2_factor NUMERIC(15,10), -- kgCO2/MJ
    ch4_factor NUMERIC(15,10), -- kgCH4/MJ
    n2o_factor NUMERIC(15,10), -- kgN2O/MJ
    
    -- Additional Factors
    td_loss_multiplier NUMERIC(10,6) DEFAULT 1.0, -- Transmission & Distribution loss multiplier
    gwp_ch4 INTEGER, -- Global Warming Potential for CH4
    gwp_n2o INTEGER, -- Global Warming Potential for N2O
    
    -- Validity Period
    valid_from DATE,
    valid_to DATE,
    
    -- Metadata
    source TEXT, -- Source of the emission factor (e.g., 'IEA 2022', 'EPA', 'Supplier Certificate')
    -- Archived: ghg_scopetwo_market SQL schema
    -- The Scope Two - Market schema has been archived. Do not execute this file
    -- against production databases. Retrieve the original schema from version
    -- control if you need to restore the feature.
    -- Unique constraint
