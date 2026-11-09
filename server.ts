import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Route Assistant Endpoint with Google Maps Grounding (gemini-3.8-flash)
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { query, busRoutes, userRole, userLocation } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const systemPrompt = `You are the Official AI Transit Assistant with real-time Google Maps Grounding for JAIN (Deemed-to-be University) - JGI Global Campus & Bangalore Transit Corridors.
You provide intelligent, geographically accurate transit and bus route advice based on the university bus fleet and real-world Bangalore locations.

Active Jain University college bus routes and schedules:
${JSON.stringify(busRoutes, null, 2)}

User Role: ${userRole || 'student'}
Reference Hub: Jain Global Campus, Kanakapura Road, Bangalore (12.6456° N, 77.4416° E).

Your responsibilities:
1. Identify the optimal Jain University bus route and stop for any destination, landmark, metro station, tech park, or junction in Bangalore (e.g., Banashankari, Electronic City, Koramangala, JP Nagar, Hosur, Silk Board).
2. Utilize Google Maps Grounding to provide verified place information, exact geographic context, nearby Namma Metro connections (Green Line / Yellow Line / Purple Line), bus stands, and road corridors.
3. Recommend the best bus when multiple routes cover nearby areas, prioritizing seat availability and arrival timings.
4. Answer questions about evening departure schedules (04:45 PM from Gate 2 bays), seat booking rules, and driver contacts.
5. Keep answers clear, courteous, and tailored to Jain University students and staff. Use formatting with bullet points or bold text where appropriate.`;

    let response: any;
    let mapsPlaces: Array<{ title: string; uri: string; address?: string; reviewSnippets?: any[] }> = [];

    try {
      // Primary call using Google Maps tool grounding on gemini-3.8-flash
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nStudent Query: "${query}"` }],
          },
        ],
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: userLocation?.latitude || 12.6456,
                longitude: userLocation?.longitude || 77.4416,
              },
            },
          },
        },
      });
    } catch (groundingErr: any) {
      console.warn('Maps Grounding call fallback:', groundingErr?.message);
      // Fallback without tools if environment API key lacks tool permission
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nStudent Query: "${query}"` }],
          },
        ],
      });
    }

    const reply = response?.text || "I'm sorry, I couldn't process your transit query at the moment.";
    const groundingMetadata = response?.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    // Extract all verified Google Maps place citations
    mapsPlaces = groundingChunks
      .map((chunk: any) => {
        if (chunk.maps) {
          return {
            title: chunk.maps.title || 'View Location',
            uri: chunk.maps.uri || '',
            address: chunk.maps.address || '',
            reviewSnippets: chunk.maps.placeAnswerSources?.reviewSnippets || [],
          };
        }
        return null;
      })
      .filter((place: any) => place && place.uri);

    res.json({ reply, mapsPlaces, groundingMetadata });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: 'Failed to generate AI transit guidance',
      details: error.message,
    });
  }
});

// AI Stop Explorer with Google Maps Grounding
app.post('/api/ai/stop-grounding', async (req, res) => {
  try {
    const { stopName, routeName, destination } = req.body;
    if (!stopName) {
      return res.status(400).json({ error: 'stopName is required' });
    }

    const prompt = `You are the Google Maps Grounded Transit Navigator for Jain University students in Bangalore.
Given the bus stop/destination "${stopName}" on the "${routeName || 'College Bus'}" route, retrieve accurate real-world geographic details using Google Maps:
1. Exact location & prominent landmarks (major tech parks, colleges, bus stands, or temples in Bangalore).
2. Nearest Namma Metro Station (specify Green/Purple/Yellow Line) and approximate walking/feeder distance.
3. Safe boarding/waiting shelter details and known traffic bottlenecks at peak hours (e.g. 05:00 PM evening rush).
4. Provide a clear, organized briefing for students.`;

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: 12.6456,
                longitude: 77.4416,
              },
            },
          },
        },
      });
    } catch (groundingErr: any) {
      console.warn('Maps Grounding fallback for stop-grounding:', groundingErr?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
    }

    const briefing = response?.text || `Geographic details for ${stopName} on the ${routeName || 'campus'} route.`;
    const groundingMetadata = response?.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    const mapsPlaces = groundingChunks
      .map((chunk: any) => {
        if (chunk.maps) {
          return {
            title: chunk.maps.title || stopName,
            uri: chunk.maps.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stopName} Bangalore`)}`,
            address: chunk.maps.address || '',
            reviewSnippets: chunk.maps.placeAnswerSources?.reviewSnippets || [],
          };
        }
        return null;
      })
      .filter((place: any) => place && place.uri);

    // Ensure at least one verified Google Maps URI is always present for the web app link
    if (mapsPlaces.length === 0) {
      mapsPlaces.push({
        title: `${stopName} (Bangalore)`,
        uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stopName} Bangalore Karnataka`)}`,
        address: 'Bangalore Metropolitan Region, Karnataka',
      });
    }

    res.json({
      stopName,
      briefing,
      mapsPlaces,
      groundingMetadata,
    });
  } catch (error: any) {
    console.error('Stop Grounding Error:', error);
    res.status(500).json({ error: 'Failed to retrieve stop grounding' });
  }
});

// AI Route Optimization Predictor with Google Maps Corridor Grounding (For Drivers & Admins)
app.post('/api/ai/optimize', async (req, res) => {
  try {
    const { busNumber, routeName, currentStop, stops, availableSeats, totalSeats } = req.body;

    const prompt = `Analyze real-time transit corridor flow and passenger capacity for Jain University College Bus:
Vehicle: ${busNumber} (${routeName})
Current Position: ${currentStop || 'Origin Bay 1-4'}
Full Route Stops: ${stops ? stops.join(' -> ') : 'College Route'}
Occupancy: ${(totalSeats || 40) - (availableSeats ?? 40)}/${totalSeats || 40} seats filled (${availableSeats ?? 40} remaining)
Reference Region: Bangalore South / Kanakapura Road to IT Corridors (Silk Board, Electronic City, Jayanagar, Hosur).

Provide operational recommendations for the driver and transport coordinator:
1. Estimated corridor delay risks & bottleneck hotspots (e.g., Silk Board junction, NICE road toll, Bannerghatta road, Hosur highway).
2. Recommended speed/departure timing adjustments from campus bay.
3. Capacity dispatch advice.`;

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: 12.6456,
                longitude: 77.4416,
              },
            },
          },
        },
      });
    } catch (e: any) {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
    }

    const recommendation = response?.text || 'Corridor transit flows normally. Maintain designated speed limits and passenger verification.';
    const groundingMetadata = response?.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    const mapsPlaces = groundingChunks
      .map((chunk: any) => {
        if (chunk.maps) {
          return {
            title: chunk.maps.title || 'Transit Corridor Point',
            uri: chunk.maps.uri || '',
            address: chunk.maps.address || '',
          };
        }
        return null;
      })
      .filter((p: any) => p && p.uri);

    res.json({ recommendation, mapsPlaces });
  } catch (error: any) {
    console.error('Gemini Optimization Error:', error);
    res.status(500).json({ error: 'Failed to generate AI optimization' });
  }
});

// Mount Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
