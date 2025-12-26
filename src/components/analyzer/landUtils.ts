// Fonction de détection complète utilisant notre base de données
export function isLandCardComplete(name: string): boolean {
  const lowerName = name.toLowerCase();

  // Liste complète des lands connus (synchronisée avec landDetection.ts)
  const knownLands = new Set([
    // Basic Lands
    "plains",
    "island",
    "swamp",
    "mountain",
    "forest",
    "wastes",
    "snow-covered plains",
    "snow-covered island",
    "snow-covered swamp",
    "snow-covered mountain",
    "snow-covered forest",

    // Fetchlands
    "flooded strand",
    "polluted delta",
    "bloodstained mire",
    "wooded foothills",
    "windswept heath",
    "scalding tarn",
    "verdant catacombs",
    "arid mesa",
    "misty rainforest",
    "marsh flats",
    "prismatic vista",
    "fabled passage",
    "evolving wilds",
    "terramorphic expanse",

    // Shocklands
    "hallowed fountain",
    "watery grave",
    "blood crypt",
    "stomping ground",
    "temple garden",
    "sacred foundry",
    "godless shrine",
    "steam vents",
    "overgrown tomb",
    "breeding pool",

    // Fastlands
    "seachrome coast",
    "darkslick shores",
    "blackcleave cliffs",
    "copperline gorge",
    "razorverge thicket",
    "inspiring vantage",
    "concealed courtyard",
    "spirebluff canal",
    "blooming marsh",
    "botanical sanctum",

    // Checklands
    "glacial fortress",
    "drowned catacomb",
    "dragonskull summit",
    "rootbound crag",
    "sunpetal grove",
    "clifftop retreat",
    "isolated chapel",
    "sulfur falls",
    "woodland cemetery",
    "hinterland harbor",

    // Horizon Lands
    "sunbaked canyon",
    "waterlogged grove",
    "nurturing peatland",
    "silent clearing",
    "fiery islet",
    "horizon canopy",
    "grove of the burnwillows",

    // Utility Lands
    "mana confluence",
    "city of brass",
    "gemstone mine",
    "grand coliseum",
    "pillar of the paruns",
    "unclaimed territory",
    "ancient ziggurat",
    "cavern of souls",
    "mutavault",

    // Recent Lands (Murders at Karlov Manor et autres)
    "starting town",
    "elegant parlor",
    "lush portico",
    "meticulous archive",
    "raucous theater",
    "undercity sewers",
    "blazemire verge",
    "foreboding landscape",
    "hedge maze",
    "promising vein",
    "shadowy backstreet",
    "underground mortuary",
    "commercial district",
    "thundering falls",
    "arena of glory",
    "command tower",
    "reflecting pool",
    "exotic orchard",
  ]);

  // Vérification directe
  if (knownLands.has(lowerName)) {
    return true;
  }

  // Mots-clés étendus pour les lands non listés (synchronisé avec landDetection.ts)
  const landKeywords = [
    "plains",
    "island",
    "swamp",
    "mountain",
    "forest",
    "land",
    "strand",
    "tarn",
    "mesa",
    "foothills",
    "delta",
    "mire",
    "catacombs",
    "flats",
    "temple",
    "sanctuary",
    "grove",
    "cavern",
    "confluence",
    "pool",
    "garden",
    "vents",
    "foundry",
    "tomb",
    "grave",
    "shrine",
    "ground",
    "crypt",
    "sanctum",
    "shores",
    "marsh",
    "tower",
    "coast",
    "cliffs",
    "gorge",
    "thicket",
    "vantage",
    "courtyard",
    "canal",
    "town",
    "parlor",
    "portico",
    "archive",
    "theater",
    "sewers",
    "verge",
    "landscape",
    "maze",
    "canyon",
    "clearing",
    "peatland",
    "islet",
    "citadel",
    "monastery",
    "outpost",
    "bivouac",
    "palace",
    "headquarters",
    "lounge",
    // Nouveaux mots-clés pour les terrains récents
    "backstreet",
    "mortuary",
    "district",
    "arena",
    "command",
    "opal",
    "path",
    "ancestry",
    "secluded",
    "commercial",
    "thundering",
    "underground",
    "restless",
    "promising",
    "foreboding",
    "blazemire",
    "undercity",
    "elegant",
    "lush",
    "meticulous",
    "raucous",
    "hedge",
  ];

  return landKeywords.some((keyword) => lowerName.includes(keyword));
}

// Fonction de catégorisation des terrains
export function categorizeLandComplete(name: string): string {
  const lowerName = name.toLowerCase();

  // Basic Lands
  if (
    ["plains", "island", "swamp", "mountain", "forest", "wastes"].includes(
      lowerName,
    ) ||
    lowerName.includes("snow-covered")
  ) {
    return "Basic Land";
  }

  // Fetchlands
  if (
    [
      "flooded strand",
      "polluted delta",
      "bloodstained mire",
      "wooded foothills",
      "windswept heath",
      "scalding tarn",
      "verdant catacombs",
      "arid mesa",
      "misty rainforest",
      "marsh flats",
      "prismatic vista",
      "fabled passage",
      "evolving wilds",
      "terramorphic expanse",
    ].includes(lowerName)
  ) {
    return "Fetchland";
  }

  // Shocklands
  if (
    [
      "hallowed fountain",
      "watery grave",
      "blood crypt",
      "stomping ground",
      "temple garden",
      "sacred foundry",
      "godless shrine",
      "steam vents",
      "overgrown tomb",
      "breeding pool",
    ].includes(lowerName)
  ) {
    return "Shockland";
  }

  // Fastlands
  if (
    [
      "seachrome coast",
      "darkslick shores",
      "blackcleave cliffs",
      "copperline gorge",
      "razorverge thicket",
      "inspiring vantage",
      "concealed courtyard",
      "spirebluff canal",
      "blooming marsh",
      "botanical sanctum",
    ].includes(lowerName)
  ) {
    return "Fastland";
  }

  // Horizon Lands
  if (
    [
      "sunbaked canyon",
      "waterlogged grove",
      "nurturing peatland",
      "silent clearing",
      "fiery islet",
      "horizon canopy",
      "grove of the burnwillows",
    ].includes(lowerName)
  ) {
    return "Horizon Land";
  }

  // Rainbow Lands (5 colors, always untapped, life cost)
  if (
    [
      "mana confluence",
      "city of brass",
      "gemstone mine",
      "grand coliseum",
      "pillar of the paruns",
      "ancient ziggurat",
    ].includes(lowerName)
  ) {
    return "Rainbow Land";
  }

  // Conditional Lands (time-based or other conditions)
  if (
    [
      "starting town",
      "elegant parlor",
      "lush portico",
      "meticulous archive",
      "raucous theater",
      "undercity sewers",
    ].includes(lowerName)
  ) {
    return "Conditional Land";
  }

  // Utility Lands (special abilities, not primarily mana fixing)
  if (
    [
      "cavern of souls",
      "unclaimed territory",
      "mutavault",
      "command tower",
      "reflecting pool",
      "exotic orchard",
    ].includes(lowerName)
  ) {
    return "Utility Land";
  }

  // Fallback par mots-clés
  if (
    [
      "strand",
      "tarn",
      "mesa",
      "foothills",
      "delta",
      "mire",
      "catacombs",
      "flats",
    ].some((fetch) => lowerName.includes(fetch))
  ) {
    return "Fetchland";
  }
  if (
    [
      "fountain",
      "grave",
      "crypt",
      "ground",
      "garden",
      "foundry",
      "shrine",
      "vents",
      "tomb",
      "pool",
    ].some((shock) => lowerName.includes(shock))
  ) {
    return "Shockland";
  }
  if (
    [
      "coast",
      "shores",
      "cliffs",
      "gorge",
      "thicket",
      "vantage",
      "courtyard",
      "canal",
      "marsh",
    ].some((fast) => lowerName.includes(fast))
  ) {
    return "Fastland";
  }
  if (
    ["canyon", "grove", "peatland", "clearing", "islet"].some((horizon) =>
      lowerName.includes(horizon),
    )
  ) {
    return "Horizon Land";
  }

  return "Other Land";
}
