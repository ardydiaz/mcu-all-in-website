-- Enforce that a service name is unique across the whole directory, not just
-- per category, so the same service can never be entered under two different
-- categories/tabs. Complements the application-level check in SystemModel.

USE mcu_all_in_one;

ALTER TABLE systems
  ADD UNIQUE KEY uq_systems_name (name);
