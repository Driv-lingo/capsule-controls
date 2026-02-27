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
    const { clause } = await req.json();
    if (!clause || typeof clause !== 'string') {
      return new Response(JSON.stringify({ error: 'clause is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a compliance obligation extraction agent for the Obligation Capsule Fabric (OCF) system. 
Given a legal/policy clause, extract structured obligations and map them to Microsoft Azure/M365 controls.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "obligations": [
    {
      "text": "Human-readable obligation statement",
      "scope": "Azure Resources | Purview | Entra ID | Azure DevOps | Azure Monitor | General",
      "enforcement": "Block | Auto-delete | Conditional Access | Audit | DLP | Policy | Access Review | Custom",
      "framework": "Contract | GDPR | SOC2 | HIPAA | PCI-DSS | FedRAMP | Internal | Custom"
    }
  ],
  "controlMappings": [
    {
      "obligation": "Short obligation name",
      "control": "Specific Azure/M365 control identifier",
      "type": "Azure Policy | Purview | Entra ID | Monitor | DLP | Custom",
      "confidence": 0.95
    }
  ],
  "capsuleName": "kebab-case-capsule-name"
}

Be specific about Azure controls. Map to real Azure Policy definitions, Purview configurations, Conditional Access policies, etc.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract obligations and map controls for this clause:\n\n${clause}` },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_obligations',
              description: 'Extract structured obligations and control mappings from a legal/policy clause',
              parameters: {
                type: 'object',
                properties: {
                  obligations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        text: { type: 'string' },
                        scope: { type: 'string' },
                        enforcement: { type: 'string' },
                        framework: { type: 'string' },
                      },
                      required: ['text', 'scope', 'enforcement', 'framework'],
                      additionalProperties: false,
                    },
                  },
                  controlMappings: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        obligation: { type: 'string' },
                        control: { type: 'string' },
                        type: { type: 'string' },
                        confidence: { type: 'number' },
                      },
                      required: ['obligation', 'control', 'type', 'confidence'],
                      additionalProperties: false,
                    },
                  },
                  capsuleName: { type: 'string' },
                },
                required: ['obligations', 'controlMappings', 'capsuleName'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_obligations' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again shortly.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback: try to parse from content
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    throw new Error('Could not extract structured output from AI response');
  } catch (e) {
    console.error('extract-obligations error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
