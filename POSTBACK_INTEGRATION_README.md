# Postback Integration System

This system implements server-side postbacks and email submission functionality, replicating the PHP implementation in Node.js.

## Features Implemented

### 1. Session Management
- **TID Parameter Capture**: Automatically captures `tid` URL parameter and stores it in session
- **Revenue Tracking**: Stores revenue amount from ping comparison results
- **IP Address Storage**: Captures and stores client IP address
- **Session Persistence**: Maintains session data throughout the user journey

### 2. Server-Side Postbacks
- **Hitpath Postback**: Sends revenue data to `https://www.trackinglynx.com/rd/px.php`
- **Everflow Postback**: Sends revenue data to `https://www.iqno4trk.com/`
- **Conditional Firing**: Postbacks only fire when:
  - ✅ Ping has revenue (`winnerValue > 0`)
  - ✅ Post to winner is successful (`postResponse.ok`)
  - ✅ TID parameter is present (`session.tid`)

### 3. Email Submission
- **Azure API Integration**: Submits lead data to `https://app-dp-tst-wu3.azurewebsites.net/api/Upload/SingleUpload`
- **Always Fires**: Email submission occurs regardless of post success
- **Complete Data Mapping**: Maps all form fields to Azure API format

### 4. Database Logging
- **Request Logging**: Logs all postback requests and responses
- **Error Tracking**: Captures and logs all errors
- **Analytics Support**: Enables tracking of postback success rates

## API Endpoints

### `/api/session/capture` (GET)
Captures TID parameter and stores in session.

**Query Parameters:**
- `tid` (required): Transaction ID to store

**Response:**
```json
{
  "success": true,
  "sessionId": "tid_test123",
  "tid": "test123",
  "ip": "192.168.1.1",
  "message": "Session data captured successfully"
}
```

### `/api/ping-both` (POST) - Enhanced
Now includes session management:
- Captures TID parameter if present in request
- Stores IP address
- Stores revenue amount when winner is determined

### `/api/post-winner` (POST) - Enhanced
Now includes postback functionality:
- Sends Hitpath and Everflow postbacks when conditions are met
- Submits email to Azure API
- Returns postback status in response

**Enhanced Response:**
```json
{
  "success": true,
  "winner": "exchangeflo",
  "result": {...},
  "postbacks": {
    "hitpath": "sent",
    "everflow": "sent", 
    "email": "sent"
  },
  "logs": [...]
}
```

## Frontend Integration

### TID Parameter Capture
The React app automatically captures TID parameters on page load:

```javascript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const tid = urlParams.get('tid');
  
  if (tid) {
    fetch(`/api/session/capture?tid=${tid}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Tid captured successfully:', data);
        }
      });
  }
}, []);
```

### URL Format
Users can access the app with TID parameter:
```
https://yourdomain.com/?tid=transaction123
```

## Postback URLs

### Hitpath Postback
```
https://www.trackinglynx.com/rd/px.php?hid={tid}&sid=3338&transid=&ate={revenue}
```

### Everflow Postback  
```
https://www.iqno4trk.com/?nid=2409&transaction_id={tid}&amount={revenue}
```

## Azure API Integration

### Endpoint
```
POST https://app-dp-tst-wu3.azurewebsites.net/api/Upload/SingleUpload?auth_token=B4YMZ43H31g0o0B9Xxx9
```

### Data Format
```json
{
  "partitionKey": "",
  "rowKey": "",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "eTag": "",
  "contact": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "customField": {
      "sourceUrl": "https://www.smartautoinsider.com",
      "ipAddress": "192.168.1.1",
      "postalAddress": "123 Main St",
      "city": "Seattle",
      "state": "WA",
      "zipCode": "98101",
      "gender": "Male",
      "birthdate": "1985-01-01",
      "married": "Single",
      "ownRent": "Own",
      "optInDate": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Testing

### Run Complete Test Suite
```bash
node server/test-postbacks.js
```

### Expected Output
```
🚀 Starting Postback Integration Test...
🧪 Testing Health Check...
✅ Health check successful: healthy
🧪 Testing Session Capture...
✅ Session capture successful: { success: true, sessionId: 'tid_test_tid_12345', ... }
🧪 Testing Ping Both...
✅ Ping both successful: { success: true, winner: 'exchangeflo', ... }
🧪 Testing Post Winner...
✅ Post winner successful: { success: true, postbacks: { hitpath: 'sent', everflow: 'sent', email: 'sent' } }

🎉 Postback Integration Test Completed Successfully!
📊 Results Summary:
  • Session Capture: ✅
  • Ping Both: ✅
  • Winner: exchangeflo
  • Post Winner: ✅
  • Hitpath Postback: sent
  • Everflow Postback: sent
  • Email Submission: sent
```

## Database Logging

### Tables Used
- `ping_requests`: Logs all postback requests and responses
- `ping_comparison`: Logs ping comparison results with revenue data

### Logged Events
- Session capture attempts
- Hitpath postback requests/responses
- Everflow postback requests/responses
- Azure API email submissions
- All errors and failures

## Configuration

### Environment Variables
```bash
# Postback URLs (configured in code)
HITPATH_URL=https://www.trackinglynx.com/rd/px.php
EVERFLOW_URL=https://www.iqno4trk.com/
AZURE_API_URL=https://app-dp-tst-wu3.azurewebsites.net/api/Upload/SingleUpload

# Postback Parameters
HITPATH_SID=3338
EVERFLOW_NID=2409
AZURE_AUTH_TOKEN=B4YMZ43H31g0o0B9Xxx9
```

## Error Handling

### Graceful Degradation
- Postback failures don't prevent form submission
- Email submission failures are logged but don't block the flow
- Session data is preserved even if individual operations fail

### Logging
- All operations are logged with timestamps
- Errors include full context and stack traces
- Database logging ensures audit trail

## Monitoring

### Key Metrics to Track
- Session capture success rate
- Postback success rates (Hitpath vs Everflow)
- Email submission success rate
- Revenue tracking accuracy
- Error rates by operation type

### Database Queries
```sql
-- Check postback success rates
SELECT 
  SUBSTRING(submission_id, 1, 10) as operation,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
  AVG(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100 as success_rate
FROM ping_requests 
WHERE submission_id LIKE 'hitpath%' OR submission_id LIKE 'everflow%'
GROUP BY SUBSTRING(submission_id, 1, 10);

-- Check revenue tracking
SELECT 
  winner,
  COUNT(*) as leads,
  AVG(total_comparison_value) as avg_revenue,
  SUM(total_comparison_value) as total_revenue
FROM ping_comparison 
WHERE winner IS NOT NULL
GROUP BY winner;
```

## Security Considerations

### Data Protection
- TID parameters are validated before storage
- IP addresses are sanitized (IPv6 prefix removal)
- All external API calls use HTTPS
- Sensitive data is not logged in plain text

### Rate Limiting
- Consider implementing rate limiting for postback endpoints
- Monitor for unusual postback patterns
- Implement request throttling if needed

## Troubleshooting

### Common Issues

1. **Postbacks not firing**
   - Check if TID parameter is present
   - Verify revenue amount > 0
   - Confirm post to winner was successful

2. **Email submission failures**
   - Check Azure API connectivity
   - Verify auth token is valid
   - Review data format requirements

3. **Session data missing**
   - Check if TID was captured on page load
   - Verify session storage is working
   - Review IP address detection

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
DEBUG=postback-integration node server/server.js
```

## Future Enhancements

- **Real-time Dashboard**: Monitor postback success rates
- **Retry Logic**: Automatic retry for failed postbacks
- **Webhook Support**: Additional postback endpoints
- **Analytics Integration**: Enhanced revenue tracking
- **A/B Testing**: Test different postback strategies 