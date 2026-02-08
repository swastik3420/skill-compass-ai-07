import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { skills, experienceLevel } = await req.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      console.error('Invalid skills provided');
      return new Response(
        JSON.stringify({ error: 'Skills array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating questions for', skills.length, 'skills, experience level:', experienceLevel);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select top skills for assessment (max 5-7 skills)
    const topSkills = skills.slice(0, 7).map((s: any) => 
      typeof s === 'string' ? s : s.name
    );

    const systemPrompt = `You are an expert technical interviewer creating a skill assessment. Generate assessment questions for the following skills: ${topSkills.join(', ')}.

The candidate's estimated experience level is: ${experienceLevel || 'Unknown'}

For EACH skill, generate 1-2 questions (total 5-8 questions). Include a mix of difficulty levels:
- Basic: Fundamental concepts everyone should know
- Intermediate: Practical application knowledge
- Advanced: Deep understanding and edge cases

Each question must have exactly 4 options with only ONE correct answer.

Return your response as a JSON array with this structure:
[
  {
    "skill": "JavaScript",
    "difficulty": "Basic",
    "question": "What is the difference between '==' and '===' in JavaScript?",
    "options": [
      "'===' checks type and value, '==' only checks value after type coercion",
      "'==' is faster than '==='",
      "They are exactly the same",
      "'===' is deprecated"
    ],
    "correctAnswer": 0,
    "explanation": "The === operator performs strict equality checking both type and value, while == performs type coercion before comparison."
  }
]

Important:
- Make questions practical and relevant to real-world work
- Ensure options are plausible (not obviously wrong)
- correctAnswer is the 0-based index of the correct option
- Include a brief explanation for learning purposes

Only return valid JSON array, no additional text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate assessment questions for these skills: ${topSkills.join(', ')}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate questions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the AI response
    let questions;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      questions = JSON.parse(jsonStr.trim());
      
      // Add IDs to questions
      questions = questions.map((q: any, index: number) => ({
        ...q,
        id: index + 1
      }));
      
      console.log('Successfully generated', questions.length, 'questions');
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw content:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse questions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
