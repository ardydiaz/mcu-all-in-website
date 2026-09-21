-- Allow a service to expose multiple clickable sub-links (e.g. a Microsoft 365
-- hub card with separate icons for Word, Excel, Outlook, PowerPoint, ...)
-- alongside its normal single URL. NULL keeps a service rendering as a plain
-- single-link card, so this is fully backward compatible.

USE mcu_all_in_one;

ALTER TABLE systems
  ADD COLUMN links JSON NULL AFTER url;
