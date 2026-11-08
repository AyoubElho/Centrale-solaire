export const REPO = 'https://github.com/AyoubElho/Centrale-solaire';
export const fig = (name: string) => `${import.meta.env.BASE_URL}figures/${name}.png`;

export const sections = [
  { id: 'probleme', label: 'Problème', en: 'Problem', start: 0 },
  { id: 'methode', label: 'Méthodologie', en: 'Methodology', start: 3 },
  { id: 'materiel', label: 'Matériel et méthodes', en: 'Materials & methods', start: 5 },
  { id: 'experiences', label: 'Expérimentations', en: 'Experiments', start: 9 },
  { id: 'comparaison', label: 'Comparaison et constats', en: 'Findings', start: 17 },
  { id: 'conclusion', label: 'Conclusion', en: 'Conclusion', start: 20 }
] as const;

export const slides = [
  ['La centrale, les données, la décision', 0],
  ['Pourquoi anticiper ?', 0],
  ['Entrées, sorties et exigences', 0],
  ['Quatre jalons, une démarche', 1],
  ['Pipeline scientifique global', 1],
  ['J1 · MLP de prévision', 2],
  ['J2 · CNN et auto-encodeur', 2],
  ['J3 · Transfert et multitâche', 2],
  ['J4 · RNN, LSTM et GRU', 2],
  ['J1 · Apprentissage et performances', 3],
  ['J1 · Ablation des variables', 3],
  ['J2 · Prévoir avec les images du ciel', 3],
  ['J2 · Détecter les défauts thermiques', 3],
  ['J3 · Transfert de A vers B', 3],
  ['J3 · Multitâche et adaptation caméra', 3],
  ['J4 · Comparatif récurrent', 3],
  ['J4 · Longueur de l’historique', 3],
  ['Comparaison · Synthèse des résultats', 4],
  ['Contrats, arbitrages et coûts', 4],
  ['Constats et rigueur expérimentale', 4],
  ['Bilan des quatre jalons', 5],
  ['Perspectives et traçabilité', 5]
] as const;

// Values transcribed from the executed output cells of notebooks, not fabricated.
export const j1Learning = [
[1,.0518,.0081],[2,.0087,.0067],[3,.0077,.0061],[4,.0072,.0055],[5,.0069,.0051],[6,.0067,.0049],[7,.0065,.0047],[8,.0064,.0047],[9,.0063,.0046],[10,.0062,.0046],[11,.0062,.0046],[12,.0061,.0045],[13,.006,.0045],[14,.006,.0045],[15,.006,.0045],[16,.0059,.0045],[17,.0059,.0045],[18,.0059,.0045],[19,.0058,.0045],[20,.0058,.0044],[21,.0058,.0044],[22,.0057,.0044],[23,.0057,.0044],[24,.0057,.0044],[25,.0057,.0044],[26,.0056,.0044],[27,.0056,.0044],[28,.0056,.0044],[29,.0056,.0044],[30,.0056,.0044]
].map(([epoch,loss,val_loss])=>({epoch,loss,val_loss}));
export const j2SkyLearning = [
[1,.0877,.0830],[2,.0196,.0187],[3,.0115,.0100],[4,.0069,.0065],[5,.0052,.0053],[6,.0044,.0052],[7,.0037,.0051],[8,.0033,.0049],[9,.0030,.0043],[10,.0027,.0037],[11,.0026,.0034],[12,.0024,.0034],[13,.0023,.0033],[14,.0023,.0034],[15,.0023,.0035]
].map(([epoch,loss,val_loss])=>({epoch,loss,val_loss}));
export const j1Horizon = [
{h:'t+1',base:4.06,mlp:3.48,gain:14.4},{h:'t+2',base:7.31,mlp:4.83,gain:33.9},{h:'t+3',base:10.26,mlp:5.26,gain:48.7},
{h:'t+4',base:12.90,mlp:5.31,gain:58.8},{h:'t+5',base:15.30,mlp:5.39,gain:64.8},{h:'t+6',base:17.44,mlp:5.52,gain:68.4}
];
export const ablations = [
{name:'Modèle complet',gain:48.2},{name:'Sans nettoyage',gain:47.9},{name:'Sans calendrier',gain:47.8},{name:'Sans ciel clair',gain:47.5},
{name:'Sans température',gain:47.1},{name:'Sans historique',gain:38.9},{name:'Sans nébulosité',gain:32.5}
];
export const j2Cloud = [
{method:'Règle simple',couvertureVal:.0190611888,couvertureTest:.0166092914,occVal:.2136402416,occTest:.1594870275},
{method:'CNN dual pooling',couvertureVal:.0333139785,couvertureTest:.0252336822,occVal:.0526851825,occTest:.0388473161}
];
export const j2Forecast = [
{h:'t+1',base:10.63,vision:14.84,test:16.80},{h:'t+2',base:33.00,vision:35.06,test:38.75},{h:'t+3',base:48.83,vision:49.77,test:53.10},
{h:'t+4',base:58.93,vision:59.32,test:62.90},{h:'t+5',base:65.08,vision:64.41,test:68.97},{h:'t+6',base:68.14,vision:67.52,test:72.47}
];
export const j2Thermal = [
{latent:16,mseAuc:1,maxAuc:1,mseSeuil:.0186,maxSeuil:.2553},
{latent:32,mseAuc:1,maxAuc:1,mseSeuil:.0174,maxSeuil:.2442},
{latent:128,mseAuc:1,maxAuc:1,mseSeuil:.0171,maxSeuil:.2531}
];
export const j3Validation = [
{model:'Zero-shot A → B',gain:.42234721779823303,params:0},{model:'Apprentissage B seul',gain:.38925155997276306,params:5350},
{model:'Fine-tuning complet',gain:.4344618320465088,params:5350},{model:'1 couche gelée',gain:.4316083490848541,params:2278},
{model:'2 couches gelées',gain:.4319753646850586,params:198}
];
export const j3Test = [
{model:'Zero-shot A → B',gain:.403},{model:'Apprentissage B seul',gain:.256},{model:'Fine-tuning complet',gain:.384}
];
export const j3Multi = [
{lambda:0,cloud:.022597771137952805,occ:.4299909472465515},
{lambda:.3,cloud:.030088648200035095,occ:.102025605738163},
{lambda:1,cloud:.03237790986895561,occ:.07452195137739182},
{lambda:3,cloud:.041673410683870316,occ:.07416380196809769}
];
export const j4Models = [
{model:'MLP de référence',params:5350,gain:.400,t1:-.233,time:7.5},
{model:'SimpleRNN(54)',params:6212,gain:.445,t1:.033,time:15.5},
{model:'LSTM(28)',params:6006,gain:.450,t1:.044,time:27.4},
{model:'GRU(32) L=24 (comparatif)',params:6054,gain:.464,t1:.110,time:31.1},
{model:'GRU(32) L=48 (retenu)',params:6054,gain:.449,t1:.086,time:53.1},
{model:'GRU Enc-Dec L=48',params:7617,gain:.443,t1:.046,time:62.3}
];
export const j4History = [
{length:'6 h',hours:6,gain:.472,time:15.1,t1:.118,loss:.00613,val_loss:.00467},
{length:'24 h',hours:24,gain:.455,time:30.9,t1:.120,loss:.00621,val_loss:.00499},
{length:'48 h',hours:48,gain:.449,time:53.1,t1:.086,loss:.00630,val_loss:.00506},
{length:'168 h',hours:168,gain:.449,time:162.2,t1:.094,loss:.00619,val_loss:.00511}
];
