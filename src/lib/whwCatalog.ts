import { Product } from '../types/index.ts';

export const WHW_PRODUCTS: Product[] = [
  {
    id: 'prod-tirzepatide',
    name: 'Tirzepatide',
    slug: 'tirzepatide',
    sku: 'WH-MET-001',
    category: 'metabolic',
    categoryLabel: 'Metabolic Support',
    shortDescription: 'Dual GIP/GLP-1 receptor agonist studied for body recomposition and metabolic balance.',
    description: 'Next-generation twin incretin mimetic activating both glucose-dependent insulinotropic polypeptide (GIP) and GLP-1 pathways for glycemic control and body composition.',
    price: 50.00,
    wholesalePrice: 400.00,
    imageUrl: '/images/products/tirzepatide.jpg',
    stockQuantity: 150,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #9012-C',
    purity: '≥ 99.7%',
    strengths: [
      { label: '10mg (1 Vial)', vialsCount: 1, price: 50.00, pricePerVial: 50.00 },
      { label: '40mg (1 Vial)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 500.00, pricePerVial: 50.00 },
      { label: '15mg (10-Vial Kit)', vialsCount: 10, price: 600.00, pricePerVial: 60.00 },
      { label: '20mg (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 },
      { label: '30mg (10-Vial Kit)', vialsCount: 10, price: 800.00, pricePerVial: 80.00 },
      { label: '40mg (10-Vial Kit)', vialsCount: 10, price: 900.00, pricePerVial: 90.00 },
      { label: '50mg (10-Vial Kit)', vialsCount: 10, price: 1000.00, pricePerVial: 100.00 },
      { label: '60mg (10-Vial Kit)', vialsCount: 10, price: 1100.00, pricePerVial: 110.00 },
      { label: '70mg (10-Vial Kit)', vialsCount: 10, price: 1200.00, pricePerVial: 120.00 },
      { label: '80mg (10-Vial Kit)', vialsCount: 10, price: 1300.00, pricePerVial: 130.00 },
      { label: '90mg (10-Vial Kit)', vialsCount: 10, price: 1400.00, pricePerVial: 140.00 },
      { label: '100mg (10-Vial Kit)', vialsCount: 10, price: 1500.00, pricePerVial: 150.00 },
      { label: '120mg (10-Vial Kit)', vialsCount: 10, price: 1600.00, pricePerVial: 160.00 }
    ],
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'prod-retatrutide',
    name: 'Retatrutide',
    slug: 'retatrutide',
    sku: 'WH-MET-002',
    category: 'metabolic',
    categoryLabel: 'Triple Agonist Research',
    shortDescription: 'Triple-receptor (GLP-1/GIP/Glucagon) molecule for metabolic energy expenditure.',
    description: 'Triple hormone receptor agonist designed to co-activate GLP-1, GIP, and Glucagon receptors, promoting heightened basal thermogenesis and metabolic efficiency.',
    price: 60.00,
    wholesalePrice: 400.00,
    imageUrl: '/images/products/retatrutide.jpg',
    stockQuantity: 90,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #4189-B',
    purity: '≥ 99.8%',
    strengths: [
      { label: '10mg (1 Vial)', vialsCount: 1, price: 60.00, pricePerVial: 60.00 },
      { label: '40mg (1 Vial)', vialsCount: 1, price: 120.00, pricePerVial: 120.00 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 500.00, pricePerVial: 50.00 },
      { label: '15mg (10-Vial Kit)', vialsCount: 10, price: 550.00, pricePerVial: 55.00 },
      { label: '20mg (10-Vial Kit)', vialsCount: 10, price: 600.00, pricePerVial: 60.00 },
      { label: '30mg (10-Vial Kit)', vialsCount: 10, price: 650.00, pricePerVial: 65.00 },
      { label: '40mg (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 },
      { label: '50mg (10-Vial Kit)', vialsCount: 10, price: 750.00, pricePerVial: 75.00 },
      { label: '60mg (10-Vial Kit)', vialsCount: 10, price: 820.00, pricePerVial: 82.00 }
    ],
    createdAt: '2026-01-16T00:00:00Z'
  },
  {
    id: 'prod-semaglutide-b12',
    name: 'Semaglutide',
    slug: 'semaglutide-b12',
    sku: 'WH-MET-003',
    category: 'metabolic',
    categoryLabel: 'Metabolic Support',
    shortDescription: 'GLP-1 receptor agonist studied for appetite regulation and glycemic equilibrium.',
    description: 'High-performance lyophilized Semaglutide peptide assayed at ≥99.6% purity. Calibrated for graduated titration and metabolic health regimens.',
    price: 50.00,
    wholesalePrice: 300.00,
    imageUrl: '/images/featured-semaglutide.png',
    stockQuantity: 200,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #8841-A',
    purity: '≥ 99.6%',
    strengths: [
      { label: '10mg (1 Vial)', vialsCount: 1, price: 50.00, pricePerVial: 50.00 },
      { label: '30mg (1 Vial)', vialsCount: 1, price: 80.00, pricePerVial: 80.00 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 420.00, pricePerVial: 42.00 },
      { label: '20mg (10-Vial Kit)', vialsCount: 10, price: 520.00, pricePerVial: 52.00 },
      { label: '30mg (10-Vial Kit)', vialsCount: 10, price: 620.00, pricePerVial: 62.00 }
    ],
    createdAt: '2026-01-17T00:00:00Z'
  },
  {
    id: 'prod-tesamorelin',
    name: 'Tesamorelin',
    slug: 'tesamorelin',
    sku: 'WH-LON-004',
    category: 'longevity',
    categoryLabel: 'Growth Hormone Secretagogue',
    shortDescription: 'GHRH analog studied for visceral adipose reduction and pulsatile GH support.',
    description: 'Stabilized growth hormone-releasing hormone (GHRH) analog supporting endogenous somatotropin release, visceral fat metabolism, and lean tissue preservation.',
    price: 47.50,
    wholesalePrice: 250.00,
    imageUrl: '/images/products/tesamorelin.jpg',
    stockQuantity: 110,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #5102-T',
    purity: '≥ 99.5%',
    strengths: [
      { label: '10mg (1 Vial)', vialsCount: 1, price: 47.50, pricePerVial: 47.50 },
      { label: '20mg (1 Vial)', vialsCount: 1, price: 78.75, pricePerVial: 78.75 }
    ],
    wholesaleStrengths: [
      { label: '2mg (10-Vial Kit)', vialsCount: 10, price: 250.00, pricePerVial: 25.00 },
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 475.00, pricePerVial: 47.50 },
      { label: '20mg (10-Vial Kit)', vialsCount: 10, price: 787.00, pricePerVial: 78.70 }
    ],
    createdAt: '2026-01-18T00:00:00Z'
  },
  {
    id: 'prod-glow-70',
    name: 'GLOW 70',
    slug: 'glow-70',
    sku: 'WH-STK-005',
    category: 'stacks',
    categoryLabel: 'Dermal & Tissue Matrix',
    shortDescription: '70mg synergy blend: BPC-157 (10mg) + GHK-Cu (50mg) + TB-500 (10mg).',
    description: 'Comprehensive regenerative matrix combining BPC-157 10mg, GHK-Cu 50mg, and TB-500 10mg in a single 70mg lyophilized vial for dermal collagen remodeling and tissue repair.',
    price: 100.00,
    wholesalePrice: 450.00,
    imageUrl: '/images/products/glow-70.jpg',
    stockQuantity: 85,
    status: 'ACTIVE',
    featured: true,
    isStack: true,
    stackItems: ['BPC-157 10mg', 'GHK-Cu 50mg', 'TB-500 10mg'],
    lotNumber: 'Lot #6021-G',
    purity: '≥ 99.6%',
    strengths: [
      { label: '70mg (1 Vial)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 }
    ],
    wholesaleStrengths: [
      { label: '70mg (10-Vial Kit)', vialsCount: 10, price: 450.00, pricePerVial: 45.00 }
    ],
    createdAt: '2026-01-19T00:00:00Z'
  },
  {
    id: 'prod-klow-80',
    name: 'KLOW 80',
    slug: 'klow-80',
    sku: 'WH-STK-006',
    category: 'stacks',
    categoryLabel: 'Quad-Peptide Recovery',
    shortDescription: '80mg quad blend: BPC-157 (10mg) + GHK-Cu (50mg) + TB-500 (10mg) + KPV (10mg).',
    description: 'Advanced 4-peptide recovery and inflammation-modulating blend combining BPC-157 10mg, GHK-Cu 50mg, TB-500 10mg, and KPV 10mg in an 80mg lyophilized vial.',
    price: 100.00,
    wholesalePrice: 500.00,
    imageUrl: '/images/products/klow-80.jpg',
    stockQuantity: 75,
    status: 'ACTIVE',
    featured: true,
    isStack: true,
    stackItems: ['BPC-157 10mg', 'GHK-Cu 50mg', 'TB-500 10mg', 'KPV 10mg'],
    lotNumber: 'Lot #6022-K',
    purity: '≥ 99.6%',
    strengths: [
      { label: '80mg (1 Vial)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 }
    ],
    wholesaleStrengths: [
      { label: '80mg (10-Vial Kit)', vialsCount: 10, price: 500.00, pricePerVial: 50.00 }
    ],
    createdAt: '2026-01-20T00:00:00Z'
  },
  {
    id: 'prod-wolverine-blend',
    name: 'Wolverine Blend',
    slug: 'wolverine-blend',
    sku: 'WH-REC-007',
    category: 'recovery',
    categoryLabel: 'Tissue & Joint Recovery',
    shortDescription: 'Dual-action BPC-157 & TB-500 synergy blend for tendon, ligament, and muscle repair.',
    description: 'Synergistic cellular recovery combination linking Body Protection Compound-157 with Thymosin Beta-4 for connective tissue tensile integrity and rapid recovery.',
    price: 50.00,
    wholesalePrice: 350.00,
    imageUrl: '/images/products/wolverine-blend.jpg',
    stockQuantity: 130,
    status: 'ACTIVE',
    featured: true,
    isStack: true,
    lotNumber: 'Lot #3312-W',
    purity: '≥ 99.8%',
    strengths: [
      { label: '5mg (1 Vial)', vialsCount: 1, price: 50.00, pricePerVial: 50.00 },
      { label: '10mg (1 Vial)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 },
      { label: '15mg (1 Vial)', vialsCount: 1, price: 140.00, pricePerVial: 140.00 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 350.00, pricePerVial: 35.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 }
    ],
    createdAt: '2026-01-21T00:00:00Z'
  },
  {
    id: 'prod-bpc-pure',
    name: 'BPC-157',
    slug: 'bpc-157-tb-500',
    sku: 'WH-REC-008',
    category: 'recovery',
    categoryLabel: 'Recovery & Gut Mucosa',
    shortDescription: 'Body Protection Compound pentadecapeptide for angiogenic regeneration and gut repair.',
    description: 'A 15-amino acid peptide isolated for its cytoprotective effects across the gastrointestinal barrier, tendons, ligaments, and muscular micro-tears.',
    price: 30.00,
    wholesalePrice: 210.00,
    imageUrl: '/images/featured-bpc157-clean.png',
    stockQuantity: 180,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #3312-E',
    purity: '≥ 99.8%',
    strengths: [
      { label: '5mg (1 Vial)', vialsCount: 1, price: 30.00, pricePerVial: 30.00 },
      { label: '10mg (1 Vial)', vialsCount: 1, price: 50.00, pricePerVial: 50.00 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 210.00, pricePerVial: 21.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 350.00, pricePerVial: 35.00 }
    ],
    createdAt: '2026-01-22T00:00:00Z'
  },
  {
    id: 'prod-tb-500',
    name: 'TB-500',
    slug: 'tb-500',
    sku: 'WH-REC-009',
    category: 'recovery',
    categoryLabel: 'Tissue & Mobility',
    shortDescription: 'Thymosin Beta-4 synthetic fraction supporting cell migration and tissue remodeling.',
    description: 'Synthetic fraction of Thymosin Beta-4 studied for actin-binding cellular migration, soft-tissue flexibility, and systemic recovery.',
    price: 30.00,
    wholesalePrice: 210.00,
    imageUrl: '/images/products/tb-500.jpg',
    stockQuantity: 140,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #3319-T',
    purity: '≥ 99.6%',
    strengths: [
      { label: '5mg (1 Vial)', vialsCount: 1, price: 30.00, pricePerVial: 30.00 },
      { label: '10mg (1 Vial)', vialsCount: 1, price: 60.00, pricePerVial: 60.00 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 210.00, pricePerVial: 21.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 420.00, pricePerVial: 42.00 }
    ],
    createdAt: '2026-01-23T00:00:00Z'
  },
  {
    id: 'prod-mazdutide',
    name: 'Mazdutide',
    slug: 'mazdutide',
    sku: 'WH-MET-010',
    category: 'metabolic',
    categoryLabel: 'Dual GLP-1 / Glucagon',
    shortDescription: 'Dual GLP-1 and glucagon receptor agonist for metabolic rate and lipid clearance.',
    description: 'Co-agonist targeting both GLP-1 and glucagon receptors to support satiety signaling, hepatic lipid metabolism, and energy expenditure.',
    price: 50.00,
    wholesalePrice: 400.00,
    imageUrl: '/images/products/mazdutide.jpg',
    stockQuantity: 95,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #7104-M',
    purity: '≥ 99.6%',
    strengths: [
      { label: '5mg (1 Vial)', vialsCount: 1, price: 50.00, pricePerVial: 50.00 },
      { label: '10mg (1 Vial)', vialsCount: 1, price: 80.00, pricePerVial: 80.00 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 550.00, pricePerVial: 55.00 }
    ],
    createdAt: '2026-01-24T00:00:00Z'
  },
  {
    id: 'prod-survodutide',
    name: 'Survodutide',
    slug: 'survodutide',
    sku: 'WH-MET-011',
    category: 'metabolic',
    categoryLabel: 'Dual Glucagon / GLP-1',
    shortDescription: 'Dual glucagon/GLP-1 receptor agonist supplied in sealed 10-vial kits.',
    description: 'Selective dual agonist of glucagon and GLP-1 receptors studied for metabolic energy expenditure and liver fat reduction. Supplied per 10-vial kit.',
    price: 700.00,
    wholesalePrice: 700.00,
    imageUrl: '/images/products/survodutide.jpg',
    stockQuantity: 40,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #7201-S',
    purity: '≥ 99.5%',
    strengths: [
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 }
    ],
    wholesaleStrengths: [
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 }
    ],
    createdAt: '2026-01-25T00:00:00Z'
  },
  {
    id: 'prod-eloralintide',
    name: 'Eloralintide',
    slug: 'eloralintide',
    sku: 'WH-MET-012',
    category: 'metabolic',
    categoryLabel: 'Amylin Receptor Agonist',
    shortDescription: 'Selective amylin receptor agonist supplied in sealed 10-vial kits.',
    description: 'Long-acting amylin analog studied for satiety signaling, gastric emptying modulation, and metabolic weight management. Supplied per 10-vial kit.',
    price: 450.00,
    wholesalePrice: 450.00,
    imageUrl: '/images/products/eloralintide.jpg',
    stockQuantity: 35,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #7308-E',
    purity: '≥ 99.5%',
    strengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 450.00, pricePerVial: 45.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 875.00, pricePerVial: 87.50 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 450.00, pricePerVial: 45.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 875.00, pricePerVial: 87.50 }
    ],
    createdAt: '2026-01-26T00:00:00Z'
  },
  {
    id: 'prod-lipo-mino',
    name: 'Lipo Mino Mix',
    slug: 'lipo-mino-mix',
    sku: 'WH-CEL-013',
    category: 'cellular',
    categoryLabel: 'Lipotropic & Methylation',
    shortDescription: '244.40mg / 10mL multi-dose vial (10 × 1mL doses or 20 × 0.5mL doses).',
    description: 'Lipotropic amino acid and B-vitamin complex (244.40mg / 10mL) formulated to support hepatic fat metabolism, cellular energy, and methylation.',
    price: 100.00,
    wholesalePrice: 700.00,
    imageUrl: '/images/products/lipo-mino-mix.jpg',
    stockQuantity: 100,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #8102-L',
    purity: '≥ 99.5%',
    strengths: [
      { label: '244.40mg / 10mL (1 Vial • 10–20 doses)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 }
    ],
    wholesaleStrengths: [
      { label: '244.40mg / 10mL (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 }
    ],
    createdAt: '2026-01-27T00:00:00Z'
  },
  {
    id: 'prod-super-shred',
    name: 'Super Shred',
    slug: 'super-shred',
    sku: 'WH-CEL-014',
    category: 'cellular',
    categoryLabel: 'Thermogenic & Lipotropic',
    shortDescription: '350.25mg / 10mL high-potency lipotropic & metabolic support vial.',
    description: 'High-concentration 350.25mg / 10mL lipotropic and amino acid formulation designed to support lipid mobilization and mitochondrial energy.',
    price: 100.00,
    wholesalePrice: 700.00,
    imageUrl: '/images/products/super-shred.jpg',
    stockQuantity: 90,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #8109-S',
    purity: '≥ 99.5%',
    strengths: [
      { label: '350.25mg / 10mL (1 Vial)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 }
    ],
    wholesaleStrengths: [
      { label: '350.25mg / 10mL (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 }
    ],
    createdAt: '2026-01-28T00:00:00Z'
  },
  {
    id: 'prod-mots-c',
    name: 'MOTS-C',
    slug: 'mots-c-activator',
    sku: 'WH-CEL-015',
    category: 'cellular',
    categoryLabel: 'Cellular Energy & Mitochondria',
    shortDescription: 'Mitochondria-encoded peptide stimulating AMPK pathways and metabolic bio-resilience.',
    description: 'Mitochondrial-derived 16-amino-acid peptide that modulates whole-body metabolic homeostasis, skeletal muscle glucose uptake, and fatty acid oxidation.',
    price: 45.00,
    wholesalePrice: 300.00,
    imageUrl: '/images/featured-motsc.png',
    stockQuantity: 85,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #7729-M',
    purity: '≥ 99.5%',
    strengths: [
      { label: '20mg (1 Vial)', vialsCount: 1, price: 45.00, pricePerVial: 45.00 },
      { label: '40mg (1 Vial)', vialsCount: 1, price: 65.00, pricePerVial: 65.00 }
    ],
    wholesaleStrengths: [
      { label: '20mg (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 },
      { label: '40mg (10-Vial Kit)', vialsCount: 10, price: 410.00, pricePerVial: 41.00 }
    ],
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'prod-cagrilintide',
    name: 'Cagrilintide',
    slug: 'cagrilintide',
    sku: 'WH-MET-016',
    category: 'metabolic',
    categoryLabel: 'Amylin Analog',
    shortDescription: 'Long-acting amylin analog studied for satiety and metabolic synergy.',
    description: 'Acylated amylin receptor agonist engineered for extended half-life and complementary satiety signaling alongside GLP-1 protocols.',
    price: 45.00,
    wholesalePrice: 300.00,
    imageUrl: '/images/products/cagrilintide.jpg',
    stockQuantity: 70,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #5510-C',
    purity: '≥ 99.5%',
    strengths: [
      { label: '5mg (1 Vial)', vialsCount: 1, price: 45.00, pricePerVial: 45.00 },
      { label: '10mg (1 Vial)', vialsCount: 1, price: 70.00, pricePerVial: 70.00 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 475.00, pricePerVial: 47.50 }
    ],
    createdAt: '2026-02-02T00:00:00Z'
  },
  {
    id: 'prod-aod-9604',
    name: 'AOD-9604',
    slug: 'aod-9604',
    sku: 'WH-MET-017',
    category: 'metabolic',
    categoryLabel: 'Lipolytic Fragment',
    shortDescription: 'Modified hGH fragment (176–191) studied for targeted lipolysis without IGF-1 elevation.',
    description: 'C-terminal peptide fragment of human growth hormone (176–191) studied for stimulating lipolysis and inhibiting lipogenesis.',
    price: 60.00,
    wholesalePrice: 400.00,
    imageUrl: '/images/products/aod-9604.jpg',
    stockQuantity: 80,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #5521-A',
    purity: '≥ 99.5%',
    strengths: [
      { label: '10mg (1 Vial)', vialsCount: 1, price: 60.00, pricePerVial: 60.00 }
    ],
    wholesaleStrengths: [
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 }
    ],
    createdAt: '2026-02-03T00:00:00Z'
  },
  {
    id: 'prod-adipotide',
    name: 'Adipotide / FTTP',
    slug: 'adipotide-fttp',
    sku: 'WH-MET-018',
    category: 'metabolic',
    categoryLabel: 'Adipose Vascular Research',
    shortDescription: 'Peptidomimetic studied for selective white adipose tissue vascular targeting.',
    description: 'Proapoptotic peptidomimetic researched for selective targeting of white adipose tissue vasculature.',
    price: 55.00,
    wholesalePrice: 362.50,
    imageUrl: '/images/products/adipotide.jpg',
    stockQuantity: 50,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #5530-F',
    purity: '≥ 99.4%',
    strengths: [
      { label: '5mg (1 Vial)', vialsCount: 1, price: 55.00, pricePerVial: 55.00 },
      { label: '10mg (1 Vial)', vialsCount: 1, price: 105.00, pricePerVial: 105.00 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 362.50, pricePerVial: 36.25 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 712.50, pricePerVial: 71.25 }
    ],
    createdAt: '2026-02-04T00:00:00Z'
  },
  {
    id: 'prod-5-amino-1mq',
    name: '5-Amino-1MQ',
    slug: '5-amino-1mq',
    sku: 'WH-CEL-019',
    category: 'cellular',
    categoryLabel: 'NNMT & NAD+ Salvage',
    shortDescription: 'Small-molecule NNMT inhibitor supporting intracellular NAD+ and cellular metabolism.',
    description: 'Selective nicotinamide N-methyltransferase (NNMT) inhibitor studied for preserving intracellular NAD+ pools and enhancing adipocyte energy expenditure.',
    price: 20.00,
    wholesalePrice: 120.00,
    imageUrl: '/images/products/5-amino-1mq.jpg',
    stockQuantity: 110,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #6102-Q',
    purity: '≥ 99.5%',
    strengths: [
      { label: '5mg (1 Vial)', vialsCount: 1, price: 20.00, pricePerVial: 20.00 },
      { label: '10mg (1 Vial)', vialsCount: 1, price: 25.00, pricePerVial: 25.00 },
      { label: '50mg (1 Vial)', vialsCount: 1, price: 45.00, pricePerVial: 45.00 }
    ],
    wholesaleStrengths: [
      { label: '5mg (10-Vial Kit)', vialsCount: 10, price: 120.00, pricePerVial: 12.00 },
      { label: '10mg (10-Vial Kit)', vialsCount: 10, price: 162.00, pricePerVial: 16.20 },
      { label: '50mg (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 }
    ],
    createdAt: '2026-02-05T00:00:00Z'
  },
  {
    id: 'prod-aicar',
    name: 'AICAR',
    slug: 'aicar',
    sku: 'WH-CEL-020',
    category: 'cellular',
    categoryLabel: 'AMPK Bioenergetics',
    shortDescription: 'Direct AMPK activator studied for cellular glucose uptake and endurance bioenergetics.',
    description: '5-Aminoimidazole-4-carboxamide ribonucleotide (AICAR) analog that activates AMP-activated protein kinase (AMPK) to support mitochondrial biogenesis.',
    price: 30.00,
    wholesalePrice: 200.00,
    imageUrl: '/images/products/aicar.jpg',
    stockQuantity: 90,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #6208-A',
    purity: '≥ 99.5%',
    strengths: [
      { label: '50mg (1 Vial)', vialsCount: 1, price: 30.00, pricePerVial: 30.00 },
      { label: '100mg (1 Vial)', vialsCount: 1, price: 60.00, pricePerVial: 60.00 }
    ],
    wholesaleStrengths: [
      { label: '50mg (10-Vial Kit)', vialsCount: 10, price: 200.00, pricePerVial: 20.00 },
      { label: '100mg (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 }
    ],
    createdAt: '2026-02-06T00:00:00Z'
  }
];
