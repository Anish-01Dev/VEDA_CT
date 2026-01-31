# 🔧 API Fixes Required - Vaidyana Healthcare App

## 🚨 IMMEDIATE SECURITY FIXES (CRITICAL)

### 1. Remove Hardcoded API Keys
**Files to fix:**
- `src/lib/ai-client.ts` (line 83)
- `src/lib/gemini-vision.ts` (line 8)
- `src/lib/supabase.ts` (lines 4-5)

**Action:** Move all API keys to environment variables:
```bash
# Add to .env file
VITE_GOOGLE_AI_STUDIO_KEY=your_key_here
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

## 🔄 API ENDPOINT UPDATES

### 2. Fix Gemini API Models
**File:** `src/lib/gemini-api.ts`
**Current Issue:** Using non-existent `gemini-3-flash-preview`

**Fix:**
```typescript
// Replace line 40
const response = await fetch(`${this.baseUrl}/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
```

### 3. Update SambaNova Models
**File:** `src/lib/sambanova-api.ts`
**Current Issue:** Using outdated model

**Fix:**
```typescript
// Replace line 20
this.model = 'Meta-Llama-3.3-70B-Instruct'; // or 'DeepSeek-V3.1'
```

### 4. Fix AI Client Model Array
**File:** `src/lib/ai-client.ts`
**Current Issue:** Wrong model names in fallback array

**Fix:**
```typescript
// Replace line 108
const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-001'];
```

### 5. Update Gemini Vision Models
**File:** `src/lib/gemini-vision.ts`
**Current Issue:** Mixed model versions

**Fix:**
```typescript
// Replace line 14
const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
```

## 🛠️ CODE QUALITY FIXES

### 6. Add Missing Error Handling
**File:** `src/lib/ai-client.ts` (line 372)
**Add try-catch block:**
```typescript
async analyzePrescription(prescriptionText: string, language: string = 'en'): Promise<PrescriptionAnalysis> {
  const startTime = Date.now();
  aiLogger.aiStart('AI Client', 'Prescription Analysis', prescriptionText);
  
  try {
    // existing code...
    const response = await this.makeAPIRequest(prescriptionText, systemPrompt, language);
    const result = PrescriptionAnalysisSchema.parse(response);
    aiLogger.aiSuccess('AI Client', 'Prescription Analysis', result);
    aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
    return result;
  } catch (error) {
    aiLogger.aiError('AI Client', 'Prescription Analysis', error);
    aiLogger.aiOffline('AI Client', 'Prescription Analysis');
    const fallbackResult = PrescriptionAnalysisSchema.parse(this.getOfflineResponse('prescription_analysis', prescriptionText, language));
    aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
    return fallbackResult;
  }
}
```

### 7. Fix API Version Consistency
**Files:** All API files
**Issue:** Mixed v1/v1beta usage

**Fix:** Use correct API versions:
- `gemini-2.5-flash`: v1beta
- `gemini-2.0-flash`: v1beta  
- `gemini-1.5-flash`: v1beta
- `gemini-1.5-pro`: v1beta

## 🧪 TESTING REQUIREMENTS

### 8. Update API Validator
**File:** `src/lib/api-validator.ts`
**Fix model name:**
```typescript
// Replace line 15
private static readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
```

### 9. Test All APIs After Fixes
Run these commands to verify:
```bash
# Test API connections
node test-models.js

# Test in browser
npm run dev
# Navigate to debug components
```

## 📊 PERFORMANCE OPTIMIZATIONS

### 10. Add Result Limiting
**File:** `src/lib/osm-service.ts` (line 136)
**Add:**
```typescript
return results.slice(0, 10); // Limit to 10 results
```

### 11. Implement Proper Caching
**All API files:** Add response caching with TTL

## ✅ VERIFICATION CHECKLIST

- [ ] All hardcoded API keys removed
- [ ] Environment variables configured
- [ ] Gemini models updated to valid names
- [ ] SambaNova model updated
- [ ] API versions corrected
- [ ] Error handling added
- [ ] API validator updated
- [ ] All APIs tested and working
- [ ] Performance optimizations applied
- [ ] Security scan passed

## 🎯 PRIORITY ORDER

1. **CRITICAL:** Remove hardcoded API keys (Security)
2. **HIGH:** Fix model names (Functionality)
3. **MEDIUM:** Add error handling (Reliability)
4. **LOW:** Performance optimizations

## 📞 SUPPORT

If you need help implementing these fixes:
1. Check the API documentation for latest models
2. Test each API endpoint individually
3. Use the debug components to verify functionality
4. Monitor console logs for detailed error messages