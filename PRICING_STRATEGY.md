# HAULN' HEAVY PRICING STRATEGY
## How to Generate Accurate Cost Estimates

---

## 🎯 CURRENT SYSTEM

### What's Already Working:
```typescript
// From EstimatorModal.tsx (lines 114-218)
const calculateEstimate = (data: EstimateData): EstimateResult => {
  const baseRate = 2.50; // per mile
  const estimatedMiles = 500; // hardcoded placeholder
  let baseCost = baseRate * estimatedMiles;

  // Weight adjustments
  if (itemData.weight > 10000) {
    baseCost *= 1.2; // 20% surcharge
  }

  // Oversize adjustments
  if (totalLength > 48 || totalWidth > 8.5 || totalHeight > 13.5) {
    oversizeFee = baseCost * 0.5; // 50% oversize fee
  }

  // Fuel surcharge: 15%
  // Hazmat fee (if applicable)
}
```

---

## 🚀 RECOMMENDED ENHANCEMENTS

### 1. **REAL DISTANCE CALCULATION**
Replace hardcoded 500 miles with actual distance:

```typescript
// Add to your API or use a service
async function calculateDistance(pickup: string, dropoff: string) {
  // Option A: Google Maps Distance Matrix API
  // Option B: MapQuest Directions API (free tier)
  // Option C: OpenRouteService (open source)
  
  const response = await fetch(
    `https://router.project-osm.org/route/v1/driving/${pickup};${dropoff}?overview=false`
  );
  const data = await response.json();
  const distanceMiles = data.routes[0].distance * 0.000621371; // meters to miles
  return distanceMiles;
}
```

### 2. **EQUIPMENT-BASED PRICING**
Use actual equipment specs from your Supabase database:

```sql
-- Add pricing_tier to equipment_models table
ALTER TABLE equipment_models 
ADD COLUMN pricing_tier VARCHAR(20) DEFAULT 'standard';

-- Tiers: 'light', 'standard', 'heavy', 'superheavy'
-- Based on weight:
-- light: < 10,000 lbs
-- standard: 10,000 - 30,000 lbs
-- heavy: 30,000 - 60,000 lbs
-- superheavy: > 60,000 lbs
```

### 3. **DYNAMIC BASE RATES**
Create a pricing table in Supabase:

```sql
CREATE TABLE pricing_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rate_type VARCHAR(50) NOT NULL,
  rate_value NUMERIC(10,2) NOT NULL,
  effective_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example rates
INSERT INTO pricing_rates (rate_type, rate_value) VALUES
('base_rate_per_mile', 2.50),
('fuel_surcharge_percent', 15.00),
('weight_surcharge_light', 0.00),      -- < 10k lbs: no charge
('weight_surcharge_standard', 20.00),   -- 10k-30k: +20%
('weight_surcharge_heavy', 40.00),      -- 30k-60k: +40%
('weight_surcharge_superheavy', 75.00), -- > 60k: +75%
('oversize_fee_percent', 50.00),
('hazmat_fee_flat', 500.00),
('residential_pickup_fee', 150.00),
('residential_dropoff_fee', 150.00),
('rush_service_percent', 25.00),        -- < 3 days notice
('weekend_service_flat', 300.00);
```

### 4. **LOCATION-BASED ADJUSTMENTS**
Add regional pricing:

```sql
CREATE TABLE regional_multipliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  state_code VARCHAR(2) NOT NULL,
  multiplier NUMERIC(4,2) DEFAULT 1.00,
  notes TEXT
);

-- Example: Urban/rural, permit costs, toll roads
INSERT INTO regional_multipliers (state_code, multiplier, notes) VALUES
('CA', 1.25, 'High permit costs, traffic'),
('NY', 1.30, 'High toll roads, urban congestion'),
('TX', 1.00, 'Standard rates'),
('MT', 0.95, 'Rural discount');
```

### 5. **TIME-BASED PRICING**
Add urgency fees:

```typescript
function calculateUrgencyFee(pickupDate: Date, baseCost: number): number {
  const daysUntilPickup = Math.floor(
    (pickupDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilPickup < 3) {
    return baseCost * 0.25; // 25% rush fee
  } else if (daysUntilPickup < 7) {
    return baseCost * 0.10; // 10% short notice
  }
  return 0;
}
```

---

## 📊 ENHANCED CALCULATION FORMULA

```typescript
async function calculateEnhancedEstimate(data: EstimateData): Promise<EstimateResult> {
  // 1. Get pricing rates from Supabase
  const rates = await supabase
    .from('pricing_rates')
    .select('*')
    .eq('is_active', true);
  
  // 2. Calculate actual distance
  const distance = await calculateDistance(
    data.locations.pickup.address,
    data.locations.dropoff.address
  );
  
  // 3. Get base rate per mile
  const baseRatePerMile = rates.find(r => r.rate_type === 'base_rate_per_mile')?.rate_value || 2.50;
  let baseCost = baseRatePerMile * distance;
  
  // 4. Weight-based surcharge
  const weight = data.equipment?.weight || data.freight?.weight || 0;
  let weightSurcharge = 0;
  if (weight > 60000) {
    weightSurcharge = baseCost * 0.75; // superheavy: +75%
  } else if (weight > 30000) {
    weightSurcharge = baseCost * 0.40; // heavy: +40%
  } else if (weight > 10000) {
    weightSurcharge = baseCost * 0.20; // standard: +20%
  }
  
  // 5. Dimensional surcharge (oversize)
  const dims = data.equipment?.dimensions || data.freight?.dimensions;
  const length = dims.length.feet + (dims.length.inches / 12);
  const width = dims.width.feet + (dims.width.inches / 12);
  const height = dims.height.feet + (dims.height.inches / 12);
  
  let oversizeFee = 0;
  if (length > 53 || width > 8.5 || height > 13.5) {
    oversizeFee = baseCost * 0.50; // 50% oversize fee
  }
  
  // 6. Fuel surcharge
  const fuelPercent = rates.find(r => r.rate_type === 'fuel_surcharge_percent')?.rate_value || 15;
  const fuelSurcharge = (baseCost + weightSurcharge + oversizeFee) * (fuelPercent / 100);
  
  // 7. Hazmat fee
  let hazmatFee = 0;
  if (data.equipment?.hasHazmatPlacards || data.freight?.hasHazmatPlacards) {
    hazmatFee = rates.find(r => r.rate_type === 'hazmat_fee_flat')?.rate_value || 500;
  }
  
  // 8. Location-based fees
  let additionalFees = 0;
  if (data.locations.pickup.addressType === 'residential') {
    additionalFees += rates.find(r => r.rate_type === 'residential_pickup_fee')?.rate_value || 150;
  }
  if (data.locations.dropoff.addressType === 'residential') {
    additionalFees += rates.find(r => r.rate_type === 'residential_dropoff_fee')?.rate_value || 150;
  }
  
  // 9. Urgency fee
  const pickupDate = new Date(data.scheduling.pickup.date);
  const urgencyFee = calculateUrgencyFee(pickupDate, baseCost);
  additionalFees += urgencyFee;
  
  // 10. Regional multiplier
  const pickupState = extractState(data.locations.pickup.address);
  const regionalData = await supabase
    .from('regional_multipliers')
    .select('multiplier')
    .eq('state_code', pickupState)
    .single();
  const regionalMultiplier = regionalData?.data?.multiplier || 1.00;
  
  // 11. Calculate total
  const subtotal = baseCost + weightSurcharge + oversizeFee + fuelSurcharge + hazmatFee + additionalFees;
  const totalCost = subtotal * regionalMultiplier;
  
  // 12. Calculate range (±15% for negotiation room)
  const estimatedLow = totalCost * 0.85;
  const estimatedHigh = totalCost * 1.15;
  
  return {
    baseCost,
    fuelSurcharge,
    oversizeFee,
    hazmatFee,
    additionalFees: additionalFees + (subtotal * (regionalMultiplier - 1)),
    totalCost,
    estimatedLow,
    estimatedHigh,
    distance: Math.round(distance),
    estimatedDuration: Math.ceil(distance / 400) // ~400 miles/day average
  };
}
```

---

## 🎯 IMPLEMENTATION PRIORITY

### **Phase 1: Immediate (Week 1)**
1. ✅ Add `pricing_rates` table to Supabase
2. ✅ Integrate real distance calculation API
3. ✅ Update `calculateEstimate()` in `EstimatorModal.tsx`

### **Phase 2: Near-term (Week 2-3)**
4. ✅ Add `regional_multipliers` table
5. ✅ Implement time-based urgency fees
6. ✅ Add admin dashboard to update rates

### **Phase 3: Long-term (Month 2+)**
7. ✅ Machine learning: analyze historical quotes
8. ✅ Competitor price monitoring
9. ✅ Dynamic pricing based on demand
10. ✅ Integration with your booking/dispatch system

---

## 📈 PRICING PHILOSOPHY

### **For Customers:**
- ✅ **Transparent**: Show full breakdown
- ✅ **Competitive**: ±15% range for negotiation
- ✅ **Instant**: No waiting for callbacks
- ✅ **Accurate**: Based on real equipment specs

### **For Your Business:**
- ✅ **Profitable**: Includes all costs + margin
- ✅ **Flexible**: Easy to adjust rates
- ✅ **Data-driven**: Track which quotes convert
- ✅ **Scalable**: Works for 10 or 10,000 quotes/month

---

## 🔧 NEXT STEPS

1. **Create pricing tables** in Supabase (SQL provided above)
2. **Choose distance API** (recommend OpenRouteService for free tier)
3. **Update calculation function** (code provided above)
4. **Test with real scenarios** (compare to your current manual quotes)
5. **Iterate based on conversion rates** (if quotes are too high/low)

---

## 💡 PRO TIPS

1. **Don't underprice**: Your estimate should cover all costs + 15-20% margin
2. **Build in buffer**: Use ±15% range to account for unknowns
3. **Track conversions**: If <30% of quotes convert, prices may be too high
4. **Update regularly**: Review fuel surcharge monthly
5. **A/B test**: Try different pricing strategies and measure results

---

Generated for Hauln' Heavy Equipment Hauling Estimator

