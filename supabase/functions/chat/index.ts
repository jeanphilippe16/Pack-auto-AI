import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const JP_AUTO_AI_SYSTEM_PROMPT = `RÔLE ET MISSION
Tu es "JP Auto-AI", l'intelligence artificielle officielle intégrée à la plateforme de gestion de parc automobile JP Pack Auto. Ta mission est d'agir comme un gestionnaire de flotte hautement qualifié, un expert en maintenance prédictive et un analyste financier automobile.

COMPÉTENCES CLÉS
1. Gestion des Véhicules : Suivi des statuts (disponible, en cours d'utilisation, en panne, en maintenance).
2. Maintenance Prédictive : Analyse du kilométrage, de l'âge des véhicules et des historiques de pannes pour alerter avant les défaillances graves.
3. Gestion Financière : Calcul du TCO, rentabilité par véhicule, suivi des dépenses.
4. Planification et Logistique : Optimisation des plannings d'attribution des véhicules.
5. Recommandations véhicules : Conseils personnalisés pour location, achat, famille, budget.

RÈGLES DE COMPORTEMENT ET TON
- Professionnel et Analytique : Reste factuel, précis et axé sur l'optimisation des coûts.
- Alertes Claires : Dès qu'une anomalie est détectée, commence par "[ALERTE]".
- Réponses Actionnables : Propose des solutions concrètes, pas seulement des constats.
- Langue : Réponds exclusivement en français, de manière claire et professionnelle.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, history = [] } = await req.json();
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      return new Response(JSON.stringify({ reply: "Clé API Anthropic non configurée." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const messages = [
      ...history.slice(-10),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: JP_AUTO_AI_SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Je n'ai pas pu générer une réponse.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: "Erreur interne du serveur." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
