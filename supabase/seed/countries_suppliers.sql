-- Seed countries and suppliers with defaults used by the scope2 market calculations
INSERT INTO countries (id, name, t_and_d_loss_factor, ch4_ef_per_mj, n2o_ef_per_mj)
VALUES
  ('Korea', 'Korea', 1.0, 0.00000265, 0.00000143),
  ('Indonesia', 'Indonesia', 1.12186042, 0.0000106, 0.00000359)
ON CONFLICT (id) DO NOTHING;

-- Example suppliers (default EF in kgCO2/MWh)
INSERT INTO suppliers (name, default_ef_kg_per_mwh, country_id)
VALUES
  ('한국전력공사 (KEPCO)', 465.29, 'Korea'),
  ('PLN (Perusahaan Listrik Negara)', 770.78, 'Indonesia')
ON CONFLICT (name) DO NOTHING;
