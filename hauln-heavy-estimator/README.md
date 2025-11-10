# Hauln' Heavy - Freight Transport Estimator

A standalone, embeddable heavy equipment transport estimator tool built with Next.js, TypeScript, and Tailwind CSS. Designed specifically for iframe embedding on external websites.

## Features

### 🚛 Equipment Details Form
- Equipment identification (make, model, year, type)
- Quantity selection
- Detailed dimensions input (length, width, height in feet/inches)
- Weight specification
- Visual dimension diagrams

### 📋 Load Characteristics Form
- Hazmat placard identification
- Special wheel configurations (duals, triples)
- Front weights and attachments
- Transportation method selection (hauled, towed, driven)
- Disassembly requirements
- Photo upload capability

### 💰 Intelligent Estimation Engine
- Base transport cost calculation
- Fuel surcharge calculation
- Oversize load fee assessment
- Hazmat fee calculation
- Additional fees for special requirements
- Comprehensive cost breakdown

### 📊 Results & Reporting
- Detailed cost breakdown
- Professional estimate display
- PDF download functionality (ready for implementation)
- Share estimate capability
- 7-day validity disclaimer

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form state management and validation
- **Lucide React** - Beautiful icon library
- **Zod** - Schema validation (ready for implementation)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hauln-heavy-estimator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Embedding in Your Website

This estimator is designed to be embedded as an iframe on your main website. Once deployed, you can embed it using the following code:

```html
<iframe
  src="https://your-deployed-url.com"
  width="100%"
  height="800px"
  style="border: none; border-radius: 8px;"
  title="Heavy Equipment Transport Estimator"
></iframe>
```

### Recommended iframe Settings

For optimal user experience:
- **Minimum height**: 800px (adjust based on your needs)
- **Width**: 100% of the container
- **Border**: none for seamless integration
- **Allow**: You may need to add permissions for form submission and geolocation if used

Example with permissions:
```html
<iframe
  src="https://your-deployed-url.com"
  width="100%"
  height="800px"
  style="border: none;"
  allow="geolocation"
  title="Heavy Equipment Transport Estimator"
></iframe>
```

## Project Structure

```
src/
├── app/
│   ├── api/                          # API routes
│   │   ├── address-autocomplete/    # Address autocomplete
│   │   └── send-estimate/           # Email estimate
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Main estimator page
├── components/
│   └── estimator/
│       ├── EstimatorModal.tsx            # Main estimator container
│       ├── Step0CategorySelection.tsx    # Category selection (Equipment/Freight)
│       ├── Step1EquipmentDetails.tsx     # Equipment details form
│       ├── Step1FreightDimensions.tsx    # Freight dimensions form
│       ├── Step2Locations.tsx            # Pickup/delivery locations
│       ├── Step3DatesTimes.tsx           # Scheduling information
│       ├── Step4AdditionalInfo.tsx       # Additional requirements
│       ├── EstimateResults.tsx           # Results display
│       ├── AddressAutocomplete.tsx       # Address input component
│       ├── CalendarWidget.tsx            # Date picker
│       └── ImageUploadSection.tsx        # Photo uploads
├── lib/
│   └── equipment-data.ts                 # Equipment type definitions
└── types/
    └── estimator.ts                      # TypeScript interfaces
```

## Estimation Logic

The estimator uses a sophisticated calculation engine that considers:

- **Base Rate**: $2.50 per mile (configurable)
- **Weight Surcharge**: 20% for loads over 10,000 lbs
- **Oversize Fees**: 50% surcharge for oversized dimensions
- **Hazmat Fees**: 25% surcharge for hazardous materials
- **Fuel Surcharge**: 15% of base cost
- **Additional Fees**: 
  - $200 for duals/triples
  - $150 for attachments
  - $300 for towed transport
  - $500 for driven transport

## Customization

### Pricing Configuration
Update the calculation logic in `EstimatorModal.tsx`:

```typescript
const baseRate = 2.50; // per mile
const weightThreshold = 10000; // lbs
const oversizeDimensions = { length: 48, width: 8.5, height: 13.5 }; // feet
```

### Styling
The project uses Tailwind CSS with a yellow and gray color scheme. Modify `tailwind.config.ts` to customize colors and spacing.

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
```bash
npm run build
npm start
```

## Future Enhancements

- [ ] Pickup/delivery location integration
- [ ] Real-time fuel price API integration
- [ ] PDF generation with company branding
- [ ] Email estimate delivery
- [ ] Customer account system
- [ ] Admin dashboard for pricing management
- [ ] Mobile app development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Hauln' Heavy Transport Services.

---

**Built with ❤️ for professional freight transport**
