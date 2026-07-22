import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { roles, location } = await req.json();
    if (!Array.isArray(roles) || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'roles required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const boundedRoles = roles.slice(0, 8).map((r: any) => String(r).slice(0, 120));
    const loc = (typeof location === 'string' && location.trim()) ? location.slice(0, 100) : 'India';

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemInstruction = 'You are a labor-market analyst producing job-hiring seasonality data from public sources (LinkedIn Workforce Reports, BLS, Naukri JobSpeak Index, Indeed Hiring Lab, Glassdoor Economic Research). Return valid JSON only.';

    const userPrompt = `Produce a 12-month seasonality profile for switching jobs into these roles in ${loc}:
Roles: ${boundedRoles.join(' | ')}

Return ONLY JSON of exact shape:
{
  "location": "${loc}",
  "roles": ["role1", ...],
  "months": [
    {
      "month": "Jan",
      "hiringVolume": 0-100,
      "salaryLeverage": 0-100,
      "note": "short reason (bonus payouts, budget freeze, etc.)"
    }
  ],
  "optimalWindow": { "startMonth": "Jan", "endMonth": "Mar", "reason": "why this window is best" },
  "secondaryWindow": { "startMonth": "Sep", "endMonth": "Oct", "reason": "why" }
}

hiringVolume = relative job-opening volume (100 = peak).
salaryLeverage = candidate negotiation power (higher after annual bonus payouts and performance reviews, lower during hiring freezes / holiday slowdown).
Include ALL 12 months in order Jan..Dec. Be realistic to ${loc}'s corporate calendar.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error('AI error:', response.status, t);
      return new Response(JSON.stringify({ error: 'Failed to fetch seasonality' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let parsed;
    try {
      const m = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      parsed = JSON.parse((m ? m[1] : content).trim());
    } catch {
      console.error('parse fail', content.substring(0, 400));
      return new Response(JSON.stringify({ error: 'Parse failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
