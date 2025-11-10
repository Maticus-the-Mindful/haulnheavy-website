// Equipment Data Loader - Loads equipment specifications from CSV
// This provides real manufacturer data without database dependencies

export interface EquipmentSpec {
  year_range: string;
  make: string;
  model: string;
  weight_lbs: number;
  length_ft: number;
  width_ft: number;
  height_ft: number;
}

export interface ManufacturerData {
  id: string;
  manufacturer_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface ModelData {
  id: string;
  model_id: string;
  name: string;
  manufacturer_id: string;
  typical_weight_lbs: number;
  typical_length_ft: number;
  typical_width_ft: number;
  typical_height_ft: number;
  year_range: string;
  is_active: boolean;
}

// Parse CSV data
function parseCSV(csvText: string): EquipmentSpec[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      year_range: values[0],
      make: values[1],
      model: values[2],
      weight_lbs: parseInt(values[3]),
      length_ft: parseFloat(values[4]),
      width_ft: parseFloat(values[5]),
      height_ft: parseFloat(values[6])
    };
  });
}

// Load equipment data from CSV
export async function loadEquipmentData(): Promise<{
  manufacturers: ManufacturerData[];
  models: ModelData[];
}> {
  try {
    // Load CSV from public folder
    const response = await fetch('/hauln_heavy_equipment_complete_specs.csv');
    if (!response.ok) {
      throw new Error('Failed to load equipment data');
    }
    
    const csvText = await response.text();
    const specs = parseCSV(csvText);
    
    // Extract unique manufacturers
    const manufacturerMap = new Map<string, string>();
    specs.forEach(spec => {
      if (!manufacturerMap.has(spec.make)) {
        manufacturerMap.set(spec.make, spec.make.toLowerCase().replace(/\s/g, '-'));
      }
    });
    
    // Create manufacturers array
    const manufacturers: ManufacturerData[] = Array.from(manufacturerMap.entries()).map(([name, id], index) => ({
      id: `manufacturer-${index + 1}`,
      manufacturer_id: id,
      name,
      sort_order: index + 1,
      is_active: true
    }));
    
    // Sort manufacturers alphabetically
    manufacturers.sort((a, b) => a.name.localeCompare(b.name));
    
    // Create models array
    const models: ModelData[] = specs.map((spec, index) => ({
      id: `model-${index + 1}`,
      model_id: `${spec.make.toLowerCase().replace(/\s/g, '-')}-${spec.model.toLowerCase().replace(/\s/g, '-')}`,
      name: spec.model,
      manufacturer_id: manufacturerMap.get(spec.make)!,
      typical_weight_lbs: spec.weight_lbs,
      typical_length_ft: spec.length_ft,
      typical_width_ft: spec.width_ft,
      typical_height_ft: spec.height_ft,
      year_range: spec.year_range,
      is_active: true
    }));
    
    return { manufacturers, models };
  } catch (error) {
    console.error('Error loading equipment data:', error);
    throw error;
  }
}

// Get manufacturers by name (for filtering)
export function getManufacturersByName(manufacturers: ManufacturerData[], searchTerm: string): ManufacturerData[] {
  return manufacturers.filter(manufacturer => 
    manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// Get models by manufacturer
export function getModelsByManufacturer(models: ModelData[], manufacturerId: string): ModelData[] {
  return models.filter(model => model.manufacturer_id === manufacturerId);
}

// Get model by ID
export function getModelById(models: ModelData[], modelId: string): ModelData | undefined {
  return models.find(model => model.model_id === modelId);
}

// Validate year against model year range
export function validateYear(year: string, model: ModelData): boolean {
  if (!year || !model.year_range) return true;
  
  const yearNum = parseInt(year);
  const [startYear, endYear] = model.year_range.split('-').map(y => parseInt(y));
  
  return yearNum >= startYear && yearNum <= endYear;
}
