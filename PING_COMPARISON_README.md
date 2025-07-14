# Ping Comparison System

This system pings both QuoteWizard and ExchangeFlo, compares the results, and automatically posts the lead to whichever service offers the highest dollar value.

## How It Works

### 1. Dual Ping Process
- **Frontend**: Collects user data and sends it to `/api/ping-both`
- **Backend**: Simultaneously pings both QuoteWizard and ExchangeFlo
- **Comparison**: Analyzes responses and determines the winner based on highest value

### 2. Winner Selection Logic
- **Primary**: Service with highest dollar value wins
- **Fallback**: If values are equal, prioritize the service that responded successfully
- **Logging**: All comparisons are logged to the database for analysis

### 3. Post to Winner
- Automatically posts the lead to the winning service
- Tracks conversion revenue for analytics
- Handles errors gracefully

## API Endpoints

### `/api/ping-both` (POST)
Pings both services and returns comparison results.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "5551234567",
  "streetAddress": "123 Main St",
  "city": "Seattle",
  "state": "WA",
  "zipcode": "98101",
  "birthdate": "1985-06-15",
  "gender": "Male",
  "maritalStatus": "Single",
  "creditScore": "Good",
  "homeowner": "Own",
  "military": "No",
  "driverEducation": "Bachelor's Degree",
  "driverOccupation": "Engineer",
  "driversLicense": "Yes",
  "sr22": "No",
  "insuranceHistory": "Yes",
  "currentAutoInsurance": "Geico",
  "insuranceDuration": "1-3 years",
  "coverageType": "Full Coverage",
  "vehicles": [
    {
      "year": "2020",
      "make": "Toyota",
      "model": "Camry",
      "purpose": "commute",
      "mileage": "10000-15000",
      "ownership": "owned"
    }
  ],
  "trusted_form_cert_id": "test123"
}
```

**Response:**
```json
{
  "success": true,
  "winner": "exchangeflo",
  "comparison": {
    "quotewizard": {
      "success": true,
      "value": 15.0,
      "error": null,
      "data": {...}
    },
    "exchangeflo": {
      "success": true,
      "value": 22.50,
      "error": null,
      "data": {...}
    }
  },
  "winnerData": {...},
  "message": "exchangeflo won with $22.50"
}
```

### `/api/post-winner` (POST)
Posts the lead to the winning service.

**Request Body:**
```json
{
  "winner": "exchangeflo",
  "winnerData": {...},
  "formData": {...}
}
```

## Database Schema

### `ping_comparison` Table
```sql
CREATE TABLE ping_comparison (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quotewizard_success BOOLEAN DEFAULT FALSE,
    quotewizard_value DECIMAL(10,2) DEFAULT 0,
    quotewizard_error TEXT,
    exchangeflo_success BOOLEAN DEFAULT FALSE,
    exchangeflo_value DECIMAL(10,2) DEFAULT 0,
    exchangeflo_error TEXT,
    winner VARCHAR(50),
    total_comparison_value DECIMAL(10,2) GENERATED ALWAYS AS (quotewizard_value + exchangeflo_value) STORED,
    request_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### Run the Test Suite
```bash
node server/test-ping-comparison.js
```

### Expected Output
```
🚀 Starting ping comparison tests...
✅ Health check passed: { status: 'healthy', ... }
🧪 Testing ping comparison system...
✅ Ping comparison response: { success: true, winner: 'exchangeflo', ... }

🏆 Results Summary:
QuoteWizard: Success - $15.00
ExchangeFlo: Success - $22.50
Winner: exchangeflo

🎯 Testing post to winner (exchangeflo)...
✅ Post to winner response: { success: true, winner: 'exchangeflo', ... }

🎉 Test completed successfully!
```

## Service Integration

### QuoteWizard Integration
- **Format**: XML-based API
- **Ping**: Sends lead data, receives Quote_ID
- **Post**: Uses Quote_ID to submit final lead
- **Value**: Fixed value (currently $15.00, configurable)

### ExchangeFlo Integration
- **Format**: JSON REST API
- **Ping**: Returns array of ping opportunities with values
- **Post**: Submits to selected ping_ids
- **Value**: Sum of all ping values

## Configuration

### Environment Variables
- `NODE_ENV`: Sets test vs production mode
- `QW_CONTRACT_ID`: QuoteWizard contract ID
- `EXCHANGEFLO_TOKEN`: ExchangeFlo API token

### Value Adjustments
To adjust QuoteWizard values, modify the `extractQuoteWizardValue()` function in `server/server.js`:

```javascript
function extractQuoteWizardValue(response) {
  try {
    if (response && response.includes && response.includes('Quote_ID')) {
      return 18.0; // Adjust this value as needed
    }
    return 0;
  } catch (error) {
    console.error('Error extracting QuoteWizard value:', error);
    return 0;
  }
}
```

## Monitoring

### Database Queries
```sql
-- Check recent comparisons
SELECT * FROM ping_comparison 
ORDER BY timestamp DESC 
LIMIT 10;

-- Winner statistics
SELECT winner, 
       COUNT(*) as count,
       AVG(total_comparison_value) as avg_value
FROM ping_comparison 
GROUP BY winner;

-- Success rates
SELECT 
  AVG(quotewizard_success) * 100 as qw_success_rate,
  AVG(exchangeflo_success) * 100 as ef_success_rate
FROM ping_comparison;
```

### Logs
- All ping comparisons are logged with full request/response data
- Winner selection logic is logged in console
- Revenue tracking fires conversion pixels automatically

## Troubleshooting

### Common Issues

1. **Both services fail**
   - Check API credentials
   - Verify network connectivity
   - Review error messages in database

2. **Low values from services**
   - Review data mapping functions
   - Check service-specific requirements
   - Verify lead quality

3. **Database connection errors**
   - Check MySQL configuration
   - Verify database schema is up to date
   - Check connection pool settings

### Debug Mode
Add debug logging by setting environment variable:
```bash
DEBUG=ping-comparison node server/server.js
```

## Performance Considerations

- **Parallel Processing**: Both services are pinged simultaneously
- **Timeout Handling**: 30-second timeout on both services
- **Connection Pooling**: Database connections are pooled for efficiency
- **Error Handling**: Graceful degradation if one service fails

## Future Enhancements

- **Dynamic Value Parsing**: Parse actual bid values from QuoteWizard XML
- **Multiple Winners**: Support for posting to multiple services
- **A/B Testing**: Randomly select winner for testing purposes
- **Real-time Dashboard**: Monitor comparison results in real-time
- **Alert System**: Notify when services consistently fail 