// Base de données complète des terrains Magic: The Gathering
const KNOWN_LANDS = new Set([
  // Basic Lands
  'Plains', 'Island', 'Swamp', 'Mountain', 'Forest',
  'Wastes', 'Snow-Covered Plains', 'Snow-Covered Island', 'Snow-Covered Swamp', 
  'Snow-Covered Mountain', 'Snow-Covered Forest',
  
  // Fetchlands
  'Flooded Strand', 'Polluted Delta', 'Bloodstained Mire', 'Wooded Foothills', 'Windswept Heath',
  'Scalding Tarn', 'Verdant Catacombs', 'Arid Mesa', 'Misty Rainforest', 'Marsh Flats',
  'Prismatic Vista', 'Fabled Passage', 'Evolving Wilds', 'Terramorphic Expanse',
  
  // Shocklands
  'Hallowed Fountain', 'Watery Grave', 'Blood Crypt', 'Stomping Ground', 'Temple Garden',
  'Sacred Foundry', 'Godless Shrine', 'Steam Vents', 'Overgrown Tomb', 'Breeding Pool',
  
  // Fastlands
  'Seachrome Coast', 'Darkslick Shores', 'Blackcleave Cliffs', 'Copperline Gorge', 'Razorverge Thicket',
  'Inspiring Vantage', 'Concealed Courtyard', 'Spirebluff Canal', 'Blooming Marsh', 'Botanical Sanctum',
  
  // Checklands
  'Glacial Fortress', 'Drowned Catacomb', 'Dragonskull Summit', 'Rootbound Crag', 'Sunpetal Grove',
  'Clifftop Retreat', 'Isolated Chapel', 'Sulfur Falls', 'Woodland Cemetery', 'Hinterland Harbor',
  
  // Painlands
  'Adarkar Wastes', 'Underground River', 'Sulfurous Springs', 'Karplusan Forest', 'Brushland',
  'Battlefield Forge', 'Caves of Koilos', 'Shivan Reef', 'Llanowar Wastes', 'Yavimaya Coast',
  
  // Filterlands
  'Mystic Gate', 'Sunken Ruins', 'Graven Cairns', 'Fire-Lit Thicket', 'Wooded Bastion',
  'Rugged Prairie', 'Fetid Heath', 'Cascade Bluffs', 'Twilight Mire', 'Flooded Grove',
  
  // Trilands
  'Arcane Sanctum', 'Crumbling Necropolis', 'Jungle Shrine', 'Savage Lands', 'Seaside Citadel',
  'Mystic Monastery', 'Nomad Outpost', 'Frontier Bivouac', 'Sandsteppe Citadel', 'Opulent Palace',
  'Spara\'s Headquarters', 'Raffine\'s Tower', 'Xander\'s Lounge', 'Ziatora\'s Proving Ground', 'Jetmir\'s Garden',
  
  // Utility Lands
  'Mana Confluence', 'City of Brass', 'Reflecting Pool', 'Exotic Orchard', 'Forbidden Orchard',
  'Gemstone Mine', 'Grand Coliseum', 'Pillar of the Paruns', 'Unclaimed Territory', 'Ancient Ziggurat',
  'Cavern of Souls', 'Mutavault', 'Boseiju, Who Endures', 'Otawara, Soaring City', 'Takenuma, Abandoned Mire',
  'Sokenzan, Crucible of Defiance', 'Eiganjo, Seat of the Empire', 'Urza\'s Saga', 'The Tabernacle at Pendrell Vale',
  'Karakas', 'Wasteland', 'Strip Mine', 'Dust Bowl', 'Ghost Quarter', 'Field of Ruin', 'Tectonic Edge',
  
  // Horizon Lands
  'Horizon Canopy', 'Grove of the Burnwillows', 'Fiery Islet', 'Prismatic Vista', 'Nurturing Peatland',
  'Silent Clearing', 'Fiery Islet', 'Sunbaked Canyon', 'Waterlogged Grove',
  
  // Creature Lands
  'Celestial Colonnade', 'Creeping Tar Pit', 'Lavaclaw Reaches', 'Raging Ravine', 'Stirring Wildwood',
  'Shambling Vent', 'Needle Spires', 'Wandering Fumarole', 'Lumbering Falls', 'Hissing Quagmire',
  'Inkmoth Nexus', 'Blinkmoth Nexus', 'Mishra\'s Factory', 'Treetop Village', 'Ghitu Encampment',
  
  // Special Lands
  'Tolarian Academy', 'Gaea\'s Cradle', 'Serra\'s Sanctum', 'Phyrexian Tower', 'High Market',
  'Rishadan Port', 'Maze of Ith', 'Bazaar of Baghdad', 'Library of Alexandria', 'Mishra\'s Workshop',
  'The Tabernacle at Pendrell Vale', 'Diamond Valley', 'Glacial Chasm', 'Lake of the Dead',
  
  // Recent Lands
  'Starting Town', 'Elegant Parlor', 'Lush Portico', 'Meticulous Archive', 'Raucous Theater',
  'Undercity Sewers', 'Blazemire Verge', 'Foreboding Landscape', 'Hedge Maze', 'Promising Vein',
  'Restless Anchorage', 'Restless Bivouac', 'Restless Cottage', 'Restless Fortress', 'Restless Prairie',
  'Restless Reef', 'Restless Ridgeline', 'Restless Spire', 'Restless Vinestalk', 'Restless Vents'
])

// Mots-clés pour détecter les terrains par pattern
const LAND_KEYWORDS = [
  'plains', 'island', 'swamp', 'mountain', 'forest',
  'land', 'strand', 'tarn', 'mesa', 'foothills', 'delta', 'mire',
  'catacombs', 'flats', 'temple', 'sanctuary', 'grove', 'cavern',
  'confluence', 'pool', 'garden', 'vents', 'foundry', 'tomb',
  'grave', 'shrine', 'ground', 'crypt', 'sanctum', 'shores',
  'marsh', 'tower', 'coast', 'cliffs', 'gorge', 'thicket',
  'vantage', 'courtyard', 'canal', 'fortress', 'catacomb',
  'summit', 'crag', 'retreat', 'chapel', 'falls', 'cemetery',
  'harbor', 'wastes', 'river', 'springs', 'forest', 'brushland',
  'forge', 'caves', 'reef', 'gate', 'ruins', 'cairns',
  'bastion', 'prairie', 'heath', 'bluffs', 'grove', 'citadel',
  'monastery', 'outpost', 'bivouac', 'palace', 'headquarters',
  'tower', 'lounge', 'proving ground', 'nexus', 'factory',
  'village', 'encampment', 'colonnade', 'pit', 'reaches',
  'ravine', 'wildwood', 'vent', 'spires', 'fumarole',
  'quagmire', 'canopy', 'islet', 'canyon', 'waterlogged',
  'clearing', 'peatland', 'town', 'parlor', 'portico',
  'archive', 'theater', 'sewers', 'verge', 'landscape',
  'maze', 'vein', 'anchorage', 'cottage', 'fortress',
  'prairie', 'reef', 'ridgeline', 'spire', 'vinestalk'
]

export interface LandInfo {
  isLand: boolean
  type: 'Basic Land' | 'Fetchland' | 'Shockland' | 'Fastland' | 'Checkland' | 'Painland' | 'Filterland' | 'Triland' | 'Utility Land' | 'Creature Land' | 'Other'
}

export function detectLand(cardName: string): LandInfo {
  const cleanName = cardName.trim()
  const lowerName = cleanName.toLowerCase()
  
  // Vérifier d'abord dans la base de données des terrains connus
  if (KNOWN_LANDS.has(cleanName)) {
    return {
      isLand: true,
      type: categorizeLand(cleanName)
    }
  }
  
  // Vérifier par mots-clés si pas trouvé dans la base
  const isLandByKeyword = LAND_KEYWORDS.some(keyword => lowerName.includes(keyword))
  
  if (isLandByKeyword) {
    return {
      isLand: true,
      type: categorizeLandByKeywords(lowerName)
    }
  }
  
  return {
    isLand: false,
    type: 'Other'
  }
}

function categorizeLand(cardName: string): LandInfo['type'] {
  const lowerName = cardName.toLowerCase()
  
  // Basic Lands
  if (['plains', 'island', 'swamp', 'mountain', 'forest', 'wastes'].includes(lowerName) ||
      lowerName.includes('snow-covered')) {
    return 'Basic Land'
  }
  
  // Fetchlands
  if (['flooded strand', 'polluted delta', 'bloodstained mire', 'wooded foothills', 'windswept heath',
       'scalding tarn', 'verdant catacombs', 'arid mesa', 'misty rainforest', 'marsh flats',
       'prismatic vista', 'fabled passage', 'evolving wilds', 'terramorphic expanse'].includes(lowerName)) {
    return 'Fetchland'
  }
  
  // Shocklands
  if (['hallowed fountain', 'watery grave', 'blood crypt', 'stomping ground', 'temple garden',
       'sacred foundry', 'godless shrine', 'steam vents', 'overgrown tomb', 'breeding pool'].includes(lowerName)) {
    return 'Shockland'
  }
  
  // Fastlands
  if (['seachrome coast', 'darkslick shores', 'blackcleave cliffs', 'copperline gorge', 'razorverge thicket',
       'inspiring vantage', 'concealed courtyard', 'spirebluff canal', 'blooming marsh', 'botanical sanctum'].includes(lowerName)) {
    return 'Fastland'
  }
  
  // Checklands
  if (['glacial fortress', 'drowned catacomb', 'dragonskull summit', 'rootbound crag', 'sunpetal grove',
       'clifftop retreat', 'isolated chapel', 'sulfur falls', 'woodland cemetery', 'hinterland harbor'].includes(lowerName)) {
    return 'Checkland'
  }
  
  // Painlands
  if (['adarkar wastes', 'underground river', 'sulfurous springs', 'karplusan forest', 'brushland',
       'battlefield forge', 'caves of koilos', 'shivan reef', 'llanowar wastes', 'yavimaya coast'].includes(lowerName)) {
    return 'Painland'
  }
  
  // Filterlands
  if (['mystic gate', 'sunken ruins', 'graven cairns', 'fire-lit thicket', 'wooded bastion',
       'rugged prairie', 'fetid heath', 'cascade bluffs', 'twilight mire', 'flooded grove'].includes(lowerName)) {
    return 'Filterland'
  }
  
  // Trilands
  if (lowerName.includes('citadel') || lowerName.includes('monastery') || lowerName.includes('outpost') ||
      lowerName.includes('bivouac') || lowerName.includes('palace') || lowerName.includes('headquarters') ||
      lowerName.includes('tower') || lowerName.includes('lounge') || lowerName.includes('proving ground') ||
      lowerName.includes('garden')) {
    return 'Triland'
  }
  
  // Creature Lands
  if (['celestial colonnade', 'creeping tar pit', 'lavaclaw reaches', 'raging ravine', 'stirring wildwood',
       'shambling vent', 'needle spires', 'wandering fumarole', 'lumbering falls', 'hissing quagmire',
       'inkmoth nexus', 'blinkmoth nexus', 'mutavault'].includes(lowerName) ||
      lowerName.includes('restless')) {
    return 'Creature Land'
  }
  
  // Utility Lands par défaut
  return 'Utility Land'
}

function categorizeLandByKeywords(lowerName: string): LandInfo['type'] {
  // Logique de fallback basée sur les mots-clés
  if (lowerName.includes('plains') || lowerName.includes('island') || 
      lowerName.includes('swamp') || lowerName.includes('mountain') || 
      lowerName.includes('forest')) {
    return 'Basic Land'
  }
  
  if (lowerName.includes('strand') || lowerName.includes('tarn') || 
      lowerName.includes('mesa') || lowerName.includes('foothills') ||
      lowerName.includes('delta') || lowerName.includes('mire') ||
      lowerName.includes('catacombs') || lowerName.includes('flats')) {
    return 'Fetchland'
  }
  
  if (lowerName.includes('vents') || lowerName.includes('foundry') ||
      lowerName.includes('tomb') || lowerName.includes('grave') ||
      lowerName.includes('shrine') || lowerName.includes('fountain') ||
      lowerName.includes('crypt')) {
    return 'Shockland'
  }
  
  if (lowerName.includes('coast') || lowerName.includes('shores') ||
      lowerName.includes('cliffs') || lowerName.includes('gorge') ||
      lowerName.includes('thicket') || lowerName.includes('vantage') ||
      lowerName.includes('courtyard') || lowerName.includes('canal') ||
      lowerName.includes('sanctum') || lowerName.includes('marsh')) {
    return 'Fastland'
  }
  
  return 'Utility Land'
} 