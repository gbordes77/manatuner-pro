# ManaTuner — LANCE CE SITE

**Ce fichier existe pour une seule raison : tu as un produit fini qui n'a pas d'utilisateurs.**

---

## L'ETAT DES LIEUX (mis a jour 2026-04-18 post-v2.5.7 + library + OG fix)

Le produit est **pret**. Ce n'est pas une opinion, ce sont les faits :

- 315 tests passent, 2 skipped, 0 echec
- Build en ~7s, deploye sur Vercel, live a https://manatuner.app
- Moteur hypergeometrique unifie, audite, valide contre Karsten
- Moteur d'acceleration K=3 (DORK/ROCK/ENHANCER) — **aucun concurrent n'a ca**
- Mulligan Bellman — **aucun concurrent n'a ca**
- 100% client-side, zero compte, zero tracking, zero Supabase — **aucun concurrent ne propose ca**
- **Couverture formats full** : Constructed (Aggro / Midrange / Control) + Commander (Atraxa Superfriends 100c) + Limited (Selesnya draft 40c). Cinq sample decks one-click (`?sample=aggro|midrange|control|edh|limited`), QuickVerdict calibre les paliers par format.
- **Library** : 47 ressources compétitives curées (articles + podcasts + 1 video Battle Chads fraîche d'avril 2026).
- **Social share preview** : OG / Twitter / meta description restaurés le 2026-04-18 au dual positioning "Mana Calculator + Competitive MTG Reading Library" — Discord / FNM Slack / iMessage voient maintenant les deux moitiés du produit au scrape.
- Score persona moyen : 3.63/5 sur 6 personas (audit v2.5.4 live, 2026-04-18). Projection post-v2.5.7 : ~3.95 (Thibault 2.56 → ~3.85 grâce au framing Commander).
- Tabs : Castability > Analysis > Mulligan > Manabase > Blueprint
- Une-phrase verdict (QuickVerdict) affichée au-dessus des onglets depuis v2.5.5.

**Tu n'as pas un probleme de produit. Tu as un probleme de distribution.**

---

## CE QUI BLOQUE LE LANCEMENT (sois honnete)

Ce n'est pas une feature manquante. C'est la peur que ce ne soit pas parfait.

Moxfield a ete lance avec 10% des features qu'il a aujourd'hui.
MTGGoldfish a commence comme un scraper moche.
Frank Karsten a publie ses tables dans un article de blog, pas dans une app.

ManaTuner a DEJA plus de profondeur mathematique que ces trois combines sur le sujet de la manabase.

---

## LE PLAN DE LANCEMENT (pas de nouvelles features)

### PRIORITE 1 : @fireshoes (Robert Taylor) sur X

**Pourquoi lui :**

- 161K posts, MTGO Creator, KMC partner
- Poste des decklists et du metagame quotidiennement
- **Il te follow deja et RT tes trucs** — relation existante
- Son audience = joueurs MTGO competitifs = ton coeur de cible (Sarah/Karim)

**La methode (un seul tweet bien fait) :**

1. Prends un deck qui vient de 5-0 une league MTGO (un qu'il a poste)
2. Analyse-le dans ManaTuner
3. Screenshot les barres de Castability avec un truc interessant (sort critique en rouge, ramp bonus visible)
4. Poste avec un angle analytique, pas publicitaire :

> "Ran [deck name] through my manabase analyzer — turns out the 23-land build
> has a 42% chance of casting [spell] on curve. The math says 25 lands.
> Free tool, no account needed: manatuner.app/analyzer
> @fireshoes"

**Pourquoi ca marche :** c'est du contenu, pas de la pub. Il a une raison de RT parce que ca apporte de la valeur a son audience. Un RT de @fireshoes = 500+ visiteurs qualifies.

**Effort : 30 minutes. Fais-le AUJOURD'HUI.**

### PRIORITE 2 : Serveurs Discord MTG existants

Ne cree pas ton propre serveur. Rejoins ceux qui existent :

- Serveurs MTG francophones (MagicVille, communautes FNM)
- Serveurs anglophones (MTG Arena, Modern, Pioneer)

Participe aux discussions deckbuilding. Quand quelqu'un demande "combien de lands ?", reponds avec un screenshot ManaTuner. C'est naturel, pas de la pub.

**Effort : 30min/jour. Resultats en 1-2 semaines.**

### PRIORITE 3 : Autres createurs MTG sur X

Meme methode que @fireshoes avec d'autres createurs :

- LegenVD (streams Arena, deck techs)
- Pleasant Kenobi (contenu Modern/Legacy)
- Createurs francais (MagicVille, communaute FR)

DM direct : "J'ai fait un outil gratuit qui calcule si ta manabase tient. Ca pourrait etre cool dans tes deck techs. Voila le lien."

**Effort : 2h pour les DMs. Si UN seul l'utilise en stream, c'est le jackpot.**

### PRIORITE 4 : SEO (investissement long terme)

Creer la page /blog avec l'article "How Many Lands Do You Need in MTG?"

- 4-8h de travail
- Resultat dans 2-3 mois mais trafic gratuit permanent
- Requete a haute intention que les joueurs tapent dans Google

### PRIORITE 5 : Reddit (seulement apres les retours)

Reddit punit les nouveaux venus qui postent des liens. N'y va qu'une fois que tu as :

- Des screenshots de vrais utilisateurs
- Des retours/temoignages a montrer
- De la credibilite sur les subs en participant aux discussions

---

## METRIQUES DE SUCCES (premiere semaine)

- 100 visiteurs uniques
- 20 analyses de deck completees
- 3 commentaires/DMs de joueurs
- 1 RT de @fireshoes ou d'un createur

C'est tout. Pas 10K users. Pas de viralite. Juste la preuve que des gens utilisent l'outil et reviennent.

---

## CE QU'IL NE FAUT PAS FAIRE

- Ajouter "encore une feature" avant de lancer
- Refactorer du code qui marche
- Passer 3h sur un dark mode
- Ecrire une API avant d'avoir 100 users
- Attendre que David (persona 3.8/5) soit a 5/5
- Creer un serveur Discord vide avant d'avoir 10 vrais utilisateurs

**David est un Pro Tour player. Il represente 0.1% des joueurs MTG. Leo et Sarah representent 80%. Lance pour eux.**

---

## RAPPEL A CHAQUE SESSION

Avant de coder quoi que ce soit, pose-toi la question :

> "Est-ce que ca m'aide a avoir mon premier utilisateur, ou est-ce que je procrastine ?"

Si la reponse est "procrastine", ouvre X et tag @fireshoes a la place.
