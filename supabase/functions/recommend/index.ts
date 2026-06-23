import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CarInput {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  type: string;
  price_rental_daily: number;
  price_sale: number;
  fuel_type: string;
  transmission: string;
  seats: number;
  features: string[];
}

interface RecommendRequest {
  criteria: string;
  cars?: CarInput[];
  carId?: string;
}

function scoreCar(car: CarInput, criteriaWords: string[]): number {
  let score = 0;
  const carText = `${car.brand} ${car.model} ${car.category} ${car.fuel_type} ${car.transmission} ${car.features.join(' ')}`.toLowerCase();
  for (const word of criteriaWords) {
    const w = word.toLowerCase().trim();
    if (!w || w.length < 2) continue;
    if (carText.includes(w)) score += 10;
    if (w.includes('suv') && car.category.toLowerCase().includes('suv')) score += 8;
    if (w.includes('berline') && car.category.toLowerCase().includes('berline')) score += 8;
    if (w.includes('citadine') && car.category.toLowerCase().includes('citadine')) score += 8;
    if (w.includes('sport') && car.category.toLowerCase().includes('sport')) score += 8;
    if (w.includes('utilitaire') && car.category.toLowerCase().includes('utilitaire')) score += 8;
    if (w.includes('break') && car.category.toLowerCase().includes('break')) score += 8;
    if (w.includes('electrique') && car.fuel_type.toLowerCase().includes('electrique')) score += 8;
    if (w.includes('hybride') && car.fuel_type.toLowerCase().includes('hybride')) score += 8;
    if (w.includes('diesel') && car.fuel_type.toLowerCase().includes('diesel')) score += 8;
    if (w.includes('essence') && car.fuel_type.toLowerCase().includes('essence')) score += 8;
    if (w.includes('automatique') && car.transmission.toLowerCase().includes('automatique')) score += 5;
    if (w.includes('manuelle') && car.transmission.toLowerCase().includes('manuelle')) score += 5;
    if ((w.includes('famille') || w.includes('5 places') || w.includes('7 places')) && car.seats >= 5) score += 6;
    if (w.includes('grand') && car.seats >= 7) score += 4;
    const budgetMatch = w.match(/(\d+)/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1]);
      if (w.includes('jour') || w.includes('daily')) {
        if (car.price_rental_daily <= budget) score += 7;
        if (car.price_rental_daily <= budget * 0.8) score += 3;
      } else if (w.includes('vente') || w.includes('achat') || w.includes('prix')) {
        if (car.price_sale <= budget) score += 7;
        if (car.price_sale <= budget * 0.9) score += 3;
      }
    }
    if (car.features.some(f => f.toLowerCase().includes(w))) score += 4;
  }
  return score;
}

function generateRecommendationText(car: CarInput, criteria: string): string {
  const parts: string[] = [];
  parts.push(`Le ${car.brand} ${car.model} (${car.year}) est recommande pour vos besoins.`);
  if (car.category) parts.push(`Categorie ${car.category} correspondant a votre recherche.`);
  if (car.fuel_type) parts.push(`Motorisation ${car.fuel_type}, transmission ${car.transmission}.`);
  if (car.seats >= 5) parts.push(`${car.seats} places - ideal pour vos trajets.`);
  if (car.features.length > 0) parts.push(`Equipements : ${car.features.slice(0, 4).join(', ')}.`);
  if (car.price_rental_daily > 0) parts.push(`Location a partir de ${car.price_rental_daily} EUR/jour.`);
  if (car.price_sale > 0) parts.push(`Prix de vente : ${car.price_sale.toLocaleString('fr-FR')} EUR.`);
  return parts.join(' ');
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RecommendRequest;
    const { criteria, cars, carId } = body;

    if (!criteria) {
      return new Response(JSON.stringify({ error: "criteria is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const criteriaWords = criteria.split(/[\s,;]+/).filter(w => w.length >= 2);

    if (carId && cars) {
      const car = cars.find((c: CarInput) => c.id === carId);
      if (car) {
        const recommendationText = generateRecommendationText(car, criteria);
        return new Response(JSON.stringify({ recommendation: recommendationText, recommendedIds: [car.id] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (cars && cars.length > 0) {
      const scored = cars
        .map((car: CarInput) => ({ car, score: scoreCar(car, criteriaWords) }))
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
      const top = scored.slice(0, 6).filter((s: { score: number }) => s.score > 0);
      const recommendedIds = top.map((s: { car: CarInput }) => s.car.id);

      let recommendationText = '';
      if (top.length > 0) {
        recommendationText = `Base sur vos criteres "${criteria}", voici mes recommandations :\n\n`;
        top.forEach((item: { car: CarInput; score: number }, index: number) => {
          recommendationText += `${index + 1}. ${item.car.brand} ${item.car.model} (${item.car.year}) - Compatibilite : ${Math.min(100, Math.round(item.score * 3))}%\n`;
          if (item.car.price_rental_daily > 0) recommendationText += `   Location : ${item.car.price_rental_daily} EUR/jour`;
          if (item.car.price_sale > 0) recommendationText += ` | Vente : ${item.car.price_sale.toLocaleString('fr-FR')} EUR`;
          recommendationText += '\n';
        });
      } else {
        recommendationText = `Aucun vehicule ne correspond parfaitement a "${criteria}". Essayez "SUV", "electrique", "famille" ou un budget comme "200/jour".`;
      }
      return new Response(JSON.stringify({ recommendation: recommendationText, recommendedIds }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "No cars data provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
