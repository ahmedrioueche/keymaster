
export const apiPromptGemini = async (prompt : string) : Promise<any> => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({prompt}),
      });
  
      if (!response.ok) {
        throw new Error('Failed to prompt Gemini');
      }
  
      const responseData = await response.json();
      
      return responseData;
  
    } catch (error) {
      console.error('Failed to prompt Gemini:', error);
      
      return { status: 'error', message: 'An error occurred' };
    }
  }