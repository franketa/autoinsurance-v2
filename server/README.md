# Auto Insurance Quote - QuoteWizard Integration

This server implements the QuoteWizard API integration to submit auto insurance leads, replicating the functionality from the original PHP implementation.

## Features

- **Two-step QuoteWizard API integration**: Ping → Get Quote ID → Post with Quote ID
- **Ignite API integration**: Sends lead data to Ignite for additional processing
- **Database logging**: All API requests and responses are logged for debugging and analytics
- **Data transformation**: Converts form data to QuoteWizard XML format
- **Error handling**: Comprehensive error handling and logging

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a MySQL database and user:

```sql
-- Run the initialization script
mysql -u root -p < server/database/init.sql
```

2. Or manually create the database:

```sql
CREATE DATABASE smartautoinsider_db;
CREATE USER 'smartautoinsider_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON smartautoinsider_db.* TO 'smartautoinsider_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configuration

1. Copy the example configuration:

```bash
cp server/config.example.js server/config.js
```

2. Update `server/config.js` with your actual values:

```javascript
module.exports = {
  database: {
    host: 'localhost',
    user: 'your_db_user',
    password: 'your_db_password',
    database: 'smartautoinsider_db'
  },
  
  quoteWizard: {
    contractID: 'your_quotewizard_contract_id',
    productionUrl: 'https://quotewizard.com/LeadAPI/Services/SubmitVendorLead',
    stagingUrl: 'https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead'
  },
  
  ignite: {
    apiUrl: 'your_ignite_api_url_with_auth_token'
  }
};
```

3. Or use environment variables by creating a `.env` file:

```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=smartautoinsider_db
QW_CONTRACT_ID=your_quotewizard_contract_id
NODE_ENV=production
PORT=5000
```

## Usage

### Development Mode

Run both the React frontend and Node.js backend:

```bash
npm run dev
```

This will start:
- React app on http://localhost:3000
- Node.js server on http://localhost:5000

### Production Mode

1. Build the React app:

```bash
npm run build
```

2. Start the server:

```bash
npm run server
```

## API Endpoints

### POST /api/submit-quote

Submits a quote request to QuoteWizard and Ignite APIs.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "555-123-4567",
  "streetAddress": "123 Main St",
  "zipcode": "12345",
  "birthdate": "1990-01-01",
  "gender": "Male",
  "maritalStatus": "Single",
  "creditScore": "Excellent",
  "homeowner": "Own",
  "driversLicense": "Yes",
  "sr22": "No",
  "currentAutoInsurance": "Geico",
  "vehicles": [
    {
      "year": "2020",
      "make": "Toyota",
      "model": "Camry"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "ping": {
    "xml": "<?xml version='1.0'...",
    "response": "QuoteWizard ping response"
  },
  "post": {
    "xml": "<?xml version='1.0'...",
    "response": "QuoteWizard post response"
  },
  "ignite": "Ignite API response",
  "initialID": "quote_id_from_ping"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Data Flow

1. **Form Submission**: User completes the insurance quote form
2. **Data Transformation**: Form data is transformed to match QuoteWizard requirements
3. **Ping Request**: First API call to QuoteWizard to get Quote ID
4. **Post Request**: Second API call with Quote ID to submit complete lead
5. **Ignite Integration**: Lead data sent to Ignite API
6. **Database Logging**: All requests and responses logged to MySQL
7. **Response**: Success/error response sent back to frontend

## Data Mapping

The application maps form data to QuoteWizard XML format:

| Form Field | QuoteWizard Field | Notes |
|------------|-------------------|-------|
| firstName | FirstName | |
| lastName | LastName | |
| email | EmailAddress | |
| phoneNumber | PrimaryPhone | Formatted as XXX-XXX-XXXX |
| streetAddress | Address1 | |
| zipcode | ZIPCode | |
| birthdate | BirthDate | Format: YYYY-MM-DD |
| gender | Gender | |
| maritalStatus | MaritalStatus | |
| creditScore | CreditRating.SelfRating | |
| homeowner | ResidenceStatus | |
| driversLicense | LicenseStatus | Yes/No → Valid/Invalid |
| sr22 | RequiresSR22Filing | |
| vehicles | Vehicles array | Year, Make, Model |

## Database Schema

### insurance_ping Table

| Column | Type | Description |
|--------|------|-------------|
| id | INT AUTO_INCREMENT | Primary key |
| action | VARCHAR(50) | Action type (ping, ping_response, post, post_response, ignite_post, ignite_response) |
| data | LONGTEXT | Request/response data in JSON format |
| created_at | TIMESTAMP | When the record was created |

## Error Handling

- API errors are caught and logged
- Database connection errors are handled gracefully
- Malformed XML responses are parsed safely
- All errors are logged to the database for debugging

## Security Notes

1. **Never commit sensitive configuration**: config.js and .env files are gitignored
2. **Database credentials**: Use strong passwords and limit database user permissions
3. **API keys**: Store QuoteWizard contract IDs and API tokens securely
4. **Input validation**: Add input validation for production use
5. **Rate limiting**: Consider adding rate limiting for the API endpoints

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check MySQL is running and credentials are correct
2. **QuoteWizard API errors**: Verify contract ID and API endpoints
3. **XML parsing errors**: Check QuoteWizard response format
4. **CORS errors**: Ensure CORS is properly configured for your domain

### Debugging

1. Check server logs for error messages
2. Check database `insurance_ping` table for API request/response logs
3. Use browser developer tools to inspect network requests
4. Test API endpoints directly with tools like Postman

## License

This project is for internal use only. Do not distribute without permission. 