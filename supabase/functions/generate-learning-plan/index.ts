import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { skill, hours_per_week } = await req.json();
    console.log('Generating learning plan for:', { skill, hours_per_week });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create a comprehensive prompt for the AI to generate a learning plan
    const systemPrompt = `You are an expert career advisor and learning path optimizer. Your role is to analyze skills and recommend the best learning resources with accurate ROI projections.

When analyzing a skill, provide:
1. Top 3 FREE courses from reputable platforms (Coursera, edX, Udacity, Khan Academy, freeCodeCamp, etc.)
2. Top 3 PAID courses that offer the best ROI
3. An 8-week learning plan broken down by weekly tasks

For each course, include:
- Title (specific and real)
- Provider (actual platform name)
- Duration (realistic timeframe in weeks)
- Price (0 for free, realistic prices for paid courses like $99-$599)
- Estimated salary impact (conservative estimates based on market data for that skill, typically $8,000-$50,000/year depending on the skill level)

IMPORTANT: Base your salary impact estimates on:
- Entry-level skills: $8,000 - $15,000/year increase
- Mid-level skills: $15,000 - $30,000/year increase  
- Advanced/specialized skills: $30,000 - $50,000/year increase

Return ONLY valid JSON in this exact format:
{
  "best_free": [
    {
      "title": "Course Name",
      "provider": "Platform Name",
      "duration": "X weeks",
      "price": 0,
      "salary_delta_est": 15000
    }
  ],
  "best_paid": [
    {
      "title": "Course Name",
      "provider": "Platform Name", 
      "duration": "X weeks",
      "price": 299,
      "salary_delta_est": 35000
    }
  ],
  "plan_weeks": [
    {
      "week": 1,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ]
}`;

    const userPrompt = `Create a personalized learning plan for someone who wants to become a ${skill}. 
They can dedicate ${hours_per_week} hours per week to learning.

Provide:
1. The 3 best FREE courses for this skill
2. The 3 best PAID courses with highest ROI
3. An 8-week learning plan with 3-4 specific tasks per week

Consider the time commitment of ${hours_per_week} hours/week when creating the weekly plan.`;

    console.log('Calling Lovable AI Gateway...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    const aiContent = data.choices[0].message.content;
    console.log('AI content:', aiContent);

    // Parse the JSON from the AI response
    let learningPlan;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      learningPlan = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI content was:', aiContent);
      throw new Error('Failed to parse learning plan from AI response');
    }

    console.log('Successfully generated learning plan');
    
    return new Response(
      JSON.stringify(learningPlan),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-learning-plan function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to generate learning plan'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
