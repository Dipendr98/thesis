-- Fix for: ERROR: function update_qr_settings_updated_at() does not exist
-- This script updates the qr_settings trigger to use the correct function

-- Drop the existing trigger (if it exists)
DROP TRIGGER IF EXISTS update_qr_settings_updated_at ON qr_settings;

-- Recreate the trigger with the correct function reference
CREATE TRIGGER update_qr_settings_updated_at BEFORE UPDATE ON qr_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
