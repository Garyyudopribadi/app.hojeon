"""
Calculate Scope 2 market-based emissions for DataCollectionYear == 2024.

Usage:
  python scripts/calc_scope2_2024.py --file path/to/your/excel.xlsx

The script will:
  - Read all sheets from the provided Excel file
  - Find the sheet containing `DataCollectionYear` and filter rows for 2024
  - Read REC values from sheet '3-4. (Raw data) Scope 2_RE' (or try to find a similar sheet)
  - Subtract REC MWh from each facility's total purchase MWh (REC assumed zero if missing)
  - Apply country-specific emission factors (kg per MWh) to adjusted MWh
  - Convert kg to tCO2eq using GWP CH4=27, N2O=273 and sum across facilities

The script handles missing files and missing/null cells gracefully.
"""
import argparse
import os
import sys
from typing import Dict, Optional

import pandas as pd


EMISSION_FACTORS: Dict[str, Dict[str, float]] = {
    "indonesia": {
        "co2": 770.7,  # kgCO2 / MWh
        "ch4": 0.038095,  # kgCH4 / MWh
        "n2o": 0.012903,  # kgN2O / MWh
    },
    "korea": {
        "co2": 465.3,
        "ch4": 0.009524,
        "n2o": 0.005161,
    },
}


def find_column(df: pd.DataFrame, candidates):
    """Return the real column name in df matching any candidate (case-insensitive)."""
    # Coerce column names to strings to handle numeric or mixed headers
    cols = {str(c).lower().strip(): c for c in df.columns}
    for cand in candidates:
        key = str(cand).lower().strip()
        if key in cols:
            return cols[key]
    # try fuzzy contains
    for k, original in cols.items():
        for cand in candidates:
            if str(cand).lower().strip() in k:
                return original
    return None


def load_excel_sheets(path: str):
    """Load all sheets and return dict of DataFrames."""
    return pd.read_excel(path, sheet_name=None, engine="openpyxl")


def find_rec_sheet(sheets: Dict[str, pd.DataFrame]) -> Optional[pd.DataFrame]:
    # Try exact name first
    target = "3-4. (Raw data) Scope 2_RE"
    if target in sheets:
        return sheets[target]
    # fallback: find sheet name containing 'scope' and 're'
    for name, df in sheets.items():
        if "scope" in name.lower() and "re" in name.lower():
            return df
    # fallback: any sheet with 'REC' column
    for name, df in sheets.items():
        if find_column(df, ["REC", "REC (MWh)", "REC MWh"]):
            return df
    return None


def get_emission_factors_for_country(country: str):
    if not isinstance(country, str):
        return None
    key = country.strip().lower()
    return EMISSION_FACTORS.get(key)


def numeric(v):
    try:
        if pd.isna(v):
            return 0.0
        return float(v)
    except Exception:
        return 0.0


def main():
    parser = argparse.ArgumentParser(description="Calculate Scope 2 market-based emissions for 2024")
    parser.add_argument("--file", "-f", required=True, help="Path to the Excel file")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    path = args.file
    if not os.path.isfile(path):
        print(f"Error: file not found: {path}")
        sys.exit(2)

    try:
        sheets = load_excel_sheets(path)
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        sys.exit(3)

    data_df = None
    data_sheet_name = None
    # Find sheet that contains the data collection year column (try default header)
    for name, df in sheets.items():
        if find_column(df, ["DataCollectionYear", "Data Collection Year", "Year"]):
            data_df = df.copy()
            data_sheet_name = name
            break

    # Fallback: try the known Scope 2 market raw sheet with a header offset
    if data_df is None and '3-3. (Raw data) Scope 2_Market' in sheets:
        try:
            # observed that the real column labels are on Excel row 5 (index 4)
            data_df = pd.read_excel(path, sheet_name='3-3. (Raw data) Scope 2_Market', header=4, engine='openpyxl')
            data_sheet_name = '3-3. (Raw data) Scope 2_Market'
        except Exception:
            data_df = None

    if data_df is None:
        print("Error: couldn't find a sheet with DataCollectionYear column")
        sys.exit(4)

    # Identify key columns
    year_col = find_column(data_df, ["DataCollectionYear", "Data Collection Year", "Year"])
    facility_col = find_column(data_df, ["Facility", "Facility Name", "Site", "Site Name"])
    total_mwh_col = find_column(data_df, ["Total Purchase Amount (MWh)", "Total Purchase (MWh)", "Total Purchase Amount", "Total (MWh)", "Total MWh"])
    country_col = find_column(data_df, ["Country", "Country/Region", "Country Name"])

    if year_col is None or total_mwh_col is None:
        print("Error: required columns (year or total MWh) not found in data sheet")
        sys.exit(5)

    # Filter year 2024
    try:
        df_2024 = data_df[data_df[year_col].astype(str).str.contains("2024") | (data_df[year_col] == 2024)]
    except Exception:
        # fallback numeric compare
        df_2024 = data_df[data_df[year_col] == 2024]

    if df_2024.shape[0] == 0:
        print("No rows found for DataCollectionYear == 2024")
        print("If your year column uses a different format, check column names and retry.")
        sys.exit(0)

    # If the sheet already contains per-row tCO2eq values, prefer using them
    sheet_tco2_col = find_column(data_df, ["tCO2eq", "t CO2eq", "t CO2 eq", "tCO2_eq", "t CO2eq"])
    if sheet_tco2_col:
        # Sum the sheet-provided tCO2eq for 2024 (these likely come from per-row emission factors)
        total_tco2eq = df_2024[sheet_tco2_col].apply(numeric).sum()
        print(f"Facilities processed: {df_2024.shape[0]}")
        print(f"Total 2024 Scope 2 market-based emissions (tCO2eq) [from sheet '{data_sheet_name}' column '{sheet_tco2_col}']: {total_tco2eq:,.6f}")
        if args.verbose:
            print(df_2024[[sheet_tco2_col]].to_string(index=False))
        return

    # Load REC sheet (if present)
    rec_df = find_rec_sheet(sheets)
    rec_has_facility = False
    rec_facility_col = None
    rec_mwh_col = None
    if rec_df is not None:
        rec_facility_col = find_column(rec_df, ["Facility", "Facility Name", "Site", "Site Name"])
        rec_mwh_col = find_column(rec_df, ["REC", "REC (MWh)", "REC MWh", "REC_MWh", "Total REC (MWh)"])
        if rec_facility_col and rec_mwh_col:
            rec_has_facility = True

    total_tco2eq = 0.0
    results = []

    for idx, row in df_2024.iterrows():
        facility = row[facility_col] if facility_col else f"row_{idx}"
        country = row[country_col] if country_col else None
        total_mwh = numeric(row[total_mwh_col])

        # Get REC for this facility if available
        rec_mwh = 0.0
        if rec_df is not None and rec_has_facility:
            # try to match facility text (case-insensitive)
            try:
                match = rec_df[rec_df[rec_facility_col].astype(str).str.strip().str.lower() == str(facility).strip().lower()]
                if match.shape[0] >= 1:
                    rec_mwh = numeric(match.iloc[0][rec_mwh_col])
            except Exception:
                rec_mwh = 0.0

        adjusted_mwh = max(total_mwh - rec_mwh, 0.0)

        # Convert to MJ (informational) as requested
        total_mj = adjusted_mwh * 3600.0

        factors = get_emission_factors_for_country(country)
        if factors is None:
            # If country isn't one of the specified ones, skip but warn
            print(f"Warning: country not recognized or missing for facility '{facility}' (value='{country}'), skipping.")
            continue

        kgco2 = adjusted_mwh * factors["co2"]
        kgch4 = adjusted_mwh * factors["ch4"]
        kgn2o = adjusted_mwh * factors["n2o"]

        # Global warming potentials
        gwp_ch4 = 27
        gwp_n2o = 273

        tco2eq = (kgco2 + kgch4 * gwp_ch4 + kgn2o * gwp_n2o) / 1000.0
        total_tco2eq += tco2eq

        results.append({
            "facility": facility,
            "country": country,
            "total_mwh": total_mwh,
            "rec_mwh": rec_mwh,
            "adjusted_mwh": adjusted_mwh,
            "total_mj": total_mj,
            "kgco2": kgco2,
            "kgch4": kgch4,
            "kgn2o": kgn2o,
            "tco2eq": tco2eq,
        })

    # Print summary
    print(f"Facilities processed: {len(results)}")
    print(f"Total 2024 Scope 2 market-based emissions (tCO2eq): {total_tco2eq:,.3f}")

    # If verbose, show breakdown
    if args.verbose:
        df_out = pd.DataFrame(results)
        print(df_out.to_string(index=False))


if __name__ == "__main__":
    main()
