// Test SambaNova API directly
const testSambaNova = async () => {
  const response = await fetch('https://api.sambanova.ai/v1/models', {
    headers: {
      'Authorization': 'Bearer REDACTED_API_KEY'
    }
  });
  console.log('SambaNova models:', await response.json());
};

// Test Gemini API directly  
const testGemini = async () => {
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models?key=REDACTED_GOOGLE_API_KEY');
  console.log('Gemini models:', await response.json());
};

testSambaNova();
testGemini();