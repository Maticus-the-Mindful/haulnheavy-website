// Supabase Integration for Hauln' Heavy Estimator
// API functions to interact with your equipment database

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client lazily to avoid build-time issues
let supabaseClient: any = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
};

// Types matching your database structure
export interface EquipmentCategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  sort_order: number;
}

export interface EquipmentManufacturer {
  id: string;
  manufacturer_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface EquipmentModel {
  id: string;
  model_id: string;
  name: string;
  manufacturer_id: string;
  category_id: string;
  typical_weight_lbs?: number;
  typical_length_ft?: number;
  typical_width_ft?: number;
  typical_height_ft?: number;
  is_active: boolean;
}

export interface EstimateRequest {
  id: string;
  request_id: string;
  category: 'equipment' | 'freight';
  equipment_category?: string;
  manufacturer?: string;
  model?: string;
  year?: string;
  quantity: number;
  weight_lbs?: number;
  dimensions?: {
    length: { feet: number; inches: number };
    width: { feet: number; inches: number };
    height: { feet: number; inches: number };
  };
  has_hazmat_placards?: boolean;
  transportation_method?: 'hauled' | 'towed' | 'driven';
  pickup_location?: any;
  dropoff_location?: any;
  scheduling?: any;
  contact_info?: any;
  additional_info?: any;
  estimated_price?: number;
  status: 'pending' | 'quoted' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

// ==============================================
// EQUIPMENT DATABASE QUERIES
// ==============================================

/**
 * Get all equipment categories
 */
export async function getAllCategories(): Promise<EquipmentCategory[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('equipment_categories')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get all manufacturers (no categories needed)
 */
export async function getAllManufacturers(): Promise<EquipmentManufacturer[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .rpc('get_all_manufacturers');

  if (error) {
    console.error('Error fetching manufacturers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get models for a specific manufacturer (no categories needed)
 */
export async function getModelsByManufacturer(manufacturerId: string): Promise<EquipmentModel[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .rpc('get_models_by_manufacturer', { man_id: manufacturerId });

  if (error) {
    console.error('Error fetching models:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a specific model with its dimensions and weight
 */
export async function getModelDetails(
  manufacturerId: string,
  categoryId: string,
  modelId: string
): Promise<EquipmentModel | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('equipment_models')
    .select('*')
    .eq('manufacturer_id', manufacturerId)
    .eq('category_id', categoryId)
    .eq('model_id', modelId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching model details:', error);
    return null;
  }

  return data;
}

// ==============================================
// ESTIMATE REQUEST QUERIES
// ==============================================

/**
 * Create a new estimate request
 */
export async function createEstimateRequest(requestData: Partial<EstimateRequest>): Promise<EstimateRequest> {
  // Generate unique request ID
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('estimate_requests')
    .insert([{
      ...requestData,
      request_id: requestId
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating estimate request:', error);
    throw error;
  }

  return data;
}

/**
 * Get estimate request by ID
 */
export async function getEstimateRequest(requestId: string): Promise<EstimateRequest | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('estimate_requests')
    .select('*')
    .eq('request_id', requestId)
    .single();

  if (error) {
    console.error('Error fetching estimate request:', error);
    return null;
  }

  return data;
}

/**
 * Update estimate request status
 */
export async function updateEstimateRequestStatus(
  requestId: string,
  status: EstimateRequest['status'],
  estimatedPrice?: number
): Promise<EstimateRequest> {
  const updateData: any = { status };
  if (estimatedPrice !== undefined) {
    updateData.estimated_price = estimatedPrice;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('estimate_requests')
    .update(updateData)
    .eq('request_id', requestId)
    .select()
    .single();

  if (error) {
    console.error('Error updating estimate request:', error);
    throw error;
  }

  return data;
}

/**
 * Get recent estimate requests (for admin dashboard)
 */
export async function getRecentEstimateRequests(limit: number = 50): Promise<EstimateRequest[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('estimate_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent requests:', error);
    throw error;
  }

  return data || [];
}

// ==============================================
// ANALYTICS QUERIES
// ==============================================

/**
 * Get equipment category usage statistics
 */
export async function getCategoryUsageStats(): Promise<any[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('estimate_requests')
    .select('equipment_category')
    .not('equipment_category', 'is', null);

  if (error) {
    console.error('Error fetching category stats:', error);
    throw error;
  }

  // Count occurrences of each category
  const categoryCounts: Record<string, number> = {};
  data?.forEach((request: any) => {
    if (request.equipment_category) {
      categoryCounts[request.equipment_category] = (categoryCounts[request.equipment_category] || 0) + 1;
    }
  });

  return Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count
  }));
}

/**
 * Get manufacturer usage statistics
 */
export async function getManufacturerUsageStats(): Promise<any[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('estimate_requests')
    .select('manufacturer')
    .not('manufacturer', 'is', null);

  if (error) {
    console.error('Error fetching manufacturer stats:', error);
    throw error;
  }

  // Count occurrences of each manufacturer
  const manufacturerCounts: Record<string, number> = {};
  data?.forEach((request: any) => {
    if (request.manufacturer) {
      manufacturerCounts[request.manufacturer] = (manufacturerCounts[request.manufacturer] || 0) + 1;
    }
  });

  return Object.entries(manufacturerCounts).map(([manufacturer, count]) => ({
    manufacturer,
    count
  }));
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Search equipment models by name
 */
export async function searchModels(query: string, categoryId?: string): Promise<EquipmentModel[]> {
  const supabase = getSupabaseClient();
  let queryBuilder = supabase
    .from('equipment_models')
    .select(`
      *,
      equipment_manufacturers(name),
      equipment_categories(name)
    `)
    .ilike('name', `%${query}%`)
    .eq('is_active', true);

  if (categoryId) {
    queryBuilder = queryBuilder.eq('category_id', categoryId);
  }

  const { data, error } = await queryBuilder.limit(20);

  if (error) {
    console.error('Error searching models:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get equipment database statistics
 */
export async function getDatabaseStats(): Promise<{
  totalCategories: number;
  totalManufacturers: number;
  totalModels: number;
  totalRequests: number;
}> {
  const supabase = getSupabaseClient();
  const [categoriesResult, manufacturersResult, modelsResult, requestsResult] = await Promise.all([
    supabase.from('equipment_categories').select('id', { count: 'exact', head: true }),
    supabase.from('equipment_manufacturers').select('id', { count: 'exact', head: true }),
    supabase.from('equipment_models').select('id', { count: 'exact', head: true }),
    supabase.from('estimate_requests').select('id', { count: 'exact', head: true })
  ]);

  return {
    totalCategories: categoriesResult.count || 0,
    totalManufacturers: manufacturersResult.count || 0,
    totalModels: modelsResult.count || 0,
    totalRequests: requestsResult.count || 0
  };
}
