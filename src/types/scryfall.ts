export interface ScryfallCardFace {
  name: string
  mana_cost?: string
  type_line: string
  oracle_text?: string
  colors?: string[]
  image_uris?: {
    small?: string
    normal?: string
    large?: string
    png?: string
    art_crop?: string
    border_crop?: string
  }
}

export interface ScryfallCard {
  id: string
  name: string
  mana_cost?: string
  cmc: number
  type_line: string
  oracle_text?: string
  colors: string[]
  color_identity: string[]
  produced_mana?: string[]
  keywords?: string[]
  layout: string
  set: string
  set_name?: string
  rarity: string
  image_uris?: {
    small?: string
    normal?: string
    large?: string
    png?: string
    art_crop?: string
    border_crop?: string
  }
  card_faces?: ScryfallCardFace[]
  prices?: {
    usd?: string
    usd_foil?: string
    eur?: string
    eur_foil?: string
  }
  legalities?: {
    standard?: string
    pioneer?: string
    modern?: string
    legacy?: string
    vintage?: string
    commander?: string
  }
}
