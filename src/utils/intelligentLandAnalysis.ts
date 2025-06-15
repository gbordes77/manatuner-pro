// Analyse intelligente des terrains via Scryfall Oracle Text
export interface IntelligentLandAnalysis {
  behavior: string
  entersUntapped: boolean | 'conditional'
  manaProduction: string[]
  specialRules: string[]
  confidence: number // 0-100%
  detectedPatterns: string[]
}

// Patterns de détection automatique
const BEHAVIOR_PATTERNS = {
  // Fetchlands
  fetchland: {
    patterns: [
      /sacrifice.*search.*library.*basic land/i,
      /\{t\}, pay 1 life, sacrifice/i,
      /search your library for.*basic.*land/i
    ],
    keywords: ['sacrifice', 'search', 'basic land', 'library'],
    confidence: 95
  },

  // Shocklands
  shockland: {
    patterns: [
      /pay 2 life.*enters.*untapped/i,
      /enters.*tapped unless you pay 2 life/i,
      /as.*enters.*you may pay 2 life/i
    ],
    keywords: ['pay 2 life', 'enters', 'untapped', 'tapped'],
    confidence: 98
  },

  // Fastlands
  fastland: {
    patterns: [
      /enters.*tapped unless you control two or fewer other lands/i,
      /enters.*untapped if you control.*or fewer.*lands/i,
      /unless you control.*or fewer.*lands.*enters tapped/i
    ],
    keywords: ['two or fewer', 'other lands', 'enters tapped', 'control'],
    confidence: 95
  }
}

// Patterns pour détecter les conditions d'entrée
const ENTERS_UNTAPPED_PATTERNS = {
  always: [
    /enters.*untapped/i,
    /doesn't enter tapped/i
  ],
  never: [
    /enters.*tapped/i,
    /always enters tapped/i
  ],
  conditional: [
    /enters.*tapped unless/i,
    /enters.*untapped if/i,
    /you may pay.*enters untapped/i,
    /unless.*enters tapped/i
  ]
}

/**
 * Analyse intelligente d'un terrain via son texte Oracle
 */
export function analyzeIntelligentLand(
  cardName: string,
  oracleText: string,
  typeLine: string,
  producedMana?: string[]
): IntelligentLandAnalysis {
  
  const analysis: IntelligentLandAnalysis = {
    behavior: 'Unknown',
    entersUntapped: true,
    manaProduction: producedMana || [],
    specialRules: [],
    confidence: 0,
    detectedPatterns: []
  }

  if (!oracleText) {
    return analysis
  }

  // 1. Détecter le comportement principal
  let maxConfidence = 0
  let detectedBehavior = 'Unknown'

  for (const [behaviorName, config] of Object.entries(BEHAVIOR_PATTERNS)) {
    let confidence = 0
    const matchedPatterns: string[] = []

    // Vérifier les patterns regex
    for (const pattern of config.patterns) {
      if (pattern.test(oracleText)) {
        confidence += 30
        matchedPatterns.push(`Pattern: ${pattern.source}`)
      }
    }

    // Vérifier les mots-clés
    const lowerText = oracleText.toLowerCase()
    const keywordMatches = config.keywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    )
    
    confidence += keywordMatches.length * 10
    matchedPatterns.push(...keywordMatches.map(k => `Keyword: ${k}`))

    if (confidence > maxConfidence) {
      maxConfidence = confidence
      detectedBehavior = behaviorName
      analysis.detectedPatterns = matchedPatterns
    }
  }

  analysis.behavior = detectedBehavior
  analysis.confidence = Math.min(maxConfidence, 100)

  // 2. Détecter les conditions d'entrée
  analysis.entersUntapped = analyzeEntersUntapped(oracleText)

  // 3. Extraire les règles spéciales
  analysis.specialRules = extractSpecialRules(oracleText, detectedBehavior)

  return analysis
}

/**
 * Détermine si le terrain entre dégagé
 */
function analyzeEntersUntapped(oracleText: string): boolean | 'conditional' {
  // Vérifier les conditions
  for (const pattern of ENTERS_UNTAPPED_PATTERNS.conditional) {
    if (pattern.test(oracleText)) {
      return 'conditional'
    }
  }

  // Vérifier si toujours engagé
  for (const pattern of ENTERS_UNTAPPED_PATTERNS.never) {
    if (pattern.test(oracleText)) {
      return false
    }
  }

  // Par défaut, assume dégagé si pas d'indication contraire
  const lowerText = oracleText.toLowerCase()
  return !lowerText.includes('enters') || !lowerText.includes('tapped')
}

/**
 * Extrait les règles spéciales du texte Oracle
 */
function extractSpecialRules(oracleText: string, behavior: string): string[] {
  const rules: string[] = []

  // Règles basées sur le comportement détecté
  switch (behavior) {
    case 'fetchland':
      if (oracleText.includes('pay 1 life')) {
        rules.push('Costs 1 life to activate')
      }
      break

    case 'shockland':
      if (oracleText.includes('2 life')) {
        rules.push('Pay 2 life to enter untapped')
      }
      break

    case 'fastland':
      if (oracleText.includes('two or fewer')) {
        rules.push('Enters untapped if 2 or fewer other lands')
      }
      break
  }

  // Règles génériques
  if (oracleText.includes('sacrifice')) {
    rules.push('Can be sacrificed for effect')
  }
  if (oracleText.includes('cycling')) {
    rules.push('Has cycling ability')
  }

  return rules
}

/**
 * Fonction principale qui combine l'analyse statique et intelligente
 */
export function getComprehensiveLandAnalysis(
  cardName: string,
  scryfallData?: any
): IntelligentLandAnalysis {
  
  // Si on a les données Scryfall, utiliser l'analyse intelligente
  if (scryfallData && scryfallData.oracle_text) {
    const intelligentAnalysis = analyzeIntelligentLand(
      cardName,
      scryfallData.oracle_text,
      scryfallData.type_line,
      scryfallData.produced_mana
    )

    // Si la confiance est élevée, utiliser l'analyse intelligente
    if (intelligentAnalysis.confidence >= 70) {
      return intelligentAnalysis
    }
  }

  // Fallback vers l'analyse statique
  return {
    behavior: 'Unknown',
    entersUntapped: true,
    manaProduction: [],
    specialRules: ['Requires manual analysis'],
    confidence: 0,
    detectedPatterns: []
  }
} 