const API_KEY = "api_key_goes_here"; // Replace with your actual API key

const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "Hello Gemini, hãy trả lời bằng tiếng Việt."
            }
          ]
        }
      ]
    })
  }
);

const data = await response.json();

console.log(
  data?.candidates?.[0]?.content?.parts?.[0]?.text || data
);