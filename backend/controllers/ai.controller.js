const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const Event = require('../models/event.model');
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// @desc    Generate event description using Gemini
// @route   POST /api/ai/generate
// @access  Private (Admins only)
const generateDescription = async (req, res) => {
  const { title, location, date } = req.body;

  if (!title || !location) {
    return res.status(400).json({ message: 'Please provide title and location' });
  }

  try {
    // 1. Construct the prompt
    const prompt = `
      You are an enthusiastic event organizer for a non-profit.
      Write a professional, inviting, and exciting description (approx 100 words) for a volunteer event.
      
      Event Details:
      Title: ${title}
      Location: ${location}
      Date: ${date || 'Upcoming'}
      
      Formatting requirements:
      - Use emojis.
      - Structure it with a "Why Join?" section.
      - Keep it inspiring.
    `;

    // 2. Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 3. Send back the text
    res.json({ 
      title: title,
      generatedDescription: text 
    });

  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ message: 'Failed to generate description' });
  }
};


// @desc    Generate tags/categories for an event
// @route   POST /api/ai/classify
// @access  Private (Admins only)
const generateTags = async (req, res) => {
  const { title, description, location } = req.body;

  try {
    const prompt = `
      Analyze this volunteer event and suggest 3-5 relevant category tags.
      
      Event Title: ${title}
      Location: ${location}
      Description: ${description || 'N/A'}
      
      Rules:
      1. Return ONLY a JSON array of strings.
      2. No extra text, no markdown formatting (no \`\`\`json).
      3. Use standard categories like: "Environment", "Health", "Education", "Animal Welfare", "Community", "Crisis Relief", "Technology".
      
      Example Output: ["Environment", "Outdoor", "Community"]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up if Gemini adds markdown formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse string to actual JSON
    const tags = JSON.parse(text);

    res.json({ tags });

  } catch (error) {
    console.error('Gemini Classification Error:', error);
    // Return empty array on failure so frontend doesn't crash
    res.json({ tags: [] }); 
  }
};

// @desc    Suggest events based on user skills
// @route   GET /api/ai/recommendations
// @access  Private (Volunteers)
const recommendEvents = async (req, res) => {
  try {
    const user = req.user;
    
    // 1. Fetch upcoming events
    const events = await Event.find({ date: { $gte: new Date() } })
      .select('_id title description date location tags')
      .limit(20);

    // 2. Decide the Prompt based on skills
    let prompt;

    // SCENARIO A: User HAS skills
    if (user.skills && user.skills.length > 0) {
       prompt = `
        Act as a volunteer coordinator.
        User Skills: ${JSON.stringify(user.skills)}
        Available Events: ${JSON.stringify(events)}
        
        Task: Find the top 3 matches based on these skills.
        Return JSON array: [{ "eventId": "...", "matchScore": "High", "reason": "..." }]
      `;
    } 
    
    // SCENARIO B: User has NO skills (The Fix)
    else {
       prompt = `
        Act as a volunteer coordinator.
        User Skills: NONE (Beginner).
        Available Events: ${JSON.stringify(events)}
        
        Task: Find the top 3 events that are "Beginner Friendly", "General Help", or require "No Experience".
        Return JSON array: [{ "eventId": "...", "matchScore": "High", "reason": "This event is great for beginners..." }]
      `;
    }

    // 3. Call Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean Markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const recommendations = JSON.parse(text);

    // 4. Merge AI data with Real Event Data
    // The AI gives us IDs, we need to attach the full event details back to them
    const fullRecommendations = recommendations.map(rec => {
      // Find the original event object
      const originalEvent = events.find(e => e._id.toString() === rec.eventId);
      return {
        ...originalEvent._doc, // The full event data
        matchScore: rec.matchScore,
        recommendationReason: rec.reason
      };
    }).filter(item => item._id); // Filter out any nulls if AI hallucinated an ID

    res.json(fullRecommendations);

  } catch (error) {
    console.error('Gemini Recommendation Error:', error);
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
};

// Don't forget to export it!
module.exports = { 
  generateDescription, 
  generateTags, // <--- Add this
  recommendEvents
};