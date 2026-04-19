

export type Step = {
  id: string;
  title: string;
  content: string; // Explication ou équation (utiliser Unicode)
  aiPromptContext?: string; // Contexte spécifique caché envoyé à l'IA
  graph?: {
    fn: (t: number) => number;
    tRange: [number, number];
    label: string;
  };
};

export type Exercise = {
  id: string;
  title: string;
  statement: string; // L'énoncé
  steps: Step[];
};

export type ExerciseGroup = {
  id: string;
  title: string;
  exercises: Exercise[];
};

export type TD = {
  id: string;
  title: string;
  description: string;
  exerciseGroups: ExerciseGroup[];
};

// Structures pour les Cours
export type Concept = {
  id: string;
  title: string;
  content: string;
  aiPromptContext?: string;
  graph?: {
    fn: (t: number) => number;
    tRange: [number, number];
    label: string;
  };
};

export type Chapter = {
  id: string;
  title: string;
  description: string;
  concepts: Concept[];
};

export type Course = {
  id: string;
  title: string;
  chapters: Chapter[];
};

export const COURSE_DATA: Course[] = [
  {
    id: "c1",
    title: "Chapitre 1 : Généralités sur les Signaux",
    chapters: [
      {
        id: "ch1-intro",
        title: "1. Introduction et Définition",
        description: "Bases fondamentales et objectifs du traitement du signal.",
        concepts: [
          {
            id: "c1-1-1",
            title: "Qu'est-ce qu'un signal ?",
            content: "Selon Picinbono (1989) : 'Un signal est la représentation physique de l'information'.\n\nEn pratique, c'est une grandeur physique mesurable (tension, courant, pression) qui évolue de façon porteuse de sens. \n\nExemples :\n- La voix captée par un microphone (signal acoustique → électrique).\n- L'activité électrique du cœur (ECG).\n- Les données d'un capteur de température.",
            aiPromptContext: "L'étudiant apprend la définition académique du signal."
          },
          {
            id: "c1-1-2",
            title: "Objectifs du Traitement du Signal",
            content: "Le traitement du signal vise trois buts principaux :\n\n1. EXTRACTION : Isoler l'information utile du bruit.\n2. MISE EN FORME : Transformer le signal pour le rendre compatible avec un système (ex: amplification, filtrage).\n3. ANALYSE : Extraire des paramètres caractéristiques pour la décision ou la reconnaissance.",
            aiPromptContext: "Les trois piliers du traitement du signal : extraction, mise en forme, analyse."
          }
        ]
      },
      {
        id: "ch1-class",
        title: "2. Classification des Signaux",
        description: "Comment organiser la diversité des signaux selon leurs propriétés.",
        concepts: [
          {
            id: "c1-2-1",
            title: "Classification Morphologique",
            content: "Elle se base sur la nature du temps et de l'amplitude :\n\n- Signal Continu (Analogique) : t et x(t) sont continus.\n- Signal Discret : t est échantillonné (n·Te), mais l'amplitude reste continue.\n- Signal Numérique : Temps et amplitude sont quantifiés (nombres binaires).",
            aiPromptContext: "Classification basée sur la continuité temporelle et d'amplitude."
          },
          {
            id: "c1-2-2",
            title: "Classification Phénoménologique",
            content: "- Signaux Déterministes : Leur évolution peut être prédite par un modèle mathématique exact (ex: sinusoïde).\n- Signaux Aléatoires : Leur évolution est imprévisible et décrite par des lois statistiques (ex: bruit thermique).",
            aiPromptContext: "Différence entre déterministe et aléatoire."
          }
        ]
      },
      {
        id: "ch1-ener",
        title: "3. Caractéristiques Énergétiques",
        description: "Énergie, Puissance et classification énergétique.",
        concepts: [
          {
            id: "c1-3-1",
            title: "Énergie d'un signal",
            content: "Pour un signal x(t), l'énergie totale E est donnée par :\n\nE = ∫ (de -∞ à +∞) |x(t)|² dt\n\nOn dit qu'un signal est à Énergie Finie si 0 < E < ∞. Ces signaux sont généralement apériodiques et tendent vers 0 à l'infini.",
            aiPromptContext: "Formule de l'énergie et définition d'un signal à énergie finie."
          },
          {
            id: "c1-3-2",
            title: "Puissance Moyenne d'un signal",
            content: "Pour les signaux qui ne s'éteignent jamais (ex: périodiques), l'énergie est infinie. On utilise alors la puissance moyenne P :\n\nP = lim (T→∞) (1/T) ∫ (de -T/2 à T/2) |x(t)|² dt\n\nSi le signal est périodique de période T₀ :\nP = (1/T₀) ∫ (sur T₀) |x(t)|² dt",
            aiPromptContext: "Formule de la puissance moyenne pour les signaux périodiques."
          }
        ]
      },
      {
        id: "ch1-elem1",
        title: "4. Signaux Usuels I : Fondamentaux",
        description: "Les briques de base : Constante, Sinusoïde et Échelon.",
        concepts: [
          {
            id: "c1-4-1",
            title: "Le Signal Constant",
            content: "C'est un signal qui garde la même valeur pour tout t :\nx(t) = A\n\nC'est le signal à puissance moyenne P = A².",
            aiPromptContext: "Signal constant.",
            graph: {
              fn: (t) => 1,
              tRange: [-2, 2],
              label: "Signal Constant A=1"
            }
          },
          {
            id: "c1-4-2",
            title: "Le Signal Sinusoïdal",
            content: "Modèle : x(t) = A · cos(2πf₀t + φ)\n- A : Amplitude maximale\n- f₀ : Fréquence (Hz)\n- φ : Phase à l'origine\n\nC'est un signal à puissance finie P = A²/2.",
            aiPromptContext: "Paramètres de la sinusoïde.",
            graph: {
              fn: (t) => Math.cos(2 * Math.PI * 1 * t),
              tRange: [-1, 1],
              label: "cos(2πt)"
            }
          },
          {
            id: "c1-4-3",
            title: "L'Échelon Unité u(t)",
            content: "Aussi appelé fonction de Heaviside :\n- u(t) = 1 si t ≥ 0\n- u(t) = 0 si t < 0\n\nIl représente le démarrage d'un système à t=0.",
            aiPromptContext: "Fonction échelon.",
            graph: {
              fn: (t) => t >= 0 ? 1 : 0,
              tRange: [-1, 2],
              label: "u(t)"
            }
          }
        ]
      },
      {
        id: "ch1-elem2",
        title: "5. Signaux Usuels II : L'Impulsion de Dirac",
        description: "Le signal le plus important pour l'analyse des systèmes.",
        concepts: [
          {
            id: "c1-5-1",
            title: "Définition de δ(t)",
            content: "L'impulsion de Dirac n'est pas une fonction classique mais une distribution. Elle est caractérisée par :\n1. δ(t) = 0 pour tout t ≠ 0\n2. ∫ (de -∞ à +∞) δ(t) dt = 1\n\nVisuellement, c'est un pic 'infiniment haut' et 'infiniment étroit' d'aire unité.",
            aiPromptContext: "Définition du Dirac.",
            graph: {
              fn: (t) => Math.abs(t) < 0.02 ? 1 : 0,
              tRange: [-1, 1],
              label: "δ(t) (Représentation symbolique)"
            }
          },
          {
            id: "c1-5-2",
            title: "Propriété de Filtrage",
            content: "C'est la propriété la plus utilisée :\nf(t) · δ(t - t₀) = f(t₀) · δ(t - t₀)\n\nCela signifie que multiplier un signal par un Dirac revient à 'échantillonner' sa valeur à l'instant t₀.",
            aiPromptContext: "Filtrage par le Dirac."
          },
          {
            id: "c1-5-3",
            title: "Le Peigne de Dirac",
            content: "C'est une suite périodique d'impulsions :\nδ_T(t) = Σ (k=-∞ à +∞) δ(t - kT)\n\nC'est l'outil mathématique fondamental pour modéliser l'échantillonnage d'un signal continu.",
            aiPromptContext: "Peigne de Dirac.",
            graph: {
              fn: (t) => Math.abs(t % 0.5) < 0.02 ? 1 : 0,
              tRange: [-1, 1],
              label: "Peigne de Dirac (T=0.5s)"
            }
          }
        ]
      },
      {
        id: "ch1-elem3",
        title: "6. Signaux Usuels III : Géométriques",
        description: "Porte, Triangle, Rampe et Exponentielle.",
        concepts: [
          {
            id: "c1-6-1",
            title: "Fonction Porte Rect(t)",
            content: "Rect(t) = 1 si |t| ≤ 1/2, sinon 0.\nModèle général : A · Rect((t - c) / l)\n- c : centre\n- l : largeur",
            aiPromptContext: "Fonction Rect.",
            graph: {
              fn: (t) => Math.abs(t) <= 0.5 ? 1 : 0,
              tRange: [-1, 1],
              label: "Rect(t)"
            }
          },
          {
            id: "c1-6-2",
            title: "Fonction Triangle Tri(t)",
            content: "Tri(t) = 1 - |t| si |t| ≤ 1, sinon 0.\nC'est le résultat de la convolution d'une porte avec elle-même.",
            aiPromptContext: "Fonction Tri.",
            graph: {
              fn: (t) => Math.abs(t) <= 1 ? 1 - Math.abs(t) : 0,
              tRange: [-1.5, 1.5],
              label: "Tri(t)"
            }
          },
          {
            id: "c1-6-3",
            title: "Fonction Rampe R(t)",
            content: "R(t) = t · u(t)\nC'est l'intégrale de l'échelon unité. Elle modélise une croissance linéaire démarrant à t=0.",
            aiPromptContext: "Fonction Rampe.",
            graph: {
              fn: (t) => t >= 0 ? t : 0,
              tRange: [-1, 2],
              label: "R(t) = t·u(t)"
            }
          },
          {
            id: "c1-6-4",
            title: "L'Exponentielle Causale",
            content: "x(t) = exp(-at) · u(t)  (avec a > 0)\nElle représente la réponse naturelle de nombreux systèmes physiques (décharge d'un condensateur, etc.).",
            aiPromptContext: "Exponentielle causale.",
            graph: {
              fn: (t) => t >= 0 ? Math.exp(-1 * t) : 0,
              tRange: [-1, 4],
              label: "exp(-t)·u(t)"
            }
          },
          {
            id: "c1-6-5",
            title: "La Fonction Signe sgn(t)",
            content: "sgn(t) vaut 1 pour t > 0, -1 pour t < 0, et 0 pour t = 0.\n\nRelation avec l'échelon : u(t) = (1 + sgn(t)) / 2.\nC'est un signal à puissance moyenne P = 1.",
            aiPromptContext: "Fonction signe.",
            graph: {
              fn: (t) => t > 0 ? 1 : (t < 0 ? -1 : 0),
              tRange: [-2, 2],
              label: "sgn(t)"
            }
          }
        ]
      },
      {
        id: "ch1-app",
        title: "7. Applications et Synthèse",
        description: "Analyse détaillée de signaux complexes (Trapèze, etc.).",
        concepts: [
          {
            id: "c1-7-1",
            title: "Exercice : Le Signal Trapézoïdal",
            content: "Considérons le signal trapézoïdal d'amplitude A=2, s'étendant de t=-2 à t=2.\n\nSon expression analytique peut être décomposée en rampes :\nx(t) = 2R(t+2) - 2R(t+1) - 2R(t-1) + 2R(t-2)\n\nAnalyse par morceaux :\n- De -2 à -1 : Pente +2\n- De -1 à 1 : Plateau à 2\n- De 1 à 2 : Pente -2",
            aiPromptContext: "Analyse du signal trapézoïdal.",
            graph: {
              fn: (t) => {
                const r = (val: number) => val >= 0 ? val : 0;
                return 2*r(t+2) - 2*r(t+1) - 2*r(t-1) + 2*r(t-2);
              },
              tRange: [-3, 3],
              label: "Signal Trapézoïdal (A=2)"
            }
          },
          {
            id: "c1-7-2",
            title: "Propriétés et Énergie",
            content: "L'énergie du trapèze précédent se calcule par morceaux :\nE = ∫ (de -2 à -1) (2t+4)² dt + ∫ (de -1 à 1) 2² dt + ∫ (de 1 à 2) (-2t+4)² dt\n\nAprès calcul :\nE = 8/3 + 8 + 8/3 = 13.33 Joules.",
            aiPromptContext: "Calcul d'énergie du trapèze."
          },
          {
            id: "c1-7-3",
            title: "Vers le Chapitre 2 : Numérisation",
            content: "Nous avons vu les signaux analogiques (continus). Le chapitre suivant traitera de leur conversion en signaux numériques via :\n1. Échantillonnage (Temps)\n2. Quantification (Amplitude)\n3. Codage (Binaire)",
            aiPromptContext: "Teaser Chapitre 2."
          }
        ]
      }
    ]
  }
];

export const TD_DATA: TD[] = [
  {
    id: "td1",
    title: "TD n°1 : Généralités sur les signaux",
    description: "Représentation graphique, classification et particularités des signaux.",
    exerciseGroups: [
      {
        id: "td1-exo1",
        title: "Exercice 1 : Signaux élémentaires",
        exercises: [
      {
        id: "ex1-x1",
        title: "Exo 1 : x₁(t) = 2 Rect(2t - 1)",
        statement: "1) Représenter graphiquement le signal x₁(t) = 2 Rect(2t - 1)\n2) Classifier ce signal.\n3) Calculer son énergie et sa puissance.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Rappels de classification",
            content: "Classification du signal x₁(t) :\n\n- Morphologique : Signal continu (analogique).\n- Spectrale : Signal déterministe apériodique.\n- Énergétique : Signal borné et limité dans le temps. C'est donc un signal à énergie finie (et puissance nulle).",
            aiPromptContext: "L'étudiant lit les propriétés de classification du signal x1(t)."
          },
          {
            id: "step2",
            title: "Étape 2 : Rappel sur la fonction Rect(t)",
            content: "Pour représenter graphiquement une fonction porte (Rect), on utilise la forme générique :\n\nx(t) = A · Rect((t - c) / l)\n\nOù :\n- c : centre de la fenêtre\n- l : largeur de la fenêtre rectangulaire\n- A : amplitude\n\nExemple de base : Rect(t) a pour centre c=0, largeur l=1, amplitude A=1.",
            aiPromptContext: "L'étudiant apprend comment identifier le centre (c), la largeur (l) et l'amplitude (A) d'une fonction Rectangulaire à partir de son équation."
          },
          {
            id: "step3",
            title: "Étape 3 : Analyse de x₁(t)",
            content: "Transformons l'équation pour retrouver la forme générique A · Rect((t - c) / l).\n\nFactorisons par 2 à l'intérieur de la fonction Rect :\n2t - 1 = 2(t - 1/2)\n\nDonc :\nx₁(t) = 2 · Rect( 2(t - 1/2) ) = 2 · Rect( (t - 1/2) / (1/2) )",
            aiPromptContext: "L'étudiant doit comprendre la factorisation temporelle à l'intérieur du paramètre de la fonction Rect."
          },
          {
            id: "step4",
            title: "Étape 4 : Représentation graphique",
            content: "Par identification avec A · Rect((t - c) / l) :\n- Amplitude A = 2\n- Centre c = 1/2\n- Largeur l = 1/2\n\nLa fonction est un rectangle de hauteur 2, qui s'étend de (1/2 - 1/4) à (1/2 + 1/4), soit de t = 1/4 à t = 3/4.",
            aiPromptContext: "L'étudiant identifie les bornes d'intégration (1/4 à 3/4) pour le tracé et le calcul d'énergie.",
            graph: {
              fn: (t) => Math.abs(t - 0.5) <= 0.25 ? 2 : 0,
              tRange: [-1, 2],
              label: "x₁(t) = 2 Rect(2t - 1)"
            }
          },
          {
            id: "step5",
            title: "Étape 5 : Calcul de l'énergie et de la puissance",
            content: "Calcul de l'énergie E :\nE = ∫ |x₁(t)|² dt\nE = ∫ (de 1/4 à 3/4) |2|² dt = 4 · [t] (de 1/4 à 3/4)\nE = 4 · (3/4 - 1/4) = 4 · (1/2) = 2 Joules.\n\nCalcul de la puissance P :\nPuisque le signal est à support borné (énergie finie), sa puissance moyenne est nulle : P = 0.",
            aiPromptContext: "L'étudiant apprend le calcul final d'énergie (intégration de l'amplitude au carré sur la largeur de la porte)."
          }
        ]
      },
      {
        id: "ex1-x2",
        title: "Exo 1 : x₂(t) = sin(πt) · Rect(t/2)",
        statement: "1) Représenter graphiquement le signal x₂(t) = sin(πt) · Rect(t/2)\n2) Classifier ce signal.\n3) Calculer son énergie et sa puissance.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Analyse de la fonction",
            content: "Le signal est le produit de deux fonctions :\n1. Une fonction sinusoïdale : sin(πt)\n2. Une fonction porte : Rect(t/2)\n\nLa fonction Rect(t/2) a une largeur l=2 et est centrée en c=0. Elle vaut 1 entre t = -1 et t = 1, et 0 ailleurs.\nLe signal final ne sera donc non-nul qu'entre -1 et 1.",
            aiPromptContext: "L'étudiant analyse le produit d'un sinus par une porte. La porte agit comme une fenêtre d'observation limitant le signal entre -1 et 1."
          },
          {
            id: "step2",
            title: "Étape 2 : Classification",
            content: "Comme le signal est multiplié par une fonction porte, son support devient borné (limité à l'intervalle [-1, 1]).\nC'est donc un signal continu, déterministe apériodique, et à énergie finie (puissance nulle).",
            aiPromptContext: "L'étudiant comprend que multiplier par un Rect rend n'importe quel signal à support borné."
          },
          {
            id: "step3",
            title: "Étape 3 : Calcul de l'énergie (Formule)",
            content: "Pour calculer l'énergie E :\nE = ∫ (de -∞ à +∞) |x₂(t)|² dt\nPuisque x₂(t) est nul en dehors de [-1, 1], l'intégrale devient :\nE = ∫ (de -1 à 1) (sin(πt))² dt",
            aiPromptContext: "L'étudiant pose l'intégrale de l'énergie. Il doit utiliser la formule trigonométrique pour linéariser le sinus au carré."
          },
          {
            id: "step4",
            title: "Étape 4 : Linéarisation et Résultat",
            content: "On utilise la formule trigonométrique : sin²(a) = (1 - cos(2a)) / 2.\nIci a = πt, donc sin²(πt) = (1 - cos(2πt)) / 2.\n\nE = (1/2) · ∫ (de -1 à 1) (1 - cos(2πt)) dt\nE = (1/2) · [ t - sin(2πt)/(2π) ] (de -1 à 1)\n\nComme sin(2π) et sin(-2π) valent 0, il ne reste que t :\nE = (1/2) · (1 - (-1)) = (1/2) · 2 = 1 Joule.\n\nPuissance P = 0 car signal à énergie finie.",
            aiPromptContext: "L'étudiant voit la résolution mathématique de l'intégrale de sin^2 via la linéarisation.",
            graph: {
              fn: (t) => Math.abs(t/2) <= 0.5 ? Math.sin(Math.PI * t) : 0,
              tRange: [-2, 2],
              label: "x₂(t) = sin(πt) Rect(t/2)"
            }
          }
        ]
      },
      {
        id: "ex1-x3",
        title: "Exo 1 : x₃(t) = Tri(2t)",
        statement: "1) Représenter graphiquement le signal x₃(t) = Tri(2t)\n2) Classifier ce signal.\n3) Calculer son énergie et sa puissance.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Rappel sur la fonction Triangle (Tri)",
            content: "La fonction Tri(t) représente un triangle isocèle de hauteur 1, centré en 0, avec une base totale de 2 (de -1 à 1).\nSon équation est :\n- Tri(t) = 1 + t (pour -1 ≤ t ≤ 0)\n- Tri(t) = 1 - t (pour 0 ≤ t ≤ 1)\n- Tri(t) = 0 ailleurs.",
            aiPromptContext: "L'étudiant apprend l'équation mathématique par morceaux de la fonction Triangle de base."
          },
          {
            id: "step2",
            title: "Étape 2 : Analyse de Tri(2t)",
            content: "Pour x₃(t) = Tri(2t), on remplace t par 2t dans les équations :\n- x₃(t) = 1 + 2t (pour -1 ≤ 2t ≤ 0, soit -1/2 ≤ t ≤ 0)\n- x₃(t) = 1 - 2t (pour 0 ≤ 2t ≤ 1, soit 0 ≤ t ≤ 1/2)\n\nC'est donc un triangle de hauteur 1, centré en 0, de base totale 1 (allant de -0.5 à 0.5).",
            aiPromptContext: "L'étudiant comprend la compression temporelle (x2) qui divise la largeur du triangle par 2.",
            graph: {
              fn: (t) => Math.abs(2*t) <= 1 ? 1 - Math.abs(2*t) : 0,
              tRange: [-1.5, 1.5],
              label: "x₃(t) = Tri(2t)"
            }
          },
          {
            id: "step3",
            title: "Étape 3 : Calcul de l'énergie",
            content: "L'énergie E est la somme des intégrales sur les deux moitiés du triangle :\nE = ∫ (de -1/2 à 0) (1 + 2t)² dt + ∫ (de 0 à 1/2) (1 - 2t)² dt\n\nPour la première intégrale (I₁) :\n(1 + 2t)² = 1 + 4t + 4t²\nI₁ = [t + 2t² + (4/3)t³] de -1/2 à 0 = 0 - (-1/2 + 2/4 - 4/24) = 1/6\n\nPar symétrie, la deuxième intégrale vaut aussi 1/6.\nE = 1/6 + 1/6 = 2/6 = 1/3 Joules.\nPuissance P = 0.",
            aiPromptContext: "L'étudiant suit le développement mathématique de l'intégrale d'un polynôme de degré 2 pour trouver l'énergie d'un triangle."
          }
        ]
      },
      {
        id: "ex1-x4",
        title: "Exo 1 : x₄(t) = U(t - 2)",
        statement: "1) Représenter graphiquement le signal x₄(t) = U(t - 2)\n2) Classifier ce signal.\n3) Calculer son énergie et sa puissance.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Fonction Échelon (U)",
            content: "La fonction U(t) (ou H(t) pour Heaviside) est l'échelon unité :\n- U(t) = 0 pour t < 0\n- U(t) = 1 pour t ≥ 0\n\nPour U(t - 2), c'est l'échelon unité retardé de 2 secondes. Il vaut 0 avant t=2, et 1 après t=2.",
            aiPromptContext: "L'étudiant apprend l'échelon retardé. Le signal s'allume à l'instant t=2.",
            graph: {
              fn: (t) => t >= 2 ? 1 : 0,
              tRange: [-1, 5],
              label: "x₄(t) = U(t - 2)"
            }
          },
          {
            id: "step2",
            title: "Étape 2 : Classification",
            content: "Le signal x₄(t) est un signal à énergie infinie car il ne s'éteint jamais (il reste à 1 jusqu'à l'infini). Il possède donc une puissance moyenne finie non nulle.",
            aiPromptContext: "L'étudiant fait le lien entre durée infinie d'un signal constant et puissance moyenne finie."
          },
          {
            id: "step3",
            title: "Étape 3 : Calcul de la puissance",
            content: "Calcul de la puissance P :\nP = lim(T→∞) (1/T) ∫ (de -T/2 à T/2) |U(t - 2)|² dt\n\nL'intégrale se fait de t=2 à T/2 (car U vaut 0 avant 2) :\nP = lim(T→∞) (1/T) · (T/2 - 2)\nP = lim(T→∞) (1/2 - 2/T)\n\nQuand T tend vers l'infini, 2/T tend vers 0. Donc :\nP = 1/2 Watt.\n\nÉnergie E = ∞.",
            aiPromptContext: "L'étudiant apprend comment calculer la puissance avec la limite pour un échelon unité."
          }
        ]
      },
      {
        id: "ex1-x5",
        title: "Exo 1 : x₅(t) = U(3 - t)",
        statement: "1) Représenter graphiquement le signal x₅(t) = U(3 - t)\n2) Classifier ce signal.\n3) Calculer son énergie et sa puissance.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Analyse graphique",
            content: "Le signal U(3 - t) est un échelon inversé (miroir) et décalé vers la droite de 3.\nIl vaut 1 pour t ≤ 3, et 0 pour t > 3.\n\nC'est un signal continu, déterministe apériodique.",
            aiPromptContext: "L'étudiant analyse un échelon inversé dans le temps.",
            graph: {
              fn: (t) => t <= 3 ? 1 : 0,
              tRange: [0, 5],
              label: "x₅(t) = U(3 - t)"
            }
          },
          {
            id: "step2",
            title: "Étape 2 : Calcul de l'Énergie",
            content: "L'énergie E se calcule par l'intégrale du module au carré :\n\nE = ∫ (de -∞ à +∞) |x₅(t)|² dt\nE = ∫ (de -∞ à 3) (1)² dt\nE = [t] de -∞ à 3 = ∞\n\nPuisqu'il s'étend de -∞ jusqu'à 3, son énergie E est infinie.",
            aiPromptContext: "Calcul de l'énergie infinie."
          },
          {
            id: "step3",
            title: "Étape 3 : Calcul de la Puissance",
            content: "Pour un signal à énergie infinie, on calcule la puissance P avec la limite :\n\nP = lim(T→∞) (1/T) ∫ (de -T/2 à T/2) |x₅(t)|² dt\nIci, la borne supérieure devient 3, car le signal s'annule après :\nP = lim(T→∞) (1/T) ∫ (de -T/2 à 3) 1 dt\nP = lim(T→∞) (1/T) · [t] (de -T/2 à 3)\nP = lim(T→∞) (1/T) · (3 - (-T/2))\nP = lim(T→∞) (3/T + 1/2)\n\nQuand T tend vers ∞, 3/T tend vers 0. Donc P = 1/2 Watt.",
            aiPromptContext: "Calcul de puissance pour un échelon inversé avec les bornes -T/2 et 3."
          }
        ]
      },
      {
        id: "ex1-x6",
        title: "Exo 1 : x₆(t) = δ(3 - t)",
        statement: "1) Représenter graphiquement le signal x₆(t) = δ(3 - t)\n2) Classifier ce signal.\n3) Calculer son énergie et sa puissance.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Impulsion de Dirac",
            content: "Le signal δ(3 - t) = δ(t - 3) car la fonction de Dirac est paire.\nC'est une impulsion située exactement à l'instant t = 3.\n\nC'est un signal à durée nulle, d'énergie limitée (E=1) et de puissance nulle (P=0).",
            aiPromptContext: "L'étudiant identifie l'impulsion de Dirac décalée à t=3.",
            graph: {
              fn: (t) => Math.abs(t - 3) < 0.02 ? 1 : 0,
              tRange: [0, 5],
              label: "x₆(t) = δ(3 - t) (Approximation discrète)"
            }
          },
          {
            id: "step2",
            title: "Étape 2 : Énergie et Puissance",
            content: "Par définition dans ce cadre de TD, l'intégrale du carré d'un Dirac est considérée comme valant 1.\n\nE = ∫ (de -∞ à +∞) |δ(3 - t)|² dt = 1 Joule.\n=> Signal à énergie finie.\n\nCalcul de la puissance :\nP = lim(T→∞) (1/T) ∫ |δ(3 - t)|² dt = lim(T→∞) (1/T) = 0.\n\nSur une période infinie, l'impulsion a une densité de puissance moyenne qui tend vers zéro : P = 0.",
            aiPromptContext: "Calcul d'énergie et puissance pour le Dirac."
          }
        ]
      },
      {
        id: "ex1-x7",
        title: "Exo 1 : x₇(t) = Rect((t - 1)/2) - Rect((t + 1)/2)",
        statement: "1) Représenter graphiquement le signal x₇(t)\n2) Classifier ce signal.\n3) Calculer son énergie et sa puissance.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Analyse par morceaux",
            content: "Le signal est la différence de deux portes :\n1. Rect((t - 1)/2) : Centre c=1, Largeur l=2 -> S'étend de 0 à 2 (hauteur 1)\n2. Rect((t + 1)/2) : Centre c=-1, Largeur l=2 -> S'étend de -2 à 0 (hauteur 1)\n\nRésultat : Le signal vaut -1 sur [-2, 0] et +1 sur [0, 2].",
            aiPromptContext: "Soustractions de deux fonctions portes adjacentes.",
            graph: {
              fn: (t) => (Math.abs((t-1)/2) <= 0.5 ? 1 : 0) - (Math.abs((t+1)/2) <= 0.5 ? 1 : 0),
              tRange: [-3, 3],
              label: "x₇(t) = Rect((t-1)/2) - Rect((t+1)/2)"
            }
          },
          {
            id: "step2",
            title: "Étape 2 : Énergie et Puissance",
            content: "Le signal est borné dans le temps ([-2, 2]). Son énergie est la somme de ses parties :\n\nE = ∫ (de -∞ à +∞) |x₇(t)|² dt\nE = ∫ (de -2 à 0) (-1)² dt + ∫ (de 0 à 2) (1)² dt\nE = [t] de -2 à 0 + [t] de 0 à 2\nE = (0 - (-2)) + (2 - 0)\nE = 2 + 2 = 4 Joules.\n\nPuisque le signal est à support borné et à énergie finie, sa puissance P = 0.",
            aiPromptContext: "Intégration d'un signal constant par morceaux."
          }
        ]
      },
      {
        id: "ex1-x8",
        title: "Exo 1 : x₈(t) = Tri(t - 1) - Tri(t + 1)",
        statement: "1) Représenter graphiquement le signal x₈(t)\n2) Classifier ce signal.\n3) Calculer son énergie et sa puissance.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Analyse graphique",
            content: "On a deux triangles de base 2 :\n- Tri(t - 1) centré en 1 (s'étend de 0 à 2)\n- Tri(t + 1) centré en -1 (s'étend de -2 à 0)\n\nLe signal a une forme de 'S' inversé, avec un pic à 1 et un creux à -1.",
            aiPromptContext: "Soustraction de deux triangles adjacents.",
            graph: {
              fn: (t) => (Math.abs(t-1) <= 1 ? 1 - Math.abs(t-1) : 0) - (Math.abs(t+1) <= 1 ? 1 - Math.abs(t+1) : 0),
              tRange: [-3, 3],
              label: "x₈(t) = Tri(t - 1) - Tri(t + 1)"
            }
          },
          {
            id: "step2",
            title: "Étape 2 : Calcul des intégrales",
            content: "On sépare l'intégrale de l'énergie en 4 parties selon les équations des droites :\n\nI₁ = ∫ (de -2 à -1) (-2-t)² dt = 1/3\nI₂ = ∫ (de -1 à 0) (t)² dt = 1/3\nI₃ = ∫ (de 0 à 1) (t)² dt = 1/3\nI₄ = ∫ (de 1 à 2) (2-t)² dt = 1/3\n\nÉnergie totale : E = I₁ + I₂ + I₃ + I₄ = 1/3 + 1/3 + 1/3 + 1/3 = 4/3 Joules.\nPuissance P = 0.",
            aiPromptContext: "Décomposition de l'intégrale en 4 parties."
          }
        ]
      },
      {
        id: "ex1-x9",
        title: "Exo 1 : x₉(t) = Rect(t/2) - Tri(t)",
        statement: "1) Représenter graphiquement le signal x₉(t)\n2) Classifier ce signal.\n3) Calculer son énergie et sa puissance.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Analyse graphique",
            content: "Soustraction : Un triangle (base [-1,1], h=1) moins un rectangle (base [-1,1], h=1).\nCela forme un 'V' au milieu du rectangle.",
            aiPromptContext: "Différence entre une porte et un triangle formant un V.",
            graph: {
              fn: (t) => (Math.abs(t/2) <= 0.5 ? 1 : 0) - (Math.abs(t) <= 1 ? 1 - Math.abs(t) : 0),
              tRange: [-2, 2],
              label: "x₉(t) = Rect(t/2) - Tri(t)"
            }
          },
          {
            id: "step2",
            title: "Étape 2 : Énergie et Puissance",
            content: "L'équation de x₉(t) sur [0,1] est : Rect(t/2) - Tri(t) = 1 - (1 - t) = t.\nPar symétrie, sur [-1,0], c'est -t.\n\nE = ∫ (de -1 à 0) (-t)² dt + ∫ (de 0 à 1) (t)² dt\nE = [t³/3] de -1 à 0 + [t³/3] de 0 à 1\nE = 1/3 + 1/3 = 2/3 Joules.\n\nP = 0.",
            aiPromptContext: "Intégration de fonctions polynomiales symétriques."
          }
        ]
      },
      {
        id: "ex1-x10",
        title: "Exo 1 : x₁₀(t) = exp(-at) U(t - 2)",
        statement: "1) Représenter graphiquement le signal x₁₀(t) (avec a > 0)\n2) Classifier ce signal.\n3) Calculer son énergie et sa puissance.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Exponentielle tronquée",
            content: "C'est une décroissance exponentielle qui ne 's'allume' qu'à partir de t=2 grâce à l'échelon U(t-2).\nAvant t=2, le signal est nul. À t=2, il vaut exp(-2a) et tend vers 0 à l'infini.",
            aiPromptContext: "Exponentielle causale retardée.",
            graph: {
              fn: (t) => t >= 2 ? Math.exp(-0.8 * t) : 0, // Utilisation de a=0.8 pour l'exemple visuel
              tRange: [0, 8],
              label: "x₁₀(t) = exp(-at) U(t - 2) [pour a=0.8]"
            }
          },
          {
            id: "step2",
            title: "Étape 2 : Énergie",
            content: "On calcule l'intégrale de 2 à ∞ :\n\nE = ∫ (de 2 à ∞) |exp(-at)|² dt \nE = ∫ (de 2 à ∞) exp(-2at) dt\nE = [-1/(2a) · exp(-2at)] de 2 à ∞\n\nÀ l'infini, l'exponentielle s'annule. À t=2, on a exp(-4a).\nE = (0) - (-1/(2a) · exp(-4a))\nE = exp(-4a) / (2a) Joules.\nPuissance P = 0.",
            aiPromptContext: "Intégration d'une exponentielle de t=2 à l'infini."
          }
        ]
      },
      {
        id: "ex1-x11_12",
        title: "Exo 1 : x₁₁(t) = sin(4πt) et x₁₂(t) = cos²(w₀t)",
        statement: "Analyse des signaux purement périodiques x₁₁ et x₁₂.",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Signaux périodiques",
            content: "Ces signaux s'étendent de -∞ à +∞ de façon répétitive.\nLeur énergie E est donc infinie. Ils font partie de la famille des signaux à puissance moyenne finie.",
            aiPromptContext: "Classification des signaux purement sinusoïdaux (E infinie, P finie).",
            graph: {
              fn: (t) => Math.pow(Math.cos(2 * Math.PI * t), 2),
              tRange: [-1, 1],
              label: "Exemple: x₁₂(t) = cos²(w₀t) [pour w₀=2π]"
            }
          },
          {
            id: "step2",
            title: "Étape 2 : Calcul des puissances",
            content: "Pour x₁₁(t) = sin(4πt) :\nLa puissance d'un signal sinusoïdal de la forme A·sin(wt) est A²/2.\nIci A=1, donc P = 1/2 Watt.\n\nPour x₁₂(t) = cos²(w₀t) :\nOn linéarise : cos²(w₀t) = (1 + cos(2w₀t))/2 = 1/2 + (1/2)cos(2w₀t).\nLa puissance de la somme (composante continue + composante alternative) est la somme des carrés des valeurs efficaces :\nP = (1/2)² + (1/2)² / 2 \nP = 1/4 + 1/8 = 3/8 Watt.",
            aiPromptContext: "Formules rapides de la puissance d'un sinus et d'un cosinus carré via linéarisation et théorème de superposition."
          }
        ]
      },
      {
        id: "ex1-x13",
        title: "Exo 1 : x₁₃(t) = R(t+1) - 2R(t) + R(t-1)",
        statement: "Analyse de x₁₃(t) (Somme de rampes R(t)).",
        steps: [
          {
            id: "step1",
            title: "Étape 1 : Superposition de rampes",
            content: "La rampe R(t) = t·U(t).\n- R(t+1) monte avec une pente de +1 à partir de t=-1.\n- À t=0, on soustrait 2R(t), la pente passe de +1 à -1.\n- À t=1, on ajoute R(t-1), la pente passe de -1 à 0.\n\nRésultat graphique :\nOn obtient exactement la fonction Triangle !\nx₁₃(t) = Tri(t).",
            aiPromptContext: "Génération d'un triangle par combinaison linéaire de rampes.",
            graph: {
              fn: (t) => Math.abs(t) <= 1 ? 1 - Math.abs(t) : 0,
              tRange: [-2, 2],
              label: "x₁₃(t) = Tri(t)"
            }
          },
          {
            id: "step2",
            title: "Étape 2 : Énergie",
            content: "Puisque x₁₃(t) = Tri(t), on connait déjà son énergie par calcul direct (intégrale des polynômes sur [-1,0] et [0,1]) :\n\nE = 2/3 Joules.\nPuissance P = 0.",
            aiPromptContext: "Énergie du triangle."
          }
        ]
      },
      {
        id: "ex1-q2q3",
        title: "Exo 1 : Questions 2 & 3 (Particularités f, G, w, H)",
        statement: "2) Classifier les signaux précédents.\n3) Quelle est la particularité des signaux G(f), H(f), w[n] et f[x,y] ?",
        steps: [
          {
            id: "step1",
            title: "Réponse Question 2 : Classification Globale",
            content: "- Énergie finie (Support borné ou décroissance) : x₁, x₂, x₃, x₆, x₇, x₈, x₉, x₁₃, et l'exponentielle x₁₀.\n- Puissance moyenne finie (Périodiques ou constants) : x₄ (échelon), x₅, x₁₁, x₁₂.",
            aiPromptContext: "Résumé de la classification énergétique."
          },
          {
            id: "step2",
            title: "Réponse Question 3 : Domaines et Dimensions",
            content: "La particularité de ces signaux est leur DOMAINE ou leur DIMENSION :\n\n- H(f) et G(f) : Ce sont des signaux dans le domaine fréquentiel (Spectre). H(f) = sinc(f) est la transformée de Fourier d'une porte. Leurs calculs d'énergie suivent le théorème de Parseval.\n- w[n] = [1, 2, 1, -1] : C'est un signal discret (numérique) unidimensionnel 1D. La variable 'n' est un entier.\n- f[x,y] : C'est un signal discret bidimensionnel 2D (typiquement une image numérique en pixels).",
            aiPromptContext: "L'étudiant comprend l'existence de signaux fréquentiels, discrets et bidimensionnels."
          }
        ]
      }
        ] // fin exercises de l'Exo 1
      }, // fin ExerciseGroup Exo 1
      // ═══════════════════════════════════════════════════════════
      // EXERCICE 2
      // ═══════════════════════════════════════════════════════════
      {
        id: "td1-exo2",
        title: "Exercice 2 : Relations entre signaux & Dirac",
        exercises: [
          // ─────────────────────────────────────────────────────────
          // QUESTION 1 : U(t) en fonction de sgn(t)
          // ─────────────────────────────────────────────────────────
          {
            id: "ex2-q1",
            title: "Q1 : Exprimer U(t) avec sgn(t)",
            statement: "Exprimer le signal U(t) (échelon unitaire) en fonction des signaux sgn(t) SEULEMENT.",
            steps: [
              {
                id: "step1",
                title: "Étape 1 : Rappel des deux signaux",
                content: "On part des définitions :\n\nSignal échelon unitaire U(t) :\n  U(t) = 1  si t ≥ 0\n  U(t) = 0  si t < 0\n\nSignal signe sgn(t) :\n  sgn(t) = +1  si t > 0\n  sgn(t) =  0  si t = 0\n  sgn(t) = −1  si t < 0\n\nObjectif : trouver une formule algébrique reliant U(t) à sgn(t).",
                aiPromptContext: "L'étudiant rappelle les définitions de l'échelon unitaire U(t) et de la fonction signe sgn(t).",
                graph: {
                  fn: (t) => t >= 0 ? 1 : 0,
                  tRange: [-3, 3],
                  label: "U(t)"
                }
              },
              {
                id: "step2",
                title: "Étape 2 : Analyse cas par cas",
                content: "On compare U(t) et sgn(t) valeur par valeur :\n\n┌─────────┬────────┬────────┐\n│   t     │  U(t)  │ sgn(t) │\n├─────────┼────────┼────────┤\n│  t > 0  │   1    │   +1   │\n│  t = 0  │   1/2  │    0   │\n│  t < 0  │   0    │   -1   │\n└─────────┴────────┴────────┘\n\nPour t > 0 : U(t) = 1  et  sgn(t) = 1  →  U(t) = (sgn(t) + 1) / 2 = 2/2 = 1 ✓\nPour t < 0 : U(t) = 0  et  sgn(t) = -1  →  U(t) = (-1 + 1) / 2 = 0/2 = 0 ✓\n\nDonc la relation est vérifiée pour les deux cas !",
                aiPromptContext: "L'étudiant compare U(t) et sgn(t) valeur par valeur pour trouver la relation algébrique."
              },
              {
                id: "step3",
                title: "Étape 3 : Résultat final",
                content: "La relation entre U(t) et sgn(t) est :\n\n┌────────────────────────────────────────┐\n│        U(t) = (1 + sgn(t)) / 2        │\n└────────────────────────────────────────┘\n\nVérification :\n• t > 0 : U(t) = (1 + 1) / 2 = 1  ✓\n• t < 0 : U(t) = (1 + (-1)) / 2 = 0  ✓\n• t = 0 : U(0) = (1 + 0) / 2 = 1/2  (convention habituelle U(0) = 1/2)  ✓\n\nConclusion : l'échelon U(t) est simplement la version «remise à l'échelle» de sgn(t) : on le translate de +1 et on divise par 2 pour ramener les valeurs dans [0, 1].",
                aiPromptContext: "L'étudiant comprend la relation U(t) = (1 + sgn(t)) / 2 et pourquoi elle fonctionne algébriquement."
              }
            ]
          },
          // ─────────────────────────────────────────────────────────
          // QUESTION 2 : Rect(2t) en fonction de U(t)
          // ─────────────────────────────────────────────────────────
          {
            id: "ex2-q2",
            title: "Q2 : Exprimer Rect(2t) avec U(t)",
            statement: "Exprimer le signal x₁(t) = Rect(2t) en fonction des signaux U(t) SEULEMENT.",
            steps: [
              {
                id: "step1",
                title: "Étape 1 : Identifier Rect(2t)",
                content: "On utilise la forme générique : Rect((t - c) / l)\nPour Rect(2t) = Rect((t - 0) / (1/2)), on identifie :\n• Centre c = 0\n• Largeur l = 1/2\n\nDonc Rect(2t) = 1 si -1/4 ≤ t ≤ 1/4, et 0 sinon.",
                aiPromptContext: "L'étudiant identifie le centre et la largeur de Rect(2t) pour en déduire ses bornes.",
                graph: {
                  fn: (t) => Math.abs(2 * t) <= 0.5 ? 1 : 0,
                  tRange: [-1, 1],
                  label: "Rect(2t)"
                }
              },
              {
                id: "step2",
                title: "Étape 2 : Analyse par intervalles",
                content: "On analyse Rect(2t) sur chaque intervalle et on cherche la combinaison d'échelons U(t) qui la reproduit :\n\n• t < -1/4 :  Rect(2t) = 0  →  on veut 0\n  U(t + 1/4) = 0  et  U(t − 1/4) = 0  →  U(t+1/4) − U(t-1/4) = 0 ✓\n\n• -1/4 ≤ t ≤ 1/4 :  Rect(2t) = 1  →  on veut 1\n  U(t + 1/4) = 1  et  U(t − 1/4) = 0  →  U(t+1/4) − U(t-1/4) = 1 ✓\n\n• t > 1/4 :  Rect(2t) = 0  →  on veut 0\n  U(t + 1/4) = 1  et  U(t − 1/4) = 1  →  U(t+1/4) − U(t-1/4) = 0 ✓",
                aiPromptContext: "L'étudiant comprend pourquoi la soustraction de deux échelons décalés reproduit exactement une fonction porte."
              },
              {
                id: "step3",
                title: "Étape 3 : Résultat final",
                content: "La relation entre Rect(2t) et U(t) est :\n\n┌────────────────────────────────────────────────────────┐\n│   Rect(2t) = U(t + 1/4) − U(t − 1/4)                 │\n└────────────────────────────────────────────────────────┘\n\nInterprétation graphique :\n• U(t + 1/4) = l'échelon qui «monte» à t = -1/4 (décalé vers la gauche de 1/4)\n• −U(t − 1/4) = l'échelon négatif qui «redescend» à t = +1/4 (décalé vers la droite de 1/4)\n• La somme crée exactement la porte de largeur 1/2 centrée en 0.\n\nCas général : Rect((t-c)/l) = U(t - c + l/2) − U(t - c − l/2)",
                aiPromptContext: "L'étudiant apprend qu'une porte est toujours une soustraction de deux échelons décalés aux bords de la porte."
              }
            ]
          },
          // ─────────────────────────────────────────────────────────
          // QUESTION 3 : Simplification avec δ(t)
          // ─────────────────────────────────────────────────────────
          {
            id: "ex2-q3",
            title: "Q3 : Simplification avec la propriété du Dirac",
            statement: "Simplifier les signaux suivants :\nx(t) = (t³ − 2t + 5)·δ(3 − t)\ny(t) = (cos(πt) − t)·δ(1 − t)\nz(t) = (2t − 1)·δ(t − 2)",
            steps: [
              {
                id: "step1",
                title: "Étape 1 : La propriété fondamentale du Dirac",
                content: "La propriété clé qui permet de simplifier ces expressions est :\n\n┌────────────────────────────────────────────────────────┐\n│   f(t) · δ(t − a) = f(a) · δ(t − a)                  │\n└────────────────────────────────────────────────────────┘\n\nExplication : le Dirac δ(t − a) est nul PARTOUT sauf en t = a.\nDonc quand on le multiplie par f(t), seule la valeur f(a) a de l'importance.\nOn peut donc «figer» la valeur de f au point a et sortir la constante f(a).\n\nNote importante : δ(3 − t) = δ(t − 3) car le Dirac est une fonction paire.",
                aiPromptContext: "L'étudiant apprend la propriété de filtrage du Dirac : f(t)·δ(t-a) = f(a)·δ(t-a)."
              },
              {
                id: "step2",
                title: "Étape 2 : Simplification de x(t)",
                content: "x(t) = (t³ − 2t + 5) · δ(3 − t)\n\nÉtape 2a : Réécrire δ(3 − t) = δ(t − 3)\n  → x(t) = (t³ − 2t + 5) · δ(t − 3)\n\nÉtape 2b : Le Dirac est actif en t = 3. Calculer f(3) :\n  f(t) = t³ − 2t + 5\n  f(3) = 3³ − 2×3 + 5 = 27 − 6 + 5 = 26\n\nÉtape 2c : Appliquer la propriété :\n  x(t) = f(3) · δ(t − 3) = 26 · δ(t − 3)\n\n┌──────────────────────────────────────┐\n│   x(t) = 26 · δ(3 − t)              │\n└──────────────────────────────────────┘",
                aiPromptContext: "L'étudiant calcule f(a) pour la simplification du Dirac en t=3.",
                graph: {
                  fn: (t) => Math.abs(t - 3) < 0.04 ? 26 : 0,
                  tRange: [0, 6],
                  label: "x(t) = 26·δ(3 − t) [amplitude représentée à 26]"
                }
              },
              {
                id: "step3",
                title: "Étape 3 : Simplification de y(t)",
                content: "y(t) = (cos(πt) − t) · δ(1 − t)\n\nÉtape 3a : Réécrire δ(1 − t) = δ(t − 1)\n  → y(t) = (cos(πt) − t) · δ(t − 1)\n\nÉtape 3b : Le Dirac est actif en t = 1. Calculer f(1) :\n  f(t) = cos(πt) − t\n  f(1) = cos(π × 1) − 1 = cos(π) − 1 = −1 − 1 = −2\n\nÉtape 3c : Appliquer la propriété :\n  y(t) = f(1) · δ(t − 1) = −2 · δ(t − 1)\n\n┌──────────────────────────────────────┐\n│   y(t) = −2 · δ(1 − t)              │\n└──────────────────────────────────────┘",
                aiPromptContext: "L'étudiant calcule cos(π) = -1 pour trouver f(1) = -2, et comprend que le signe négatif est inclus dans l'amplitude.",
                graph: {
                  fn: (t) => Math.abs(t - 1) < 0.04 ? -2 : 0,
                  tRange: [-1, 4],
                  label: "y(t) = −2·δ(1 − t) [amplitude -2]"
                }
              },
              {
                id: "step4",
                title: "Étape 4 : Simplification de z(t)",
                content: "z(t) = (2t − 1) · δ(t − 2)\n\nÉtape 4a : δ(t − 2) est déjà sous la forme standard. Le Dirac est actif en t = 2.\n\nÉtape 4b : Calculer f(2) :\n  f(t) = 2t − 1\n  f(2) = 2×2 − 1 = 4 − 1 = 3\n\nÉtape 4c : Appliquer la propriété :\n  z(t) = f(2) · δ(t − 2) = 3 · δ(t − 2)\n\n┌──────────────────────────────────────┐\n│   z(t) = 3 · δ(t − 2)               │\n└──────────────────────────────────────┘",
                aiPromptContext: "L'étudiant calcule f(2) = 3 pour la simplification de z(t) avec le Dirac en t=2.",
                graph: {
                  fn: (t) => Math.abs(t - 2) < 0.04 ? 3 : 0,
                  tRange: [0, 5],
                  label: "z(t) = 3·δ(t − 2) [amplitude 3]"
                }
              },
              {
                id: "step5",
                title: "Étape 5 : Récapitulatif et méthode",
                content: "Résumé des résultats :\n\n  x(t) = (t³ − 2t + 5)·δ(3 − t)  →  x(t) = 26·δ(3 − t)\n  y(t) = (cos(πt) − t)·δ(1 − t)   →  y(t) = −2·δ(1 − t)\n  z(t) = (2t − 1)·δ(t − 2)         →  z(t) = 3·δ(t − 2)\n\nMéthode générale en 3 étapes :\n  1. Identifier le point d'activation 'a' du Dirac : δ(t − a) → a\n     (Si δ(a − t), la parité donne δ(t − a), donc le point reste a)\n  2. Calculer la valeur de f en ce point : f(a)\n  3. Le résultat est simplement : f(a) · δ(t − a)",
                aiPromptContext: "L'étudiant maîtrise la méthode de simplification des expressions f(t)·δ(t-a) en 3 étapes claires."
              }
            ]
          }
        ]
      } // fin ExerciseGroup Exo 2
    ] // fin exerciseGroups
  }
];
