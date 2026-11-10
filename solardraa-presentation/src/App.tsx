import { useEffect, useRef, useState, type ReactNode, type HTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, BarChart3, BookOpen, BrainCircuit,
  CheckCircle2, ChevronRight, CircleAlert, CloudSun, Cpu, Database, ExternalLink,
  Eye, Focus, Gauge, Layers3, Maximize2, Minimize2,
  PanelLeftClose, PanelLeftOpen, PanelTop, Radio, ScanSearch, ShieldCheck, Sun, Target, ThermometerSun, TrendingUp, Wind, X, Zap
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { ZoomProvider, useZoomModal } from './ZoomContext';
import {
  REPO, fig, sections, slides, j1Learning, ablations, j2SkyLearning,
  j2Cloud, j2Forecast, j2Thermal, j3Test,
  j3Multi, j4Models, j4History
} from './data';

const C = { cyan: '#67caff', blue: '#4e85ff', dim: '#758aa9', white: '#e4efff', gold: '#f4bf6d', green: '#73d9bb' };
const nf = (n: number, d = 3) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n: number, d = 1) => `${nf(n * 100, d)} %`;
const slideSource = ['notebooks/jalon1_prevoir_production_mlp.ipynb', 'notebooks/uc4_jalon2.ipynb', 'notebooks/uc4_jalon3.ipynb', 'notebooks/uc4_jalon4.ipynb'];
const figureDescriptions: Record<string, string> = {
  jalon1_prevoir_production_mlp_cell11_img0: "L’erreur est la plus forte vers 11 h et baisse en fin d’après-midi.",
  jalon1_prevoir_production_mlp_cell16_img1: "Mars présente l’erreur t+1 la plus élevée du test 2025.",
  jalon1_ablation_study: "Sans nébulosité, le gain moyen chute le plus : c’est la variable décisive.",
  jalon1_gains_horizons: "En validation, le gain progresse de t+1 à t+6.",
  jalon2_cnn_vs_regles_notebook: "Le CNN améliore l’occultation ; la règle reste meilleure pour la couverture.",
  jalon2_camera_examples_notebook: "Les prédictions suivent les valeurs réelles, avec des écarts selon l’image.",
  jalon2_detection_thermique_notebook: "La détection des fissures dépasse la cible de 85 % sur le test.",
  jalon3_cell4_img2: "En validation, les cinq stratégies se rapprochent aux horizons longs.",
  jalon3_cell6_img2: "Les sites ont un profil solaire proche, mais une clarté matinale différente.",
  jalon3_cell10_img2: "Ces exemples montrent des écarts ; la MAE du test reste au-dessus de la cible.",
  jalon4_cell4_img1: "Le GRU réduit la perte de validation et améliore surtout t+1.",
  jalon4_cell6_img1: "Le GRU obtient le meilleur gain moyen, mais t+1 reste sous 12 %.",
  jalon4_cell8_img1: "Au-delà de 48 h, le temps augmente sans gain moyen supplémentaire.",
  jalon4_cell10_img1: "La sortie directe garde un léger avantage, sur A comme sur B.",
  jalon4_cell14_img1: "Les cibles moyennes A et B sont atteintes ; t+1 A ne l’est pas.",
};
const chartDescriptions: Record<string, string> = {
  'Convergence du MLP de référence': "Les pertes d’entraînement et de validation baissent ensemble.",
  'Ablation des 47 variables': "Chaque barre montre le gain restant après retrait d’un groupe d’entrées.",
  'Compromis multitâche': "Le poids λ ajuste l’équilibre entre couverture et occultation.",
};

function Label({ children }: { children: ReactNode }) { return <span className="label-micro">{children}</span> }
function Heading({ kicker, title, desc }: { kicker: string, title: string, desc?: string }) {
  return <div className="slide-heading"><Label>{kicker}</Label><h2>{title}</h2>{desc && <p>{desc}</p>}</div>;
}
function Card({ children, className = '', noPad = false, ...props }: { children: ReactNode, className?: string, noPad?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return <div className={`glass-card ${noPad ? '!p-0' : ''} ${className}`} {...props}>{children}</div>;
}
function Metric({ value, label, detail, accent = 'blue' }: { value: string, label: string, detail?: string, accent?: 'blue' | 'gold' | 'green' }) { return <Card className="metric-card"><div className={`metric-value ${accent}`}>{value}</div><div className="metric-label">{label}</div>{detail && <div className="metric-sub">{detail}</div>}</Card> }
function Bullets({ items }: { items: ReactNode[] }) { return <ul className="scientific-list">{items.map((x, i) => <li key={i}><span className="bullet-dot" />{x}</li>)}</ul> }
function Chip({ children, accent = false }: { children: ReactNode, accent?: boolean }) { return <span className={`tag-chip ${accent ? 'tag-chip-accent' : ''}`}>{children}</span> }
function Note({ children, warning = false }: { children: ReactNode, warning?: boolean }) { return <div className={`note ${warning ? 'note-warning' : ''}`}>{warning ? <CircleAlert size={17} /> : <ShieldCheck size={17} />}<span>{children}</span></div> }
function Source({ paths }: { paths: string[] }) { return <div className="source-ref"><BookOpen size={13} /><span>Source vérifiable : </span>{paths.map((p, i) => <a key={p} href={`${REPO}/blob/main/${p}`} target="_blank" rel="noreferrer">{p.split('/').pop()}{i < paths.length - 1 ? ', ' : ''}</a>)}</div> }

function ImagePlate({ name, title, desc, wide = false, hero = false, notebook: _notebook = false }: { name: string, title: string, desc?: string, wide?: boolean, hero?: boolean, notebook?: boolean }) {
  const { openZoom } = useZoomModal();
  void _notebook;

  return (
    <Card
      className={`image-plate group cursor-pointer transition-all hover:border-[#67caff]/60 hover:shadow-[0_0_15px_rgba(103,202,255,0.18)] ${wide ? 'wide' : ''} ${hero ? 'hero-plate' : ''}`}
      noPad
      onClick={(e) => {
        e.preventDefault();
        openZoom({ id: name, type: 'image', title, subtitle: desc, imageSrc: fig(name), imageDesc: desc });
      }}
      title="Cliquer pour afficher la figure en grand dans un pop-up"
    >
      <div className="image-plate-thumb relative block overflow-hidden bg-[#eaf0f4] w-full flex-shrink-0" style={{ height: hero ? 'clamp(250px, 39vh, 360px)' : wide ? 'clamp(115px, 17vh, 160px)' : 'clamp(100px, 14.5vh, 140px)' }}>
        <img src={fig(name)} loading="lazy" alt={title} className="w-full h-full object-contain" />
        <div className="absolute inset-0 bg-[#081528]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-[#e4efff] font-medium backdrop-blur-[2px]">
          <Maximize2 size={14} className="text-[#67caff]" />
          <span>Cliquer pour agrandir</span>
        </div>
      </div>
      <div className="image-caption"><span>{title}</span>{desc && <small>{desc}</small>}</div>
      {figureDescriptions[name] && <p className="figure-description">{figureDescriptions[name]}</p>}
    </Card>
  );
}

function ChartCard({ title, subtitle, description, children, className = '' }: { title: string, subtitle?: string, description?: string, children: ReactNode, className?: string }) {
  const { openZoom } = useZoomModal();
  const takeaway = description ?? chartDescriptions[title];

  return (
    <Card
      className={`chart-card group cursor-pointer transition-all hover:border-[#67caff]/60 hover:shadow-[0_0_18px_rgba(103,202,255,0.16)] ${className}`}
      onClick={() => openZoom({ id: title, type: 'chart', title, subtitle, content: children })}
      title="Cliquer pour agrandir le graphique en pop-up"
    >
      <div className="card-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            className="chart-zoom-pill opacity-75 group-hover:opacity-100 transition-all flex items-center gap-1 text-[10.5px] font-medium text-[#67caff] bg-[#122846]/90 px-2 py-0.5 rounded border border-[#67caff]/40 hover:bg-[#67caff]/20"
            onClick={(e) => {
              e.stopPropagation();
              openZoom({ id: title, type: 'chart', title, subtitle, content: children });
            }}
            title="Cliquer pour agrandir le graphique en pop-up"
          >
            <Maximize2 size={11} />
            <span>Agrandir</span>
          </button>
          <BarChart3 size={17} className="text-[#7191b6]" />
        </div>
      </div>
      <div className="chart-body">{children}</div>
      {takeaway && <p className="chart-description">{takeaway}</p>}
    </Card>
  );
}
function ChartTip({ active, payload, label }: { active?: boolean, payload?: { name?: string, value?: number, color?: string }[], label?: string | number }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><strong>{label}</strong>{payload.filter(p => typeof p.value === 'number').map((p, i) => <div key={i}><span style={{ background: p.color }} />{p.name}: <b>{nf(p.value!, 4)}</b></div>)}</div>;
}
function Table({ headers, rows, emphasis = [] }: { headers: string[], rows: (string | number | ReactNode)[][], emphasis?: number[] }) { return <div className="table-wrap"><table className="data-table"><thead><tr>{headers.map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i} className={emphasis.includes(i) ? 'row-focus' : ''}>{row.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody></table></div> }
function PanelTitle({ icon, title, subtitle }: { icon: ReactNode, title: string, subtitle?: string }) { return <div className="panel-title"><span className="panel-icon">{icon}</span><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div></div> }
function FlowStep({ number, title, description }: { number: string, title: string, description: string }) { return <div className="flow-step"><span>{number}</span><strong>{title}</strong><small>{description}</small></div> }
function Network({ type }: { type: 'mlp' | 'cnn' | 'ae' | 'gru' }) {
  const series = type === 'mlp' ? [['Entrée', '47 variables'], ['Dense', '64 · ReLU'], ['Dense', '32 · ReLU'], ['Sortie', '6 horizons']] : type === 'cnn' ? [['Image', '32 × 32 × 1'], ['Conv2D', '16 → 32 → 64'], ['Pooling', 'GAP + GMP'], ['Dense', '2 sorties']] : type === 'ae' ? [['Thermique', '24 × 40'], ['Encodeur', '16 → 32 filtres'], ['Latent', '32 dims'], ['Décodeur', 'Image reconstruite']] : [['Historique', '48 h × 6'], ['GRU', '32 unités'], ['Fusion', 'Météo 6 × 5'], ['Sortie', '6 horizons']];
  const visualInput = type === 'cnn'
    ? { src: fig('jalon2_ciel_input_thumbnail'), alt: 'Image réelle de la caméra du ciel' }
    : type === 'ae'
      ? { src: fig('jalon2_thermique_input_thumbnail'), alt: 'Thermographie réelle avec point chaud' }
      : null;
  return <div className="network">
    {series.map(([a, b], i) => {
      const showVisualInput = i === 0 && visualInput;
      return <div className="network-node" key={a}><div className={`node-core node-${i} ${showVisualInput ? 'node-core-visual' : ''}`}>{showVisualInput ? <img src={visualInput.src} alt={visualInput.alt} /> : <span>{i === 0 ? 'IN' : i === series.length - 1 ? 'OUT' : i === 2 ? '02' : '01'}</span>}</div><strong>{a}</strong><small>{b}</small>{i < series.length - 1 && <ArrowRight className="network-arrow" size={19} />}</div>;
    })}
  </div>;
}
function LearningChart({ data }: { data: { epoch: number, loss: number, val_loss: number }[] }) { return <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}><CartesianGrid stroke="#233a55" strokeDasharray="3 6" /><XAxis dataKey="epoch" stroke="#7d96b3" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#adc6e2' }} /><YAxis stroke="#7d96b3" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#adc6e2' }} tickFormatter={v => Number(v).toFixed(v < .01 ? 3 : 2)} /><Tooltip content={<ChartTip />} /><Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 6, color: '#e5f2ff' }} /><Line name="Loss" type="monotone" dataKey="loss" stroke={C.cyan} dot={false} strokeWidth={3.1} /><Line name="Validation loss" type="monotone" dataKey="val_loss" stroke={C.gold} dot={false} strokeWidth={2.9} /></LineChart></ResponsiveContainer> }
function OccultationDiagram() {
  return (
    <svg viewBox="0 0 440 150" className="w-full h-full" role="img" aria-label="Images du ciel à t−1 et t, CNN paire, occultation prédite à t+1 : MAE test 0,0675, cible 0,10">
      <rect x="12" y="15" width="98" height="46" rx="8" fill="#d6e9f7" stroke="#83b9dc" />
      <text x="61" y="34" textAnchor="middle" fontSize="12" fontWeight="700" fill="#183a5b">Images du ciel</text>
      <text x="61" y="51" textAnchor="middle" fontSize="13" fill="#183a5b">t−1 et t</text>
      <path d="M115 38h25m-7-6 7 6-7 6" fill="none" stroke="#66839d" strokeWidth="2" />
      <rect x="147" y="15" width="100" height="46" rx="8" fill="#d4e7fc" stroke="#81ade8" />
      <text x="197" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="#174484">CNN paire</text>
      <text x="197" y="51" textAnchor="middle" fontSize="11" fill="#174484">prévision</text>
      <path d="M252 38h25m-7-6 7 6-7 6" fill="none" stroke="#66839d" strokeWidth="2" />
      <rect x="284" y="15" width="144" height="46" rx="8" fill="#d6f2e7" stroke="#72c8a3" />
      <text x="356" y="34" textAnchor="middle" fontSize="12" fontWeight="700" fill="#126242">Occultation</text>
      <text x="356" y="51" textAnchor="middle" fontSize="13" fill="#126242">prédite à t+1</text>
      <text x="20" y="84" fontSize="12" fontWeight="700" fill="#183a5b">MAE test : 0,0675</text>
      <text x="420" y="84" textAnchor="end" fontSize="12" fontWeight="700" fill="#183a5b">Cible : ≤ 0,10</text>
      <rect x="20" y="95" width="400" height="13" rx="6.5" fill="#ccdce8" />
      <rect x="20" y="95" width="270" height="13" rx="6.5" fill="#249d72" />
      <path d="M290 91v21" stroke="#126242" strokeWidth="2" />
      <path d="M420 90v23" stroke="#e59a28" strokeWidth="2" />
      <text x="20" y="130" fontSize="11" fill="#43617a">0</text>
      <text x="290" y="130" textAnchor="middle" fontSize="11" fill="#126242">0,0675</text>
      <text x="420" y="130" textAnchor="end" fontSize="11" fill="#86560c">0,10</text>
    </svg>
  );
}
function Content({ page }: { page: number }) {
  const { openZoom } = useZoomModal();
  switch (page) {
    case 0: return <div className="cover-slide">
      <div className="cover-copy"><div className="overline"><span className="tiny-sun" /> MASTER SDIA · ÉTUDE DE CAS 04</div><h1>Prévoir l'énergie.<br /><span>Comprendre le ciel.</span></h1><p className="cover-lead">Prévision multi-horizons, perception visuelle et transfert d'apprentissage pour une centrale solaire intelligente.</p><div className="cover-pills"><Chip accent>Drâa Solaire</Chip><Chip>Groupe 14</Chip><Chip>Étude scientifique</Chip><Chip>2026 / 2027</Chip></div><div className="cover-line" /><div className="cover-foot"><div><small>CAS D'ÉTUDE</small><strong>Drâa Solaire · Site A</strong></div><div><small>PARCOURS</small><strong>Master SDIA</strong></div><div><small>DOMAINE</small><strong>IA avancée</strong></div></div><div className="cover-team"><div className="cover-team-row"><span className="cover-team-label">RÉALISÉ PAR · GROUPE 14</span><div className="cover-team-members"><div className="cover-team-member">Oussama <strong>FELOUACH</strong></div><div className="cover-team-member">Ayoub <strong>EL HOUANI</strong></div><div className="cover-team-member">Mbarek <strong>ETTALEBY</strong></div></div></div><div className="cover-prof"><span>ENCADRÉ PAR :</span><strong>Pr. Soufiane HAMIDA</strong></div></div></div>
      <div className="cover-art" aria-label="Illustration des panneaux photovoltaïques et du rayonnement"><div className="art-sun"><Sun size={50} strokeWidth={1.3} /></div><div className="art-halo halo1" /><div className="art-halo halo2" /><div className="panel-plane"><div className="panel-grid" /></div><div className="art-glow" /><div className="art-float"><span><Activity size={15} /> CAPACITÉ INSTALLÉE</span><strong>50 <em>MW</em></strong><small>Site A · centrale de référence</small></div><div className="orbit-tag orbit-one">01 <span>Prévision</span></div><div className="orbit-tag orbit-two">02 <span>Inspection</span></div></div>
    </div>;
    case 1: return <><Heading kicker="01 / CONTEXTE & ENJEUX" title="Pourquoi anticiper la production solaire ?" desc="Une production dépendante de la météo, de la dynamique du ciel et de l'état physique des modules." /><div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0"><Card><PanelTitle icon={<CloudSun size={20} />} title="Variabilité météorologique" subtitle="Le rayonnement n'est pas constant" /><p className="body-text">Nuages, température et position solaire modifient la puissance disponible d'une heure à l'autre.</p><div className="mini-art mini-cloud"><CloudSun size={42} /><span>GHI · nébulosité</span></div></Card><Card><PanelTitle icon={<ThermometerSun size={20} />} title="Défauts matériels" subtitle="Détection préventive" /><p className="body-text">Les points chauds, fissures et défauts électriques altèrent la performance des panneaux.</p><div className="mini-art mini-thermal"><ScanSearch size={42} /><span>Thermographie · résidus</span></div></Card><Card><PanelTitle icon={<Wind size={20} />} title="Transfert entre sites" subtitle="Données locales limitées" /><p className="body-text">Le site B (20 MW) présente un climat différent et seulement deux mois d'historique pour l'adaptation.</p><div className="mini-art mini-map"><TrendingUp size={42} /><span>Site A → Site B</span></div></Card></div><div className="key-quote"><span>QUESTION DE RECHERCHE</span><p>Comment améliorer la prévision à 1–6 heures, diagnostiquer les anomalies visuelles et généraliser à un nouveau site sans perdre en fiabilité ?</p></div></>;
    case 2: return <><Heading kicker="01 / FORMULATION DU PROBLÈME" title="Des données vers une décision opérationnelle" desc="Quatre blocs fonctionnels, avec entrées et sorties explicitement définies." /><div className="grid lg:grid-cols-2 gap-3 flex-1 min-h-0"><Card><PanelTitle icon={<Database size={20} />} title="Entrées" subtitle="Sources physiques et numériques" /><Bullets items={[<>Série horaire : production, GHI, température, météo et entretien.</>, <>Images du ciel <b>32 × 32 × 1</b> pour la couverture et l'occultation.</>, <>Thermographies <b>24 × 40 × 1</b> pour la détection de défauts.</>, <>Deux sites : A <b>50 MW</b>, B <b>20 MW</b>.</>]} /></Card><Card><PanelTitle icon={<Target size={20} />} title="Sorties" subtitle="Prédictions quantitatives" /><Bullets items={[<>Courbe de production à <b>t+1 ... t+6 h</b>.</>, <>Couverture nuageuse et occultation solaire <b>[0, 1]</b>.</>, <>Score d'anomalie thermique et décision d'alerte.</>, <>Stratégie de déploiement transférable au site B.</>]} /></Card></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-1"><Metric value="6 h" label="Horizon de prévision" /><Metric value="≥ 30 %" label="Cible gain moyen A" /><Metric value="≥ 27 %" label="Cible gain moyen B" /><Metric value="≤ 5 Mo" label="Taille modèle" /></div><Source paths={[slideSource[0], slideSource[2], slideSource[3]]} /></>;
    case 3: return <><Heading kicker="02 / PLAN DE RECHERCHE" title="Quatre jalons. Un système cohérent." desc="La prévision tabulaire constitue la base, enrichie par la vision, puis transférée et confrontée aux modèles séquentiels." /><div className="milestone-grid"><Card className="milestone-card"><div className="milestone-num">01 <Zap size={20} /></div><h3>Prévision MLP</h3><p>Construire la référence multi-horizons à partir des historiques et des prévisions météo.</p><Chip>47 → 64 → 32 → 6</Chip></Card><Card className="milestone-card"><div className="milestone-num">02 <Eye size={20} /></div><h3>Vision et diagnostic</h3><p>CNN ciel, enrichissement multimodal et auto-encodeur thermique sur panneaux.</p><Chip>Images & anomalies</Chip></Card><Card className="milestone-card"><div className="milestone-num">03 <Layers3 size={20} /></div><h3>Adaptation au site B</h3><p>Comparer zero-shot, fine-tuning, couches gelées et apprentissage multitâche.</p><Chip>Domain shift</Chip></Card><Card className="milestone-card"><div className="milestone-num">04 <BrainCircuit size={20} /></div><h3>Modèles séquentiels</h3><p>Comparer SimpleRNN, LSTM, GRU et Seq2Seq ; sélectionner une architecture de déploiement.</p><Chip>Historique 6–168 h</Chip></Card></div><Note>Le jalon 4 du dépôt est une expérimentation RNN/LSTM/GRU, et pas uniquement une étape de présentation. Le site respecte le contenu scientifique réellement disponible.</Note></>;
    case 4: return <><Heading kicker="02 / MÉTHODOLOGIE GLOBALE" title="Du signal brut à la décision" desc="Pipeline conceptuel intégrant les quatre jalons et les différents types de données." /><Card className="pipeline-card"><div className="pipeline-flow"><FlowStep number="01" title="Acquisition" description="Site A/B · météo, séries et images" /><ChevronRight className="pipe-arrow" size={22} /><FlowStep number="02" title="Prétraitement" description="Normalisation · fenêtres · splits" /><ChevronRight className="pipe-arrow" size={22} /><FlowStep number="03" title="Modélisation" description="MLP · CNN · AE · RNN/GRU" /><ChevronRight className="pipe-arrow" size={22} /><FlowStep number="04" title="Évaluation" description="RMSE · gain · MAE · ROC-AUC" /><ChevronRight className="pipe-arrow" size={22} /><FlowStep number="05" title="Décision" description="Transfert · diagnostic · déploiement" /></div></Card><div className="grid md:grid-cols-3 gap-3 flex-1 min-h-0 mt-1"><Card><Label>PRÉVISION</Label><h3 className="text-base mt-1.5 font-semibold text-[#f0f6ff]">Série → puissance</h3><p className="body-text">Le MLP fixe une base ; les GRU exploitent l'ordre temporel pour mieux capturer la dynamique.</p></Card><Card><Label>PERCEPTION</Label><h3 className="text-base mt-1.5 font-semibold text-[#f0f6ff]">Image → information</h3><p className="body-text">Le CNN évalue l'état du ciel. L'auto-encodeur quantifie les anomalies de reconstruction.</p></Card><Card><Label>GÉNÉRALISATION</Label><h3 className="text-base mt-1.5 font-semibold text-[#f0f6ff]">Site A → Site B</h3><p className="body-text">Le modèle pré-entraîné est comparé aux approches de réentraînement et d'ajustement.</p></Card></div><div className="formula small">Gain = 1 − <span>RMSE<sub>modèle</sub></span> / <span>RMSE<sub>persistance intelligente</sub></span> <small>· évalué sur les heures de jour</small></div></>;
    case 5: return <><Heading kicker="03 / MATÉRIEL ET MÉTHODES · JALON 01" title="MLP : une référence tabulaire explicable" desc="Prévision directe de six horizons avec 47 variables conçues pour capturer la dynamique physique et calendaire." /><Card className="architecture-card"><div className="inline-card-heading"><span>ARCHITECTURE DU RÉSEAU</span><Chip accent>5 350 paramètres</Chip></div><Network type="mlp" /></Card><div className="grid md:grid-cols-2 gap-3 flex-1 min-h-0 mt-1"><Card><h3 className="small-title">Protocole d'entraînement</h3><Table headers={['Paramètre', 'Valeur']} rows={[["Données A", "26 304 h (26 275 fenêtres)"], ["Train / Val / Test", "15 313 / 2 208 / 8 754"], ["Split temporel", "jusqu'à sept. 2024 / fin 2024 / 2025"], ["Optimiseur", "Adam, η = 10⁻³ · époques 30 / 128"], ["Loss", "MSE · sorties sigmoid"]]} /></Card><Card><h3 className="small-title">Construction du vecteur d'entrée</h3><div className="segmented-vars"><div style={{ flex: 24 }}>24 <span>Production historique</span></div><div style={{ flex: 18 }}>18 <span>Météo future</span></div><div style={{ flex: 4 }}>4 <span>Temps</span></div><div style={{ flex: 1 }}>1</div></div><Bullets items={[<>24 heures de production normalisée par 50 MW.</>, <>6 × 3 : ciel clair, nébulosité et température prévues.</>, <>Sinus et cosinus de l'heure et du jour dans l'année.</>, <>Jours depuis nettoyage, normalisés.</>]} /></Card></div><Source paths={[slideSource[0]]} /></>;
    case 6: return <><Heading kicker="03 / MATÉRIEL ET MÉTHODES · JALON 02" title="Deux modèles de vision complémentaires" desc="Images du ciel pour anticiper ; thermographies pour surveiller l'état du matériel." /><div className="grid lg:grid-cols-2 gap-3 flex-1 min-h-0"><Card className="architecture-card"><div className="inline-card-heading"><span>CNN DU CIEL · 27 490 PARAMÈTRES</span><Chip>32 × 32 px</Chip></div><Network type="cnn" /><div className="divider-soft" /><p className="body-text">Convolutions 3×3 (16, 32, 64 filtres), <b>GAP + GMP</b>, Dense(32), deux sorties sigmoïdes. Champ réceptif : <b>18 × 18</b> avant pooling global.</p><div className="mini-data">12 394 images : 7 346 train · 920 validation · 4 128 test</div></Card><Card className="architecture-card"><div className="inline-card-heading"><span>AUTO-ENCODEUR THERMIQUE · GOULOT 32</span><Chip>24 × 40 px</Chip></div><Network type="ae" /><div className="divider-soft" /><p className="body-text">Apprentissage sur images saines, scores <b>MSE / erreur max</b>, seuil <b>seuil_5FA</b> au 95e percentile de la validation saine.</p><div className="mini-data">3 000 sains train · 500 sains val · 1 500 test</div></Card></div><div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-1"><Metric value="42" label="Graine reproductible" /><Metric value="15" label="Époques CNN & AE" /><Metric value="5 %" label="Fausses alertes visées" /></div><Source paths={[slideSource[1]]} /></>;
    case 7: return <><Heading kicker="03 / MATÉRIEL ET MÉTHODES · JALON 03" title="Transfert de domaine et apprentissage multitâche" desc="Un site à 20 MW, deux mois d'observations, et un changement de distribution climatique." /><div className="grid lg:grid-cols-2 gap-3 flex-1 min-h-0"><Card><PanelTitle icon={<ArrowRight size={19} />} title="Transfert Site A → Site B" subtitle="MLP de référence pré-entraîné" /><div className="transfer"><div><b>Site A</b><small>50 MW · 2023–2025</small></div><ArrowRight size={24} /><div><b>Site B</b><small>20 MW · Jan.–Juin 2025</small></div></div><Bullets items={[<>Cinq stratégies : zero-shot, scratch, fine-tuning complet et deux niveaux de gel.</>, <>Normalisation de la puissance par la capacité de chaque site.</>, <>Optimiseur Adam <b>10⁻⁴</b> pour le fine-tuning ; 30 époques, batch 64.</>]} /></Card><Card><PanelTitle icon={<Layers3 size={19} />} title="CNN multitâche" subtitle="Tronc partagé + deux têtes" /><div className="multi-branch"><div className="multi-input-visual"><img src={fig('jalon2_ciel_input_thumbnail')} alt="Image réelle de la caméra du ciel" /><span>Caméra du ciel<small>32 × 32 × 1</small></span></div><ArrowDownRight size={18} /><div>Conv + Dense partagées</div><div className="branch-row"><div>Couverture</div><div>Occultation</div></div></div><p className="formula small">L = L<sub>couverture</sub> + λ · L<sub>occultation</sub></p><p className="body-text">Étude de λ ∈ {'{'}0 ; 0,3 ; 1 ; 3{'}'} pour le compromis entre tâches.</p></Card></div><div className="grid grid-cols-3 gap-2.5 mt-1"><Metric value="47" label="Entrées du MLP" /><Metric value="5 350" label="Paramètres totaux" /><Metric value="198" label="Si 2 couches gelées" /></div><Source paths={[slideSource[2]]} /></>;
    case 8: return <><Heading kicker="03 / MATÉRIEL ET MÉTHODES · JALON 04" title="La production comme une séquence" desc="Contrairement au MLP tabulaire, les réseaux récurrents intègrent l'évolution temporelle des mesures." /><Card className="architecture-card"><div className="inline-card-heading"><span>MODÈLE GRU DIRECT · ARCHITECTURE RETENUE</span><Chip accent>6 054 paramètres</Chip></div><Network type="gru" /></Card><div className="grid lg:grid-cols-3 gap-3 flex-1 min-h-0 mt-1"><Card><PanelTitle icon={<Activity size={18} />} title="Tenseurs" /><Bullets items={['Historique : (N, 48, 6)', 'Météo future : (N, 6, 5)', 'Cible : (N, 6)', 'Normalisation par capacité']} /></Card><Card><PanelTitle icon={<BrainCircuit size={18} />} title="Entraînement" /><Bullets items={['Adam, taux initial 10⁻³', 'MSE, sorties sigmoid', '25 époques, batch 128', 'Budget ~6k paramètres']} /></Card><Card><PanelTitle icon={<Gauge size={18} />} title="Choix étudiés" /><Bullets items={['SimpleRNN(54) · LSTM(28)', 'GRU(32) direct', 'Fenêtres : 6, 24, 48, 168 h', 'Seq2Seq encodeur-décodeur']} /></Card></div><Source paths={[slideSource[3]]} /></>;
    case 9: return <><Heading kicker="04 / EXPÉRIENCES · JALON 01" title="Le MLP franchit la cible moyenne" desc="Les deux figures blanches sont les PNG exacts des cellules 11 et 16 du notebook exécuté ; la convergence est retracée depuis son journal d'entraînement." /><div className="grid lg:grid-cols-3 gap-3 flex-1 min-h-0"><ChartCard title="Convergence du MLP de référence" subtitle="Loss et validation loss · 30 époques · logs du notebook"><LearningChart data={j1Learning} /></ChartCard><ImagePlate name="jalon1_prevoir_production_mlp_cell11_img0" title="Erreur t+1 selon l’heure" desc="Cellule 11 · validation Site A" wide notebook /><ImagePlate name="jalon1_prevoir_production_mlp_cell16_img1" title="Erreur t+1 par mois" desc="Cellule 16 · test caché 2025" wide notebook /></div><div className="grid grid-cols-3 gap-2.5 mt-1"><Metric value="48,2 %" label="Gain moyen · validation" accent="green" /><Metric value="14,4 %" label="Gain t+1 · validation" /><Metric value="50,9 %" label="Gain moyen · test 2025" /></div><Note warning>Le gain t+1 en test J1 est de 10,2 %, inférieur à la cible de 12 %, malgré l'atteinte de la cible moyenne.</Note><Source paths={[slideSource[0]]} /></>;
    case 10: return <><Heading kicker="04 / EXPÉRIENCES · JALON 01" title="Quelles variables expliquent la prévision ?" desc="L'ablation supprime un groupe d'entrées à la fois, puis mesure la baisse du gain moyen en validation. Ici, le notebook publie un tableau texte : les graphiques le visualisent sans modifier les valeurs." /><div className="grid lg:grid-cols-[1.2fr_1fr_1fr] gap-3 flex-1 min-h-0"><ChartCard title="Ablation des 47 variables" subtitle="Gain moyen en %, validation A · sortie cellule 14"><ResponsiveContainer width="100%" height="100%"><BarChart data={ablations} layout="vertical" margin={{ top: 4, right: 10, left: 12, bottom: 2 }}><CartesianGrid stroke="#253955" strokeDasharray="3 6" horizontal={false} /><XAxis type="number" domain={[0, 55]} stroke="#879db7" tickLine={false} tick={{ fontSize: 10 }} /><YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#bed0e5' }} axisLine={false} tickLine={false} interval={0} /><Tooltip content={<ChartTip />} /><Bar dataKey="gain" name="Gain moyen (%)" radius={[0, 4, 4, 0]} barSize={17}>{ablations.map((_, i) => <Cell key={i} fill={i === 6 ? C.gold : i === 5 ? C.cyan : C.blue} />)}</Bar></BarChart></ResponsiveContainer></ChartCard><Card className="!flex !flex-col"><h3 className="small-title">Interprétation</h3><div className="insight-big"><span>−15,6 pts</span><p>perte imprimée par le notebook ; les gains affichés sont arrondis (48,2 % → 32,5 %).</p></div><div className="divider-soft" /><Bullets items={[<>La <b>nébulosité</b> est la variable la plus déterminante.</>, <>Sans historique, le gain tombe à <b>38,9 %</b>.</>, <>Nettoyage et calendrier ont un effet relatif plus faible.</>]} /></Card><div className="flex flex-col gap-2 min-h-0"><ImagePlate name="jalon1_ablation_study" title="Visualisation du tableau d’ablation" desc="Dérivée de la sortie exécutée · cellule 14" /><ImagePlate name="jalon1_gains_horizons" title="Visualisation des gains par horizon" desc="Dérivée de la sortie exécutée · cellule 10" /></div></div><Source paths={[slideSource[0]]} /></>;
    case 11: return <>
      <Heading kicker="04 / EXPÉRIENCES · JALON 02" title="CNN ciel : observer et anticiper l'occultation" desc="Objectif : extraire l'information des images du ciel pour améliorer la prévision et anticiper l'occultation à t+1." />
      <div className="grid lg:grid-cols-3 gap-3 flex-1 min-h-0">
        <ChartCard title="Apprentissage du CNN ciel" subtitle="MSE train & val · 15 époques · sortie exécutée" description="Les erreurs diminuent et restent proches : l'apprentissage se stabilise."><LearningChart data={j2SkyLearning} /></ChartCard>
        <ChartCard title="Impact sur chaque horizon" subtitle="Gain (%) · validation et test final retenu" description="Le gain augmente avec l'horizon ; validation et test sont distingués."><ResponsiveContainer width="100%" height="100%"><LineChart data={j2Forecast} margin={{ top: 6, right: 10, bottom: 0, left: -15 }}><CartesianGrid stroke="#233a55" strokeDasharray="3 6" /><XAxis dataKey="h" stroke="#7d96b3" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} /><YAxis stroke="#7d96b3" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} /><Tooltip content={<ChartTip />} /><Legend wrapperStyle={{ fontSize: 10 }} /><Line dataKey="base" name="MLP seul · val (%)" type="monotone" stroke={C.gold} strokeWidth={2.2} /><Line dataKey="vision" name="MLP + CNN · val (%)" type="monotone" stroke={C.cyan} strokeWidth={2.4} /><Line dataKey="test" name="Retenu · test (%)" type="monotone" stroke={C.green} strokeWidth={2.5} /></LineChart></ResponsiveContainer></ChartCard>
        <div className="flex flex-col gap-3 min-h-0">
          <Card className="!flex !flex-col !p-3">
            <h3 className="small-title">1 · Cibles de prévision · test final</h3>
            <Table headers={['Condition', 'Résultat', 'Cible', 'Statut']} rows={[
              ["Gain Site A · t+1", "16,80 %", "≥ 12 %", <span className="status-good">Atteinte</span>],
              ["MAE occultation · t+1", "0,0675", "≤ 0,10", <span className="status-good">Atteinte</span>]
            ]} emphasis={[0, 1]} />
          </Card>
          <Card className="!flex !flex-col !p-3">
            <h3 className="small-title">2 · CNN vs règle simple · test</h3>
            <Table headers={['MAE', 'Règle', 'CNN']} rows={[
              ['Couverture', nf(j2Cloud[0].couvertureTest, 4), nf(j2Cloud[1].couvertureTest, 4)],
              ['Occultation', nf(j2Cloud[0].occTest, 4), nf(j2Cloud[1].occTest, 4)]
            ]} />
            <p className="j2-context-note">Estimation sur l'image courante, distincte de la prévision à t+1.</p>
          </Card>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-2 mt-1">
        <ImagePlate name="jalon2_cnn_vs_regles_notebook" title="CNN ciel vs règles simples" desc="MAE de l'image courante · test final" wide notebook />
        <ImagePlate name="jalon2_camera_examples_notebook" title="Exemples caméra : valeurs vraies et prédictions CNN" desc="Quatre images du jeu de test" wide notebook />
        <Card
          className="image-plate wide group cursor-pointer transition-all hover:border-[#67caff]/60 hover:shadow-[0_0_15px_rgba(103,202,255,0.18)]"
          noPad
          role="button"
          tabIndex={0}
          title="Cliquer pour agrandir le graphique"
          onClick={() => openZoom({
            id: 'occultation-t1', type: 'chart', title: "Prévision d'occultation à t+1",
            subtitle: 'Deux images prédisent l’occultation à t+1 : MAE test 0,0675, sous la cible de 0,10.',
            content: <div className="w-full h-full rounded-xl bg-[#eaf0f4]"><OccultationDiagram /></div>
          })}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.click();
            }
          }}
        >
          <div className="relative w-full bg-[#eaf0f4]" style={{ height: 'clamp(115px, 17vh, 160px)' }}>
            <OccultationDiagram />
            <div className="absolute inset-0 bg-[#081528]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-[#e4efff] font-medium backdrop-blur-[2px]"><Maximize2 size={14} className="text-[#67caff]" /><span>Cliquer pour agrandir</span></div>
          </div>
          <div className="image-caption"><span>Prévision d'occultation à t+1</span><small>Deux images prédisent t+1 : MAE test 0,0675, sous la cible de 0,10.</small></div>
        </Card>
      </div>
      <Source paths={[slideSource[1], 'experiments/journal_experiences_jalon2.csv', 'docs/decisions/PAGE_DE_DECISIONS_JALON2.md']} />
    </>;
    case 12: return <>
      <Heading kicker="04 / EXPÉRIENCES · JALON 02" title="Auto-encodeur : détecter les défauts thermiques" desc="Objectif : repérer les anomalies des panneaux à partir de l'erreur de reconstruction des images thermiques." />
      <div className="j2-thermal-layout">
        <Card className="j2-thermal-card">
          <h3 className="small-title">1 · Principe et sélection</h3>
          <div className="j2-ae-flow" aria-label="Image thermique, encodeur, goulot de 32 dimensions, décodeur, image reconstruite">
            <span>Image<br />thermique</span><ArrowRight size={14} /><span>Encodeur</span><ArrowRight size={14} /><span className="j2-ae-bottleneck">Goulot<br />32 dim</span><ArrowRight size={14} /><span>Décodeur</span><ArrowRight size={14} /><span>Image<br />reconstruite</span>
          </div>
          <p className="j2-thermal-copy">Entraîné sur des images saines, le modèle les reconstruit. Une erreur de reconstruction élevée peut signaler un défaut.</p>
          <h3 className="small-title j2-section-title">Choix du goulot · validation proxy</h3>
          <Table headers={['Goulot', 'AUC proxy MSE / max', 'Seuil max']} rows={j2Thermal.map(x => [`${x.latent} dim`, `${nf(x.mseAuc, 1)} / ${nf(x.maxAuc, 1)}`, nf(x.maxSeuil, 4)])} emphasis={[1]} />
          <div className="j2-thermal-copy"><b>Pourquoi 32 ?</b>
            <ul className="j2-choice-reasons">
              <li>Même AUC proxy pour les trois goulots : <b>1,0</b>.</li>
              <li>32 offre le meilleur compromis entre compression et reconstruction.</li>
              <li>Compression <b>60×</b> ; seuil sain fixé à <b>0,2442</b>.</li>
            </ul>
          </div>
        </Card>
        <Card className="j2-thermal-card">
          <h3 className="small-title">2 · Résultats et cibles · test final</h3>
          <div className="grid grid-cols-2 gap-2 mb-2"><Metric value="0,9859" label="AUC thermique" accent="green" /><Metric value="88,0 %" label="Fissures détectées" accent="green" /></div>
          <Table headers={['Condition', 'Résultat', 'Cible', 'Statut']} rows={[
            ["AUC thermique", "0,9859", "≥ 0,98", <span className="status-good">Atteinte</span>],
            ["Cellules fissurées", "88,0 % · FA 4,92 %", "≥ 85 % · FA ≤ 5 %", <span className="status-good">Atteinte</span>]
          ]} emphasis={[0, 1]} />
          <p className="j2-thermal-copy">Fausses alertes observées : <b>4,92 %</b> sur le test. AUC de la référence max − médiane : <b>0,9739</b>.</p>
        </Card>
        <div className="j2-thermal-figure">
          <ImagePlate name="jalon2_detection_thermique_notebook" title="3 · Détection par type de défaut" desc="Taux de détection par type · test final" hero notebook />
        </div>
      </div>
      <Source paths={[slideSource[1], 'docs/decisions/PAGE_DE_DECISIONS_JALON2.md']} />
    </>;
    case 13: return <><Heading kicker="04 / EXPÉRIENCES · JALON 03" title="Sur le site B, le zero-shot généralise mieux au test" desc="La validation de mars et le décalage climatique A/B sont montrés avec les sorties exactes des cellules 4 et 6." /><div className="grid lg:grid-cols-[1.15fr_1fr_1fr] gap-3 flex-1 min-h-0"><ImagePlate name="jalon3_cell4_img2" title="Gain par horizon · validation B" desc="Cellule 4 · cinq stratégies de transfert" wide notebook /><Card className="!flex !flex-col"><h3 className="small-title">Test final · avril–juin 2025</h3><Table headers={['Stratégie', 'Gain moyen', 'Décision']} rows={j3Test.map(x => [x.model, pct(x.gain), x.gain >= .27 ? <span className="status-good">Atteinte</span> : <span className="status-bad">Non atteinte</span>])} emphasis={[0]} /><div className="mt-2.5"><Metric value="40,3 %" label="Zero-shot, gain moyen test" accent="green" /></div><p className="explain-text">Le fine-tuning atteint 43,4 % en validation mais 38,4 % en test. Le zero-shot conserve une meilleure généralisation.</p></Card><ImagePlate name="jalon3_cell6_img2" title="Décalage climatique A / B" desc="Cellule 6 · profil journalier et clarté matinale" wide notebook /></div><Source paths={[slideSource[2], 'experiments/journal_experiences_jalon3.csv']} /></>;
    case 14: return <><Heading kicker="04 / EXPÉRIENCES · JALON 03" title="Deux tâches, une représentation partagée" desc="Le compromis λ vient du tableau exécuté de la cellule 8 ; l'adaptation caméra est illustrée par la sortie exacte de la cellule 10." /><div className="grid lg:grid-cols-[1.1fr_1fr_1fr] gap-3 flex-1 min-h-0"><ChartCard title="Compromis multitâche" subtitle="Erreur MAE · validation Site A · cellule 8"><ResponsiveContainer width="100%" height="100%"><LineChart data={j3Multi} margin={{ top: 6, right: 10, bottom: 2, left: -15 }}><CartesianGrid stroke="#233b53" strokeDasharray="3 6" /><XAxis dataKey="lambda" stroke="#92a3bd" tickLine={false} tick={{ fontSize: 10 }} /><YAxis stroke="#92a3bd" tickLine={false} tick={{ fontSize: 10 }} /><Tooltip content={<ChartTip />} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line name="Couverture MAE" dataKey="cloud" stroke={C.cyan} strokeWidth={2.7} /><Line name="Occultation MAE" dataKey="occ" stroke={C.gold} strokeWidth={2.7} /></LineChart></ResponsiveContainer></ChartCard><Card className="!flex !flex-col"><h3 className="small-title">Adaptation de la caméra B</h3><Table headers={['Mesure', 'Zero-shot', 'Fine-tuning']} rows={[["Couverture MAE · val", "0,0562", "0,0380"], ["Occultation MAE · val", "0,1204", "0,0992"], ["Occultation MAE · test", "n/d", "0,1534"]]} /><div className="mt-2"><Note warning>Test B occultation = 0,1534 &gt; cible (0,10).</Note></div><p className="explain-text">λ = 0,3 est le compromis proposé. λ = 1 privilégie l'occultation.</p></Card><ImagePlate name="jalon3_cell10_img2" title="Prédictions sur la caméra B" desc="Cellule 10 · vrai vs prédit après fine-tuning" wide notebook /></div><Source paths={[slideSource[2], 'docs/decisions/PAGE_DE_DECISIONS_JALON3.md']} /></>;
    case 15: return <><Heading kicker="04 / EXPÉRIENCES · JALON 04 · ÉTAPE 1" title="GRU direct vs MLP : l’apport de la séquence" desc="La comparaison de référence isole l’effet de la modélisation temporelle sur la validation du Site A." /><div className="grid lg:grid-cols-[1.1fr_.9fr] gap-3 flex-1 min-h-0"><ImagePlate name="jalon4_cell4_img1" title="MLP de référence vs GRU direct" desc="Convergence MSE et gains par horizon · validation Site A" hero notebook /><Card className="!flex !flex-col justify-between min-h-0"><h3 className="small-title">Résultats validation Site A</h3><Table headers={['Modèle', 'Paramètres', 'Gain t+1', 'Gain moyen']} rows={[[j4Models[0].model, j4Models[0].params.toLocaleString('fr-FR'), nf(j4Models[0].t1, 3), nf(j4Models[0].gain, 3)], [j4Models[3].model, j4Models[3].params.toLocaleString('fr-FR'), nf(j4Models[3].t1, 3), nf(j4Models[3].gain, 3)]]} emphasis={[1]} /><div className="grid grid-cols-2 gap-2 my-2"><Metric value="+0,110" label="Gain t+1 · GRU" accent="green" detail="vs −0,233 pour le MLP" /><Metric value="46,4 %" label="Gain moyen · GRU" accent="green" detail="vs 40,0 % pour le MLP" /></div><Note>Le GRU direct corrige l’effondrement du MLP à l’horizon immédiat en exploitant explicitement l’ordre temporel.</Note></Card></div><Source paths={[slideSource[3], 'experiments/journal_experiences_jalon4.csv']} /></>;
    case 16: return <><Heading kicker="04 / EXPÉRIENCES · JALON 04 · ÉTAPE 2" title="SimpleRNN, LSTM ou GRU à budget comparable ?" desc="Les trois cellules récurrentes sont comparées autour d’une enveloppe commune de 6 000 paramètres." /><div className="grid lg:grid-cols-[1.1fr_.9fr] gap-3 flex-1 min-h-0"><ImagePlate name="jalon4_cell6_img1" title="Comparaison récurrente iso-budget" desc="Réactivité t+1 et gain moyen sur six horizons" hero notebook /><Card className="!flex !flex-col justify-between min-h-0"><h3 className="small-title">Tableau comparatif iso-budget</h3><Table headers={['Architecture', 'Paramètres', 'Gain t+1', 'Gain moyen']} rows={j4Models.slice(1, 4).map(x => [x.model, x.params.toLocaleString('fr-FR'), nf(x.t1, 3), nf(x.gain, 3)])} emphasis={[2]} /><div className="grid grid-cols-2 gap-2 my-2"><Metric value="0,464" label="Gain moyen GRU" accent="green" /><Metric value="6 054" label="Paramètres GRU" /></div><Bullets items={[<>Le <b>SimpleRNN</b> reste le plus léger en calcul.</>, <>Le <b>LSTM</b> améliore légèrement le gain moyen.</>, <>Le <b>GRU direct</b> offre le meilleur compromis sur t+1 et sur six horizons.</>]} /></Card></div><Source paths={[slideSource[3], 'experiments/journal_experiences_jalon4.csv']} /></>;
    case 17: return <><Heading kicker="04 / EXPÉRIENCES · JALON 04 · ÉTAPE 3" title="Impact de la longueur d’historique L" desc="L’étude de 6 à 168 heures quantifie le compromis entre mémoire utile et coût de rétropropagation BPTT." /><div className="grid lg:grid-cols-[1.1fr_.9fr] gap-3 flex-1 min-h-0"><ImagePlate name="jalon4_cell8_img1" title="Historique : gain et coût BPTT" desc="GRU(32) · L = 6, 24, 48 et 168 heures" hero notebook /><Card className="!flex !flex-col justify-between min-h-0"><h3 className="small-title">Compromis gain / temps BPTT</h3><Table headers={['Historique', 'Durée', 'Gain t+1', 'Gain moyen']} rows={j4History.map(x => [x.length, `${nf(x.time, 1)} s`, nf(x.t1, 3), nf(x.gain, 3)])} emphasis={[2]} /><div className="grid grid-cols-2 gap-2 my-2"><Metric value="48 h" label="Historique retenu" detail="Deux cycles jour / nuit" /><Metric value="53,1 s" label="Temps d’entraînement" detail="vs 162,2 s à 168 h" /></div><Note>Passer de 48 à 168 heures triple le coût sans améliorer le gain moyen, qui reste à 0,449.</Note></Card></div><Source paths={[slideSource[3], 'experiments/journal_experiences_jalon4.csv']} /></>;
    case 18: return <><Heading kicker="04 / EXPÉRIENCES · JALON 04 · ÉTAPE 4" title="Sortie directe vs Seq2Seq et transfert Site B" desc="La sortie simultanée à six horizons est confrontée à l’encodeur-décodeur, avant et après adaptation au Site B." /><div className="grid lg:grid-cols-[1.1fr_.9fr] gap-3 flex-1 min-h-0"><ImagePlate name="jalon4_cell10_img1" title="Direct vs encodeur-décodeur" desc="Profils de gains par horizon · Sites A et B" hero notebook /><Card className="!flex !flex-col justify-between min-h-0"><h3 className="small-title">Benchmark Direct vs Seq2Seq · L = 48 h</h3><Table headers={['Site et condition', 'Architecture', 'Gain t+1', 'Gain moyen']} rows={[["Site A · validation", "Direct GRU", "0,086", "0,449"], ["Site A · validation", "Enc-Dec GRU", "0,046", "0,443"], ["Site B · zero-shot", "Direct GRU", "−0,042", "0,423"], ["Site B · zero-shot", "Enc-Dec GRU", "−0,090", "0,400"], ["Site B · fine-tuning", "Direct GRU", "+0,013", "0,443"], ["Site B · fine-tuning", "Enc-Dec GRU", "−0,061", "0,418"]]} emphasis={[0, 4]} /><Note>La sortie directe évite l’accumulation d’erreurs du décodeur et surpasse Seq2Seq dans les trois régimes évalués.</Note></Card></div><Source paths={[slideSource[3], 'experiments/journal_experiences_jalon4.csv']} /></>;
    case 19: return <><Heading kicker="04 / EXPÉRIENCES · JALON 04 · ÉTAPE 5" title="Bilan sur le test caché et cibles contractuelles" desc="Le modèle retenu est vérifié sur les données 2025 non vues, avec les seuils du cahier des charges." /><div className="grid lg:grid-cols-[1.1fr_.9fr] gap-3 flex-1 min-h-0"><ImagePlate name="jalon4_cell14_img1" title="Tableau de bord de conformité" desc="Résultats finaux sur les jeux de test cachés" hero notebook /><Card className="!flex !flex-col justify-between min-h-0"><h3 className="small-title">Conformité du Jalon 4</h3><Table headers={['Exigence', 'Mesure test', 'Cible', 'Statut']} rows={[["Site A · t+1", "Gain = 0,095", "≥ 0,12", <span className="status-bad">Non atteinte</span>], ["Site A · 6 horizons", "Gain moyen = 0,490", "≥ 0,30", <span className="status-good">Atteinte</span>], ["Site B · zero-shot", "Gain moyen = 0,400", "≥ 0,27", <span className="status-good">Atteinte</span>], ["Déploiement", "Taille = 0,106 Mo", "≤ 5 Mo", <span className="status-good">Conforme</span>]]} emphasis={[1, 2, 3]} /><div className="grid grid-cols-2 gap-2 my-2"><Metric value="0,490" label="Gain moyen test A" accent="green" detail="Cible ≥ 0,30" /><Metric value="0,400" label="Gain moyen test B" accent="green" detail="Cible ≥ 0,27" /></div><Note warning>La performance multi-horizons et le transfert sont conformes ; le gain t+1 reste sous la cible de 0,12.</Note></Card></div><Source paths={[slideSource[3], 'docs/decisions/PAGE_DE_DECISIONS_JALON4.md']} /></>;
    case 20: return <><Heading kicker="05 / COMPARAISON ET CONSTATS" title="Ce que démontre chaque jalon" desc="Quatre résultats sur des objectifs différents : les métriques ne sont pas comparables entre tâches sans préciser le protocole." /><div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5"><Metric value="50,9 %" label="J1 · gain moyen test A" accent="green" /><Metric value="0,9859" label="J2 · AUC score erreur max" accent="green" /><Metric value="40,3 %" label="J3 · zero-shot test B" accent="green" /><Metric value="49,0 %" label="J4 · gain moyen test A · 6 h" accent="green" /></div><Card className="flex-1 min-h-0 mt-1"><h3 className="small-title">Tableau de synthèse scientifique</h3><Table headers={['Jalon', 'Tâche principale', 'Méthode retenue / constat', 'Métrique et partition', 'Limitation clé']} rows={[
      ['J1', 'Prévision 6 h A', 'MLP régularisé / référence', 'Gain moyen 50,9 % · test A', 't+1 test 10,2 % < 12 %'],
      ['J2', 'Vision du ciel / thermique', 'CNN Dual Pooling / AE max, goulot 32', 'Occultation MAE 0,0388 ; gain t+1 16,8 % ; AUC 0,9859 · tests', 'Règle plus précise pour la couverture'],
      ['J3', 'Transfert B / multitâche', 'Zero-shot A → B ; fine-tuning CNN', 'Gain 40,3 % · test B ; MAE occ 0,1534 · test B', 'Occultation B sous la cible'],
      ['J4', 'Prévision séquentielle', 'GRU(32) L=48 h direct', 'Gain 49,0 % · test A ; 40,0 % · test B', 't+1 test 9,5 % < 12 %']
    ]} /></Card><Note>Les chiffres sont extraits des sorties de notebooks exécutés. Ils représentent des expériences distinctes sur des protocoles documentés.</Note></>;
    case 21: return <><Heading kicker="05 / DÉCISIONS OPÉRATIONNELLES" title="La performance seule ne suffit pas" desc="Le choix final combine métriques, généralisabilité, complexité et exigences de déploiement." /><div className="grid lg:grid-cols-3 gap-3 flex-1 min-h-0"><Card><div className="decision-icon"><Target size={22} /></div><h3 className="small-title mt-2">Prévision court terme</h3><div className="decision-result">0,095 <span>/ 0,12</span></div><p className="body-text">Gain t+1 GRU sur test A, inférieur à l'objectif ; cible non atteinte.</p><Chip>À améliorer</Chip></Card><Card><div className="decision-icon"><TrendingUp size={22} /></div><h3 className="small-title mt-2">Prévision multi-horizons</h3><div className="decision-result">0,490 <span>/ 0,30</span></div><p className="body-text">Gain moyen sur six heures, test A. Cible dépassée.</p><Chip accent>Atteinte</Chip></Card><Card><div className="decision-icon"><Cpu size={22} /></div><h3 className="small-title mt-2">Faisabilité technique</h3><div className="decision-result">0,106 <span>Mo</span></div><p className="body-text">Modèle GRU sauvegardé ; plafond contractuel de 5 Mo.</p><Chip accent>Conforme</Chip></Card></div><div className="grid lg:grid-cols-2 gap-3 flex-1 min-h-0 mt-1"><Card><h3 className="small-title">Pourquoi retenir le GRU direct ?</h3><Bullets items={[<>Utilise les <b>corrélations temporelles</b> sur plusieurs jours.</>, <>Evite les sorties récursives de l'encodeur-décodeur pour six horizons.</>, <>Reste léger : <b>6 054 paramètres</b> et fichier de <b>0,106 Mo</b>.</>]} /></Card><Card><h3 className="small-title">Pourquoi conserver le zero-shot ?</h3><Bullets items={[<>Fonctionne dès la mise en service sans historique local.</>, <>Site B test : <b>0,403</b> sans réentraînement du MLP A.</>, <>L'ajustement limité à l'hiver peut être moins robuste sur le printemps.</>]} /></Card></div><Source paths={[slideSource[2], slideSource[3]]} /></>;
      case 22: return <><Heading kicker="05 / INTERPRÉTATION CRITIQUE" title="Lire les résultats sans surinterpréter" desc="Une présentation scientifique doit expliciter les partitions, les limites et les désaccords de source." /><div className="grid lg:grid-cols-2 gap-3 flex-1 min-h-0"><Card><PanelTitle icon={<CheckCircle2 size={19} />} title="Résultats établis & vérifiés" /><Bullets items={[<>Jalon 2 : <b>gain t+1 16,80 %</b>, MAE occultation <b>0,0388</b> et AUC thermique <b>0,9859</b>.</>, <>Détection des fissures : <b>88 %</b> au seuil fixé pour 5 % de fausses alertes sur validation.</>, <>Généralisation zero-shot : <b>gain 40,3 %</b> sur le test Site B.</>, <>Modélisation séquentielle : <b>gain moyen 49,0 % sur six horizons</b> avec GRU 48 h (test A).</>]} /></Card><Card><PanelTitle icon={<CircleAlert size={19} />} title="Points de vigilance & Limites observées" /><Bullets items={[<><b>Validation ≠ Test</b> : le zero-shot surpasse le fine-tuning en test réel sur le Site B (40,3 % vs 38,4 %).</>, <><b>Couverture J2</b> : la règle simple reste meilleure que le CNN sur le test (0,0166 vs 0,0252).</>, <><b>Dérive optique caméra B</b> : MAE occultation = <b>0,1534</b> en test (écart à la cible 0,10).</>, <><b>Horizon immédiat J4</b> : le GRU L=48 retenu obtient <b>9,5 %</b> sur le test final, sous 12 %.</>]} /></Card></div><div className="key-quote compact"><span>PRINCIPE DE RIGUEUR SCIENTIFIQUE</span><p>Validation ≠ test. Tous les chiffres présentés proviennent des cellules exécutées de nos notebooks. Les graphiques exacts portent un badge vert ; les autres visualisent explicitement des tableaux ou journaux exécutés.</p></div><Source paths={[slideSource[0], slideSource[1], slideSource[2], slideSource[3], 'docs/decisions/PAGE_DE_DECISIONS_JALON2.md']} /></>;
    case 23: return <><Heading kicker="06 / CONCLUSION GÉNÉRALE" title="Un système, quatre contributions" desc="Le projet rapproche prévision de production, compréhension visuelle et transfert entre centrales solaires." /><div className="conclusion-grid flex-1 min-h-0"><Card><div className="conclusion-index">01</div><Zap size={22} /><h3>Prévoir</h3><p>Le MLP établit une référence et montre le rôle déterminant de la nébulosité.</p></Card><Card><div className="conclusion-index">02</div><Eye size={22} /><h3>Observer</h3><p>Le CNN quantifie l'état du ciel ; l'auto-encodeur repère les défauts thermiques.</p></Card><Card><div className="conclusion-index">03</div><Layers3 size={22} /><h3>Transférer</h3><p>Le zero-shot répond à l'absence d'historique local, avec vigilance sur le décalage climatique.</p></Card><Card><div className="conclusion-index">04</div><BrainCircuit size={22} /><h3>Modéliser le temps</h3><p>Le GRU direct propose un compromis entre performance, temporalité et légèreté.</p></Card></div><div className="conclusion-statement"><span>EN SYNTHÈSE</span><h3>Une prévision robuste à 6 h est réalisable ; le défi reste l'horizon immédiat et la généralisation de la vision entre sites.</h3><div>Drâa Solaire · Master SDIA · Étude de cas 04</div></div></>;
    case 24: return <><Heading kicker="06 / PERSPECTIVES & DÉMONSTRATION PRATIQUE" title="Vers une supervision solaire plus fiable" desc="Une trajectoire d'amélioration réaliste, étayée par les limites observées et démontrée en direct." /><div className="grid lg:grid-cols-2 gap-3 flex-1 min-h-0"><Card><h3 className="small-title">Axes scientifiques suivants</h3><Bullets items={[<>Fusion <b>spatio-temporelle</b> CNN + GRU pour l'horizon t+1.</>, <>Évaluer le site B sur plusieurs saisons pour mesurer la dérive de domaine.</>, <>Répéter les entraînements avec plusieurs graines, intervalles de confiance et tests statistiques.</>, <>Recalibrer le CNN pour l'occultation du site B ; étudier les mécanismes d'attention.</>, <>Mesurer l'inférence CPU/GPU sur une machine documentée.</>]} /></Card><Card className="flex flex-col"><h3 className="small-title">Traçabilité & Démonstration pratique</h3><a href="https://centrale-solaire.streamlit.app/" target="_blank" rel="noreferrer" className="demo-pratique-card"><div className="demo-pratique-icon"><Radio size={19} className="animate-pulse text-[#73d9bb]"/></div><div className="demo-pratique-body"><div className="flex items-center gap-2"><span className="demo-pratique-badge">APPLICATION EN LIGNE (STREAMLIT)</span><span className="demo-pratique-live">● LIVE DEMO</span></div><strong className="demo-pratique-url">centrale-solaire.streamlit.app</strong><p className="demo-pratique-text">Démonstration interactive des 4 jalons (MLP, CNN ciel, Transfert B, GRU séquentiel).</p></div><ExternalLink size={16} className="demo-pratique-arrow"/></a><div className="resource-list">{[...slideSource, 'experiments/journal_experiences_jalon3.csv', 'experiments/journal_experiences_jalon4.csv'].map((s, i) => <a href={`${REPO}/blob/main/${s}`} target="_blank" rel="noreferrer" key={s}><span>{i < 4 ? `Jalon ${i + 1}` : 'Résultats'}</span><b>{s.split('/').pop()}</b><ExternalLink size={13} /></a>)}</div><p className="explain-text">Figures, modèles et application interactive réelle démontrant les quatre jalons en direct.</p></Card></div><div className="end-slide"><span className="tiny-sun" /><span>Drâa Solaire · 50 MW</span><h3>Merci pour votre attention.</h3><div className="end-slide-team"><span>Groupe 14 : <strong>Oussama FELOUACH</strong> · <strong>Ayoub EL HOUANI</strong> · <strong>Mbarek ETTALEBY</strong></span><span className="end-slide-prof">Encadré par : <strong>Pr. Soufiane HAMIDA</strong></span></div><div className="end-slide-actions"><a href="https://centrale-solaire.streamlit.app/" target="_blank" rel="noreferrer" className="end-slide-demo-link"><Radio size={14} className="animate-pulse"/><span>Démo pratique en ligne</span><ExternalLink size={12}/></a><a href={REPO} target="_blank" rel="noreferrer" className="end-slide-code-link"><span>Consulter le projet source</span><ArrowRight size={14}/></a></div></div></>;
    default: return null;
  }
}

function PresentationShell() {
  const { closeZoom, activeItem } = useZoomModal();
  const [page, setPage] = useState(() => { const n = parseInt(new URLSearchParams(location.search).get('slide') || '0', 10); return Number.isFinite(n) ? Math.max(0, Math.min(slides.length - 1, n)) : 0 });
  const [sidebarOpen, setSidebarOpen] = useState(() => { if (typeof window !== 'undefined') { return window.innerWidth > 850; } return true; });
  const [fullscreen, setFullscreen] = useState(false);
  const [overview, setOverview] = useState(false);
  const viewport = useRef<HTMLElement | null>(null);
  const pageCount = slides.length;
  const go = (p: number) => {
    const next = Math.max(0, Math.min(pageCount - 1, p));
    closeZoom();
    setPage(next);
    setOverview(false);
    if (typeof window !== 'undefined' && window.innerWidth <= 850) {
      setSidebarOpen(false);
    }
    viewport.current?.scrollTo({ top: 0, behavior: 'auto' });
  };
  useEffect(() => { history.replaceState({}, '', `${location.pathname}?slide=${page}${location.hash}`) }, [page]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'Escape') {
        if (activeItem) {
          closeZoom();
          return;
        }
        if (typeof window !== 'undefined' && window.innerWidth <= 850) {
          setSidebarOpen(false);
        }
        setOverview(false);
        return;
      }
      if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarOpen(v => !v);
        return;
      }
      if (e.key.toLowerCase() === 'o') { e.preventDefault(); setOverview(v => !v); return; }
      if (e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFullscreen(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        closeZoom();
        setPage(v => Math.min(pageCount - 1, v + 1));
      }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        closeZoom();
        setPage(v => Math.max(0, v - 1));
      }
      else if (e.key === 'Home') { e.preventDefault(); closeZoom(); setPage(0); }
      else if (e.key === 'End') { e.preventDefault(); closeZoom(); setPage(pageCount - 1); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [pageCount, activeItem, closeZoom]);
  useEffect(() => { const f = () => setFullscreen(Boolean(document.fullscreenElement)); document.addEventListener('fullscreenchange', f); return () => document.removeEventListener('fullscreenchange', f) }, []);
  const toggleFullscreen = () => { if (document.fullscreenElement) { document.exitFullscreen?.() } else { document.documentElement.requestFullscreen?.() } };
  const sectionIndex = slides[page][1];
  const section = sections[sectionIndex];
  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`} aria-label="Menu de navigation latéral">
      <div className="sidebar-inner">
        <div className="sidebar-header">
          <div className="brand" onClick={() => go(0)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') go(0) }} title="Retour au titre">
            <div className="brand-icon"><Sun size={25} /></div>
            <div><strong>SOLAR<span>DRÂA</span></strong><small>RESEARCH PRESENTATION</small></div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} title="Fermer le menu latéral (M)" aria-label="Fermer le menu latéral">
            <PanelLeftClose size={18} />
          </button>
        </div>
        <div className="side-divider" />
        <div className="sidebar-kicker">PRÉSENTATION SCIENTIFIQUE</div>
        <nav aria-label="Les six parties de la présentation">{sections.map((s, i) => <button key={s.id} onClick={() => go(s.start)} className={`nav-item ${i === sectionIndex ? 'active' : ''}`}><span className="nav-index">0{i + 1}</span><span className="nav-text"><b>{s.label}</b><small>{s.en}</small></span>{i === sectionIndex && <span className="active-indicator" />}</button>)}</nav>
        <div className="side-bottom">
          <div className="side-callout">
            <div><Focus size={16} /> MODE SOUTENANCE</div>
            <p>Diapos : <kbd>←</kbd> <kbd>→</kbd> · Menu : <kbd>M</kbd></p>
          </div>
          <div className="side-project">
            <span>GROUPE 14 · ÉTUDE DE CAS 04</span>
            <strong>Master SDIA · 2026–27</strong>
            <small>O. Felouach · A. El Houani · M. Ettaleby</small>
            <small style={{ color: '#f4bf6d', marginTop: '3px', display: 'block' }}>Pr. Soufiane HAMIDA</small>
          </div>
        </div>
      </div>
    </aside>
    {sidebarOpen && <div className="mobile-scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
    <div className="page-layout">
      {!sidebarOpen && (
        <button
          className="floating-sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
          title="Ouvrir le menu latéral (M)"
          aria-label="Ouvrir le menu latéral"
        >
          <PanelLeftOpen size={19} />
        </button>
      )}
      <div className="top-progress-bar" style={{ width: `${((page + 1) / pageCount) * 100}%` }} />
      <main className="main-scroll" ref={viewport}>
        <div className="slide-stage">
          <div className="slide-topline">
            <div className="topline-left">
              <span className="stage-dot" />
              <span className="topline-section">{section.en.toUpperCase()} · {section.label}</span>
            </div>
            <div className="topline-controls">
              <span className="topline-count">
                PRÉSENTATION / <b>{String(page + 1).padStart(2, '0')}</b> <em>/</em> {String(pageCount).padStart(2, '0')}
              </span>
              <div className="topline-nav-group">
                <button
                  className="topline-btn"
                  onClick={() => go(page - 1)}
                  disabled={page === 0}
                  title="Diapositive précédente (←)"
                  aria-label="Diapositive précédente"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  className="topline-btn topline-btn-accent"
                  onClick={() => go(page + 1)}
                  disabled={page === pageCount - 1}
                  title="Diapositive suivante (→ ou Espace)"
                  aria-label="Diapositive suivante"
                >
                  <ArrowRight size={14} />
                </button>
                <div className="topline-divider" />
                <button
                  className="topline-btn"
                  onClick={() => setOverview(true)}
                  title="Sommaire rapide (O)"
                  aria-label="Sommaire"
                >
                  <PanelTop size={14} />
                </button>
                <button
                  className="topline-btn"
                  onClick={toggleFullscreen}
                  title={fullscreen ? "Quitter le plein écran (F)" : "Plein écran (F)"}
                  aria-label="Plein écran"
                >
                  {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.section
              key={page}
              className="slide-content"
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: .3, ease: 'easeOut' }}
            >
              <Content page={page} />
            </motion.section>
          </AnimatePresence>
        </div>
      </main>
    </div>
    <AnimatePresence>{overview && <motion.div className="overview-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOverview(false)}><motion.div className="overview-panel" initial={{ scale: .96, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .96, y: 15 }} onClick={e => e.stopPropagation()}><div className="overview-head"><div><Label>NAVIGATION RAPIDE</Label><h2>Sommaire de la présentation</h2></div><button className="icon-button" aria-label="Fermer" onClick={() => setOverview(false)}><X size={20} /></button></div><div className="overview-grid">{sections.map((s, i) => <div key={s.id}><h3><span>0{i + 1}</span>{s.label}</h3>{slides.map((sl, j) => sl[1] === i && <button key={j} className={j === page ? 'current' : ''} onClick={() => go(j)}><span>{String(j + 1).padStart(2, '0')}</span>{sl[0]}<ChevronRight size={14} /></button>)}</div>)}</div></motion.div></motion.div>}</AnimatePresence>
  </div>;
}

export default function App() {
  return (
    <ZoomProvider>
      <PresentationShell />
    </ZoomProvider>
  );
}
