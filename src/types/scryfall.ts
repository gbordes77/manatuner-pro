export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors: string[];
  color_identity: string[];
  set: string;
  set_name: string;
  rarity: string;
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
    art_crop?: string;
    border_crop?: string;
  };
  prices?: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
    eur_foil?: string;
  };
  legalities?: {
    standard?: string;
    pioneer?: string;
    modern?: string;
    legacy?: string;
    vintage?: string;
    commander?: string;
  };
} 