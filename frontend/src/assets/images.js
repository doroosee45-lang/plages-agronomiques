/* ==========================================================================
   assets/images.js — bibliothèque d'images du site
   Toutes les photos sont locales (aucune dépendance à Internet) et fournies
   en deux tailles : « grand » (960 px) pour les bandeaux, « petit » (480 px)
   pour les vignettes et les cartes.
   ========================================================================== */

import maniocGrand from './cultures/manioc.jpg';
import maniocPetit from './cultures/manioc-480.jpg';
import maisGrand from './cultures/mais.jpg';
import maisPetit from './cultures/mais-480.jpg';
import haricotGrand from './cultures/haricot.jpg';
import haricotPetit from './cultures/haricot-480.jpg';
import arachideGrand from './cultures/arachide.jpg';
import arachidePetit from './cultures/arachide-480.jpg';
import rizGrand from './cultures/riz.jpg';
import rizPetit from './cultures/riz-480.jpg';
import bananierGrand from './cultures/bananier.jpg';
import bananierPetit from './cultures/bananier-480.jpg';
import palmierGrand from './cultures/palmier.jpg';
import palmierPetit from './cultures/palmier-480.jpg';
import cafeGrand from './cultures/cafe.jpg';
import cafePetit from './cultures/cafe-480.jpg';
import cacaoGrand from './cultures/cacao.jpg';
import cacaoPetit from './cultures/cacao-480.jpg';

import pHeroGrand from './partenaires/hero.jpg';
import pHeroPetit from './partenaires/hero-480.jpg';
import pSolGrand from './partenaires/sol-sonde.jpg';
import pSolPetit from './partenaires/sol-sonde-480.jpg';
import pCarteGrand from './partenaires/carte-parcelle.jpg';
import pCartePetit from './partenaires/carte-parcelle-480.jpg';
import pCoopGrand from './partenaires/cooperative.jpg';
import pCoopPetit from './partenaires/cooperative-480.jpg';
import pMarcheGrand from './partenaires/marche.jpg';
import pMarchePetit from './partenaires/marche-480.jpg';
import pIdentiteGrand from './partenaires/identite.jpg';
import pIdentitePetit from './partenaires/identite-480.jpg';
import pEquipeGrand from './partenaires/equipe.jpg';
import pEquipePetit from './partenaires/equipe-480.jpg';
import pFormationGrand from './partenaires/formation.jpg';
import pFormationPetit from './partenaires/formation-480.jpg';
import sondeGrand from './sections/sonde-sol.jpg';
import sondePetit from './sections/sonde-sol-480.jpg';
import heroImg from './hero.jpg';
import heroPetit from './hero-880.jpg';

export const IMAGES_CULTURES = {
  manioc: { grand: maniocGrand, petit: maniocPetit },
  mais: { grand: maisGrand, petit: maisPetit },
  haricot: { grand: haricotGrand, petit: haricotPetit },
  arachide: { grand: arachideGrand, petit: arachidePetit },
  riz: { grand: rizGrand, petit: rizPetit },
  bananier: { grand: bananierGrand, petit: bananierPetit },
  palmier: { grand: palmierGrand, petit: palmierPetit },
  cafe: { grand: cafeGrand, petit: cafePetit },
  cacao: { grand: cacaoGrand, petit: cacaoPetit }
};

export const IMAGES = {
  hero: { grand: heroImg, petit: heroPetit },
  sonde: { grand: sondeGrand, petit: sondePetit }
};

/* Photos du programme AGRIKONNECT AFRICA / « Devenir partenaire » */
export const IMAGES_PARTENAIRES = {
  hero: { grand: pHeroGrand, petit: pHeroPetit },
  sol: { grand: pSolGrand, petit: pSolPetit },
  carte: { grand: pCarteGrand, petit: pCartePetit },
  cooperative: { grand: pCoopGrand, petit: pCoopPetit },
  marche: { grand: pMarcheGrand, petit: pMarchePetit },
  identite: { grand: pIdentiteGrand, petit: pIdentitePetit },
  equipe: { grand: pEquipeGrand, petit: pEquipePetit },
  formation: { grand: pFormationGrand, petit: pFormationPetit }
};

export const ALT_PARTENAIRES = {
  hero: 'Une agronome et un producteur congolais consultent ensemble une tablette dans un champ de manioc',
  sol: 'Sonde d’humidité enfoncée dans la terre par un producteur, à côté d’un jeune plant de maïs',
  carte: 'Technicien tenant une tablette avec une carte de parcelle au-dessus d’un champ, drone en arrière-plan',
  cooperative: 'Assemblée de producteurs réunis dans un entrepôt coopératif avec des sacs de récolte',
  marche: 'Chargement de sacs de manioc et de maïs sur un camion au marché rural à l’aube',
  identite: 'Producteur souriant présentant un profil agricole numérique sur son téléphone dans une bananeraie',
  equipe: 'Trois jeunes ingénieurs africains travaillant ensemble sur la plateforme dans un bureau à Kinshasa',
  formation: 'Technicien formant des producteurs à l’application mobile à l’ombre d’un manguier',
  sonde: 'Sonde d’humidité du sol plantée près d’un jeune plant'
};

/* Textes alternatifs (accessibilité) */
export const ALT_CULTURES = {
  manioc: 'Champ de manioc aux feuilles palmées, rangées régulières sur un sol ocre',
  mais: 'Champ de maïs mûr avec ses épis sur les tiges',
  haricot: 'Plants de haricot vert avec leurs gousses et leurs fleurs',
  arachide: 'Champ d’arachide à feuilles composées sur un sol sableux',
  riz: 'Rizière inondée avec de jeunes plants de riz',
  bananier: 'Bananiers plantain et régime de bananes vertes',
  palmier: 'Plantation de palmiers à huile avec un régime de fruits',
  cafe: 'Caféier robusta couvert de cerises rouges mûres',
  cacao: 'Cacaoyer portant deux cabosses jaune-orangé'
};

export const imageCulture = (id, taille = 'grand') =>
  (IMAGES_CULTURES[id] || IMAGES.hero)[taille] || IMAGES.hero.grand;
