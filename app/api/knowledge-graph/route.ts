import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// Get the Browserless API key from environment variables
const BROWSERLESS_API_KEY = process.env.BROWSERLESS_API_KEY || 'your-browserless-api-key';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

// Function to check if OpenAI API key is valid
const isValidOpenAIKey = (key: string): boolean => {
  if (!key) return false;
  if (key === '') return false;
  if (key === 'your-openai-api-key') return false;
  return true;
};

// Polyfill for AbortSignal.timeout if not available
if (!AbortSignal.timeout) {
  AbortSignal.timeout = (ms: number): AbortSignal => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error(`Timeout after ${ms}ms`)), ms);
    return controller.signal;
  };
}

// Define interface for input
interface ProfileInput {
  title: string;
  location: string;
  company: string;
  age?: number;
  additionalContext?: string[];
}

// Define interface for OpenAI response data structure
interface OpenAIToolsUsed {
  'High Probability': string[];
  'Medium Probability': string[];
  'Low Probability': string[];
}

interface OpenAIAttributeRanges {
  'Pattern Recognition': string;
  'Associative Memory': string;
  'Emotional Influence': string;
  'Heuristic Processing': string;
  'Parallel Processing': string;
  'Implicit Learning': string;
  'Reflexive Responses': string;
  'Cognitive Biases': string;
  'Logical Reasoning': string;
  'Abstract Thinking': string;
  'Deliberative Decision-Making': string;
  'Sequential Processing': string;
  'Cognitive Control (Inhibition)': string;
  'Goal-Oriented Planning': string;
  'Meta-Cognition': string;
}

interface OpenAIGraphData {
  'Tools Used': OpenAIToolsUsed;
  'Biggest Pain Points': OpenAIToolsUsed;
  'Attribute Ranges': OpenAIAttributeRanges;
  'Education Level & Learning Approach': string;
}

// Define interface for knowledge graph output
interface KnowledgeGraph {
  toolsUsed: {
    highProbability: string[];
    mediumProbability: string[];
    lowProbability: string[];
  };
  biggestPainPoints: {
    highProbability: string[];
    mediumProbability: string[];
    lowProbability: string[];
  };
  attributeRanges: {
    patternRecognition: string;
    associativeMemory: string;
    emotionalInfluence: string;
    heuristicProcessing: string;
    parallelProcessing: string;
    implicitLearning: string;
    reflexiveResponses: string;
    cognitiveBiases: string;
    logicalReasoning: string;
    abstractThinking: string;
    deliberativeDecisionMaking: string;
    sequentialProcessing: string;
    cognitiveControl: string;
    goalOrientedPlanning: string;
    metaCognition: string;
  };
  educationLevelAndLearning: string;
}

export async function POST(request: NextRequest) {
  try {
    const profileInput: ProfileInput = await request.json();

    // Validate input
    if (!profileInput.title || !profileInput.location || !profileInput.company) {
      return NextResponse.json(
        { error: 'Please provide title, location, and company' },
        { status: 400 }
      );
    }

    let browser;
    
    // Check if we have a valid Browserless API key
    if (BROWSERLESS_API_KEY && BROWSERLESS_API_KEY !== 'your-browserless-api-key') {
      console.log('Connecting to Browserless.io...');
      browser = await puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`,
      });
    } else {
      // Fallback to local browser if Browserless is not configured
      console.log('Browserless API key not configured, falling back to local browser...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
      });
    }

    try {
      // Sources to scrape - using only LinkedIn and Reddit to avoid Google CAPTCHA
      const sources = [
        // LinkedIn search for the role
        `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(`${profileInput.title} ${profileInput.company}`)}`,
        // Reddit discussions about the role
        `https://www.reddit.com/search/?q=${encodeURIComponent(`${profileInput.title} tools`)}`,
        // Reddit discussions about pain points
        `https://www.reddit.com/search/?q=${encodeURIComponent(`${profileInput.title} challenges problems`)}`,
        // LinkedIn Learning search for the role
        `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(profileInput.title)}`
      ];

      // Scrape all sources
      const scrapedData = await Promise.all(
        sources.map(async (url, index) => {
          try {
            console.log(`[Scraping] Source ${index + 1}: ${url}`);
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Extract relevant text from the page
            const textContent = await page.evaluate(() => {
              return document.body.innerText;
            });
            
            console.log(`[Scraping] Source ${index + 1} completed, extracted ${textContent.length} characters`);
            await page.close();
            return textContent;
          } catch (error) {
            console.error(`[Scraping] Error scraping ${url}:`, error);
            return '';
          }
        })
      );

      // Close the browser
      await browser.close();

      // Generate knowledge graph based on scraped data and input
      console.log(`[Knowledge Graph] Generating knowledge graph for ${profileInput.title} at ${profileInput.company}`);
      const knowledgeGraph = await generateKnowledgeGraph(profileInput, scrapedData);
      
      return NextResponse.json({ knowledgeGraph });
    } catch (error) {
      // Ensure browser is closed in case of error
      if (browser) await browser.close();
      throw error;
    }
  } catch (error) {
    console.error('Knowledge graph generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function generateKnowledgeGraph(profileInput: ProfileInput, scrapedData: string[]): Promise<KnowledgeGraph> {
  // Check if OpenAI API key is available and valid
  if (!isValidOpenAIKey(OPENAI_API_KEY)) {
    console.log('[OpenAI] API key not configured, using fallback knowledge graph generation...');
    return fallbackGenerateKnowledgeGraph(profileInput);
  }

  // Combine all scraped data into one text for analysis
  const combinedText = scrapedData.join(' ').substring(0, 16000); // Limit text length for API calls
  console.log(combinedText);
  console.log(`[OpenAI] Prepared ${combinedText.length} characters of scraped data for analysis`);
  
  // Prepare the prompt for the LLM
  const systemPrompt = `You are a professional knowledge graph generator. You need to analyze information about a professional profile and generate a structured knowledge graph in JSON format.`;
  
  const userPrompt = `
Generate a structured knowledge graph for the following professional profile:

Professional Profile:
- Title: ${profileInput.title}
- Company: ${profileInput.company}
- Location: ${profileInput.location}
${profileInput.age ? `- Age: ${profileInput.age}` : ''}
${profileInput.additionalContext && profileInput.additionalContext.length > 0 
  ? `- Additional Context: ${profileInput.additionalContext.join(', ')}` 
  : ''}

I have scraped data from the web about this profile:
${combinedText}

Create a professional knowledge graph JSON with the following structure:

1. Tools Used:
   - High Probability (90%): List 3-5 tools that people in this role are very likely to use
   - Medium Probability (70%): List 3-5 tools that people in this role might use
   - Low Probability (50%): List 3-5 tools that people in this role occasionally use

2. Biggest Pain Points:
   - High Probability (90%): List 2-4 pain points that people in this role are very likely to face
   - Medium Probability (70%): List 2-4 pain points that people in this role might face
   - Low Probability (50%): List 2-4 pain points that people in this role occasionally face

3. Attribute Ranges (rate each as Low, Medium, or High):
   - Pattern Recognition
   - Associative Memory
   - Emotional Influence
   - Heuristic Processing
   - Parallel Processing
   - Implicit Learning
   - Reflexive Responses
   - Cognitive Biases
   - Logical Reasoning
   - Abstract Thinking
   - Deliberative Decision-Making
   - Sequential Processing
   - Cognitive Control (Inhibition)
   - Goal-Oriented Planning
   - Meta-Cognition

4. Education Level & Learning Approach:
   - Provide a paragraph describing typical education requirements and learning approaches for this role

ONLY respond with the JSON object directly. Do not include any explanations, markdown formatting, or additional text.
`;

  try {
    console.log('[OpenAI] Calling OpenAI API with model:', OPENAI_MODEL);
    const response = await fetch(OPENAI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OpenAI] API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API returned status ${response.status}: ${errorText}`);
    }

    console.log('[OpenAI] Received successful response from API');
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    // Extract JSON from the result
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : result;

    try {
      // Parse the JSON
      console.log('[OpenAI] Parsing response JSON');
      const knowledgeGraph = JSON.parse(jsonStr);
      console.log('Knowledge graph:', knowledgeGraph);
      
      // Validate and format the knowledge graph
      return formatKnowledgeGraph(knowledgeGraph, profileInput);
    } catch (error) {
      console.error('[OpenAI] Error parsing response JSON:', error);
      throw new Error('Failed to parse OpenAI response');
    }
  } catch (error) {
    console.error('[OpenAI] Error during API call or processing:', error);
    // Fallback to predefined knowledge graph if API call fails
    return fallbackGenerateKnowledgeGraph(profileInput);
  }
}

// Fallback function that uses predefined data based on role
function fallbackGenerateKnowledgeGraph(profileInput: ProfileInput): KnowledgeGraph {
  console.log('[Fallback] Using predefined knowledge graph template for role:', profileInput.title);
  
  let toolsUsed = {
    highProbability: [] as string[],
    mediumProbability: [] as string[],
    lowProbability: [] as string[]
  };
  
  let biggestPainPoints = {
    highProbability: [] as string[],
    mediumProbability: [] as string[],
    lowProbability: [] as string[]
  };
  
  let attributeRanges = {
    patternRecognition: "Medium",
    associativeMemory: "Medium",
    emotionalInfluence: "Medium",
    heuristicProcessing: "Medium",
    parallelProcessing: "Medium",
    implicitLearning: "Medium",
    reflexiveResponses: "Medium",
    cognitiveBiases: "Medium",
    logicalReasoning: "Medium",
    abstractThinking: "Medium",
    deliberativeDecisionMaking: "Medium",
    sequentialProcessing: "Medium",
    cognitiveControl: "Medium",
    goalOrientedPlanning: "Medium",
    metaCognition: "Medium"
  };
  
  let educationLevelAndLearning = "Bachelor's degree with continuous professional development";
  
  // Product Manager specific data
  if (profileInput.title.toLowerCase().includes('product manager')) {
    toolsUsed = {
      highProbability: ["JIRA", "Confluence", "Figma", "Google Analytics", "Slack"],
      mediumProbability: ["Amplitude", "Trello", "Asana", "Miro", "Notion"],
      lowProbability: ["Productboard", "Pendo", "Hotjar", "Optimizely", "FullStory"]
    };
    
    biggestPainPoints = {
      highProbability: [
        "Balancing stakeholder needs and expectations", 
        "Prioritizing features with limited resources",
        "Getting accurate customer feedback"
      ],
      mediumProbability: [
        "Aligning engineering and design teams", 
        "Meeting tight deadlines", 
        "Managing technical debt"
      ],
      lowProbability: [
        "Defining clear success metrics", 
        "Handling changing market conditions",
        "Maintaining product documentation"
      ]
    };
    
    attributeRanges = {
      patternRecognition: "High",
      associativeMemory: "Medium",
      emotionalInfluence: "High",
      heuristicProcessing: "High",
      parallelProcessing: "High",
      implicitLearning: "Medium",
      reflexiveResponses: "Medium",
      cognitiveBiases: "Medium",
      logicalReasoning: "High",
      abstractThinking: "High",
      deliberativeDecisionMaking: "High",
      sequentialProcessing: "Medium",
      cognitiveControl: "High",
      goalOrientedPlanning: "High",
      metaCognition: "High"
    };
    
    educationLevelAndLearning = "Bachelor's or Master's degree in Business, Computer Science, or related field. Continuous learning through industry events, product communities, and online courses.";
  }
  
  // Software Engineer specific data
  else if (profileInput.title.toLowerCase().includes('software engineer') || profileInput.title.toLowerCase().includes('developer')) {
    toolsUsed = {
      highProbability: ["Git", "VS Code", "Stack Overflow", "JIRA", "Docker"],
      mediumProbability: ["Jenkins", "Kubernetes", "Postman", "Figma", "Slack"],
      lowProbability: ["TypeScript", "GraphQL", "MongoDB", "Redis", "Terraform"]
    };
    
    biggestPainPoints = {
      highProbability: [
        "Debugging complex issues", 
        "Meeting project deadlines",
        "Technical debt management"
      ],
      mediumProbability: [
        "Unclear requirements", 
        "Balancing new features vs. maintenance", 
        "Context switching between projects"
      ],
      lowProbability: [
        "Knowledge sharing across teams", 
        "Keeping up with new technologies",
        "Documentation maintenance"
      ]
    };
    
    attributeRanges = {
      patternRecognition: "High",
      associativeMemory: "Medium",
      emotionalInfluence: "Low",
      heuristicProcessing: "High",
      parallelProcessing: "Medium",
      implicitLearning: "Medium",
      reflexiveResponses: "Low",
      cognitiveBiases: "Medium",
      logicalReasoning: "High",
      abstractThinking: "High",
      deliberativeDecisionMaking: "Medium",
      sequentialProcessing: "High",
      cognitiveControl: "High",
      goalOrientedPlanning: "Medium",
      metaCognition: "High"
    };
    
    educationLevelAndLearning = "Bachelor's or Master's degree in Computer Science, Software Engineering, or related field. Continuous learning through documentation, Stack Overflow, GitHub, technical blogs, and online courses.";
  }
  
  // Sales specific data
  else if (profileInput.title.toLowerCase().includes('sales')) {
    toolsUsed = {
      highProbability: ["Salesforce", "LinkedIn Sales Navigator", "Outreach", "ZoomInfo", "Slack"],
      mediumProbability: ["HubSpot", "Gong", "Calendly", "DocuSign", "Zoom"],
      lowProbability: ["Salesloft", "6sense", "Clearbit", "Pandadoc", "Chorus.ai"]
    };
    
    biggestPainPoints = {
      highProbability: [
        "Meeting sales quotas", 
        "Lead quality and quantity",
        "Long sales cycles"
      ],
      mediumProbability: [
        "CRM data management", 
        "Competitive differentiation", 
        "Internal communication barriers"
      ],
      lowProbability: [
        "Product knowledge gaps", 
        "Price negotiation constraints",
        "Post-sales handoff problems"
      ]
    };
    
    attributeRanges = {
      patternRecognition: "Medium",
      associativeMemory: "High",
      emotionalInfluence: "High",
      heuristicProcessing: "High",
      parallelProcessing: "Medium",
      implicitLearning: "High",
      reflexiveResponses: "High",
      cognitiveBiases: "Medium",
      logicalReasoning: "Medium",
      abstractThinking: "Medium",
      deliberativeDecisionMaking: "Medium",
      sequentialProcessing: "Low",
      cognitiveControl: "Medium",
      goalOrientedPlanning: "High",
      metaCognition: "Medium"
    };
    
    educationLevelAndLearning = "Bachelor's degree in Business, Marketing, or related field. Learning through sales training programs, industry events, and competitor research.";
  }
  
  // Default values for other roles not specifically handled
  else {
    // Generic professional tools and pain points
    toolsUsed = {
      highProbability: ["Microsoft Office Suite", "Slack", "Zoom", "Google Workspace", "LinkedIn"],
      mediumProbability: ["Asana", "Trello", "Notion", "Teams", "Salesforce"],
      lowProbability: ["Tableau", "PowerBI", "Airtable", "Monday.com", "Miro"]
    };
    
    biggestPainPoints = {
      highProbability: [
        "Work-life balance", 
        "Communication challenges",
        "Time management"
      ],
      mediumProbability: [
        "Information overload", 
        "Meeting efficiency", 
        "Remote collaboration"
      ],
      lowProbability: [
        "Career development", 
        "Tool fragmentation",
        "Process inefficiencies"
      ]
    };
  }
  
  return {
    toolsUsed,
    biggestPainPoints,
    attributeRanges,
    educationLevelAndLearning
  };
}

// Function to validate and format the knowledge graph
function formatKnowledgeGraph(data: OpenAIGraphData, profileInput: ProfileInput): KnowledgeGraph {
  // Initialize with default values
  const defaultGraph = fallbackGenerateKnowledgeGraph(profileInput);

  console.log('[formatKnowledgeGraph] Formatting knowledge graph data');
  
  // Create a formatted knowledge graph with proper structure
  const formattedGraph: KnowledgeGraph = {
    toolsUsed: {
      highProbability: Array.isArray(data?.['Tools Used']?.['High Probability']) 
        ? data['Tools Used']['High Probability'].slice(0, 5) 
        : defaultGraph.toolsUsed.highProbability,
      mediumProbability: Array.isArray(data?.['Tools Used']?.['Medium Probability']) 
        ? data['Tools Used']['Medium Probability'].slice(0, 5) 
        : defaultGraph.toolsUsed.mediumProbability,
      lowProbability: Array.isArray(data?.['Tools Used']?.['Low Probability']) 
        ? data['Tools Used']['Low Probability'].slice(0, 5) 
        : defaultGraph.toolsUsed.lowProbability,
    },
    biggestPainPoints: {
      highProbability: Array.isArray(data?.['Biggest Pain Points']?.['High Probability']) 
        ? data['Biggest Pain Points']['High Probability'].slice(0, 4) 
        : defaultGraph.biggestPainPoints.highProbability,
      mediumProbability: Array.isArray(data?.['Biggest Pain Points']?.['Medium Probability']) 
        ? data['Biggest Pain Points']['Medium Probability'].slice(0, 4) 
        : defaultGraph.biggestPainPoints.mediumProbability,
      lowProbability: Array.isArray(data?.['Biggest Pain Points']?.['Low Probability']) 
        ? data['Biggest Pain Points']['Low Probability'].slice(0, 4) 
        : defaultGraph.biggestPainPoints.lowProbability,
    },
    attributeRanges: {
      patternRecognition: isValidLevel(data?.['Attribute Ranges']?.['Pattern Recognition']) 
        ? data['Attribute Ranges']['Pattern Recognition'] 
        : defaultGraph.attributeRanges.patternRecognition,
      associativeMemory: isValidLevel(data?.['Attribute Ranges']?.['Associative Memory']) 
        ? data['Attribute Ranges']['Associative Memory'] 
        : defaultGraph.attributeRanges.associativeMemory,
      emotionalInfluence: isValidLevel(data?.['Attribute Ranges']?.['Emotional Influence']) 
        ? data['Attribute Ranges']['Emotional Influence'] 
        : defaultGraph.attributeRanges.emotionalInfluence,
      heuristicProcessing: isValidLevel(data?.['Attribute Ranges']?.['Heuristic Processing']) 
        ? data['Attribute Ranges']['Heuristic Processing'] 
        : defaultGraph.attributeRanges.heuristicProcessing,
      parallelProcessing: isValidLevel(data?.['Attribute Ranges']?.['Parallel Processing']) 
        ? data['Attribute Ranges']['Parallel Processing'] 
        : defaultGraph.attributeRanges.parallelProcessing,
      implicitLearning: isValidLevel(data?.['Attribute Ranges']?.['Implicit Learning']) 
        ? data['Attribute Ranges']['Implicit Learning'] 
        : defaultGraph.attributeRanges.implicitLearning,
      reflexiveResponses: isValidLevel(data?.['Attribute Ranges']?.['Reflexive Responses']) 
        ? data['Attribute Ranges']['Reflexive Responses'] 
        : defaultGraph.attributeRanges.reflexiveResponses,
      cognitiveBiases: isValidLevel(data?.['Attribute Ranges']?.['Cognitive Biases']) 
        ? data['Attribute Ranges']['Cognitive Biases'] 
        : defaultGraph.attributeRanges.cognitiveBiases,
      logicalReasoning: isValidLevel(data?.['Attribute Ranges']?.['Logical Reasoning']) 
        ? data['Attribute Ranges']['Logical Reasoning'] 
        : defaultGraph.attributeRanges.logicalReasoning,
      abstractThinking: isValidLevel(data?.['Attribute Ranges']?.['Abstract Thinking']) 
        ? data['Attribute Ranges']['Abstract Thinking'] 
        : defaultGraph.attributeRanges.abstractThinking,
      deliberativeDecisionMaking: isValidLevel(data?.['Attribute Ranges']?.['Deliberative Decision-Making']) 
        ? data['Attribute Ranges']['Deliberative Decision-Making'] 
        : defaultGraph.attributeRanges.deliberativeDecisionMaking,
      sequentialProcessing: isValidLevel(data?.['Attribute Ranges']?.['Sequential Processing']) 
        ? data['Attribute Ranges']['Sequential Processing'] 
        : defaultGraph.attributeRanges.sequentialProcessing,
      cognitiveControl: isValidLevel(data?.['Attribute Ranges']?.['Cognitive Control (Inhibition)']) 
        ? data['Attribute Ranges']['Cognitive Control (Inhibition)'] 
        : defaultGraph.attributeRanges.cognitiveControl,
      goalOrientedPlanning: isValidLevel(data?.['Attribute Ranges']?.['Goal-Oriented Planning']) 
        ? data['Attribute Ranges']['Goal-Oriented Planning'] 
        : defaultGraph.attributeRanges.goalOrientedPlanning,
      metaCognition: isValidLevel(data?.['Attribute Ranges']?.['Meta-Cognition']) 
        ? data['Attribute Ranges']['Meta-Cognition'] 
        : defaultGraph.attributeRanges.metaCognition,
    },
    educationLevelAndLearning: typeof data?.['Education Level & Learning Approach'] === 'string' && data['Education Level & Learning Approach'].length > 10
      ? data['Education Level & Learning Approach']
      : defaultGraph.educationLevelAndLearning
  };

  return formattedGraph;
}

// Helper function to check if an attribute level is valid
function isValidLevel(level: string | undefined): boolean {
  if (typeof level !== 'string') return false;
  const validLevels = ['Low', 'Medium', 'High'];
  return validLevels.includes(level);
} 