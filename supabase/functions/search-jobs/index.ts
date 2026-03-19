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
    const { skills, experienceLevel, jobTitles, industries } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const topSkills = skills
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 6)
      .map((s: any) => s.name)
      .join(', ');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a job search assistant. Generate realistic, current job listings that match a candidate's profile. The jobs should be from well-known companies and legitimate job platforms (LinkedIn, Indeed, Glassdoor, company career pages). Include direct application URLs. Jobs must be currently relevant and not expired.

IMPORTANT: Generate jobs that are realistic and match the candidate's skill level. Include a mix of remote and on-site positions from reputable companies.`
          },
          {
            role: 'user',
            content: `Find 8 matching jobs for this candidate:
- Top skills: ${topSkills}
- Experience: ${experienceLevel}
- Previous roles: ${(jobTitles || []).join(', ') || 'Not specified'}
- Industries: ${(industries || []).join(', ') || 'Not specified'}

Return ONLY a JSON object:
{"jobs": [
  {
    "title": "Senior Frontend Engineer",
    "company": "Google",
    "location": "Remote / Mountain View, CA",
    "type": "Full-time",
    "match": 92,
    "url": "https://careers.google.com/jobs",
    "source": "Google Careers",
    "postedDate": "Recent"
  }
]}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Failed to search jobs' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let parsed;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonStr.trim());
    } catch {
      console.error('Failed to parse jobs:', content.substring(0, 500));
      return new Response(JSON.stringify({ error: 'Failed to parse jobs' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(
      JSON.stringify({ jobs: parsed.jobs || parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
