# Auto Insurance Quote Application

A multi-step car insurance quote application built with React.

## Features

- **Progressive Multi-Step Form**: Guides users through a 13+ step quote process
- **Smart Navigation**: Auto-advances after selections to minimize user interaction
- **Vehicle Management**: Handles 1-2 vehicles with dynamic year/make/model selection
- **Responsive Design**: Clean, mobile-first interface
- **Data Validation**: Form validation at each step
- **Progress Tracking**: Visual progress bar showing completion percentage

## User Journey Flow

1. **ZIP Code Entry** (5-digit validation)
2. **Vehicle Count** (1, 2, or 3+ vehicles)
3. **Vehicle Information** (year, make, model for each vehicle)
4. **Insurance History** (past 30 days coverage)
5. **Demographics** (gender, marital status, homeowner status)
6. **Risk Assessment** (military affiliation)
7. **Birth Date**
8. **Contact Information** (name, email)
9. **Address Information** (street address, phone)

## Technology Stack

- **React 18** - UI framework
- **CSS3** - Styling with custom CSS (no external frameworks)
- **Inter Font** - Typography
- **Modern JavaScript** - ES6+ features

## Design System

- **Primary Color**: `#467FCE` (blue for text accents, borders, button text)
- **Secondary Color**: `#6FD0BD` (teal for progress bars, selections)
- **Font Family**: Inter
- **Clean, minimal design** with generous white space
- **Mobile-first responsive** layout

## Project Structure

```
src/
├── components/
│   ├── Header.js & Header.css
│   ├── ProgressBar.js & ProgressBar.css
│   ├── StepContainer.js
│   ├── Footer.js & Footer.css
│   └── steps/
│       ├── ZipCodeStep.js
│       ├── VehicleCountStep.js
│       ├── VehicleYearStep.js
│       ├── VehicleMakeStep.js
│       ├── VehicleModelStep.js
│       ├── InsuranceHistoryStep.js
│       ├── GenderStep.js
│       ├── MaritalStatusStep.js
│       ├── HomeownerStep.js
│       ├── MilitaryStep.js
│       ├── BirthdateStep.js
│       ├── ContactInfoStep.js
│       └── AddressInfoStep.js
├── data/
│   └── vehicleData.js
├── App.js & App.css
├── index.js & index.css
```

## Key Features

### Smart Step Management
- Dynamic step flow based on vehicle count selection
- Auto-advance functionality for better UX
- Progress tracking with percentage completion

### Vehicle Data Management
- Years from 2025 back to 1987
- 11 major car manufacturers (BMW, Toyota, Honda, Ford, Chevrolet, etc.)
- Comprehensive model lists for each make
- Maximum 2 vehicles even if user selects "3+"

### Form Validation
- ZIP code validation (5 digits)
- Email validation
- Required field validation
- Date validation for birth date

### Data Submission
- Collects comprehensive insurance profile
- Structured JSON output
- Webhook endpoint ready (placeholder included)
- Console logging for development

## Getting Started

### Prerequisites
- Node.js (14+ recommended)
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

## Configuration

### Webhook Integration
To integrate with your backend, update the `submitFormData` function in `src/App.js`:

```javascript
const response = await fetch('YOUR_WEBHOOK_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(submissionData)
});
```

### Vehicle Data
Update `src/data/vehicleData.js` to modify available car makes and models.

### Styling
Core colors can be updated in the CSS files:
- Primary: `#467FCE`
- Secondary: `#6FD0BD`

## Development Notes

- **Component Structure**: Each step is a separate component for maintainability
- **State Management**: Uses React hooks with centralized form state
- **Auto-advance**: 300ms delay after selection for smooth UX
- **Responsive**: Mobile-first design with tablet/desktop enhancements
- **Accessibility**: Proper form labels, focus management, semantic HTML

- To deploy after git push use ./deploy-update.sh on deploy user ssh deploy@66.42.86.208
- To Go back to previous commit
- git reset --hard HEAD~1
- npm run build
- pm2 restart auto-insurance-app

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private project - All rights reserved. 