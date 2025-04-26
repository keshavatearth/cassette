import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the Gemini Pro model
const geminiProModel = genAI.getGenerativeModel({
  model: 'gemini-pro',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

// Function to generate content reflections based on user input
export async function generateReflectionInsight(
  contentTitle: string,
  contentType: string,
  userReflection: string
): Promise<string> {
  const prompt = `
  I'm watching ${contentTitle} (${contentType}) and wrote this reflection:
  "${userReflection}"
  
  Please provide a short, thoughtful response to my reflection that might deepen my understanding 
  or connect it to themes in the content. Keep it conversational, as if we're chatting about the show/movie.
  Limit to 3-4 sentences max.
  `;

  try {
    const result = await geminiProModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating reflection insight:', error);
    return 'I couldn\'t process that reflection at the moment. Please try again later.';
  }
}

// Function to generate content recommendations based on user preferences
export async function generateContentRecommendations(
  watchedContent: string[],
  preferredGenres: string[],
  mood: string = '',
  timeAvailable: number = 0
): Promise<string> {
  const genresStr = preferredGenres.join(', ');
  const watchedStr = watchedContent.join(', ');
  
  let prompt = `
  I've watched: ${watchedStr}.
  I enjoy these genres: ${genresStr}.
  `;
  
  if (mood) {
    prompt += `I'm in the mood for something ${mood}. `;
  }
  
  if (timeAvailable > 0) {
    prompt += `I have about ${timeAvailable} minutes available to watch. `;
  }
  
  prompt += `
  Please recommend 2-3 movies or shows I might enjoy and briefly explain why for each.
  Format as a JSON array with objects having fields: title, type (movie/tv), and reason.
  `;

  try {
    const result = await geminiProModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content recommendations:', error);
    return JSON.stringify([
      { 
        title: "Error generating recommendations", 
        type: "error", 
        reason: "Unable to process your request at this time." 
      }
    ]);
  }
}

// Function to analyze sentiment and themes in user reflections
export async function analyzeReflection(
  reflectionText: string
): Promise<{ sentiment: string; themes: string[]; tags: string[] }> {
  const prompt = `
  Analyze this reflection about a movie or TV show:
  "${reflectionText}"
  
  Return the result as JSON with these fields:
  1. sentiment: a single word describing the overall sentiment (positive, negative, neutral, mixed)
  2. themes: an array of 2-3 main themes or topics detected in the reflection
  3. tags: an array of 3-5 relevant tags that could be used to categorize this reflection
  
  Format the response as valid JSON only, with no additional text.
  `;

  try {
    const result = await geminiProModel.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing reflection:', error);
    return {
      sentiment: 'neutral',
      themes: ['entertainment'],
      tags: ['general']
    };
  }
}

// Function to generate personalized viewing insights based on watching history
export async function generateViewingInsights(
  recentlyWatched: string[],
  reflectionHighlights: string[]
): Promise<string> {
  const watchedStr = recentlyWatched.join(', ');
  const reflectionsStr = reflectionHighlights.join('\n- ');
  
  const prompt = `
  Recently watched: ${watchedStr}
  
  Some of my reflections:
  - ${reflectionsStr}
  
  Based on my watching history and reflections, provide 2-3 insights about my viewing preferences 
  or patterns that might help me discover new content or appreciate my current watches more deeply.
  Keep it conversational and brief (3-4 sentences total).
  `;

  try {
    const result = await geminiProModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating viewing insights:', error);
    return 'Unable to generate viewing insights at the moment. Please try again later.';
  }
}