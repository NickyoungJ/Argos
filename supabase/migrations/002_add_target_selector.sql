-- Add target_selector column to monitors table
-- This allows users to specify a CSS selector to monitor only a specific part of the page

ALTER TABLE monitors ADD COLUMN target_selector TEXT;

-- Add comment for documentation
COMMENT ON COLUMN monitors.target_selector IS 'CSS selector to focus monitoring on a specific element (e.g., ".price-area")';

-- Create index for queries filtering by target_selector
CREATE INDEX idx_monitors_target_selector ON monitors(target_selector) WHERE target_selector IS NOT NULL;

