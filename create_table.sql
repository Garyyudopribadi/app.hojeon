CREATE TABLE business_sites (
  id SERIAL PRIMARY KEY,
  no INTEGER,
  name_of_entity TEXT,
  name_of_facility TEXT,
  country TEXT,
  business_type TEXT,
  lease_status TEXT,
  detailed_address TEXT,
  area TEXT,
  ghg_sources TEXT,
  management_tools_status TEXT,
  department_in_charge TEXT,
  contact_information TEXT
);