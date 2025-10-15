-- Supabase Cleanup Script - Remove Category Dependencies
-- Run this after confirming you want to remove category-related functionality

-- ==============================================
-- DROP VIEWS FIRST (they depend on tables)
-- ==============================================

-- Drop views that depend on category tables
DROP VIEW IF EXISTS "public"."category_with_manufacturers";
DROP VIEW IF EXISTS "public"."manufacturer_with_models";

-- ==============================================
-- DROP FUNCTIONS THAT USE CATEGORIES
-- ==============================================

-- Drop functions that depend on categories
DROP FUNCTION IF EXISTS "public"."get_manufacturers_by_category"(cat_id text);
DROP FUNCTION IF EXISTS "public"."get_models_by_manufacturer_and_category"(man_id text, cat_id text);

-- ==============================================
-- CLEAN UP REMAINING TABLES FIRST
-- ==============================================

-- Remove category_id column from equipment_models table
-- (This will also remove the foreign key constraint)
ALTER TABLE "public"."equipment_models" DROP COLUMN IF EXISTS "category_id";

-- ==============================================
-- DROP CATEGORY-RELATED TABLES
-- ==============================================

-- Drop the junction table first (has foreign keys)
DROP TABLE IF EXISTS "public"."category_manufacturers" CASCADE;

-- Drop the main category table (now safe since foreign key is removed)
DROP TABLE IF EXISTS "public"."equipment_categories" CASCADE;

-- ==============================================
-- CREATE SIMPLIFIED FUNCTIONS (Optional)
-- ==============================================

-- Create a simple function to get all manufacturers (no categories needed)
CREATE OR REPLACE FUNCTION "public"."get_all_manufacturers"()
RETURNS TABLE (
  id uuid,
  manufacturer_id text,
  name text,
  sort_order integer,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    em.id,
    em.manufacturer_id,
    em.name,
    em.sort_order,
    em.is_active
  FROM equipment_manufacturers em
  WHERE em.is_active = true
  ORDER BY em.sort_order, em.name;
END;
$$;

-- Create a simple function to get models by manufacturer only
CREATE OR REPLACE FUNCTION "public"."get_models_by_manufacturer"(man_id text)
RETURNS TABLE (
  id uuid,
  model_id text,
  name text,
  manufacturer_id text,
  typical_weight_lbs integer,
  typical_length_ft numeric,
  typical_width_ft numeric,
  typical_height_ft numeric,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    em.id,
    em.model_id,
    em.name,
    em.manufacturer_id,
    em.typical_weight_lbs,
    em.typical_length_ft,
    em.typical_width_ft,
    em.typical_height_ft,
    em.is_active
  FROM equipment_models em
  WHERE em.manufacturer_id = man_id 
    AND em.is_active = true
  ORDER BY em.name;
END;
$$;

-- ==============================================
-- UPDATE RLS POLICIES (if needed)
-- ==============================================

-- Enable RLS on remaining tables if not already enabled
ALTER TABLE "public"."equipment_manufacturers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."equipment_models" ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (if not already exists)
DO $$
BEGIN
  -- Equipment manufacturers policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'equipment_manufacturers' 
    AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access" ON "public"."equipment_manufacturers"
    FOR SELECT USING (true);
  END IF;

  -- Equipment models policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'equipment_models' 
    AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access" ON "public"."equipment_models"
    FOR SELECT USING (true);
  END IF;
END $$;

-- ==============================================
-- SUMMARY
-- ==============================================

-- After running this script, your database will have:
-- ✅ equipment_manufacturers (simplified)
-- ✅ equipment_models (no category_id column)
-- ✅ estimate_requests (unchanged)
-- ❌ equipment_categories (removed)
-- ❌ category_manufacturers (removed)
-- ❌ category_with_manufacturers view (removed)
-- ❌ manufacturer_with_models view (removed)
-- ❌ Category-dependent functions (removed)
-- ✅ New simplified functions for direct manufacturer/model access

-- This reduces complexity and improves performance since we're not using categories anymore!
