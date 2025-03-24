import React, { useState } from "react";
import Contain from '../components/container/Contain';

const formatPlanContent = (content) => {
    return content
      .replace(/\*/g, "") // Remove all asterisks
      .split(/\n{2,}/) // Split by double new lines to group into paragraphs
      .map((paragraph, index) => {
        const trimmedParagraph = paragraph.trim().replace(/^(\•|\-|\d+\.)\s*/, ""); // Remove bullets and numbering
  
        if (!trimmedParagraph) return null; // Ignore empty lines
  
        // Match "Day X: Title" and bold the entire text
        const dayMatch = trimmedParagraph.match(/^(Day\s\d+:\s*)(.*)/);
        if (dayMatch) {
          return (
            <p key={index} className="mb-4 font-normal text-white text-md">
              <span className="font-bold">{dayMatch[1]}{dayMatch[2]}</span>
            </p>
          );
        }
  
        return (
          <p key={index} className="mb-4 font-normal text-white text-md">
            {trimmedParagraph}
          </p>
        );
      });
  };
  
  
  
  

const TravelPlanner = () => {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const prompt = `Create a structured travel plan for ${destination} from ${startDate} to ${endDate}.  
Format the response with clear section headers.  
Include the following sections:  

Trip Overview  
- Provide a brief introduction and key details about the destination, including climate, best travel season, and local culture.  

Daily Itinerary  
- Outline a detailed day-by-day plan covering sightseeing, activities, and recommendations.  
- Specify morning, afternoon, and evening activities.  
- Suggest must-see landmarks, adventure options, and relaxing spots.  

Must-Visit Attractions  
- List key places to visit with a brief description of why they are important.  

Local Food Recommendations  
- Mention popular local dishes and must-visit restaurants or street food spots.  

Transportation Tips  
- Explain the best ways to get around (public transport, taxis, rental cars, etc.).  
- Mention travel passes or local commuting hacks.  

Cultural Customs  
- Share important local customs, traditions, and etiquette to follow.  
- Highlight dress codes, tipping culture, and common greetings.  

Consider these activities: ${activities.join(', ')}  
- Tailor the itinerary based on these user preferences.  
I do not want any type of symbol in the response.
Generate a response which is easy to read and understand.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      const generatedPlan = data.candidates?.[0]?.content?.parts?.[0]?.text 
        || "Failed to generate plan. Please try again.";
      setPlan(generatedPlan);
    } catch (error) {
      console.error("Error generating travel plan:", error);
      setPlan("Error: Failed to generate travel plan. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const addActivity = (e) => {
    e.preventDefault();
    if (newActivity.trim()) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity('');
    }
  };

  const removeActivity = (index) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 min-h-screen bg-gray-900">
      <Contain>
        <div className="relative p-4 min-h-screen text-white bg-gray-800 rounded-lg shadow-md sm:p-6">
          <h1 className="text-2xl font-bold text-center sm:text-3xl">AI Travel Planner</h1>
          
          <form onSubmit={handleSubmit} className="p-6 mt-8 space-y-6 bg-gray-900 rounded-lg shadow-md">
            <div className="space-y-2">
              <label htmlFor="destination" className="block text-sm font-medium text-gray-300">
                Destination:
              </label>
              <input
                type="text"
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination"
                required
                className="px-4 py-2 w-full placeholder-gray-400 text-white bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                  Start Date:
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="px-4 py-2 w-full text-white bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">
                  End Date:
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="px-4 py-2 w-full text-white bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="activities" className="block text-sm font-medium text-gray-300">
                Activities:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="activities"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="Add an activity"
                  className="flex-1 px-4 py-2 placeholder-gray-400 text-white bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addActivity}
                  className="px-4 py-2 text-white bg-blue-700 rounded-md transition-colors hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-800 rounded-md"
                >
                  <span className="text-gray-300">{activity}</span>
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="p-1 text-gray-400 rounded-full transition-colors hover:bg-gray-700"
                  >
                    <span className="text-lg">×</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-3 w-full font-medium text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 
                ${loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-700 hover:bg-blue-600'
                }`}
            >
              {loading ? 'Generating Plan...' : 'Create Travel Plan'}
            </button>
          </form>

          {plan && (
            <div className="p-6 mt-8 bg-gray-900 rounded-lg shadow-md">
              <h2 className="pb-2 mb-8 text-2xl font-bold text-white border-b border-gray-700">
                Your Travel Plan for {destination}
              </h2>
              <div className="max-w-none">
                <div className="space-y-6">
                  {formatPlanContent(plan)}
                </div>
              </div>
            </div>
          )}
        </div>
      </Contain>
    </div>
  );
};

export default TravelPlanner;
    