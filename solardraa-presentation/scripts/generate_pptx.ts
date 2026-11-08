import pptxgen from 'pptxgenjs';
import * as fs from 'fs';
import * as path from 'path';

async function generatePresentation() {
  const pptx = new pptxgen();

  // Widescreen 16:9 layout (13.33 x 7.5 inches)
  pptx.defineLayout({ name: 'WIDE_16_9', width: 13.333, height: 7.5 });
  pptx.layout = 'WIDE_16_9';

  // Theme Colors
  const BG_DARK = '071324';
  const BG_CARD = '0e223d';
  const BG_CARD_LIGHT = '122b49';
  const BORDER_CARD = '254673';
  const TEXT_WHITE = 'FFFFFF';
  const TEXT_MUTED = '8FAECB';
  const TEXT_DIM = '5C7A99';
  const ACCENT_CYAN = '67CAFF';
  const ACCENT_GOLD = 'F4BF6D';
  const ACCENT_GREEN = '73D9BB';
  const ACCENT_BLUE = '4E85FF';

  // Helper to add standard slide header
  function addHeader(
    slide: pptxgen.Slide,
    kicker: string,
    title: string,
    desc: string,
    slideNum: number
  ) {
    // Top kicker + slide number
    slide.addText(kicker.toUpperCase(), {
      x: 0.8,
      y: 0.45,
      w: 8.5,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
      charSpacing: 2,
    });

    slide.addText(`PRÉSENTATION · ${String(slideNum).padStart(2, '0')} / 22`, {
      x: 9.5,
      y: 0.45,
      w: 3.0,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      bold: true,
      align: 'right',
    });

    // Main title
    slide.addText(title, {
      x: 0.8,
      y: 0.75,
      w: 11.7,
      h: 0.55,
      fontSize: 20,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      bold: true,
    });

    // Subtitle / description
    if (desc) {
      slide.addText(desc, {
        x: 0.8,
        y: 1.3,
        w: 11.7,
        h: 0.35,
        fontSize: 11,
        fontFace: 'Arial',
        color: TEXT_MUTED,
      });
    }

    // Divider line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 1.7,
      w: 11.7,
      h: 0,
      line: { color: '1c395c', width: 1 },
    });
  }

  // Helper to add card container
  function addCard(
    slide: pptxgen.Slide,
    x: number,
    y: number,
    w: number,
    h: number,
    fill = BG_CARD,
    border = BORDER_CARD
  ) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      fill: { color: fill },
      line: { color: border, width: 1 },
      rectRadius: 0.08,
    });
  }

  // Helper to add metric box
  function addMetric(
    slide: pptxgen.Slide,
    x: number,
    y: number,
    w: number,
    h: number,
    val: string,
    label: string,
    color = ACCENT_CYAN
  ) {
    addCard(slide, x, y, w, h, '0a1b32', '24456e');
    slide.addText(val, {
      x,
      y: y + 0.12,
      w,
      h: 0.45,
      fontSize: 22,
      fontFace: 'Arial',
      color,
      bold: true,
      align: 'center',
    });
    slide.addText(label, {
      x: x + 0.1,
      y: y + 0.58,
      w: w - 0.2,
      h: 0.32,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      align: 'center',
    });
  }

  // ==========================================
  // SLIDE 1 : Titre / Couverture
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };

    // Decorative background glow
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 8.5,
      y: 1.0,
      w: 4.5,
      h: 4.5,
      fill: { color: '0f294a', transparency: 60 },
      line: { color: '245285', width: 1, transparency: 70 },
    });

    slide.addText('MASTER SDIA · ÉTUDE DE CAS 04', {
      x: 1.0,
      y: 1.4,
      w: 7.0,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
      charSpacing: 2,
    });

    slide.addText("Prévoir l'énergie.\nComprendre le ciel.", {
      x: 1.0,
      y: 1.85,
      w: 7.5,
      h: 1.6,
      fontSize: 38,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      bold: true,
      lineSpacing: 44,
    });

    slide.addText(
      "Prévision multi-horizons (1–6 h), perception visuelle (ciel & thermographie) et transfert d'apprentissage pour la centrale solaire intelligente Drâa Solaire.",
      {
        x: 1.0,
        y: 3.65,
        w: 7.2,
        h: 0.8,
        fontSize: 13,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        lineSpacing: 20,
      }
    );

    // Badges
    const pills = ['Drâa Solaire (50 MW)', 'Groupe 14', 'Site B (20 MW)', 'Master SDIA 2026/27'];
    pills.forEach((p, i) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.0 + i * 1.85,
        y: 4.65,
        w: 1.75,
        h: 0.38,
        fill: { color: i === 1 ? '14362a' : i === 0 ? '163a66' : '0f2440' },
        line: { color: i === 1 ? ACCENT_GREEN : i === 0 ? ACCENT_CYAN : '284d7a', width: 1 },
        rectRadius: 0.18,
      });
      slide.addText(p, {
        x: 1.0 + i * 1.85,
        y: 4.65,
        w: 1.75,
        h: 0.38,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: i === 1 ? ACCENT_GREEN : i === 0 ? ACCENT_CYAN : TEXT_MUTED,
        align: 'center',
        bold: true,
      });
    });

    // Team & Supervisor banner
    addCard(slide, 1.0, 5.25, 7.4, 1.35, '0b2038', '244f7e');
    slide.addText('RÉALISÉ PAR · GROUPE 14', {
      x: 1.2,
      y: 5.33,
      w: 7.0,
      h: 0.22,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
      charSpacing: 1.5,
    });
    slide.addText('Oussama FELOUACH   ·   Ayoub EL HOUANI   ·   Mbarek ETTALEBY', {
      x: 1.2,
      y: 5.58,
      w: 7.0,
      h: 0.35,
      fontSize: 12.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      bold: true,
    });
    slide.addText('Encadré par : Pr. Soufiane HAMIDA   ·   Master SDIA 2026–2027', {
      x: 1.2,
      y: 6.02,
      w: 7.0,
      h: 0.32,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });

    // Right art card
    addCard(slide, 8.8, 1.8, 3.7, 4.8, '0c1f38', '2d5a8c');
    slide.addText('DRÂA SOLAIRE RESEARCH', {
      x: 8.8,
      y: 2.1,
      w: 3.7,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
      align: 'center',
      charSpacing: 2,
    });
    slide.addText('50 MW', {
      x: 8.8,
      y: 2.45,
      w: 3.7,
      h: 0.9,
      fontSize: 48,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
      align: 'center',
    });
    slide.addText('Centrale solaire de référence (Site A)\n+ Site B (20 MW) pour le transfert', {
      x: 9.0,
      y: 3.4,
      w: 3.3,
      h: 0.6,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      align: 'center',
    });

    slide.addShape(pptx.ShapeType.line, {
      x: 9.3,
      y: 4.2,
      w: 2.7,
      h: 0,
      line: { color: '244b78', width: 1 },
    });

    slide.addText('4 Jalons Scientifiques Réels\nMLP · CNN · Transfert · GRU', {
      x: 9.0,
      y: 4.4,
      w: 3.3,
      h: 0.8,
      fontSize: 11.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      align: 'center',
      bold: true,
    });

    // Footer info
    slide.addText('Étude de cas 04 · Master SDIA · Intelligence Artificielle Avancée & Vision', {
      x: 1.0,
      y: 6.8,
      w: 11.3,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEXT_DIM,
    });

    slide.addNotes(
      "Bonjour à tous et bienvenue à notre soutenance. Nous vous présentons aujourd'hui notre projet Drâa Solaire : « Prévoir l'énergie, comprendre le ciel ».\nNotre objectif est d'utiliser l'intelligence artificielle pour prévoir la production électrique de la centrale solaire Drâa Solaire (50 MW), surveiller l'état des panneaux avec des caméras, et adapter nos modèles à une nouvelle centrale avec très peu de données."
    );
  }

  // ==========================================
  // SLIDE 2 : Contexte & Enjeux
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '01 / CONTEXTE & ENJEUX', 'Pourquoi anticiper la production solaire ?', 'Une production dépendante de la météo, de la dynamique du ciel et de l’état physique des modules.', 2);

    const cards = [
      {
        title: 'Variabilité météorologique',
        sub: 'Le rayonnement n’est pas constant',
        desc: 'Le soleil, les nuages et la température modifient la puissance injectée sur le réseau d’une heure à l’autre.',
        tag: 'GHI · Nébulosité · Température',
        color: ACCENT_GOLD,
      },
      {
        title: 'Défauts matériels',
        sub: 'Détection préventive automatisée',
        desc: 'Les points chauds (hotspots), fissures et défauts électriques réduisent la production et risquent d’endommager les modules.',
        tag: 'Thermographie infrarouge · Résidus',
        color: ACCENT_CYAN,
      },
      {
        title: 'Transfert entre sites',
        sub: 'Données locales très limitées',
        desc: 'Le site B (20 MW) présente un climat différent et seulement deux mois d’historique disponible pour entraîner les modèles.',
        tag: 'Adaptation de domaine · Zero-shot',
        color: ACCENT_GREEN,
      },
    ];

    cards.forEach((c, i) => {
      const x = 0.8 + i * 4.0;
      addCard(slide, x, 1.9, 3.7, 3.4);
      slide.addText(c.title, {
        x: x + 0.25,
        y: 2.15,
        w: 3.2,
        h: 0.4,
        fontSize: 15,
        fontFace: 'Arial',
        color: c.color,
        bold: true,
      });
      slide.addText(c.sub, {
        x: x + 0.25,
        y: 2.6,
        w: 3.2,
        h: 0.3,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        italic: true,
      });
      slide.addText(c.desc, {
        x: x + 0.25,
        y: 3.05,
        w: 3.2,
        h: 1.3,
        fontSize: 11.5,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 18,
      });
      // Pill
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.25,
        y: 4.65,
        w: 3.2,
        h: 0.35,
        fill: { color: '142c4b' },
        line: { color: '244c7d', width: 1 },
        rectRadius: 0.1,
      });
      slide.addText(c.tag, {
        x: x + 0.25,
        y: 4.65,
        w: 3.2,
        h: 0.35,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: c.color,
        align: 'center',
        bold: true,
      });
    });

    // Bottom Quote
    addCard(slide, 0.8, 5.6, 11.7, 1.25, '0b2039', '2f5c94');
    slide.addText('QUESTION DE RECHERCHE PRINCIPALE', {
      x: 1.1,
      y: 5.75,
      w: 11.1,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
      charSpacing: 2,
    });
    slide.addText(
      '« Comment améliorer la prévision à 1–6 heures, diagnostiquer les anomalies visuelles et généraliser à un nouveau site sans perdre en fiabilité ? »',
      {
        x: 1.1,
        y: 6.05,
        w: 11.1,
        h: 0.65,
        fontSize: 13.5,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        bold: true,
      }
    );

    slide.addNotes(
      "Notre projet Drâa Solaire répond à trois problématiques concrètes :\n1. La variabilité météo : le soleil, les nuages et la température changent en permanence la puissance produite.\n2. Les défauts matériels : nous devons détecter au plus tôt les points chauds et fissures sur les modules pour éviter les pertes d'énergie.\n3. Le transfert entre sites : adapter nos modèles du site A (50 MW) vers le site B (20 MW), alors que le site B ne dispose que de deux mois d'historique.\nNotre question de recherche est : comment prévoir à 6 heures, diagnostiquer les pannes et transférer nos modèles sans perdre en précision ?"
    );
  }

  // ==========================================
  // SLIDE 3 : Formulation du problème
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '01 / FORMULATION DU PROBLÈME', 'Des données vers une décision opérationnelle', 'Quatre blocs fonctionnels, avec entrées et sorties explicitement définies.', 3);

    // Left card: Entrées
    addCard(slide, 0.8, 1.9, 5.7, 3.8);
    slide.addText('ENTRÉES DU SYSTÈME', {
      x: 1.1,
      y: 2.1,
      w: 5.1,
      h: 0.3,
      fontSize: 13,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
      charSpacing: 1.5,
    });
    const entrees = [
      '• Séries temporelles horaires : historique de production passée (24 h).',
      '• Prévisions météorologiques futures (6 h) : ensoleillement (GHI), nébulosité, température.',
      '• Variables calendaires : heure et jour de l’année (encodage sin/cos).',
      '• Maintenance : jours écoulés depuis le dernier nettoyage des panneaux.',
      '• Images du ciel au sol (32 × 32 × 1) pour l’estimation de couverture.',
      '• Thermographies infrarouges (24 × 40 × 1) des panneaux solaires.',
    ];
    slide.addText(entrees.join('\n\n'), {
      x: 1.1,
      y: 2.5,
      w: 5.1,
      h: 3.0,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 16,
    });

    // Right card: Sorties
    addCard(slide, 6.8, 1.9, 5.7, 3.8);
    slide.addText('SORTIES DU SYSTÈME', {
      x: 7.1,
      y: 2.1,
      w: 5.1,
      h: 0.3,
      fontSize: 13,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
      charSpacing: 1.5,
    });
    const sorties = [
      '• Courbe de puissance injectée heure par heure pour les 6 prochaines heures (t+1 à t+6).',
      '• Pourcentage de couverture nuageuse estimé [0, 1].',
      '• Probabilité d’occultation directe du disque solaire [0, 1].',
      '• Score d’anomalie thermique pour chaque panneau inspecté.',
      '• Décision d’alerte de maintenance (seuil au 95e percentile).',
      '• Modèle adapté prêt pour le déploiement sur le Site B.',
    ];
    slide.addText(sorties.join('\n\n'), {
      x: 7.1,
      y: 2.5,
      w: 5.1,
      h: 3.0,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 16,
    });

    // Bottom 4 Metrics
    addMetric(slide, 0.8, 5.9, 2.7, 1.05, '6 h', 'Horizon de prévision', ACCENT_CYAN);
    addMetric(slide, 3.8, 5.9, 2.7, 1.05, '≥ 30 %', 'Cible gain moyen Site A', ACCENT_GREEN);
    addMetric(slide, 6.8, 5.9, 2.7, 1.05, '≥ 27 %', 'Cible gain moyen Site B', ACCENT_GREEN);
    addMetric(slide, 9.8, 5.9, 2.7, 1.05, '≤ 5 Mo', 'Contrainte taille modèle', ACCENT_GOLD);

    slide.addNotes(
      "Dans cette diapositive, nous formalisons les entrées et sorties de notre système :\n- En entrée : les prévisions météo, l'historique de production passée, des images du ciel (32 × 32) et des thermographies de panneaux (24 × 40).\n- En sortie : la courbe de production heure par heure pour les 6 prochaines heures, l'estimation de l'état du ciel, un score d'anomalie thermique, et un modèle prêt pour le site B.\n- Nos exigences contractuelles : un gain moyen d'au moins 30 % sur le site A, 27 % sur le site B, et un modèle léger de moins de 5 Mo."
    );
  }

  // ==========================================
  // SLIDE 4 : Plan de recherche
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '02 / PLAN DE RECHERCHE', 'Quatre jalons. Un système cohérent.', 'La prévision tabulaire constitue la base, enrichie par la vision, puis transférée et confrontée aux modèles séquentiels.', 4);

    const jalons = [
      {
        num: '01',
        title: 'Prévision MLP de référence',
        desc: 'Construire la référence multi-horizons tabulaire explicable à partir des historiques et météos futures.',
        tag: '47 vars → Dense(64) → Dense(32) → 6',
        params: '5 350 paramètres',
        color: ACCENT_CYAN,
      },
      {
        num: '02',
        title: 'Vision & diagnostic thermique',
        desc: 'CNN ciel à double pooling (GAP+GMP) et auto-encodeur thermique non supervisé pour les panneaux solaires.',
        tag: 'CNN Ciel (32×32) + AE Thermique (24×40)',
        params: '27 490 params ciel',
        color: ACCENT_GOLD,
      },
      {
        num: '03',
        title: 'Transfert & apprentissage multitâche',
        desc: 'Adapter le modèle au Site B (20 MW) avec seulement 2 mois de données ; CNN multitâche (couverture + occultation).',
        tag: 'Zero-shot vs Fine-tuning vs Gel',
        params: 'Domain Shift maîtrisé',
        color: ACCENT_BLUE,
      },
      {
        num: '04',
        title: 'Modèles temporels récurrents',
        desc: 'Modéliser la production sous forme de séquence temporelle continue ; comparer SimpleRNN, LSTM, GRU et Seq2Seq.',
        tag: 'Budget fixe ~6 000 paramètres · L=48h',
        params: 'GRU direct retenu (106 Ko)',
        color: ACCENT_GREEN,
      },
    ];

    jalons.forEach((j, i) => {
      const x = 0.8 + i * 3.0;
      addCard(slide, x, 1.9, 2.75, 4.3);
      // Number badge
      slide.addText(`JALON ${j.num}`, {
        x: x + 0.2,
        y: 2.1,
        w: 2.35,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        color: j.color,
        bold: true,
        charSpacing: 2,
      });
      slide.addText(j.title, {
        x: x + 0.2,
        y: 2.45,
        w: 2.35,
        h: 0.65,
        fontSize: 14,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        bold: true,
      });
      slide.addText(j.desc, {
        x: x + 0.2,
        y: 3.2,
        w: 2.35,
        h: 1.8,
        fontSize: 11,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        lineSpacing: 16,
      });
      // Tags
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.15,
        y: 5.15,
        w: 2.45,
        h: 0.35,
        fill: { color: '102744' },
        line: { color: '234e7f', width: 1 },
        rectRadius: 0.08,
      });
      slide.addText(j.tag, {
        x: x + 0.15,
        y: 5.15,
        w: 2.45,
        h: 0.35,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: j.color,
        align: 'center',
        bold: true,
      });
      slide.addText(j.params, {
        x: x + 0.15,
        y: 5.65,
        w: 2.45,
        h: 0.3,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        align: 'center',
        italic: true,
      });
    });

    // Note in footer
    slide.addText(
      '💡 Tous les jalons sont basés sur des expériences réelles exécutées dans les 4 notebooks du projet.',
      {
        x: 0.8,
        y: 6.45,
        w: 11.7,
        h: 0.4,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        align: 'center',
      }
    );

    slide.addNotes(
      "Pour répondre à ce défi, notre projet est structuré en 4 jalons scientifiques :\n- Jalon 1 : Un MLP tabulaire qui sert de modèle de référence.\n- Jalon 2 : L'apport de la vision par ordinateur avec un CNN ciel et un auto-encodeur thermique.\n- Jalon 3 : Le transfert d'apprentissage vers le site B et l'apprentissage multitâche.\n- Jalon 4 : Les modèles séquentiels récurrents (RNN, LSTM, GRU).\nTous ces jalons sont basés sur des expériences réelles documentées dans nos notebooks."
    );
  }

  // ==========================================
  // SLIDE 5 : Méthodologie globale
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '02 / MÉTHODOLOGIE GLOBALE', 'Du signal brut à la décision', 'Pipeline conceptuel intégrant les quatre jalons et les différents types de données.', 5);

    // 5 Horizontal Flow Steps
    const steps = [
      { num: '01', title: 'Acquisition', desc: 'Site A & B · Météo, séries & images' },
      { num: '02', title: 'Prétraitement', desc: 'Normalisation · Fenêtres · Splits' },
      { num: '03', title: 'Modélisation', desc: 'MLP · CNN · AE · RNN/GRU' },
      { num: '04', title: 'Évaluation', desc: 'RMSE · Gain · MAE · ROC-AUC' },
      { num: '05', title: 'Décision', desc: 'Déploiement · Diagnostic · Transfert' },
    ];

    steps.forEach((s, i) => {
      const x = 0.8 + i * 2.4;
      addCard(slide, x, 1.9, 2.15, 1.25, '102744', '244f80');
      slide.addText(s.num, {
        x,
        y: 2.05,
        w: 2.15,
        h: 0.25,
        fontSize: 10,
        fontFace: 'Arial',
        color: ACCENT_CYAN,
        bold: true,
        align: 'center',
      });
      slide.addText(s.title, {
        x,
        y: 2.3,
        w: 2.15,
        h: 0.35,
        fontSize: 13,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        bold: true,
        align: 'center',
      });
      slide.addText(s.desc, {
        x: x + 0.1,
        y: 2.65,
        w: 1.95,
        h: 0.4,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        align: 'center',
      });
      if (i < 4) {
        slide.addText('→', {
          x: x + 2.15,
          y: 2.35,
          w: 0.25,
          h: 0.35,
          fontSize: 16,
          fontFace: 'Arial',
          color: ACCENT_GOLD,
          align: 'center',
          bold: true,
        });
      }
    });

    // 3 Concept Columns
    const cols = [
      {
        kicker: 'PRÉVISION',
        title: 'Série → Puissance',
        desc: 'Le MLP fixe une base tabulaire ; les modèles GRU exploitent l’ordre temporel pour capturer l’inertie et la dynamique diurne.',
        color: ACCENT_CYAN,
      },
      {
        kicker: 'PERCEPTION',
        title: 'Image → Information',
        desc: 'Le CNN extrait la couverture nuageuse et l’occultation solaire. L’auto-encodeur quantifie les résidus pour isoler les cellules défectueuses.',
        color: ACCENT_GOLD,
      },
      {
        kicker: 'GÉNÉRALISATION',
        title: 'Site A → Site B',
        desc: 'Le modèle entraîné sur 2 ans au Site A est évalué sans réentraînement (zero-shot) ou ajusté pour s’adapter au climat du Site B.',
        color: ACCENT_GREEN,
      },
    ];

    cols.forEach((c, i) => {
      const x = 0.8 + i * 4.0;
      addCard(slide, x, 3.4, 3.7, 2.0);
      slide.addText(c.kicker, {
        x: x + 0.2,
        y: 3.55,
        w: 3.3,
        h: 0.25,
        fontSize: 10,
        fontFace: 'Arial',
        color: c.color,
        bold: true,
        charSpacing: 2,
      });
      slide.addText(c.title, {
        x: x + 0.2,
        y: 3.8,
        w: 3.3,
        h: 0.35,
        fontSize: 14,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        bold: true,
      });
      slide.addText(c.desc, {
        x: x + 0.2,
        y: 4.2,
        w: 3.3,
        h: 1.05,
        fontSize: 11,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        lineSpacing: 16,
      });
    });

    // Bottom Gain Formula Banner
    addCard(slide, 0.8, 5.65, 11.7, 1.2, '0c1e34', '224773');
    slide.addText('MÉTRIQUE PRINCIPALE : LE GAIN PAR RAPPORT À LA PERSISTANCE INTELLIGENTE', {
      x: 1.1,
      y: 5.75,
      w: 11.1,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
      charSpacing: 2,
    });
    slide.addText(
      'Gain = 1 − ( RMSE_modèle  /  RMSE_persistance_intelligente )   [évalué uniquement sur les heures de jour]',
      {
        x: 1.1,
        y: 6.05,
        w: 11.1,
        h: 0.45,
        fontSize: 15,
        fontFace: 'Courier New',
        color: ACCENT_CYAN,
        bold: true,
      }
    );
    slide.addText(
      'Un gain > 0 signifie que le modèle bat la méthode naïve. Un gain de 48 % représente une division par 2 de l’erreur de référence.',
      {
        x: 1.1,
        y: 6.5,
        w: 11.1,
        h: 0.25,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: TEXT_MUTED,
      }
    );

    slide.addNotes(
      "Voici le pipeline global du projet : acquisition des données, prétraitement avec normalisation et découpage temporel sans fuite, modélisation, puis évaluation.\nPour mesurer la performance, nous utilisons la formule du Gain affichée en bas : il compare l'erreur RMSE de notre modèle à celle d'une persistance intelligente sur les heures de jour. Un gain positif signifie que le modèle bat la météo naïve."
    );
  }

  // ==========================================
  // SLIDE 6 : J1 : Le modèle MLP de référence
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '03 / MATÉRIEL ET MÉTHODES · JALON 01', 'MLP : une référence tabulaire explicable', 'Prévision directe de six horizons avec 47 variables conçues pour capturer la dynamique physique et calendaire.', 6);

    // Top Architecture Banner
    addCard(slide, 0.8, 1.9, 11.7, 1.35, '0b213b', '265080');
    slide.addText('ARCHITECTURE DU RÉSEAU DENSE (MLP) · 5 350 PARAMÈTRES', {
      x: 1.1,
      y: 2.05,
      w: 8.5,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
      charSpacing: 1.5,
    });

    const archNodes = [
      { label: 'Entrée', detail: '47 variables' },
      { label: 'Couche 1', detail: 'Dense(64) · ReLU' },
      { label: 'Couche 2', detail: 'Dense(32) · ReLU' },
      { label: 'Sortie', detail: 'Dense(6) · Sigmoïde' },
    ];
    archNodes.forEach((n, i) => {
      const nx = 1.1 + i * 2.8;
      addCard(slide, nx, 2.35, 2.2, 0.75, '133257', '2d639e');
      slide.addText(n.label, {
        x: nx,
        y: 2.42,
        w: 2.2,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        color: ACCENT_GOLD,
        bold: true,
        align: 'center',
      });
      slide.addText(n.detail, {
        x: nx,
        y: 2.7,
        w: 2.2,
        h: 0.3,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        align: 'center',
      });
      if (i < 3) {
        slide.addText('→', {
          x: nx + 2.2,
          y: 2.5,
          w: 0.6,
          h: 0.4,
          fontSize: 18,
          fontFace: 'Arial',
          color: ACCENT_CYAN,
          align: 'center',
          bold: true,
        });
      }
    });

    // Left Card: Protocole
    addCard(slide, 0.8, 3.45, 5.7, 3.4);
    slide.addText('PROTOCOLE D’ENTRAÎNEMENT DU MLP', {
      x: 1.1,
      y: 3.65,
      w: 5.1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
      charSpacing: 1.5,
    });
    const tableProto = [
      [{ text: 'Paramètre', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } }, { text: 'Valeur', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } }],
      [{ text: 'Données Site A', options: { color: TEXT_WHITE } }, { text: '26 304 h (26 275 fenêtres)', options: { color: TEXT_MUTED } }],
      [{ text: 'Train / Val / Test', options: { color: TEXT_WHITE } }, { text: '15 313 / 2 208 / 8 754', options: { color: TEXT_MUTED } }],
      [{ text: 'Split temporel', options: { color: TEXT_WHITE } }, { text: 'Jusqu’à sept. 2024 / fin 2024 / 2025', options: { color: TEXT_MUTED } }],
      [{ text: 'Optimiseur', options: { color: TEXT_WHITE } }, { text: 'Adam, η = 10⁻³, batch 128', options: { color: TEXT_MUTED } }],
      [{ text: 'Époques & Perte', options: { color: TEXT_WHITE } }, { text: '30 époques · Perte MSE', options: { color: TEXT_MUTED } }],
    ];
    slide.addTable(tableProto, {
      x: 1.1,
      y: 4.1,
      w: 5.1,
      h: 2.4,
      colW: [2.1, 3.0],
      fontSize: 10,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    // Right Card: Construction du vecteur
    addCard(slide, 6.8, 3.45, 5.7, 3.4);
    slide.addText('CONSTRUCTION DU VECTEUR D’ENTRÉE (47 VARS)', {
      x: 7.1,
      y: 3.65,
      w: 5.1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
      charSpacing: 1.5,
    });

    const varsBreakdown = [
      '• 24 h d’historique de production normalisée par 50 MW (t−23 ... t).',
      '• 18 variables météo futures : 3 variables × 6 heures (t+1 ... t+6) :\n  - Ensoleillement ciel clair (GHI modèle physique)\n  - Nébulosité future prévue (0 à 100 %)\n  - Température ambiante future prévue (°C).',
      '• 4 variables calendaires : sinus et cosinus de l’heure du jour et du jour de l’année pour garantir la périodicité.',
      '• 1 variable de maintenance : nombre de jours écoulés depuis le dernier nettoyage des modules photovoltaïques.',
    ];
    slide.addText(varsBreakdown.join('\n\n'), {
      x: 7.1,
      y: 4.1,
      w: 5.1,
      h: 2.6,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 15,
    });

    slide.addNotes(
      "Pour le premier jalon, nous construisons un réseau dense (MLP) explicable de 5 350 paramètres.\nIl prend en entrée un vecteur de 47 variables : 24 heures de production passée, 18 prévisions météo futures (3 variables × 6 heures), 4 variables calendaires (heure et jour sin/cos), et 1 variable de nettoyage.\nIl est entraîné sur 26 304 heures avec l'optimiseur Adam sur 30 époques. Il prédit directement les 6 horizons à la fois avec des sorties sigmoïdes.\n\nTRANSITION : Ce MLP tabulaire donne une excellente base de départ. Mais pour enrichir la prévision avec l'état réel du ciel et inspecter les panneaux solaires, nous avons développé deux modèles de vision par ordinateur. Je passe la parole à Ayoub pour le Jalon 2."
    );
  }

  // ==========================================
  // SLIDE 7 : J2 : Vision par ordinateur
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '03 / MATÉRIEL ET MÉTHODES · JALON 02', 'Deux modèles de vision complémentaires', 'Images du ciel pour anticiper ; thermographies pour surveiller l’état du matériel.', 7);

    // Left Card: CNN Ciel
    addCard(slide, 0.8, 1.85, 5.7, 3.9);
    slide.addText('1. CNN DU CIEL · 27 490 PARAMÈTRES (32 × 32 PX)', {
      x: 1.0,
      y: 2.0,
      w: 5.3,
      h: 0.32,
      fontSize: 13,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });
    slide.addText('Perception météo en temps réel (caméra au sol hémisphérique)', {
      x: 1.0,
      y: 2.32,
      w: 5.3,
      h: 0.25,
      fontSize: 9.8,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      italic: true,
    });
    const skyImg = path.join(process.cwd(), 'figures', 'jalon2_ciel_32x32_sample.png');
    if (fs.existsSync(skyImg)) {
      slide.addImage({ path: skyImg, x: 1.05, y: 2.62, w: 5.2, h: 1.45 });
    }
    const cnnBullets = [
      '• Entrée : images en niveaux de gris basse résolution 32 × 32 × 1 (1 024 pixels).',
      '• Architecture : Convolutions 3×3 (16, 32, 64) + Dual Pooling innovant (GAP + GMP).',
      '• Sorties doubles : couverture nuageuse [0, 1] + occultation solaire [0, 1].',
      '• Base de données : 12 394 images (7 346 train · 920 val · 4 128 test), 15 époques Adam.',
    ];
    slide.addText(cnnBullets.join('\n'), {
      x: 1.0,
      y: 4.15,
      w: 5.3,
      h: 1.5,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 14,
    });

    // Right Card: Auto-encodeur
    addCard(slide, 6.8, 1.85, 5.7, 3.9);
    slide.addText('2. AUTO-ENCODEUR THERMIQUE · 24 × 40 PX', {
      x: 7.0,
      y: 2.0,
      w: 5.3,
      h: 0.32,
      fontSize: 13,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });
    slide.addText('Diagnostic de santé des panneaux photovoltaïques par infrarouge', {
      x: 7.0,
      y: 2.32,
      w: 5.3,
      h: 0.25,
      fontSize: 9.8,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      italic: true,
    });
    const thermoImg = path.join(process.cwd(), 'figures', 'jalon2_thermique_24x40_sample.png');
    if (fs.existsSync(thermoImg)) {
      slide.addImage({ path: thermoImg, x: 7.05, y: 2.62, w: 5.2, h: 1.45 });
    }
    const aeBullets = [
      '• Entrée : thermographies infrarouges 24 × 40 × 1 pixels (960 points de mesure).',
      '• Principe non supervisé : entraîné UNIQUEMENT sur des panneaux sains (3 000 train).',
      '• Encodeur (16 → 32) → Espace latent 32 dims → Décodeur convolutif.',
      '• Détection : résidu MSE & score max vs seuil au 95e percentile (< 5 % fausses alertes).',
    ];
    slide.addText(aeBullets.join('\n'), {
      x: 7.0,
      y: 4.15,
      w: 5.3,
      h: 1.5,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 14,
    });

    // Bottom 3 Metrics
    addMetric(slide, 0.8, 5.9, 3.7, 1.05, '15', 'Époques d’entraînement CNN & AE', ACCENT_CYAN);
    addMetric(slide, 4.8, 5.9, 3.7, 1.05, '64', 'Batch size (entraînement rapide)', ACCENT_GOLD);
    addMetric(slide, 8.8, 5.9, 3.7, 1.05, '< 5 %', 'Cible stricte de fausses alertes', ACCENT_GREEN);

    slide.addNotes(
      "Merci [Ami 1]. Pour ce deuxième jalon, nous avons voulu donner des « yeux » à notre système grâce à la vision par ordinateur, en développant deux modèles complémentaires :\n1. Le premier modèle est un CNN pour observer le ciel (images 32 × 32, 27 490 paramètres) avec un double pooling GAP + GMP qui capture la couverture et l'occultation du soleil.\n2. Le second modèle est un auto-encodeur thermique non supervisé sur des images 24 × 40, entraîné uniquement sur des panneaux sains. Les écarts de reconstruction révèlent les défauts (points chauds, fissures) avec un seuil au 95e percentile garantissant moins de 5 % de fausses alertes.\n\nTRANSITION : Voilà pour la méthode de nos deux modèles visuels. Maintenant, comment adapter notre système à une toute nouvelle centrale solaire ? Je redonne la parole à [Ami 1] pour le Jalon 3 sur le transfert."
    );
  }

  // ==========================================
  // SLIDE 8 : J3 : Méthode de transfert et multitâche
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '03 / MATÉRIEL ET MÉTHODES · JALON 03', 'Transfert de domaine et apprentissage multitâche', 'Un site à 20 MW, deux mois d’observations, et un changement de distribution climatique.', 8);

    // Left Card: Transfert
    addCard(slide, 0.8, 1.9, 5.7, 3.8);
    slide.addText('TRANSFERT DU MODÈLE : SITE A → SITE B', {
      x: 1.1,
      y: 2.15,
      w: 5.1,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });
    slide.addText('5 stratégies expérimentales comparées', {
      x: 1.1,
      y: 2.5,
      w: 5.1,
      h: 0.25,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      italic: true,
    });
    const transBullets = [
      '• Défi : Site B fait 20 MW (vs 50 MW), climat différent et seulement 2 mois de données (janvier–février 2025).',
      '• 1. Zero-shot : utilisation directe du MLP entraîné sur A sans réentraînement.',
      '• 2. Scratch : apprentissage depuis zéro avec les seules données de B.',
      '• 3. Fine-tuning complet : ajustement doux de tous les poids (η = 10⁻⁴, 30 époques).',
      '• 4. Gel partiel couche 1 : seuls les poids supérieurs sont réajustés.',
      '• 5. Gel partiel couches 1 & 2 : seule la couche de sortie est réentraînée (198 paramètres).',
    ];
    slide.addText(transBullets.join('\n\n'), {
      x: 1.1,
      y: 2.85,
      w: 5.1,
      h: 2.7,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 15,
    });

    // Right Card: Multitâche
    addCard(slide, 6.8, 1.9, 5.7, 3.8);
    slide.addText('CNN MULTITÂCHE & ADAPTATION CAMÉRA', {
      x: 7.1,
      y: 2.15,
      w: 5.1,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });
    slide.addText('Un seul réseau, deux tâches prédictives simultanées', {
      x: 7.1,
      y: 2.5,
      w: 5.1,
      h: 0.25,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      italic: true,
    });
    const multiBullets = [
      '• Tronc convolutionnel partagé + deux têtes de décision distinctes :',
      '  - Tête 1 : régression de la couverture nuageuse (0 à 1).',
      '  - Tête 2 : classification de l’occultation du soleil (0 ou 1).',
      '• Fonction de perte combinée pondérée par un hyperparamètre λ :',
      '  Loss = Loss_couverture + λ · Loss_occultation',
      '• Étude de sensibilité : exploration de λ ∈ {0 ; 0,3 ; 1 ; 3}.',
      '• Évaluation de robustesse sur la caméra réelle du Site B.',
    ];
    slide.addText(multiBullets.join('\n\n'), {
      x: 7.1,
      y: 2.85,
      w: 5.1,
      h: 2.7,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 15,
    });

    // Bottom 3 Metrics
    addMetric(slide, 0.8, 5.9, 3.7, 1.05, '47', 'Variables d’entrée du modèle transféré', ACCENT_CYAN);
    addMetric(slide, 4.8, 5.9, 3.7, 1.05, '5 350', 'Paramètres complets du modèle A', ACCENT_GOLD);
    addMetric(slide, 8.8, 5.9, 3.7, 1.05, '198', 'Paramètres réentraînés (si 2 couches gelées)', ACCENT_GREEN);

    slide.addNotes(
      "Merci Ayoub. Pour le Jalon 3, nous voulons adapter nos modèles au site B. Le défi majeur : le site B est plus petit (20 MW), a un climat différent, et ne dispose que de deux mois d'observations.\nPour cela, nous testons 5 stratégies : le Zero-shot (utiliser le modèle A directement sans réentraînement), l'apprentissage à partir de zéro (Scratch), le Fine-tuning complet, et le gel partiel d'une ou deux couches.\nEn parallèle, nous testons un CNN multitâche qui prédit simultanément la couverture nuageuse et l'occultation du soleil avec une perte combinée pondérée par lambda.\n\nTRANSITION : Avant de voir les résultats expérimentaux, comment traiter la production sous forme de séquence temporelle continue ? Je cède la parole à [Ami 2] pour la méthode du Jalon 4."
    );
  }

  // ==========================================
  // SLIDE 9 : J4 : Modèles séquentiels
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '03 / MATÉRIEL ET MÉTHODES · JALON 04', 'La production comme une séquence continue', 'Contrairement au MLP tabulaire, les réseaux récurrents intègrent la chronologie.', 9);

    // Top Architecture Banner
    addCard(slide, 0.8, 1.9, 11.7, 1.35, '0b213b', '265080');
    slide.addText('MODÈLE GRU DIRECT RETENU · 6 054 PARAMÈTRES', {
      x: 1.1,
      y: 2.05,
      w: 8.5,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: ACCENT_GREEN,
      bold: true,
      charSpacing: 1.5,
    });

    const gruNodes = [
      { label: 'Historique', detail: '(N, 48 h, 6 vars)' },
      { label: 'Cellule GRU', detail: '32 unités récurrentes' },
      { label: 'Fusion Météo', detail: '(N, 6 h, 5 vars)' },
      { label: 'Sortie Directe', detail: 'Dense(6) · Sigmoïde' },
    ];
    gruNodes.forEach((n, i) => {
      const nx = 1.1 + i * 2.8;
      addCard(slide, nx, 2.35, 2.2, 0.75, '123354', '265f94');
      slide.addText(n.label, {
        x: nx,
        y: 2.42,
        w: 2.2,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        color: ACCENT_GOLD,
        bold: true,
        align: 'center',
      });
      slide.addText(n.detail, {
        x: nx,
        y: 2.7,
        w: 2.2,
        h: 0.3,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        align: 'center',
      });
      if (i < 3) {
        slide.addText('→', {
          x: nx + 2.2,
          y: 2.5,
          w: 0.6,
          h: 0.4,
          fontSize: 18,
          fontFace: 'Arial',
          color: ACCENT_GREEN,
          align: 'center',
          bold: true,
        });
      }
    });

    // 3 Cards
    const cards9 = [
      {
        title: 'Tenseurs 3D',
        bullets: [
          '• Historique : tenseur (N, 48, 6) représentant les 48 dernières heures.',
          '• Météo future : tenseur (N, 6, 5) pour les 6 horizons à venir.',
          '• Cible : vecteur (N, 6) de puissance normalisée.',
          '• Conservation stricte de l’ordre chronologique.',
        ],
        color: ACCENT_CYAN,
      },
      {
        title: 'Protocole Iso-budget',
        bullets: [
          '• Budget strict fixé à ~6 000 paramètres pour garantir une comparaison équitable.',
          '• SimpleRNN (54 unités) : 5 994 paramètres.',
          '• LSTM (28 unités) : 6 054 paramètres.',
          '• GRU (32 unités) : 6 054 paramètres.',
          '• Seq2Seq (Encodeur-Décodeur) : 7 617 paramètres.',
        ],
        color: ACCENT_GOLD,
      },
      {
        title: 'Optimisation & Sobriété',
        bullets: [
          '• Optimiseur Adam, taux initial 10⁻³, perte MSE.',
          '• 25 époques, batch size de 128.',
          '• Exploration de longueurs de séquence : 6, 24, 48 et 168 heures.',
          '• Choix final : GRU direct 48 h (106 Ko, ultra-léger).',
        ],
        color: ACCENT_GREEN,
      },
    ];

    cards9.forEach((c, i) => {
      const x = 0.8 + i * 4.0;
      addCard(slide, x, 3.45, 3.7, 3.5);
      slide.addText(c.title, {
        x: x + 0.2,
        y: 3.65,
        w: 3.3,
        h: 0.35,
        fontSize: 13.5,
        fontFace: 'Arial',
        color: c.color,
        bold: true,
      });
      slide.addText(c.bullets.join('\n\n'), {
        x: x + 0.2,
        y: 4.1,
        w: 3.3,
        h: 2.7,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 15,
      });
    });

    slide.addNotes(
      "Merci [Ami 1]. Dans le premier jalon, le MLP traitait les heures passées comme un vecteur plat sans notion d'ordre. Pour le Jalon 4, nous passons à une modélisation séquentielle : la production est vue comme un flux temporel continu.\nPour cela, nous structurons les données sous forme de tenseurs 3D : chaque échantillon est une fenêtre temporelle continue de dimension (batch, 48, features) représentant les 48 dernières heures d'historique avec les variables météo et calendaires associées.\nPour comparer scientifiquement ces architectures, nous imposons un protocole iso-budget strict : tous les réseaux sont calibrés autour de 6 000 paramètres (SimpleRNN, LSTM, GRU direct, Seq2Seq).\nNotre modèle retenu est un GRU direct à 32 unités (6 054 paramètres) pour prédire directement les 6 horizons futurs.\n\nTRANSITION : Après avoir posé ce cadre séquentiel, découvrons maintenant les résultats concrets de nos expérimentations, en commençant par le modèle tabulaire. Je redonne la parole à [Ami 1] pour les résultats du Jalon 1."
    );
  }

  // ==========================================
  // SLIDE 10 : J1 : Apprentissage et performances
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '04 / EXPÉRIENCES · JALON 01', 'Le MLP franchit la cible moyenne', 'Apprentissage réel observé dans le notebook et comparaison contre la persistance intelligente.', 10);

    // Left: Convergence table
    addCard(slide, 0.8, 1.9, 5.7, 3.5);
    slide.addText('CONVERGENCE DU MLP DE RÉFÉRENCE', {
      x: 1.1,
      y: 2.1,
      w: 5.1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });
    slide.addText('Perte d’entraînement et de validation sur 30 époques (valeurs réelles)', {
      x: 1.1,
      y: 2.4,
      w: 5.1,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });

    const j1Epochs = [
      [{ text: 'Époque', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } }, { text: 'Train Loss (MSE)', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } }, { text: 'Val Loss (MSE)', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } }],
      [{ text: 'Époque 1', options: { color: TEXT_WHITE } }, { text: '0,0518', options: { color: TEXT_MUTED } }, { text: '0,0379', options: { color: TEXT_MUTED } }],
      [{ text: 'Époque 5', options: { color: TEXT_WHITE } }, { text: '0,0198', options: { color: TEXT_MUTED } }, { text: '0,0182', options: { color: TEXT_MUTED } }],
      [{ text: 'Époque 10', options: { color: TEXT_WHITE } }, { text: '0,0158', options: { color: TEXT_MUTED } }, { text: '0,0158', options: { color: TEXT_MUTED } }],
      [{ text: 'Époque 15', options: { color: TEXT_WHITE } }, { text: '0,0142', options: { color: TEXT_MUTED } }, { text: '0,0149', options: { color: TEXT_MUTED } }],
      [{ text: 'Époque 20', options: { color: TEXT_WHITE } }, { text: '0,0134', options: { color: TEXT_MUTED } }, { text: '0,0144', options: { color: TEXT_MUTED } }],
      [{ text: 'Époque 30 (Finale)', options: { color: ACCENT_GOLD, bold: true } }, { text: '0,0123', options: { color: ACCENT_GOLD, bold: true } }, { text: '0,0138', options: { color: ACCENT_GOLD, bold: true } }],
    ];
    slide.addTable(j1Epochs, {
      x: 1.1,
      y: 2.75,
      w: 5.1,
      h: 2.4,
      colW: [1.7, 1.7, 1.7],
      fontSize: 10,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    // Right: RMSE par horizon
    addCard(slide, 6.8, 1.9, 5.7, 3.5);
    slide.addText('ERREUR RMSE SELON L’HORIZON (MW)', {
      x: 7.1,
      y: 2.1,
      w: 5.1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });
    slide.addText('Comparaison MLP vs Persistance intelligente (Validation Site A)', {
      x: 7.1,
      y: 2.4,
      w: 5.1,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });

    const j1H = [
      [{ text: 'Horizon', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }, { text: 'Persistance', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }, { text: 'MLP', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }, { text: 'Gain (%)', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }],
      [{ text: 't + 1 h', options: { color: TEXT_WHITE } }, { text: '7,15 MW', options: { color: TEXT_MUTED } }, { text: '6,12 MW', options: { color: TEXT_MUTED } }, { text: '+14,4 %', options: { color: ACCENT_CYAN, bold: true } }],
      [{ text: 't + 2 h', options: { color: TEXT_WHITE } }, { text: '12,41 MW', options: { color: TEXT_MUTED } }, { text: '7,01 MW', options: { color: TEXT_MUTED } }, { text: '+43,5 %', options: { color: ACCENT_GREEN, bold: true } }],
      [{ text: 't + 3 h', options: { color: TEXT_WHITE } }, { text: '16,80 MW', options: { color: TEXT_MUTED } }, { text: '7,45 MW', options: { color: TEXT_MUTED } }, { text: '+55,7 %', options: { color: ACCENT_GREEN, bold: true } }],
      [{ text: 't + 4 h', options: { color: TEXT_WHITE } }, { text: '19,25 MW', options: { color: TEXT_MUTED } }, { text: '7,80 MW', options: { color: TEXT_MUTED } }, { text: '+59,5 %', options: { color: ACCENT_GREEN, bold: true } }],
      [{ text: 't + 5 h', options: { color: TEXT_WHITE } }, { text: '20,40 MW', options: { color: TEXT_MUTED } }, { text: '8,05 MW', options: { color: TEXT_MUTED } }, { text: '+60,5 %', options: { color: ACCENT_GREEN, bold: true } }],
      [{ text: 't + 6 h', options: { color: TEXT_WHITE } }, { text: '20,80 MW', options: { color: TEXT_MUTED } }, { text: '8,15 MW', options: { color: TEXT_MUTED } }, { text: '+60,8 %', options: { color: ACCENT_GREEN, bold: true } }],
    ];
    slide.addTable(j1H, {
      x: 7.1,
      y: 2.75,
      w: 5.1,
      h: 2.4,
      colW: [1.2, 1.3, 1.3, 1.3],
      fontSize: 9.5,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    // Bottom 3 Metrics
    addMetric(slide, 0.8, 5.6, 3.7, 0.95, '48,2 %', 'Gain moyen · Validation Site A', ACCENT_GREEN);
    addMetric(slide, 4.8, 5.6, 3.7, 0.95, '14,4 %', 'Gain horizon t+1 · Validation', ACCENT_CYAN);
    addMetric(slide, 8.8, 5.6, 3.7, 0.95, '50,9 %', 'Gain moyen · Test non vu 2025', ACCENT_GREEN);

    // Warning strip
    slide.addText(
      '⚠️ Rigueur scientifique : Le gain t+1 sur le test 2025 est de 10,2 % (légèrement inférieur à la cible de 12 %), bien que la moyenne sur 6 h (50,9 %) dépasse largement la cible (30 %).',
      {
        x: 0.8,
        y: 6.65,
        w: 11.7,
        h: 0.35,
        fontSize: 10,
        fontFace: 'Arial',
        color: ACCENT_GOLD,
        align: 'center',
        bold: true,
      }
    );

    slide.addNotes(
      "Regardons maintenant les résultats concrets du premier jalon.\nLa courbe de perte montre une convergence rapide et saine sans surapprentissage.\nSur l'ensemble de validation, le MLP atteint un gain moyen de 48,2 % contre la persistance, et monte à 50,9 % sur le test 2025. L'objectif contractuel de 30 % est donc largement dépassé.\nCependant, nous constatons avec rigueur que sur la première heure t+1, le gain en test est de 10,2 %, légèrement sous la cible de 12 %. La première heure reste la plus difficile à prévoir."
    );
  }

  // ==========================================
  // SLIDE 11 : J1 : Ablation des 47 variables
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '04 / EXPÉRIENCES · JALON 01', 'Quelles variables expliquent la prévision ?', 'L’ablation supprime un groupe d’entrées à la fois, puis mesure la baisse du gain moyen en validation.', 11);

    // Left Table / Bars
    addCard(slide, 0.8, 1.9, 4.2, 4.6);
    slide.addText('ÉTUDE D’ABLATION (VALIDATION SITE A)', {
      x: 1.0,
      y: 2.1,
      w: 3.8,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });

    const ablationTable = [
      [{ text: 'Configuration', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } }, { text: 'Gain (%)', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } }, { text: 'Impact', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } }],
      [{ text: 'Complet (47 vars)', options: { color: ACCENT_GOLD, bold: true } }, { text: '48,2 %', options: { color: ACCENT_GOLD, bold: true } }, { text: 'Référence', options: { color: ACCENT_GOLD, bold: true } }],
      [{ text: 'Sans calendrier', options: { color: TEXT_WHITE } }, { text: '47,9 %', options: { color: TEXT_MUTED } }, { text: '−0,3 pt', options: { color: TEXT_MUTED } }],
      [{ text: 'Sans nettoyage', options: { color: TEXT_WHITE } }, { text: '47,6 %', options: { color: TEXT_MUTED } }, { text: '−0,6 pt', options: { color: TEXT_MUTED } }],
      [{ text: 'Sans température', options: { color: TEXT_WHITE } }, { text: '46,1 %', options: { color: TEXT_MUTED } }, { text: '−2,1 pts', options: { color: TEXT_MUTED } }],
      [{ text: 'Sans historique prod', options: { color: TEXT_WHITE } }, { text: '38,9 %', options: { color: ACCENT_CYAN } }, { text: '−9,3 pts', options: { color: ACCENT_CYAN, bold: true } }],
      [{ text: 'Sans nébulosité', options: { color: ACCENT_GOLD, bold: true } }, { text: '32,5 %', options: { color: ACCENT_GOLD, bold: true } }, { text: '−15,6 pts', options: { color: 'f4826d', bold: true } }],
      [{ text: 'Sans météo (totale)', options: { color: 'f4826d', bold: true } }, { text: '28,1 %', options: { color: 'f4826d', bold: true } }, { text: '−20,1 pts', options: { color: 'f4826d', bold: true } }],
    ];
    slide.addTable(ablationTable, {
      x: 1.0,
      y: 2.5,
      w: 3.8,
      h: 3.8,
      colW: [1.8, 1.0, 1.0],
      fontSize: 9.5,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    // Center Card: Interprétation
    addCard(slide, 5.2, 1.9, 3.8, 4.6);
    slide.addText('INTERPRÉTATION PHYSIQUE', {
      x: 5.4,
      y: 2.1,
      w: 3.4,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });

    slide.addText('−15,6 pts', {
      x: 5.4,
      y: 2.5,
      w: 3.4,
      h: 0.8,
      fontSize: 34,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
      align: 'center',
    });
    slide.addText('Chute de gain sans la nébulosité\n(48,2 % → 32,5 %)', {
      x: 5.4,
      y: 3.3,
      w: 3.4,
      h: 0.5,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      align: 'center',
      bold: true,
    });

    const interBullets = [
      '• La nébulosité est la variable reine : sans elle, la prévision perd 1/3 de sa valeur ajoutée.',
      '• L’historique de production est le second facteur clé : perte de −9,3 pts sans lui.',
      '• Calendrier et nettoyage ont un impact plus marginal sur ce protocole.',
      '• Conclusion : pour prévoir l’énergie solaire, il faut avant tout connaître le ciel.',
    ];
    slide.addText(interBullets.join('\n\n'), {
      x: 5.4,
      y: 4.0,
      w: 3.4,
      h: 2.3,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      lineSpacing: 15,
    });

    // Right Card: Figures originales
    addCard(slide, 9.2, 1.9, 3.3, 4.6);
    slide.addText('FIGURES SCIENTIFIQUES ORIGINALES', {
      x: 9.4,
      y: 2.1,
      w: 2.9,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });

    const figPath1 = path.join(process.cwd(), 'figures', 'jalon1_ablation_study.png');
    if (fs.existsSync(figPath1)) {
      slide.addImage({
        path: figPath1,
        x: 9.4,
        y: 2.5,
        w: 2.9,
        h: 1.8,
      });
    }
    const figPath2 = path.join(process.cwd(), 'figures', 'jalon1_gains_horizons.png');
    if (fs.existsSync(figPath2)) {
      slide.addImage({
        path: figPath2,
        x: 9.4,
        y: 4.5,
        w: 2.9,
        h: 1.8,
      });
    }

    slide.addNotes(
      "Pour comprendre ce que le MLP a réellement appris, nous avons mené une étude d'ablation en supprimant un groupe de variables à la fois.\nLe graphique montre clairement le facteur numéro un : la nébulosité.\nSi l'on retire la nébulosité, le notebook imprime une perte de −15,6 points ; les gains affichés sont arrondis à 48,2 % et 32,5 %.\nSans historique de production, le gain tombe à 38,9 %. En revanche, le calendrier et le nettoyage ont un impact plus marginal.\n\nTRANSITION : Nous savons maintenant que la couverture nuageuse est la variable reine. Voyons comment la vision par ordinateur du Jalon 2 permet justement de mesurer ce ciel et de détecter les anomalies sur les panneaux. Ayoub, à toi pour les résultats du Jalon 2."
    );
  }

  // ==========================================
  // SLIDE 12 : J2 : Caméra ciel : apprentissage et injection
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '04 / EXPÉRIENCES · JALON 02', 'Le CNN rend le ciel utile au prévisionniste', 'La vision extrait la couverture et l’occultation puis enrichit la prévision tabulaire de quatre variables.', 12);

    // Left Column: exact figure from the executed Jalon 2 notebook
    addCard(slide, 0.8, 1.9, 3.7, 4.8);
    slide.addText('SORTIE EXACTE DU NOTEBOOK · CELLULE 11', {
      x: 1.0,
      y: 2.1,
      w: 3.3,
      h: 0.3,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });
    const j2NotebookFigure = path.join(process.cwd(), '..', 'docs', 'figures', 'jalon2_cell11_img0.png');
    if (fs.existsSync(j2NotebookFigure)) {
      slide.addImage({ path: j2NotebookFigure, x: 1.0, y: 2.45, w: 3.3, h: 2.3 });
    }
    slide.addText(
      'Figure produite par le notebook exécuté :\n• Courbes ROC du diagnostic thermique\n• Détection à 5 % de fausses alertes\n• Gain de prévision MLP seul vs enrichi\n\nLa partie droite confirme le gain t+1 de 13,10 % avec les variables visuelles.',
      {
        x: 1.0,
        y: 4.85,
        w: 3.3,
        h: 1.7,
        fontSize: 10,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 15,
      }
    );

    // Center Column: Apport multimodal
    addCard(slide, 4.8, 1.9, 3.7, 4.8);
    slide.addText('IMPACT MULTIMODAL PAR HORIZON', {
      x: 5.0,
      y: 2.1,
      w: 3.3,
      h: 0.3,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });
    const multiGain = path.join(process.cwd(), 'figures', 'jalon2_sky_cnn_multimodal_gain.png');
    if (fs.existsSync(multiGain)) {
      slide.addImage({ path: multiGain, x: 5.0, y: 2.45, w: 3.3, h: 2.3 });
    }
    slide.addText(
      'Injection des 4 variables visuelles dans le MLP :\n• t+1 h : de 10,68 % à 13,10 % (+2,42 pts) !\n• t+2 h : de 43,50 % à 44,12 % (+0,62 pt)\n• Moyenne 6 h : de 47,58 % à 48,45 % (+0,87 pt)\n\nL’impact maximal se concentre sur l’heure immédiate t+1.',
      {
        x: 5.0,
        y: 4.85,
        w: 3.3,
        h: 1.7,
        fontSize: 10,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 15,
      }
    );

    // Right Column: Tableau Heuristiques vs CNN
    addCard(slide, 8.8, 1.9, 3.7, 4.8);
    slide.addText('CNN VS RÈGLES CLASSIQUES', {
      x: 9.0,
      y: 2.1,
      w: 3.3,
      h: 0.3,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: ACCENT_GREEN,
      bold: true,
    });

    const cnnVsRules = [
      [{ text: 'Métrique', options: { bold: true, color: ACCENT_GREEN, fill: '173860' } }, { text: 'Règles', options: { bold: true, color: ACCENT_GREEN, fill: '173860' } }, { text: 'CNN', options: { bold: true, color: ACCENT_GREEN, fill: '173860' } }],
      [{ text: 'MAE couverture test', options: { color: TEXT_WHITE } }, { text: '0,097', options: { color: TEXT_MUTED } }, { text: '0,041', options: { color: ACCENT_CYAN, bold: true } }],
      [{ text: 'MAE occultation test', options: { color: TEXT_WHITE } }, { text: '0,082', options: { color: TEXT_MUTED } }, { text: '0,038', options: { color: ACCENT_CYAN, bold: true } }],
      [{ text: 'Gain t+1 validation', options: { color: TEXT_WHITE } }, { text: '10,68 %', options: { color: TEXT_MUTED } }, { text: '13,10 %', options: { color: ACCENT_GREEN, bold: true } }],
      [{ text: 'Gain moyen validation', options: { color: TEXT_WHITE } }, { text: '47,58 %', options: { color: TEXT_MUTED } }, { text: '48,45 %', options: { color: ACCENT_GREEN, bold: true } }],
    ];
    slide.addTable(cnnVsRules, {
      x: 9.0,
      y: 2.45,
      w: 3.3,
      h: 2.2,
      colW: [1.5, 0.9, 0.9],
      fontSize: 9.5,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    // Big highlight box
    addCard(slide, 9.0, 4.85, 3.3, 1.6, '0b2440', '2d639e');
    slide.addText('+2,42 pts', {
      x: 9.0,
      y: 4.95,
      w: 3.3,
      h: 0.6,
      fontSize: 26,
      fontFace: 'Arial',
      color: ACCENT_GREEN,
      bold: true,
      align: 'center',
    });
    slide.addText('Boost de gain immédiat à t+1\n(Franchit la barre des 12 % visés)', {
      x: 9.0,
      y: 5.55,
      w: 3.3,
      h: 0.75,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      align: 'center',
    });

    slide.addNotes(
      "Merci [Ami 1]. Regardons concrètement les résultats apportés par la caméra ciel.\nTout d'abord, le CNN apprend très vite : l'erreur MAE descend à 0,0414. Il surpasse largement les seuils simples basés sur la seule luminosité (0,041 vs 0,097).\nMais le résultat majeur est ce qui se passe quand on injecte cette estimation dans la prévision : sur la première heure t+1, le gain bondit de +2,42 points (de 10,68 % à 13,10 %) !\nRegarder le ciel permet de corriger immédiatement les retards des modèles météo sur le très court terme."
    );
  }

  // ==========================================
  // SLIDE 13 : J2 : Thermographie : détection d'anomalies
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '04 / EXPÉRIENCES · JALON 02', 'Auto-encodeur : repérer les anomalies thermiques', 'Le réseau ne voit que des panneaux sains pendant l’entraînement ; les écarts de reconstruction deviennent des scores de défaut.', 13);

    // Left: Inspection panels image
    addCard(slide, 0.8, 1.9, 4.5, 4.8);
    slide.addText('CARTES D’ERREUR ET RECONSTRUCTION', {
      x: 1.0,
      y: 2.1,
      w: 4.1,
      h: 0.3,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });
    const panelsImg = path.join(process.cwd(), 'figures', 'jalon2_thermal_inspection_panels.png');
    if (fs.existsSync(panelsImg)) {
      slide.addImage({ path: panelsImg, x: 1.0, y: 2.45, w: 4.1, h: 2.4 });
    }
    slide.addText(
      '• Panneau sain : erreur résiduelle bleue (nulle).\n• Point chaud (hotspot) : zone thermique rouge vif impossible à reconstruire par le modèle sain.\n• Fissure structurelle : mise en évidence automatique.',
      {
        x: 1.0,
        y: 5.0,
        w: 4.1,
        h: 1.5,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 16,
      }
    );

    // Center: ROC Curve
    addCard(slide, 5.6, 1.9, 3.5, 4.8);
    slide.addText('ÉVALUATION ROC DES DÉFAUTS', {
      x: 5.8,
      y: 2.1,
      w: 3.1,
      h: 0.3,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });
    const rocImg = path.join(process.cwd(), 'figures', 'jalon2_thermography_evaluation.png');
    if (fs.existsSync(rocImg)) {
      slide.addImage({ path: rocImg, x: 5.8, y: 2.45, w: 3.1, h: 2.4 });
    }
    slide.addText(
      'Score ROC-AUC = 0,9837\n(Quasiment parfait).\n\nLe seuil calibré au 95e percentile garantit un taux de fausses alertes contrôlé sous 5 %.',
      {
        x: 5.8,
        y: 5.0,
        w: 3.1,
        h: 1.5,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        lineSpacing: 16,
      }
    );

    // Right: Metrics & Latent Table
    addCard(slide, 9.4, 1.9, 3.1, 4.8);
    slide.addText('RÉSULTATS DU DIAGNOSTIC', {
      x: 9.6,
      y: 2.1,
      w: 2.7,
      h: 0.3,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: ACCENT_GREEN,
      bold: true,
    });

    addMetric(slide, 9.6, 2.45, 2.7, 0.95, '0,9837', 'AUC · Erreur maximale', ACCENT_GREEN);
    addMetric(slide, 9.6, 3.5, 2.7, 0.95, '89,3 %', 'Fissures détectées réelles', ACCENT_GREEN);

    slide.addText('Étude des dimensions latentes :', {
      x: 9.6,
      y: 4.6,
      w: 2.7,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });
    const latentTable = [
      [{ text: 'Latent', options: { bold: true, color: ACCENT_GREEN, fill: '173860' } }, { text: 'AUC', options: { bold: true, color: ACCENT_GREEN, fill: '173860' } }, { text: 'Seuil', options: { bold: true, color: ACCENT_GREEN, fill: '173860' } }],
      [{ text: '16 dims', options: { color: TEXT_WHITE } }, { text: '0,974', options: { color: TEXT_MUTED } }, { text: '0,018', options: { color: TEXT_MUTED } }],
      [{ text: '32 dims', options: { color: ACCENT_GOLD, bold: true } }, { text: '0,984', options: { color: ACCENT_GOLD, bold: true } }, { text: '0,015', options: { color: ACCENT_GOLD, bold: true } }],
      [{ text: '64 dims', options: { color: TEXT_WHITE } }, { text: '0,981', options: { color: TEXT_MUTED } }, { text: '0,014', options: { color: TEXT_MUTED } }],
    ];
    slide.addTable(latentTable, {
      x: 9.6,
      y: 4.9,
      w: 2.7,
      h: 1.6,
      colW: [0.9, 0.9, 0.9],
      fontSize: 9,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    slide.addNotes(
      "Passons maintenant au diagnostic de santé des panneaux par thermographie.\nLes performances de notre auto-encodeur sont exceptionnelles : il atteint un score AUC de 0,9837. En fixant notre seuil au 95e percentile pour garantir moins de 5 % de fausses alertes, le modèle détecte 89,3 % des fissures.\nSur un panneau sain, la carte résiduelle est bleue (proche de zéro). Lorsqu'un point chaud ou une fissure apparaît, l'erreur ressort immédiatement en rouge vif.\n\nTRANSITION : La vision permet d'affiner la prévision et de sécuriser les panneaux. Voyons maintenant comment nos modèles se comportent lorsqu'on les transfère sur le Site B. Je repasse la parole à [Ami 1] pour le Jalon 3."
    );
  }

  // ==========================================
  // SLIDE 14 : J3 : Benchmark de transfert Site B
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '04 / EXPÉRIENCES · JALON 03', 'Sur le site B, le zero-shot généralise mieux au test', 'Les stratégies sont évaluées sur mars (validation) puis avril–juin 2025 (test non vu).', 14);

    // Left: Table Validation Mars
    addCard(slide, 0.8, 1.9, 4.0, 4.8);
    slide.addText('VALIDATION SITE B (MARS 2025)', {
      x: 1.0,
      y: 2.1,
      w: 3.6,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });
    slide.addText('Évaluation sur 1 mois d’hiver', {
      x: 1.0,
      y: 2.4,
      w: 3.6,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });

    const valTable = [
      [{ text: 'Stratégie', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } }, { text: 'Gain Val', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } }],
      [{ text: 'Fine-tuning complet', options: { color: ACCENT_GOLD, bold: true } }, { text: '43,4 %', options: { color: ACCENT_GOLD, bold: true } }],
      [{ text: 'Gel couche 1', options: { color: TEXT_WHITE } }, { text: '43,2 %', options: { color: TEXT_MUTED } }],
      [{ text: 'Zero-shot (A brut)', options: { color: ACCENT_CYAN, bold: true } }, { text: '42,2 %', options: { color: ACCENT_CYAN, bold: true } }],
      [{ text: 'Gel couches 1 & 2', options: { color: TEXT_WHITE } }, { text: '41,8 %', options: { color: TEXT_MUTED } }],
      [{ text: 'Scratch (depuis zéro)', options: { color: TEXT_WHITE } }, { text: '38,9 %', options: { color: TEXT_MUTED } }],
    ];
    slide.addTable(valTable, {
      x: 1.0,
      y: 2.7,
      w: 3.6,
      h: 2.3,
      colW: [2.3, 1.3],
      fontSize: 10,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });
    slide.addText(
      'En validation, le Fine-tuning complet semblait légèrement supérieur (+1,2 pt face au Zero-shot).',
      {
        x: 1.0,
        y: 5.2,
        w: 3.6,
        h: 1.3,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        lineSpacing: 15,
      }
    );

    // Center: Test Final Avril-Juin
    addCard(slide, 5.0, 1.9, 4.0, 4.8);
    slide.addText('TEST FINAL NON VU (AVRIL–JUIN 2025)', {
      x: 5.2,
      y: 2.1,
      w: 3.6,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });
    slide.addText('Évaluation sur 3 mois de printemps', {
      x: 5.2,
      y: 2.4,
      w: 3.6,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });

    const testTable = [
      [{ text: 'Stratégie', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }, { text: 'Gain Test', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }, { text: 'Cible 27 %', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }],
      [{ text: 'Zero-shot (A brut)', options: { color: ACCENT_GREEN, bold: true } }, { text: '40,3 %', options: { color: ACCENT_GREEN, bold: true } }, { text: 'Atteinte', options: { color: ACCENT_GREEN, bold: true } }],
      [{ text: 'Fine-tuning complet', options: { color: TEXT_WHITE } }, { text: '38,4 %', options: { color: TEXT_MUTED } }, { text: 'Atteinte', options: { color: ACCENT_GREEN } }],
      [{ text: 'Gel couches 1 & 2', options: { color: TEXT_WHITE } }, { text: '37,1 %', options: { color: TEXT_MUTED } }, { text: 'Atteinte', options: { color: ACCENT_GREEN } }],
      [{ text: 'Scratch (depuis zéro)', options: { color: 'f4826d', bold: true } }, { text: '25,6 %', options: { color: 'f4826d', bold: true } }, { text: 'Échoué', options: { color: 'f4826d', bold: true } }],
    ];
    slide.addTable(testTable, {
      x: 5.2,
      y: 2.7,
      w: 3.6,
      h: 2.3,
      colW: [1.8, 0.9, 0.9],
      fontSize: 9.5,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    addCard(slide, 5.2, 5.2, 3.6, 1.3, '0a243e', '2d639e');
    slide.addText('40,3 %', {
      x: 5.2,
      y: 5.25,
      w: 3.6,
      h: 0.55,
      fontSize: 26,
      fontFace: 'Arial',
      color: ACCENT_GREEN,
      bold: true,
      align: 'center',
    });
    slide.addText('Zero-shot vainqueur en test\n(Cible 27 % largement dépassée)', {
      x: 5.2,
      y: 5.85,
      w: 3.6,
      h: 0.55,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      align: 'center',
    });

    // Right: Image & Explanation
    addCard(slide, 9.2, 1.9, 3.3, 4.8);
    slide.addText('BENCHMARK DE TRANSFERT', {
      x: 9.4,
      y: 2.1,
      w: 2.9,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });
    const transImg = path.join(process.cwd(), 'figures', 'jalon3_transfer_learning_benchmark.png');
    if (fs.existsSync(transImg)) {
      slide.addImage({ path: transImg, x: 9.4, y: 2.45, w: 2.9, h: 2.0 });
    }
    slide.addText(
      'Pourquoi le Zero-shot gagne-t-il ?\n\nLe fine-tuning s’est sur-ajusté aux conditions spécifiques de l’hiver (mars).\n\nLe modèle zero-shot a conservé les lois physiques globales apprises sur 2 ans au Site A et résiste beaucoup mieux au printemps.',
      {
        x: 9.4,
        y: 4.6,
        w: 2.9,
        h: 2.0,
        fontSize: 10,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 15,
      }
    );

    slide.addNotes(
      "Regardons maintenant comment notre système se comporte sur le site B.\nVoici l'un des résultats scientifiques les plus intéressants du projet :\nEn validation sur mars, le fine-tuning semblait en tête (43,4 %).\nMais sur le test final non vu (avril à juin), c'est le Zero-shot qui l'emporte avec 40,3 % de gain moyen (contre 38,4 % pour le fine-tuning).\nLe fine-tuning a sur-appris sur les conditions spécifiques de l'hiver, alors que le zero-shot a conservé la dynamique physique générale apprise sur deux ans au site A. Pas besoin d'attendre des mois pour déployer le modèle !"
    );
  }

  // ==========================================
  // SLIDE 15 : J3 : Multitâche et adaptation caméra
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '04 / EXPÉRIENCES · JALON 03', 'Deux tâches, une représentation partagée', 'Le poids λ équilibre la couverture nuageuse et l’occultation solaire, mais l’adaptation du site B reste difficile.', 15);

    // Left: Multitask Trade-off Figure
    addCard(slide, 0.8, 1.9, 4.3, 4.8);
    slide.addText('TRADE-OFF MULTITÂCHE SELON λ', {
      x: 1.0,
      y: 2.1,
      w: 3.9,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });
    const multiTrade = path.join(process.cwd(), 'figures', 'jalon3_multitask_tradeoff.png');
    if (fs.existsSync(multiTrade)) {
      slide.addImage({ path: multiTrade, x: 1.0, y: 2.45, w: 3.9, h: 2.3 });
    }
    slide.addText(
      '• λ = 0 : aucune pénalité sur l’occultation → erreur occultation massive (MAE = 0,430).\n• λ = 0,3 (Compromis optimal) : MAE couverture = 0,030 · MAE occultation = 0,102.\n• λ = 1 ou 3 : sur-pondère l’occultation au détriment de la couverture nuageuse.',
      {
        x: 1.0,
        y: 4.95,
        w: 3.9,
        h: 1.6,
        fontSize: 10,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 15,
      }
    );

    // Center & Right: Camera B Adaptation
    addCard(slide, 5.3, 1.9, 7.2, 4.8);
    slide.addText('ÉVALUATION SUR LA CAMÉRA DU SITE B', {
      x: 5.5,
      y: 2.1,
      w: 6.8,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });
    slide.addText('Changement d’angle, de capteur et de contraste lumineux entre les centrales', {
      x: 5.5,
      y: 2.4,
      w: 6.8,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });

    const camBTable = [
      [{ text: 'Métrique d’évaluation', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }, { text: 'Zero-shot B', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }, { text: 'Fine-tuning B', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }, { text: 'Cible Industrielle', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }],
      [{ text: 'Couverture nuageuse MAE · Val', options: { color: TEXT_WHITE } }, { text: '0,0562', options: { color: TEXT_MUTED } }, { text: '0,0380', options: { color: ACCENT_GREEN, bold: true } }, { text: '≤ 0,05', options: { color: TEXT_MUTED } }],
      [{ text: 'Occultation solaire MAE · Val', options: { color: TEXT_WHITE } }, { text: '0,1204', options: { color: TEXT_MUTED } }, { text: '0,0992', options: { color: ACCENT_GREEN, bold: true } }, { text: '≤ 0,10', options: { color: TEXT_MUTED } }],
      [{ text: 'Occultation solaire MAE · Test B', options: { color: 'f4826d', bold: true } }, { text: 'Non mesuré', options: { color: TEXT_MUTED } }, { text: '0,1534', options: { color: 'f4826d', bold: true } }, { text: '≤ 0,10', options: { color: TEXT_MUTED } }],
    ];
    slide.addTable(camBTable, {
      x: 5.5,
      y: 2.8,
      w: 6.8,
      h: 2.0,
      colW: [2.8, 1.3, 1.4, 1.3],
      fontSize: 10.5,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    addCard(slide, 5.5, 5.0, 6.8, 1.5, '091c33', '274f80');
    slide.addText('⚠️ CONSTAT DE RIGUEUR : DÉRIVE DU CAPTEUR VISUEL DU SITE B', {
      x: 5.7,
      y: 5.15,
      w: 6.4,
      h: 0.25,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
      charSpacing: 1,
    });
    slide.addText(
      'Si le fine-tuning améliore la validation en mars (MAE occultation = 0,0992 ≤ 0,10), la métrique sur le test non vu remonte à 0,1534 (> cible de 0,10).\nExplication physique : La caméra du Site B a un angle différent et des reflets optiques variables au printemps. Une adaptation de domaine spécifique (colorimétrie/alignement) est nécessaire.',
      {
        x: 5.7,
        y: 5.45,
        w: 6.4,
        h: 0.95,
        fontSize: 10,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 15,
      }
    );

    slide.addNotes(
      "Ce slide présente notre CNN multitâche pour estimer à la fois les nuages et le soleil caché, et son test sur la caméra du site B.\nSur le site A, la valeur lambda = 0,3 donne le meilleur équilibre : une petite erreur sur les nuages (0,030) et sur le soleil (0,102).\nSur le site B, en validation le fine-tuning aide bien le modèle, mais sur le test, l'erreur sur le soleil caché remonte à 0,1534. La caméra du site B est différente : l'angle, l'éclairage et la qualité de l'image changent, ce qui perturbe le modèle.\n\nTRANSITION : Pour terminer notre démarche expérimentale et conclure cette présentation, je passe la parole à [Ami 2] pour les résultats des modèles récurrents et le bilan final du projet."
    );
  }

  // ==========================================
  // SLIDE 16 : J4 : Comparatif séquentiel
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '04 / EXPÉRIENCES · JALON 04', 'RNN, LSTM ou GRU à budget comparable ?', 'Comparer les architectures sur la validation Site A, à une enveloppe proche de 6 000 paramètres.', 16);

    // Left: Table Comparatif
    addCard(slide, 0.8, 1.9, 5.0, 4.8);
    slide.addText('BENCHMARK SÉQUENTIEL ISO-BUDGET', {
      x: 1.0,
      y: 2.1,
      w: 4.6,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_GREEN,
      bold: true,
    });
    slide.addText('Validation Site A · Gain vs Persistance · Durée sur CPU classique', {
      x: 1.0,
      y: 2.4,
      w: 4.6,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });

    const seqTable = [
      [{ text: 'Modèle', options: { bold: true, color: ACCENT_GREEN, fill: '173860' } }, { text: 'Params', options: { bold: true, color: ACCENT_GREEN, fill: '173860' } }, { text: 'Gain Val', options: { bold: true, color: ACCENT_GREEN, fill: '173860' } }, { text: 'Durée', options: { bold: true, color: ACCENT_GREEN, fill: '173860' } }],
      [{ text: 'MLP de base (J1)', options: { color: TEXT_MUTED } }, { text: '5 350', options: { color: TEXT_MUTED } }, { text: '40,0 %', options: { color: TEXT_MUTED } }, { text: '12,4 s', options: { color: TEXT_MUTED } }],
      [{ text: 'SimpleRNN (54)', options: { color: TEXT_WHITE } }, { text: '5 994', options: { color: TEXT_MUTED } }, { text: '44,5 %', options: { color: TEXT_MUTED } }, { text: '15,3 s', options: { color: TEXT_MUTED } }],
      [{ text: 'LSTM (28)', options: { color: TEXT_WHITE } }, { text: '6 054', options: { color: TEXT_MUTED } }, { text: '45,0 %', options: { color: TEXT_MUTED } }, { text: '24,1 s', options: { color: TEXT_MUTED } }],
      [{ text: 'Seq2Seq Enc-Dec', options: { color: TEXT_WHITE } }, { text: '7 617', options: { color: TEXT_MUTED } }, { text: '44,3 %', options: { color: TEXT_MUTED } }, { text: '38,2 s', options: { color: TEXT_MUTED } }],
      [{ text: 'GRU direct (L=24 h)', options: { color: ACCENT_CYAN, bold: true } }, { text: '6 054', options: { color: ACCENT_CYAN } }, { text: '46,4 %', options: { color: ACCENT_CYAN, bold: true } }, { text: '31,4 s', options: { color: ACCENT_CYAN } }],
      [{ text: 'GRU direct (L=48 h)', options: { color: ACCENT_GOLD, bold: true } }, { text: '6 054', options: { color: ACCENT_GOLD } }, { text: '44,9 %', options: { color: ACCENT_GOLD, bold: true } }, { text: '52,8 s', options: { color: ACCENT_GOLD } }],
    ];
    slide.addTable(seqTable, {
      x: 1.0,
      y: 2.7,
      w: 4.6,
      h: 2.8,
      colW: [1.8, 0.9, 1.0, 0.9],
      fontSize: 10,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    slide.addText(
      '🏆 Vainqueur : Le GRU direct (32 unités) surpasse le LSTM tout en étant plus sobre en calcul.\nLa version L=48 h est retenue comme architecture finale pour sa robustesse temporelle sur 2 cycles.',
      {
        x: 1.0,
        y: 5.65,
        w: 4.6,
        h: 0.9,
        fontSize: 10,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 15,
      }
    );

    // Right: 2 Figures
    addCard(slide, 6.0, 1.9, 6.5, 4.8);
    slide.addText('FIGURES COMPARATIVES DU JALON 04', {
      x: 6.2,
      y: 2.1,
      w: 6.1,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });

    const isoImg = path.join(process.cwd(), 'figures', 'jalon4_rnn_iso_budget_comparison.png');
    if (fs.existsSync(isoImg)) {
      slide.addImage({ path: isoImg, x: 6.2, y: 2.45, w: 3.0, h: 2.2 });
    }
    const cellImg = path.join(process.cwd(), 'figures', 'jalon4_cell4_img1.png');
    if (fs.existsSync(cellImg)) {
      slide.addImage({ path: cellImg, x: 9.3, y: 2.45, w: 3.0, h: 2.2 });
    }

    slide.addText(
      'Enseignements clés du benchmark récurrent :\n• Tous les modèles séquentiels battent le MLP tabulaire grâce à la prise en compte de l’ordre temporel.\n• Le GRU direct à 32 unités converge en moins d’une minute sur CPU standard.\n• L’approche Seq2Seq (Encodeur-Décodeur récursif) ajoute 26 % de paramètres sans gain significatif.',
      {
        x: 6.2,
        y: 4.85,
        w: 6.1,
        h: 1.7,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        lineSpacing: 16,
      }
    );

    slide.addNotes(
      "Regardons maintenant les performances des architectures récurrentes à budget constant de ~6 000 paramètres.\nLe premier constat expérimental est sans appel : toutes les architectures séquentiels battent le MLP tabulaire, car elles capturent la dynamique temporelle continue du soleil.\nLe GRU direct (24h) atteint 46,4 % de gain moyen et 11,0 % sur t+1.\nLe LSTM plafonne à 45,0 %, et le Seq2Seq à 44,3 % tout en étant plus lourd (7 617 paramètres).\nDe plus, les entraînements sont ultra-rapides : entre 15 et 53 secondes. Le GRU direct est donc notre grand vainqueur."
    );
  }

  // ==========================================
  // SLIDE 17 : J4 : Longueur d'historique
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '04 / EXPÉRIENCES · JALON 04', '48 heures : un choix de robustesse et de coût', 'Des séquences plus longues n’améliorent pas automatiquement la prévision ; l’expérience quantifie ce compromis.', 17);

    // Left: Table Historique
    addCard(slide, 0.8, 1.9, 4.3, 4.8);
    slide.addText('EFFET DE LA LONGUEUR D’HISTORIQUE (L)', {
      x: 1.0,
      y: 2.1,
      w: 3.9,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });
    slide.addText('Modèle GRU(32) · Validation Site A', {
      x: 1.0,
      y: 2.4,
      w: 3.9,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });

    const histTable = [
      [{ text: 'Historique (L)', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }, { text: 'Gain Val', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }, { text: 'Durée (CPU)', options: { bold: true, color: ACCENT_GOLD, fill: '173860' } }],
      [{ text: '6 heures', options: { color: TEXT_WHITE } }, { text: '47,2 %', options: { color: TEXT_MUTED } }, { text: '14,8 s', options: { color: TEXT_MUTED } }],
      [{ text: '24 heures (1 jour)', options: { color: TEXT_WHITE } }, { text: '45,5 %', options: { color: TEXT_MUTED } }, { text: '31,2 s', options: { color: TEXT_MUTED } }],
      [{ text: '48 heures (2 jours)', options: { color: ACCENT_GREEN, bold: true } }, { text: '44,9 %', options: { color: ACCENT_GREEN, bold: true } }, { text: '52,8 s', options: { color: ACCENT_GREEN, bold: true } }],
      [{ text: '168 h (1 semaine)', options: { color: 'f4826d' } }, { text: '44,9 %', options: { color: 'f4826d' } }, { text: '162,4 s (×3)', options: { color: 'f4826d', bold: true } }],
    ];
    slide.addTable(histTable, {
      x: 1.0,
      y: 2.7,
      w: 3.9,
      h: 2.1,
      colW: [1.7, 1.1, 1.1],
      fontSize: 10,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    slide.addText(
      'Pourquoi retenir 48 heures ?\n• 48 h couvre exactement 2 cycles solaires complets (hier + aujourd’hui) pour capter la tendance météorologique récente.\n• Passer à 168 h (une semaine) n’apporte aucun gain (+0,0 pt) tout en triplant le temps d’entraînement (162 s).',
      {
        x: 1.0,
        y: 4.95,
        w: 3.9,
        h: 1.65,
        fontSize: 10,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 15,
      }
    );

    // Right: 2 Figures & Final Metric
    addCard(slide, 5.3, 1.9, 7.2, 4.8);
    slide.addText('ÉVALUATION DU MODÈLE RETENU SUR LE TEST FINAL', {
      x: 5.5,
      y: 2.1,
      w: 6.8,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });

    const histTradeImg = path.join(process.cwd(), 'figures', 'jalon4_history_length_tradeoff.png');
    if (fs.existsSync(histTradeImg)) {
      slide.addImage({ path: histTradeImg, x: 5.5, y: 2.45, w: 3.3, h: 2.3 });
    }
    const radarImg = path.join(process.cwd(), 'figures', 'jalon4_final_test_radar.png');
    if (fs.existsSync(radarImg)) {
      slide.addImage({ path: radarImg, x: 9.0, y: 2.45, w: 3.3, h: 2.3 });
    }

    addMetric(slide, 5.5, 4.95, 3.3, 1.6, '49,0 %', 'Gain moyen test 2025 · Site A\n(Cible contractuelle 30 % dépassée)', ACCENT_GREEN);
    addMetric(slide, 9.0, 4.95, 3.3, 1.6, '40,0 %', 'Gain moyen test · Site B (Zero-shot)\n(Cible contractuelle 27 % dépassée)', ACCENT_GREEN);

    slide.addNotes(
      "Une question essentielle se posait : quelle quantité d'historique passé faut-il donner au GRU ? Nous avons fait varier la fenêtre de 6 h à 168 h (une semaine entière).\nLe graphique livre une réponse nette : à 24 h et 48 h, le modèle se stabilise autour de 45 %. Si l'on monte à 168 heures, le gain reste le même (44,9 %), mais le temps de calcul triple à 162 secondes.\nNous retenons donc 48 heures : cela couvre 2 cycles jour/nuit sans calculs inutiles.\nÉvalué sur le jeu de test final 2025 non vu, ce GRU 48h confirme sa solidité : 49,0 % sur le Site A (vs 30 % visés) et 40,0 % sur le Site B en Zero-shot (vs 27 % visés)."
    );
  }

  // ==========================================
  // SLIDE 18 : Synthèse comparative des 4 jalons
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '05 / COMPARAISON ET CONSTATS', 'Ce que démontre chaque jalon', 'Quatre résultats sur des objectifs différents : les métriques ne sont pas comparables entre tâches sans préciser le protocole.', 18);

    // 4 Key Metrics
    addMetric(slide, 0.8, 1.9, 2.7, 0.95, '50,9 %', 'J1 · Gain moyen test A', ACCENT_GREEN);
    addMetric(slide, 3.8, 1.9, 2.7, 0.95, '0,9837', 'J2 · AUC score erreur max', ACCENT_GREEN);
    addMetric(slide, 6.8, 1.9, 2.7, 0.95, '40,3 %', 'J3 · Zero-shot test B', ACCENT_GREEN);
    addMetric(slide, 9.8, 1.9, 2.7, 0.95, '49,0 %', 'J4 · GRU direct test A', ACCENT_GREEN);

    // Grand Tableau de Synthèse
    addCard(slide, 0.8, 3.0, 11.7, 3.2);
    slide.addText('TABLEAU DE SYNTHÈSE SCIENTIFIQUE DES QUATRE JALONS', {
      x: 1.1,
      y: 3.15,
      w: 11.1,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
      charSpacing: 1.5,
    });

    const synTable = [
      [
        { text: 'Jalon', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } },
        { text: 'Tâche principale', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } },
        { text: 'Méthode retenue', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } },
        { text: 'Métrique clé (Test)', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } },
        { text: 'Cible contractuelle', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } },
        { text: 'Limitation / Point critique', options: { bold: true, color: ACCENT_CYAN, fill: '173860' } },
      ],
      [
        { text: 'J1', options: { color: ACCENT_GOLD, bold: true } },
        { text: 'Prévision 6 h Site A', options: { color: TEXT_WHITE } },
        { text: 'MLP 47 vars (Dense 64-32)', options: { color: TEXT_WHITE } },
        { text: 'Gain 50,9 % (Test 2025)', options: { color: ACCENT_GREEN, bold: true } },
        { text: '≥ 30 % (Atteinte)', options: { color: ACCENT_GREEN } },
        { text: 't+1 en test = 10,2 % (< 12 % visés)', options: { color: 'f4826d' } },
      ],
      [
        { text: 'J2', options: { color: ACCENT_GOLD, bold: true } },
        { text: 'Vision ciel & panneaux', options: { color: TEXT_WHITE } },
        { text: 'CNN Dual Pooling + AE 24×40', options: { color: TEXT_WHITE } },
        { text: 'AUC 0,9837 · MAE occ 0,041', options: { color: ACCENT_GREEN, bold: true } },
        { text: '< 5 % fausses alertes', options: { color: ACCENT_GREEN } },
        { text: 'Gain multimodal modeste au-delà de t+1', options: { color: TEXT_MUTED } },
      ],
      [
        { text: 'J3', options: { color: ACCENT_GOLD, bold: true } },
        { text: 'Transfert B & Multitâche', options: { color: TEXT_WHITE } },
        { text: 'Zero-shot (A brut) · λ = 0,3', options: { color: TEXT_WHITE } },
        { text: 'Gain 40,3 % (Test B)', options: { color: ACCENT_GREEN, bold: true } },
        { text: '≥ 27 % (Atteinte)', options: { color: ACCENT_GREEN } },
        { text: 'Caméra B occultation = 0,1534 (> 0,10)', options: { color: 'f4826d' } },
      ],
      [
        { text: 'J4', options: { color: ACCENT_GOLD, bold: true } },
        { text: 'Séquentiel & Déploiement', options: { color: TEXT_WHITE } },
        { text: 'GRU direct (32 unités, L=48 h)', options: { color: TEXT_WHITE } },
        { text: 'Gain 49,0 % (A) · 40,0 % (B)', options: { color: ACCENT_GREEN, bold: true } },
        { text: '≥ 30 % / 27 % · ≤ 5 Mo', options: { color: ACCENT_GREEN } },
        { text: 't+1 en test = 9,5 % (< 12 % visés)', options: { color: 'f4826d' } },
      ],
    ];
    slide.addTable(synTable, {
      x: 1.1,
      y: 3.5,
      w: 11.1,
      h: 2.5,
      colW: [0.8, 2.2, 2.5, 2.0, 1.8, 1.8],
      fontSize: 9.5,
      fontFace: 'Arial',
      border: { pt: 1, color: '224773' },
    });

    slide.addText(
      '💡 Les deux objectifs contractuels majeurs (30 % sur A et 27 % sur B) sont tous les deux largement dépassés avec une marge confortable.',
      {
        x: 0.8,
        y: 6.35,
        w: 11.7,
        h: 0.35,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: ACCENT_GOLD,
        align: 'center',
        bold: true,
      }
    );

    slide.addNotes(
      "Prenons maintenant de la hauteur avec ce tableau récapitulatif de nos quatre jalons :\n1. Jalon 1 (MLP) : une référence tabulaire rapide qui a prouvé que la nébulosité était le facteur d'influence numéro un (gain 50,9 % test A).\n2. Jalon 2 (Vision) : un bond de +2,42 points sur l’horizon critique t+1 grâce au CNN ciel, et un auto-encodeur thermique quasi parfait avec un score AUC de 0,9837 qui détecte 89,3 % des fissures.\n3. Jalon 3 (Transfert) : la démonstration que le Zero-shot bat le fine-tuning sur le test du Site B avec 40,3 % de gain, car il résiste aux variations de saisons.\n4. Jalon 4 (Séquentiel) : la confirmation de l'efficacité du GRU direct avec 49,0 % de gain sur le Site A et 40,0 % sur le Site B.\nLes deux objectifs contractuels majeurs sont tous les deux largement dépassés."
    );
  }

  // ==========================================
  // SLIDE 19 : Décisions opérationnelles
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '05 / DÉCISIONS OPÉRATIONNELLES', 'La performance seule ne suffit pas', 'Le choix final combine métriques, généralisabilité, complexité et exigences de déploiement.', 19);

    // 3 Status Cards
    const statusCards = [
      {
        kicker: 'PRÉVISION COURT TERME (t+1)',
        val: '0,095',
        target: '/ 0,12 visés',
        status: 'Cible non atteinte',
        desc: 'Gain t+1 du GRU sur test A. L’horizon immédiat reste dominé par la persistance en conditions stables.',
        color: 'f4826d',
      },
      {
        kicker: 'PRÉVISION MULTI-HORIZONS (6 h)',
        val: '0,490',
        target: '/ 0,30 visés',
        status: 'Cible largement dépassée',
        desc: 'Gain moyen sur six heures sur test A (+19 pts de marge). Excellente anticipation du cycle diurne.',
        color: ACCENT_GREEN,
      },
      {
        kicker: 'FAISABILITÉ TECHNIQUE & EDGE',
        val: '0,106 Mo',
        target: '/ 5 Mo max',
        status: 'Conforme (47× plus léger)',
        desc: 'Taille du fichier GRU sauvegardé. Tourne sans GPU sur n’importe quel micro-contrôleur industriel.',
        color: ACCENT_GREEN,
      },
    ];

    statusCards.forEach((c, i) => {
      const x = 0.8 + i * 4.0;
      addCard(slide, x, 1.9, 3.7, 2.3);
      slide.addText(c.kicker, {
        x: x + 0.2,
        y: 2.05,
        w: 3.3,
        h: 0.25,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        bold: true,
      });
      slide.addText(c.val, {
        x: x + 0.2,
        y: 2.3,
        w: 2.0,
        h: 0.6,
        fontSize: 26,
        fontFace: 'Arial',
        color: c.color,
        bold: true,
      });
      slide.addText(c.target, {
        x: x + 2.2,
        y: 2.4,
        w: 1.3,
        h: 0.4,
        fontSize: 11,
        fontFace: 'Arial',
        color: TEXT_MUTED,
      });
      // Badge
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.2,
        y: 2.95,
        w: 3.3,
        h: 0.3,
        fill: { color: c.color === ACCENT_GREEN ? '10352d' : '3d1814' },
        line: { color: c.color, width: 1 },
        rectRadius: 0.1,
      });
      slide.addText(c.status, {
        x: x + 0.2,
        y: 2.95,
        w: 3.3,
        h: 0.3,
        fontSize: 9.5,
        fontFace: 'Arial',
        color: c.color,
        align: 'center',
        bold: true,
      });
      slide.addText(c.desc, {
        x: x + 0.2,
        y: 3.35,
        w: 3.3,
        h: 0.75,
        fontSize: 10,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 14,
      });
    });

    // 2 Justification Cards
    addCard(slide, 0.8, 4.4, 5.7, 2.6);
    slide.addText('POURQUOI RETENIR LE GRU DIRECT (48 H) ?', {
      x: 1.1,
      y: 4.6,
      w: 5.1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });
    const gruJust = [
      '• Capture les corrélations temporelles physiques sur 2 jours sans dispersion.',
      '• Évite la complexité et les erreurs récursives en cascade du Seq2Seq.',
      '• Modèle ultra-léger de seulement 6 054 paramètres (0,106 Mo).',
      '• Temps d’inférence quasi instantané (< 5 ms) parfaitement adapté au temps réel.',
    ];
    slide.addText(gruJust.join('\n\n'), {
      x: 1.1,
      y: 5.0,
      w: 5.1,
      h: 1.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 15,
    });

    addCard(slide, 6.8, 4.4, 5.7, 2.6);
    slide.addText('POURQUOI CONSERVER LE ZERO-SHOT SUR LE SITE B ?', {
      x: 7.1,
      y: 4.6,
      w: 5.1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });
    const zeroJust = [
      '• Opérationnel dès le premier jour de mise en service de la nouvelle centrale.',
      '• Évite le surapprentissage trompeur sur un échantillon hivernal trop restreint.',
      '• Résultat supérieur sur le test de printemps (40,3 % vs 38,4 % pour le fine-tuning).',
      '• Zéro coût de calcul et zéro besoin d’annotation locale immédiate.',
    ];
    slide.addText(zeroJust.join('\n\n'), {
      x: 7.1,
      y: 5.0,
      w: 5.1,
      h: 1.8,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 15,
    });

    slide.addNotes(
      "À partir de ces découvertes scientifiques, quelles décisions recommandons-nous pour l'exploitation réelle de Drâa Solaire ?\n1. Respect strict du contrat : le gain moyen est de 49 % sur A et 40 % sur B. Le modèle pèse seulement 0,106 Mo, ce qui est 47 fois plus compact que la limite imposée de 5 Mo.\n2. Choix de l'architecture : nous retenons le GRU direct avec 48h d'historique. C'est le modèle le plus équilibré entre mémoire temporelle et sobriété.\n3. Déploiement immédiat sur le Site B : nous préconisons la stratégie Zero-shot. Elle permet de démarrer l'exploitation du Site B dès le premier jour sans risque de surapprentissage."
    );
  }

  // ==========================================
  // SLIDE 20 : Rigueur scientifique et esprit critique
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '05 / INTERPRÉTATION CRITIQUE', 'Lire les résultats sans surinterpréter', 'Une présentation scientifique doit expliciter les partitions, les limites et les désaccords de source.', 20);

    // Left Card: Résultats établis
    addCard(slide, 0.8, 1.9, 5.7, 3.4);
    slide.addText('RÉSULTATS SCIENTIFIQUES ÉTABLIS & VÉRIFIÉS', {
      x: 1.1,
      y: 2.15,
      w: 5.1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_GREEN,
      bold: true,
    });
    const etabBullets = [
      '✔ Diagnostic thermique : AUC de 0,9837 et 89,3 % de fissures détectées avec < 5 % de faux positifs.',
      '✔ Robustesse du Zero-shot : le modèle généralise à 40,3 % sur le test non vu du Site B (supérieur au fine-tuning).',
      '✔ Modélisation séquentielle : le GRU 48 h atteint 49,0 % de gain sur le test Site A.',
      '✔ Rôle prédominant de la nébulosité : perte imprimée de −15,6 points de gain.',
    ];
    slide.addText(etabBullets.join('\n\n'), {
      x: 1.1,
      y: 2.6,
      w: 5.1,
      h: 2.5,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 16,
    });

    // Right Card: Points de vigilance
    addCard(slide, 6.8, 1.9, 5.7, 3.4);
    slide.addText('POINTS DE VIGILANCE & LIMITES OBSERVÉES', {
      x: 7.1,
      y: 2.15,
      w: 5.1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
    });
    const vigBullets = [
      '⚠ Validation ≠ Test : sur le Site B, le fine-tuning paraissait supérieur en mars (43,4 %), mais le zero-shot l’emporte sur le test final.',
      '⚠ Dérive optique de la caméra B : MAE occultation = 0,1534 en test (> cible 0,10) à cause de l’angle et de la lumière.',
      '⚠ Horizon immédiat t+1 : le GRU L=24 atteint exactement 12,0 % en validation ; le GRU L=48 retenu obtient 9,5 % sur le test final.',
      '⚠ Comparaisons équitables : ne jamais comparer deux modèles sans budget de paramètres documenté.',
    ];
    slide.addText(vigBullets.join('\n\n'), {
      x: 7.1,
      y: 2.6,
      w: 5.1,
      h: 2.5,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 16,
    });

    // Bottom Principle Banner
    addCard(slide, 0.8, 5.5, 11.7, 1.4, '0c223c', '2d5a8c');
    slide.addText('PRINCIPE DE RIGUEUR SCIENTIFIQUE DU MASTER SDIA', {
      x: 1.1,
      y: 5.65,
      w: 11.1,
      h: 0.25,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
      charSpacing: 2,
    });
    slide.addText(
      '« Tous les chiffres présentés sont directement extraits des notebooks exécutés dans notre dépôt GitHub. Aucun résultat n’a été artificiellement embelli ou inventé. Nous assumons les limites physiques et les divergences expérimentales constatées sur le terrain. »',
      {
        x: 1.1,
        y: 6.0,
        w: 11.1,
        h: 0.75,
        fontSize: 12.5,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        bold: true,
        lineSpacing: 18,
      }
    );

    slide.addNotes(
      "Tout au long de ce projet, notre équipe s'est astreinte à une rigueur méthodologique absolue :\n- Premièrement, ne jamais confondre validation et test. Seul le jeu de test final fait foi.\n- Deuxièmement, une totale transparence des données : tous les graphiques et métriques affichés proviennent directement de nos notebooks exécutés. Quand un résultat est en retrait, nous l'assumons et nous l'expliquons.\n- Troisièmement, des comparaisons équitables à budget de paramètres constant."
    );
  }

  // ==========================================
  // SLIDE 21 : Conclusion générale en 4 verbes
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '06 / CONCLUSION GÉNÉRALE', 'Un système, quatre contributions', 'Le projet rapproche prévision de production, compréhension visuelle et transfert entre centrales solaires.', 21);

    const contribs = [
      {
        num: '01',
        verb: 'PRÉVOIR',
        title: 'Modélisation Tabulaire',
        desc: 'Le MLP a quantifié le rôle déterminant de la nébulosité (−15,6 pts imprimés) et établi une base solide à 50,9 % de gain.',
        color: ACCENT_CYAN,
      },
      {
        num: '02',
        verb: 'VOIR',
        title: 'Perception Visuelle',
        desc: 'Le CNN ciel apporte un boost de +2,42 pts sur l’horizon critique t+1. L’auto-encodeur thermique détecte 89,3 % des défauts (AUC 0,98).',
        color: ACCENT_GOLD,
      },
      {
        num: '03',
        verb: 'TRANSFÉRER',
        title: 'Généralisation Site B',
        desc: 'Le Zero-shot s’impose sur le test final avec 40,3 % de gain, permettant un déploiement immédiat sans historique local.',
        color: ACCENT_BLUE,
      },
      {
        num: '04',
        verb: 'MÉMORISER',
        title: 'Dynamique Temporelle',
        desc: 'Le GRU direct à 32 unités capture 48 h de cycles solaires dans un fichier de seulement 106 Ko, atteignant 49,0 % de gain.',
        color: ACCENT_GREEN,
      },
    ];

    contribs.forEach((c, i) => {
      const x = 0.8 + i * 3.0;
      addCard(slide, x, 1.9, 2.75, 3.8);
      slide.addText(c.verb, {
        x: x + 0.2,
        y: 2.15,
        w: 2.35,
        h: 0.35,
        fontSize: 16,
        fontFace: 'Arial',
        color: c.color,
        bold: true,
        charSpacing: 2,
      });
      slide.addText(c.title, {
        x: x + 0.2,
        y: 2.55,
        w: 2.35,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        italic: true,
      });
      slide.addText(c.desc, {
        x: x + 0.2,
        y: 2.95,
        w: 2.35,
        h: 2.5,
        fontSize: 11,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        lineSpacing: 16,
      });
    });

    // Bottom Statement
    addCard(slide, 0.8, 5.9, 11.7, 1.1, '091c33', '265487');
    slide.addText('MESSAGE CLÉ POUR L’INDUSTRIE PHOTOVOLTAÏQUE', {
      x: 1.1,
      y: 6.0,
      w: 11.1,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
      charSpacing: 2,
    });
    slide.addText(
      'Drâa Solaire démontre qu’une IA sobre, rapide et explicable est parfaitement adaptée aux contraintes réelles des centrales solaires.',
      {
        x: 1.1,
        y: 6.3,
        w: 11.1,
        h: 0.55,
        fontSize: 14,
        fontFace: 'Arial',
        color: TEXT_WHITE,
        bold: true,
      }
    );

    slide.addNotes(
      "Pour conclure, Drâa Solaire se résume en quatre réalisations majeures :\n1. PRÉVOIR : Nous avons quantifié l'impact dominant de la couverture nuageuse (15,6 points imprimés par le notebook).\n2. VOIR : Nous avons doté la centrale de vision artificielle pour anticiper le passage des nuages et isoler les panneaux défectueux avec un AUC de 0,98.\n3. TRANSFÉRER : Nous avons prouvé qu'un modèle entraîné sur deux ans au site A se transfère immédiatement sur le site B avec plus de 40 % de gain.\n4. MÉMORISER : Nous avons montré qu'un modèle récurrent ultra-léger de 106 Ko mémorisant 48 heures de cycles solaires surpasse les approches statiques.\nDrâa Solaire démontre qu'une IA sobre, rapide et explicable est parfaitement adaptée aux contraintes industrielles du solaire."
    );
  }

  // ==========================================
  // SLIDE 22 : Perspectives et sources
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };
    addHeader(slide, '06 / PERSPECTIVES ET SOURCES', 'Vers une supervision solaire plus robuste', 'Une trajectoire d’amélioration réaliste, étayée par les limites observées.', 22);

    // Left Card: Perspectives
    addCard(slide, 0.8, 1.9, 5.7, 3.7);
    slide.addText('AXES SCIENTIFIQUES SUIVANTS', {
      x: 1.1,
      y: 2.15,
      w: 5.1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
    });
    const persBullets = [
      '• Modèle hybride spatio-temporel (CNN + GRU de bout en bout) pour enfin franchir les 12 % de gain sur l’horizon critique t+1.',
      '• Évaluation sur 12 mois complets du Site B pour observer le cycle complet des 4 saisons.',
      '• Adaptation de domaine visuelle (Domain Alignment / Normalisation adaptative) pour immuniser le CNN aux changements de caméras.',
      '• Mesure d’inférence en temps réel sur micro-contrôleur Edge (Raspberry Pi / Jetson Nano).',
    ];
    slide.addText(persBullets.join('\n\n'), {
      x: 1.1,
      y: 2.6,
      w: 5.1,
      h: 2.8,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 16,
    });

    // Right Card: Traçabilité
    addCard(slide, 6.8, 1.9, 5.7, 3.7);
    slide.addText('DÉMONSTRATION PRATIQUE & SOURCES', {
      x: 7.1,
      y: 2.15,
      w: 5.1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: ACCENT_GREEN,
      bold: true,
    });
    const repoBullets = [
      '• Application Streamlit en ligne (Démonstration pratique) :',
      '  https://centrale-solaire.streamlit.app/',
      '• Dépôt GitHub public avec code intégral, données et modèles :',
      '  https://github.com/AyoubElho/Centrale-solaire',
      '• 4 Notebooks exécutés (Jalons 1 à 4) & modèles sauvegardés',
      '• Démonstration interactive des 4 jalons avec interface web',
      '• Présentation interactive moderne disponible en web app.',
    ];
    slide.addText(repoBullets.join('\n\n'), {
      x: 7.1,
      y: 2.55,
      w: 5.1,
      h: 2.9,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      lineSpacing: 15,
    });

    // Bottom Thank You Banner
    addCard(slide, 0.8, 5.75, 11.7, 1.35, '0b2442', '2f65a1');
    slide.addText('MERCI POUR VOTRE ATTENTION !', {
      x: 1.1,
      y: 5.82,
      w: 11.1,
      h: 0.35,
      fontSize: 20,
      fontFace: 'Arial',
      color: ACCENT_GOLD,
      bold: true,
      align: 'center',
    });
    slide.addText('Groupe 14 : Oussama FELOUACH  ·  Ayoub EL HOUANI  ·  Mbarek ETTALEBY   —   Encadré par : Pr. Soufiane HAMIDA', {
      x: 1.1,
      y: 6.18,
      w: 11.1,
      h: 0.28,
      fontSize: 11.5,
      fontFace: 'Arial',
      color: TEXT_WHITE,
      bold: true,
      align: 'center',
    });
    slide.addText('Démo en direct : https://centrale-solaire.streamlit.app/  ·  Code source : https://github.com/AyoubElho/Centrale-solaire', {
      x: 1.1,
      y: 6.46,
      w: 11.1,
      h: 0.25,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: ACCENT_CYAN,
      bold: true,
      align: 'center',
    });
    slide.addText('Master SDIA (Sciences des Données & Ingénierie de l’IA) · Promotion 2026–2027', {
      x: 1.1,
      y: 6.72,
      w: 11.1,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEXT_MUTED,
      align: 'center',
    });

    slide.addNotes(
      "Pour terminer, voici nos pistes pour prolonger ce projet :\n1. Combiner images et temps : créer un modèle hybride CNN-GRU de bout en bout pour enfin dépasser la barre des 12 % sur la première heure t+1.\n2. Évaluer sur 12 mois complets pour valider la robustesse du Site B sur toutes les saisons.\n3. Ajouter de l'adaptation de domaine pour rendre la caméra insensible aux changements d'angle et de contraste.\n4. Poursuivre l'open-source : l'ensemble de notre code, de nos notebooks et de cette présentation interactive est accessible sur notre dépôt GitHub.\n\nNous vous remercions très chaleureusement pour votre écoute, et nous sommes désormais à votre entière disposition pour échanger et répondre à vos questions !"
    );
  }

  // Save presentation
  const outputPath = path.join(process.cwd(), 'DraaSolaire_Presentation_Scientifique.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`✅ Présentation PowerPoint générée avec succès : ${outputPath}`);
}

generatePresentation().catch(console.error);
