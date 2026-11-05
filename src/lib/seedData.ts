import { 
  Product, 
  WellnessProgram, 
  Partner, 
  EducationalArticle, 
  FAQ, 
  Testimonial, 
  Order, 
  PartnerEarning 
} from '../types/index.ts';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-tirzepatide',
    name: 'Tirzepatide',
    slug: 'tirzepatide',
    sku: 'WH-MET-001',
    category: 'metabolic',
    categoryLabel: 'Metabolic Health',
    shortDescription: 'Dual GIP/GLP-1 receptor agonist studied for body recomposition and glucose tolerance.',
    description: 'Next-generation twin incretin mimetic activating both glucose-dependent insulinotropic polypeptide (GIP) and GLP-1 pathways for glycemic control and body composition.',
    price: 50.00,
    wholesalePrice: 400.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOgCeS50V0T7Km2GEjEEq9qTsuuhYXeQvz2cx5O9JotRS8HzOPWVRkDuwzutO-SxdNN4C4VXL8WU-6MLWkgmOylXP739D-T11tR7MBj30d7enb0JvJp1WJGh7HBpuzlDLCkrKQojPqjlLjSObWVMlMzX9KRfMSylYKkyCn2f55TO6NZoG3BBphY2duUIgwpjl0JvhH-hQt_fYTXDDi3fXb7Rt4NGDhUGAZBr7MJfC5wlf4IYgtBKzx',
    stockQuantity: 150,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #9012-C',
    purity: '≥ 99.7%',
    strengths: [
      { label: '10 MG (1 Vial)', vialsCount: 1, price: 50.00, pricePerVial: 50.00 },
      { label: '40 MG (1 Vial)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 }
    ],
    wholesaleStrengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 500.00, pricePerVial: 50.00 },
      { label: '15 MG (10-Vial Kit)', vialsCount: 10, price: 600.00, pricePerVial: 60.00 },
      { label: '20 MG (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 },
      { label: '30 MG (10-Vial Kit)', vialsCount: 10, price: 800.00, pricePerVial: 80.00 },
      { label: '40 MG (10-Vial Kit)', vialsCount: 10, price: 900.00, pricePerVial: 90.00 },
      { label: '50 MG (10-Vial Kit)', vialsCount: 10, price: 1000.00, pricePerVial: 100.00 },
      { label: '60 MG (10-Vial Kit)', vialsCount: 10, price: 1100.00, pricePerVial: 110.00 },
      { label: '70 MG (10-Vial Kit)', vialsCount: 10, price: 1200.00, pricePerVial: 120.00 },
      { label: '80 MG (10-Vial Kit)', vialsCount: 10, price: 1300.00, pricePerVial: 130.00 },
      { label: '90 MG (10-Vial Kit)', vialsCount: 10, price: 1400.00, pricePerVial: 140.00 },
      { label: '100 MG (10-Vial Kit)', vialsCount: 10, price: 1500.00, pricePerVial: 150.00 },
      { label: '120 MG (10-Vial Kit)', vialsCount: 10, price: 1600.00, pricePerVial: 160.00 }
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
    description: 'Triple hormone receptor agonist designed to co-activate GLP-1, GIP, and Glucagon receptors, promoting heightened basal thermogenesis and visceral fat clearance.',
    price: 60.00,
    wholesalePrice: 400.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjf0pMXjH9zHGnKZIF6-q1ifUrH06jHk1gGn53tnoQm3tCD1dIn12-OYzs9cv4yXhJT4F3epXT0Mria-kI1FkQZd5D97yOpxL9fp4f3w2nhfkkyuLFfYrafKzXNvqPgl6V1d40REF2ewIUtL9JhVeXbMeb9ivWY0WnQXiwJayNPNr-XinYxH42M14ME_j2YXlZxBukjPvrClY2x4KOsMv3tkrSpA10OnLPZyXWMI388G7RC9h-Gkhy',
    stockQuantity: 110,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #4189-B',
    purity: '≥ 99.8%',
    strengths: [
      { label: '10 MG (1 Vial)', vialsCount: 1, price: 60.00, pricePerVial: 60.00 },
      { label: '40 MG (1 Vial)', vialsCount: 1, price: 120.00, pricePerVial: 120.00 }
    ],
    wholesaleStrengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 500.00, pricePerVial: 50.00 },
      { label: '15 MG (10-Vial Kit)', vialsCount: 10, price: 550.00, pricePerVial: 55.00 },
      { label: '20 MG (10-Vial Kit)', vialsCount: 10, price: 600.00, pricePerVial: 60.00 },
      { label: '30 MG (10-Vial Kit)', vialsCount: 10, price: 650.00, pricePerVial: 65.00 },
      { label: '40 MG (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 },
      { label: '50 MG (10-Vial Kit)', vialsCount: 10, price: 750.00, pricePerVial: 75.00 },
      { label: '60 MG (10-Vial Kit)', vialsCount: 10, price: 820.00, pricePerVial: 82.00 }
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
    shortDescription: 'GLP-1 receptor agonist studied for appetite regulation and metabolic balance.',
    description: 'High-purity lyophilized Semaglutide peptide assayed at ≥ 99.6% purity. Calibrated for graduated titration and metabolic health regimens.',
    price: 50.00,
    wholesalePrice: 300.00,
    imageUrl: '/images/featured-semaglutide.png',
    stockQuantity: 200,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #8841-A',
    purity: '≥ 99.6%',
    strengths: [
      { label: '10 MG (1 Vial)', vialsCount: 1, price: 50.00, pricePerVial: 50.00 },
      { label: '30 MG (1 Vial)', vialsCount: 1, price: 80.00, pricePerVial: 80.00 }
    ],
    wholesaleStrengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 420.00, pricePerVial: 42.00 },
      { label: '20 MG (10-Vial Kit)', vialsCount: 10, price: 520.00, pricePerVial: 52.00 },
      { label: '30 MG (10-Vial Kit)', vialsCount: 10, price: 620.00, pricePerVial: 62.00 }
    ],
    createdAt: '2026-01-18T00:00:00Z'
  },
  {
    id: 'prod-tesamorelin',
    name: 'Tesamorelin',
    slug: 'tesamorelin',
    sku: 'WH-LON-004',
    category: 'longevity',
    categoryLabel: 'Growth Hormone Secretagogue',
    shortDescription: 'GHRH analog studied for visceral adipose reduction and pulsatile GH support.',
    description: 'Stabilized growth hormone-releasing hormone (GHRH) analog supporting endogenous somatotropin release, lean tissue preservation, and visceral lipid metabolism.',
    price: 47.50,
    wholesalePrice: 250.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1OoDk-P1JFw7mtA_QQ-0MT9E3QnbWNVR0JNORAZK9gIwq-p6--JjLxKCsMDrW5FTq5fJpitimeb9PZUmMAZ8NKGWLU7ieK-SbAuufv5Z987pEXUNze4vqJOrkTA5nB_EI_Rs_yc59MlyO1xmQ_g8PWB1sQ3uT3O4oYnvm6Pn9VryjvsVyWXTyy70Wfg0ZC0kdjM3YFFl5vu2AqdYiop6swZ79GFmnpPpvilwOStsSCLVJUlyoSvAY',
    stockQuantity: 90,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #5104-T',
    purity: '≥ 99.6%',
    strengths: [
      { label: '10 MG (1 Vial)', vialsCount: 1, price: 47.50, pricePerVial: 47.50 },
      { label: '20 MG (1 Vial)', vialsCount: 1, price: 78.75, pricePerVial: 78.75 }
    ],
    wholesaleStrengths: [
      { label: '2 MG (10-Vial Kit)', vialsCount: 10, price: 250.00, pricePerVial: 25.00 },
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 475.00, pricePerVial: 47.50 },
      { label: '20 MG (10-Vial Kit)', vialsCount: 10, price: 787.00, pricePerVial: 78.70 }
    ],
    createdAt: '2026-01-19T00:00:00Z'
  },
  {
    id: 'prod-glow-70',
    name: 'GLOW 70',
    slug: 'glow-70',
    sku: 'WH-STK-005',
    category: 'stacks',
    categoryLabel: 'Dermal & Tissue Matrix',
    shortDescription: 'BPC-157 10MG + GHK-Cu 50MG + TB-500 10MG (70MG total) synergistic blend.',
    description: 'Tri-peptide regenerative matrix combining BPC-157 (10mg), GHK-Cu (50mg), and TB-500 (10mg) for dermal collagen remodeling, angiogenesis, and cellular repair.',
    price: 100.00,
    wholesalePrice: 450.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRpTWQqHwr7RSmFlJUpyiHY-OW2byBZUFc_OeYqhEj-uh1GW3Y9QBm7EkI9BNxCPz2IUkSUfvisRgSeRsA-tR_sxSOr9dzU1xgQ1vhwCciAaRz7lfGNT9NN8XKlhWfln_UFz5RqnVWitDXDTsavX-ET--3pn4jY35MwkF9ZQcd2YzYDYtHcZmtSAeNt9vSIMqRURXJcYqWeFC8dqYyM52Q9qsNA8MqJ0f9ivlrZI9ENGBHmmd7y7sW',
    stockQuantity: 65,
    status: 'ACTIVE',
    featured: true,
    isStack: true,
    stackItems: ['BPC-157 10MG', 'GHK-Cu 50MG', 'TB-500 10MG'],
    lotNumber: 'Lot #7011-G',
    purity: '≥ 99.6%',
    strengths: [
      { label: '70 MG (1 Vial)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 }
    ],
    wholesaleStrengths: [
      { label: '70 MG (10-Vial Kit)', vialsCount: 10, price: 450.00, pricePerVial: 45.00 }
    ],
    createdAt: '2026-01-20T00:00:00Z'
  },
  {
    id: 'prod-klow-80',
    name: 'KLOW 80',
    slug: 'klow-80',
    sku: 'WH-STK-006',
    category: 'stacks',
    categoryLabel: 'Quad-Peptide Recovery',
    shortDescription: 'BPC-157 10MG + GHK-Cu 50MG + TB-500 10MG + KPV 10MG (80MG total) blend.',
    description: 'Comprehensive four-peptide cellular recovery and anti-inflammatory matrix pairing BPC-157 (10mg), GHK-Cu (50mg), TB-500 (10mg), and KPV (10mg).',
    price: 100.00,
    wholesalePrice: 500.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsThipw4ifzUb4VOZb2XEHMvhGe7jFxslNKjPCeA4zfT_v7N3f4Q_RqppkorL76l-kXR2mp8dYcO0nyTTWDG8dWul8P2XdCpqGzuhepK8yIOiuhAoNIjkf8IwVzp33bDoiJhNrbWmgmalS5OmjpMfuZm5BZf-gmTvLxrwBl6zndiLUTAyQAaMfz0QeO7LGaVZYuaPGL4GVV05DW3OcO9pUekXMVEqk7DEkaWW49FcTg6T-4rUA5CPK',
    stockQuantity: 60,
    status: 'ACTIVE',
    featured: true,
    isStack: true,
    stackItems: ['BPC-157 10MG', 'GHK-Cu 50MG', 'TB-500 10MG', 'KPV 10MG'],
    lotNumber: 'Lot #8022-K',
    purity: '≥ 99.6%',
    strengths: [
      { label: '80 MG (1 Vial)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 }
    ],
    wholesaleStrengths: [
      { label: '80 MG (10-Vial Kit)', vialsCount: 10, price: 500.00, pricePerVial: 50.00 }
    ],
    createdAt: '2026-01-21T00:00:00Z'
  },
  {
    id: 'prod-bpc-tb',
    name: 'Wolverine Blend (BPC-157 + TB-500)',
    slug: 'bpc-157-tb-500',
    sku: 'WH-REC-007',
    category: 'recovery',
    categoryLabel: 'Tissue & Gut Recovery',
    shortDescription: 'Potent pentadecapeptide & Thymosin Beta-4 composite for tissue healing and tendon repair.',
    description: 'Synergistic cellular recovery combination linking Body Protection Compound-157 with Thymosin Beta-4 for connective tissue tensile integrity and gut mucosal restoration.',
    price: 50.00,
    wholesalePrice: 350.00,
    imageUrl: '/images/featured-bpc157-clean.png',
    stockQuantity: 95,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #3312-E',
    purity: '≥ 99.8%',
    strengths: [
      { label: '5 MG (1 Vial)', vialsCount: 1, price: 50.00, pricePerVial: 50.00 },
      { label: '10 MG (1 Vial)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 },
      { label: '15 MG (1 Vial)', vialsCount: 1, price: 140.00, pricePerVial: 140.00 }
    ],
    createdAt: '2026-01-22T00:00:00Z'
  },
  {
    id: 'prod-bpc-pure',
    name: 'BPC-157',
    slug: 'bpc-157-pure',
    sku: 'WH-REC-008',
    category: 'recovery',
    categoryLabel: 'Recovery & Gut Mucosa',
    shortDescription: 'Body Protection Compound pentadecapeptide targeted for angiogenic regeneration and tissue repair.',
    description: 'A 15-amino acid peptide isolated for its cytoprotective effects across the stomach, intestinal epithelial barrier, tendons, ligaments, and muscular micro-tears.',
    price: 30.00,
    wholesalePrice: 210.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoByVsRHp4-nKVyA7uA-WF1tRyh47MFGvlMhLc1bk1fY1kKwPtuDOiCD7GeZuxm9hUxl3NvuLNrspRvozF2ELw_0r-pabzIFm5eyYD1pTHV-j1_ihSxA3ygi7g-MhiHGaloqZvX6lNmMPzn0M8BvPkflHwQE3o0piBkknbvGWn7DghezRRyYlhkBWA1yqEPPjMsnJwmCPOgUWKyXk75HkHnH3dasYhkt83YnHSG-3OGLOlj3cR_3FG',
    stockQuantity: 180,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #3312-E',
    purity: '≥ 99.8%',
    strengths: [
      { label: '5 MG (1 Vial)', vialsCount: 1, price: 30.00, pricePerVial: 30.00 },
      { label: '10 MG (1 Vial)', vialsCount: 1, price: 50.00, pricePerVial: 50.00 }
    ],
    createdAt: '2026-01-23T00:00:00Z'
  },
  {
    id: 'prod-tb-500',
    name: 'TB-500',
    slug: 'tb-500',
    sku: 'WH-REC-009',
    category: 'recovery',
    categoryLabel: 'Soft Tissue & Mobility',
    shortDescription: 'Synthetic Thymosin Beta-4 fragment supporting actin sequestration and cellular migration.',
    description: 'Lyophilized Thymosin Beta-4 (TB-500) studied for systemic soft-tissue recovery, angiogenesis, and musculoskeletal flexibility.',
    price: 30.00,
    wholesalePrice: 210.00,
    imageUrl: '/images/featured-bpc157-clean.png',
    stockQuantity: 130,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #4410-TB',
    purity: '≥ 99.6%',
    strengths: [
      { label: '5 MG (1 Vial)', vialsCount: 1, price: 30.00, pricePerVial: 30.00 },
      { label: '10 MG (1 Vial)', vialsCount: 1, price: 60.00, pricePerVial: 60.00 }
    ],
    createdAt: '2026-01-24T00:00:00Z'
  },
  {
    id: 'prod-mazdutide',
    name: 'Mazdutide',
    slug: 'mazdutide',
    sku: 'WH-MET-010',
    category: 'metabolic',
    categoryLabel: 'Dual GLP-1 / Glucagon',
    shortDescription: 'Dual GLP-1 and glucagon receptor agonist for metabolic and hepatic lipid balance.',
    description: 'Oxyntomodulin-derived dual agonist targeting both GLP-1 and glucagon receptors to support energy expenditure and metabolic homeostasis.',
    price: 50.00,
    wholesalePrice: 400.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh1qPD-t_R4MR8itc_mT_7w_y4Fd85iBfQD_5ZkNhx9yMitYXxQYJ2YLtysgJr70noE7QQGU9_s5UsWATvnfIocQPjrFMG8M1l_9nwRQB-jT1Jc1U2ucWuREyiQZHkD30I0O39DM8iQmhOhomVxe-kcvh35bDfs8UafWo7QSI3wAjRb1cmRoCXh4DotDMiqVe2qfJg3gc6CZSdNVfAZNmz8PcZI1bk7rSypZ5_jSpRiVrL_KB-Jby6',
    stockQuantity: 85,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #5519-MZ',
    purity: '≥ 99.6%',
    strengths: [
      { label: '5 MG (1 Vial)', vialsCount: 1, price: 50.00, pricePerVial: 50.00 },
      { label: '10 MG (1 Vial)', vialsCount: 1, price: 80.00, pricePerVial: 80.00 }
    ],
    wholesaleStrengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 550.00, pricePerVial: 55.00 }
    ],
    createdAt: '2026-01-25T00:00:00Z'
  },
  {
    id: 'prod-survodutide',
    name: 'Survodutide',
    slug: 'survodutide',
    sku: 'WH-MET-011',
    category: 'metabolic',
    categoryLabel: 'Dual Glucagon / GLP-1',
    shortDescription: 'Dual glucagon/GLP-1 receptor agonist (10MG 10-Vial Kit) for metabolic research.',
    description: 'Potent dual glucagon and GLP-1 receptor agonist supplied as a 10-vial lyophilized kit for advanced metabolic research.',
    price: 700.00,
    wholesalePrice: 700.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsolGHbAioiVo5bIkaxBNt3TPR8Z-5aPb3r8mZYox_grrIqcJWCYUaw0ax9TTBtF101odx1kqkNV76kWVjPHpNBKGsx9ENB4dJYaph06LF-MT_EbuhwiZISLEkHHBzcGgesb-VNUyfp682fBRTqemZyRH3zsjcNLLEodKE_n3NPZpRzuHpEyFFW51q0WOGoIjJg8dc0xWac69Shia8WjiJTPA0bjbjaacBD4II6deKz2wLGuIRec5M',
    stockQuantity: 40,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #6610-SV',
    purity: '≥ 99.6%',
    strengths: [
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 }
    ],
    wholesaleStrengths: [
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 700.00, pricePerVial: 70.00 }
    ],
    createdAt: '2026-01-26T00:00:00Z'
  },
  {
    id: 'prod-eloralintide',
    name: 'Eloralintide',
    slug: 'eloralintide',
    sku: 'WH-MET-012',
    category: 'metabolic',
    categoryLabel: 'Amylin Receptor Agonist',
    shortDescription: 'Selective amylin receptor agonist supplied in 5MG and 10MG 10-vial kits.',
    description: 'Long-acting amylin analog studied for satiety signaling, gastric emptying modulation, and metabolic weight management.',
    price: 450.00,
    wholesalePrice: 450.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsolGHbAioiVo5bIkaxBNt3TPR8Z-5aPb3r8mZYox_grrIqcJWCYUaw0ax9TTBtF101odx1kqkNV76kWVjPHpNBKGsx9ENB4dJYaph06LF-MT_EbuhwiZISLEkHHBzcGgesb-VNUyfp682fBRTqemZyRH3zsjcNLLEodKE_n3NPZpRzuHpEyFFW51q0WOGoIjJg8dc0xWac69Shia8WjiJTPA0bjbjaacBD4II6deKz2wLGuIRec5M',
    stockQuantity: 35,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #7102-EL',
    purity: '≥ 99.5%',
    strengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 450.00, pricePerVial: 45.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 875.00, pricePerVial: 87.50 }
    ],
    wholesaleStrengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 450.00, pricePerVial: 45.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 875.00, pricePerVial: 87.50 }
    ],
    createdAt: '2026-01-27T00:00:00Z'
  },
  {
    id: 'prod-lipo-mino-mix',
    name: 'Lipo Mino Mix',
    slug: 'lipo-mino-mix',
    sku: 'WH-CEL-013',
    category: 'cellular',
    categoryLabel: 'Lipotropic & Amino Complex',
    shortDescription: '244.40mg / 10mL multi-dose vial (10 x 1mL doses or 20 x 0.5mL doses).',
    description: 'Lipotropic MIC (Methionine, Inositol, Choline) + B-vitamin and amino acid complex formulated to support hepatic lipid metabolism and cellular energy.',
    price: 100.00,
    wholesalePrice: 700.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd7d5eg3_68ThJpJZybjIKieTDbZpajK6ta4wsdTf0naBre3-qH63I2AnlFUpveL7aWz3p4m19xIokoMMiGFsHaTomk5TE82SJFK2az5QWdnW-FSn5bH49_cBYN57Ri0XVl1XlUs6inzSTQl9cTmF6ChdM02w52Dvvmla3sO-X8Q_AkWetZU-Fmf_cnXOvoQUfdLk_uIIctKPXUt8Kinkj2_WDJNN6uymZUEc2QQBbFYcJSplHkS3G',
    stockQuantity: 100,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #2440-LM',
    purity: '≥ 99.5%',
    strengths: [
      { label: '244.40mg / 10mL (1 Vial • 10–20 doses)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 }
    ],
    createdAt: '2026-01-28T00:00:00Z'
  },
  {
    id: 'prod-super-shred',
    name: 'Super Shred',
    slug: 'super-shred',
    sku: 'WH-CEL-014',
    category: 'cellular',
    categoryLabel: 'Thermogenic & Metabolic Blend',
    shortDescription: '350.25mg / 10mL high-potency lipotropic & metabolic support vial.',
    description: 'Concentrated 350.25mg/10mL lipotropic, amino acid, and cofactor blend engineered for metabolic rate support and body composition protocols.',
    price: 100.00,
    wholesalePrice: 700.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd7d5eg3_68ThJpJZybjIKieTDbZpajK6ta4wsdTf0naBre3-qH63I2AnlFUpveL7aWz3p4m19xIokoMMiGFsHaTomk5TE82SJFK2az5QWdnW-FSn5bH49_cBYN57Ri0XVl1XlUs6inzSTQl9cTmF6ChdM02w52Dvvmla3sO-X8Q_AkWetZU-Fmf_cnXOvoQUfdLk_uIIctKPXUt8Kinkj2_WDJNN6uymZUEc2QQBbFYcJSplHkS3G',
    stockQuantity: 90,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #3502-SS',
    purity: '≥ 99.5%',
    strengths: [
      { label: '350.25mg / 10mL (1 Vial)', vialsCount: 1, price: 100.00, pricePerVial: 100.00 }
    ],
    createdAt: '2026-01-29T00:00:00Z'
  },
  {
    id: 'prod-mots-c',
    name: 'MOTS-C',
    slug: 'mots-c-activator',
    sku: 'WH-CEL-015',
    category: 'cellular',
    categoryLabel: 'Cellular Energy & Mitochondria',
    shortDescription: 'Mitochondria-encoded peptide stimulating AMPK pathways and metabolic bio-resilience.',
    description: 'Mitochondrial-derived 16-amino-acid peptide that modulates whole-body metabolic homeostasis and stimulates skeletal muscle glucose uptake.',
    price: 30.00,
    wholesalePrice: 300.00,
    imageUrl: '/images/featured-motsc.png',
    stockQuantity: 75,
    status: 'ACTIVE',
    featured: true,
    lotNumber: 'Lot #7729-M',
    purity: '≥ 99.5%',
    strengths: [
      { label: '20 MG (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 },
      { label: '40 MG (10-Vial Kit)', vialsCount: 10, price: 410.00, pricePerVial: 41.00 }
    ],
    wholesaleStrengths: [
      { label: '20 MG (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 },
      { label: '40 MG (10-Vial Kit)', vialsCount: 10, price: 410.00, pricePerVial: 41.00 }
    ],
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'prod-cagrilintide',
    name: 'Cagrilintide',
    slug: 'cagrilintide',
    sku: 'WH-MET-016',
    category: 'metabolic',
    categoryLabel: 'Amylin Receptor Agonist',
    shortDescription: 'Long-acting amylin analog (5MG & 10MG 10-Vial Kits) for satiety and metabolic synergy.',
    description: 'Acylated amylin receptor agonist studied for synergistic appetite regulation alongside GLP-1 pathways.',
    price: 300.00,
    wholesalePrice: 300.00,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh1qPD-t_R4MR8itc_mT_7w_y4Fd85iBfQD_5ZkNhx9yMitYXxQYJ2YLtysgJr70noE7QQGU9_s5UsWATvnfIocQPjrFMG8M1l_9nwRQB-jT1Jc1U2ucWuREyiQZHkD30I0O39DM8iQmhOhomVxe-kcvh35bDfs8UafWo7QSI3wAjRb1cmRoCXh4DotDMiqVe2qfJg3gc6CZSdNVfAZNmz8PcZI1bk7rSypZ5_jSpRiVrL_KB-Jby6',
    stockQuantity: 60,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #3005-CG',
    purity: '≥ 99.6%',
    strengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 475.00, pricePerVial: 47.50 }
    ],
    wholesaleStrengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 475.00, pricePerVial: 47.50 }
    ],
    createdAt: '2026-02-02T00:00:00Z'
  },
  {
    id: 'prod-aod-9604',
    name: 'AOD-9604',
    slug: 'aod-9604',
    sku: 'WH-MET-017',
    category: 'metabolic',
    categoryLabel: 'Lipolytic Peptide Fragment',
    shortDescription: 'C-terminal hGH fragment (10MG 10-Vial Kit) studied for targeted lipolysis.',
    description: 'Modified fragment of human growth hormone (amino acids 176–191) studied for lipolytic activity without impacting IGF-1 or glucose.',
    price: 400.00,
    wholesalePrice: 400.00,
    imageUrl: '/images/featured-motsc.png',
    stockQuantity: 70,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #9604-AO',
    purity: '≥ 99.5%',
    strengths: [
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 }
    ],
    wholesaleStrengths: [
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 }
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
    shortDescription: 'Peptidomimetic (5MG & 10MG 10-Vial Kits) studied for white adipose tissue research.',
    description: 'Proapoptotic peptidomimetic researched for selective targeting of white adipose tissue vasculature.',
    price: 362.50,
    wholesalePrice: 362.50,
    imageUrl: '/images/featured-motsc.png',
    stockQuantity: 45,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #3625-AD',
    purity: '≥ 99.5%',
    strengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 362.50, pricePerVial: 36.25 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 712.50, pricePerVial: 71.25 }
    ],
    wholesaleStrengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 362.50, pricePerVial: 36.25 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 712.50, pricePerVial: 71.25 }
    ],
    createdAt: '2026-02-04T00:00:00Z'
  },
  {
    id: 'prod-5-amino-1mq',
    name: '5-Amino-1MQ',
    slug: '5-amino-1mq',
    sku: 'WH-CEL-019',
    category: 'cellular',
    categoryLabel: 'NNMT Inhibitor & NAD+ Support',
    shortDescription: 'Small-molecule NNMT inhibitor (5MG, 10MG, 50MG 10-Vial Kits) for cellular NAD+ preservation.',
    description: 'Potent nicotinamide N-methyltransferase (NNMT) inhibitor studied for elevating intracellular NAD+ and SAM levels in adipocytes.',
    price: 120.00,
    wholesalePrice: 120.00,
    imageUrl: '/images/featured-motsc.png',
    stockQuantity: 85,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #1205-AM',
    purity: '≥ 99.5%',
    strengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 120.00, pricePerVial: 12.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 162.00, pricePerVial: 16.20 },
      { label: '50 MG (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 }
    ],
    wholesaleStrengths: [
      { label: '5 MG (10-Vial Kit)', vialsCount: 10, price: 120.00, pricePerVial: 12.00 },
      { label: '10 MG (10-Vial Kit)', vialsCount: 10, price: 162.00, pricePerVial: 16.20 },
      { label: '50 MG (10-Vial Kit)', vialsCount: 10, price: 300.00, pricePerVial: 30.00 }
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
    shortDescription: 'AMPK activator (50MG & 100MG 10-Vial Kits) for cellular endurance and glucose uptake.',
    description: '5-Aminoimidazole-4-carboxamide ribonucleotide (AICAR), an endogenous AMPK activator studied for mitochondrial biogenesis and metabolic endurance.',
    price: 200.00,
    wholesalePrice: 200.00,
    imageUrl: '/images/featured-motsc.png',
    stockQuantity: 65,
    status: 'ACTIVE',
    featured: false,
    lotNumber: 'Lot #2004-AI',
    purity: '≥ 99.5%',
    strengths: [
      { label: '50 MG (10-Vial Kit)', vialsCount: 10, price: 200.00, pricePerVial: 20.00 },
      { label: '100 MG (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 }
    ],
    wholesaleStrengths: [
      { label: '50 MG (10-Vial Kit)', vialsCount: 10, price: 200.00, pricePerVial: 20.00 },
      { label: '100 MG (10-Vial Kit)', vialsCount: 10, price: 400.00, pricePerVial: 40.00 }
    ],
    createdAt: '2026-02-06T00:00:00Z'
  }
];

export const INITIAL_PROGRAMS: WellnessProgram[] = [
  {
    id: 'prog-metabolic-reset',
    name: 'The Metabolic Reset Protocol',
    slug: 'metabolic-reset-protocol',
    duration: '12 Weeks',
    category: 'Metabolic Longevity',
    tag: 'Holistic Guided',
    shortDescription: 'A comprehensive clinical weight-loss and visceral fat mitigation system with continuous glucose monitoring and GLP-1 peptide pairing.',
    fullDescription: 'Structured around clinical wellness principles, this 12-week protocol pairs biomarker-calibrated GLP-1 micro-dosing with continuous glucose sensor telemetry, weekly macronutrient timing, and lean muscle mass preservation.',
    priceMonthly: 390.00,
    features: [
      'Baseline and mid-point comprehensive 60-marker venous blood panel',
      '1-on-1 monthly telehealth consults with clinical staff',
      'Personalized peptide titration and leucine-dense nutrition guide',
      'Included Dexcom continuous glucose monitor sensor kit',
      'Cold-chain pharmacy drop-shipping straight to door'
    ],
    status: 'ACTIVE',
    featured: true,
    createdAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'prog-cellular-rejuvenation',
    name: 'Cellular Rejuvenation Journey',
    slug: 'cellular-rejuvenation-journey',
    duration: '16 Weeks',
    category: 'Mitochondrial & Cellular',
    tag: 'Research Track',
    shortDescription: 'Targeted peptide formulations (GHK-Cu, Epithalon, MOTS-c) designed to trigger autophagy, NAD+ recovery, and skin matrix restructuring.',
    fullDescription: 'A premier 16-week epigenetic rejuvenation protocol targeting DNA methylation reversal, mitochondrial respiratory phosphorylation, and total body extracellular matrix renewal.',
    priceMonthly: 540.00,
    features: [
      'Epigenetic DNA methylation biological age testing kit',
      'High-purity lyophilized peptide vials, bacteriostatic water & syringe kit',
      'Mitochondrial respiration & antioxidant micronutrient protocols',
      'Monthly telomere velocity reporting and biological age calibration',
      'Continuous nurse support via encrypted clinical conduit'
    ],
    status: 'ACTIVE',
    featured: true,
    createdAt: '2026-01-12T00:00:00Z'
  },
  {
    id: 'prog-athletic-recovery',
    name: 'Athletic Recovery & Joint Longevity',
    slug: 'athletic-recovery-joint-longevity',
    duration: '8 Weeks',
    category: 'Biomechanics & Movement',
    tag: 'Sports Biology',
    shortDescription: 'Focused on collagen synthesis, micro-tear tissue recovery, and systemic musculoskeletal inflammation for high-performance longevity.',
    fullDescription: 'Designed for endurance athletes, strength competitors, and active executives recovering from acute connective tissue strain, rotator cuff fatigue, or chronic joint wear.',
    priceMonthly: 320.00,
    features: [
      'BPC-157 & TB-500 synergy blend administration protocol',
      'Joint mobility & soft-tissue conditioning plans',
      'Direct asynchronous nurse support via portal',
      'High-speed cold-chain delivery with digital thermometer verification',
      'Customized post-competition re-composition scheduling'
    ],
    status: 'ACTIVE',
    featured: true,
    createdAt: '2026-01-15T00:00:00Z'
  }
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'partner-equinox',
    partnerId: 'WH-P-000001',
    name: 'Equinox Longevity Suite',
    slug: 'equinox-longevity',
    contactPerson: 'Dr. Julian Vance, DO',
    email: 'julian@vancemedical.com',
    phone: '+1 (212) 555-0192',
    description: 'Premier executive performance and longevity suite based in West Village, offering whole-body biometric scans, peptide protocols, and cold-plunge recovery.',
    logoUrl: '',
    website: 'https://equinox.com/longevity',
    category: 'Performance Gym / Fitness Studio',
    address: '97 Greenwich Ave, New York, NY 10014',
    status: 'APPROVED',
    commissionRate: 0.25, // 25%
    memberDiscountRate: 0.15, // 15% VIP member discount
    ownerUid: 'demo-partner-uid-1',
    featuredProducts: ['prod-semaglutide-b12', 'prod-bpc-pure', 'prod-mots-c'],
    createdAt: '2026-01-05T00:00:00Z'
  },
  {
    id: 'partner-harbor-sanctuary',
    partnerId: 'WH-P-000002',
    name: 'Harbor Sanctuary Beverly Hills',
    slug: 'harbor-sanctuary',
    contactPerson: 'Dr. Helena Vance, MD',
    email: 'helena@harborsanctuary.com',
    phone: '+1 (310) 555-0143',
    description: 'Luxury integrative medical spa offering bespoke epigenetic therapies, hyperbaric oxygen, and specialized metabolic protocols.',
    category: 'Medical Spa / Aesthetic Clinic',
    address: '465 N Bedford Dr, Beverly Hills, CA 90210',
    status: 'APPROVED',
    commissionRate: 0.25,
    memberDiscountRate: 0.10,
    ownerUid: 'demo-partner-uid-2',
    featuredProducts: ['prod-ghk-cu', 'prod-stack-collagen', 'prod-nad-plus'],
    createdAt: '2026-01-12T00:00:00Z'
  },
  {
    id: 'partner-soma',
    partnerId: 'WH-P-000003',
    name: 'Soma Longevity & Aesthetics',
    slug: 'soma-longevity',
    contactPerson: 'Jordan Vance',
    email: 'marcus@somawellness.com',
    phone: '+1 (415) 555-0177',
    description: 'Holistic functional medicine clinic in the Presidio, combining cellular biology, peptide compounding, and preventative diagnostics.',
    category: 'Integrative & Functional Medicine',
    address: '220 Presidio Ave, San Francisco, CA 94115',
    status: 'APPROVED',
    commissionRate: 0.25,
    memberDiscountRate: 0.15,
    ownerUid: 'demo-partner-uid-3',
    createdAt: '2026-01-20T00:00:00Z'
  },
  {
    id: 'partner-pacific',
    partnerId: 'WH-P-000004',
    name: 'Pacific Athletic Performance Institute',
    slug: 'pacific-athletic',
    contactPerson: 'Brett Thornton',
    email: 'brett@pacificathletic.com',
    phone: '+1 (619) 555-0188',
    description: 'High-performance athletic conditioning facility training elite swimmers, triathletes, and tactical operators.',
    category: 'High-Performance Coaching',
    address: '1050 N Harbor Dr, San Diego, CA 92101',
    status: 'PENDING',
    commissionRate: 0.25,
    memberDiscountRate: 0.10,
    createdAt: '2026-03-01T00:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'WH-ORD-2026-1001',
    customerUid: 'cust-sarah-m',
    customerName: 'Sarah Miller',
    customerEmail: 'sarah.miller@example.com',
    shippingAddress: {
      fullName: 'Sarah Miller',
      addressLine1: '340 W 11th St, Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10014',
      country: 'USA'
    },
    items: [
      {
        productId: 'prod-bpc-pure',
        productName: 'BPC-157 Pure',
        productSlug: 'bpc-157-pure',
        selectedStrength: { label: '10mg (10 vials)', vialsCount: 10, price: 150.00, pricePerVial: 15.00 },
        unitPrice: 150.00,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoByVsRHp4-nKVyA7uA-WF1tRyh47MFGvlMhLc1bk1fY1kKwPtuDOiCD7GeZuxm9hUxl3NvuLNrspRvozF2ELw_0r-pabzIFm5eyYD1pTHV-j1_ihSxA3ygi7g-MhiHGaloqZvX6lNmMPzn0M8BvPkflHwQE3o0piBkknbvGWn7DghezRRyYlhkBWA1yqEPPjMsnJwmCPOgUWKyXk75HkHnH3dasYhkt83YnHSG-3OGLOlj3cR_3FG'
      }
    ],
    subtotal: 150.00,
    volumeDiscount: 0,
    partnerDiscount: 22.50, // 15% Equinox VIP discount
    shipping: 15.00,
    tax: 11.45,
    total: 153.95,
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    partnerId: 'partner-equinox',
    partnerSlug: 'equinox-longevity',
    partnerName: 'Equinox Longevity Suite',
    referralSource: 'Equinox QR Stand #04',
    partnerCommission: 31.88, // 25% of eligible net sales ($127.50)
    commissionStatus: 'APPROVED',
    trackingNumber: 'FDX-99420-1882',
    coldChainLogged: true,
    createdAt: '2026-03-28T14:32:00Z'
  },
  {
    id: 'ord-1002',
    orderNumber: 'WH-ORD-2026-1002',
    customerUid: 'cust-david-k',
    customerName: 'David Kim',
    customerEmail: 'david.kim@example.com',
    shippingAddress: {
      fullName: 'David Kim',
      addressLine1: '88 Franklin St',
      city: 'New York',
      state: 'NY',
      postalCode: '10013',
      country: 'USA'
    },
    items: [
      {
        productId: 'prod-mots-c',
        productName: 'MOTS-C Activator',
        productSlug: 'mots-c-activator',
        selectedStrength: { label: '20mg / 10 Vials', vialsCount: 10, price: 285.00, pricePerVial: 28.50 },
        unitPrice: 285.00,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTtrGrSksEuZXJiGZCSWBuUxnJ-YC2P8w4VWao6AJygFcvxXNd3sU3_Lx38_JFs_yB4JfU6sz_ZYSjZiA3osRyrHBuqK2XDiCB9BTBZGRNG4WBd5Mu1ZYq5n_BQnwURIeky1KUu9u1yFpWm5cQkzHkJnHlVrNvZHkqmv5E9T7KFNp3-0jAaXWexHzUlImSKNPCFgPaN8zLfPM9udSDcmejxBJZfgNQBoMF_95y2S2B1a9rBGHybcXm'
      }
    ],
    subtotal: 285.00,
    volumeDiscount: 0,
    partnerDiscount: 42.75, // 15% VIP discount
    shipping: 15.00,
    tax: 21.80,
    total: 279.05,
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    partnerId: 'partner-equinox',
    partnerSlug: 'equinox-longevity',
    partnerName: 'Equinox Longevity Suite',
    referralSource: 'Equinox Member Portal',
    partnerCommission: 60.56,
    commissionStatus: 'PENDING',
    trackingNumber: 'FDX-88310-9011',
    coldChainLogged: true,
    createdAt: '2026-04-01T09:15:00Z'
  },
  {
    id: 'ord-1003',
    orderNumber: 'WH-ORD-2026-1003',
    customerUid: 'cust-elena-r',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    shippingAddress: {
      fullName: 'Elena Rostova',
      addressLine1: '9550 Wilshire Blvd',
      city: 'Beverly Hills',
      state: 'CA',
      postalCode: '90212',
      country: 'USA'
    },
    items: [
      {
        productId: 'prod-stack-collagen',
        productName: 'Glow & Rebuild Collagen Matrix',
        productSlug: 'glow-rebuild-collagen-matrix',
        selectedStrength: { label: 'Complete Dermal Kit', vialsCount: 20, price: 410.00 },
        unitPrice: 410.00,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRpTWQqHwr7RSmFlJUpyiHY-OW2byBZUFc_OeYqhEj-uh1GW3Y9QBm7EkI9BNxCPz2IUkSUfvisRgSeRsA-tR_sxSOr9dzU1xgQ1vhwCciAaRz7lfGNT9NN8XKlhWfln_UFz5RqnVWitDXDTsavX-ET--3pn4jY35MwkF9ZQcd2YzYDYtHcZmtSAeNt9vSIMqRURXJcYqWeFC8dqYyM52Q9qsNA8MqJ0f9ivlrZI9ENGBHmmd7y7sW'
      },
      {
        productId: 'prod-nad-plus',
        productName: 'NAD+ Solution',
        productSlug: 'nad-plus-solution',
        selectedStrength: { label: '500mg Lyophilized', vialsCount: 1, price: 195.00, pricePerVial: 195.00 },
        unitPrice: 195.00,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd7d5eg3_68ThJpJZybjIKieTDbZpajK6ta4wsdTf0naBre3-qH63I2AnlFUpveL7aWz3p4m19xIokoMMiGFsHaTomk5TE82SJFK2az5QWdnW-FSn5bH49_cBYN57Ri0XVl1XlUs6inzSTQl9cTmF6ChdM02w52Dvvmla3sO-X8Q_AkWetZU-Fmf_cnXOvoQUfdLk_uIIctKPXUt8Kinkj2_WDJNN6uymZUEc2QQBbFYcJSplHkS3G'
      }
    ],
    subtotal: 605.00,
    volumeDiscount: 30.25, // 5% for 2 kits
    partnerDiscount: 60.50, // 10% Harbor Sanctuary discount
    shipping: 0, // Free cold-chain for $500+
    tax: 46.28,
    total: 560.53,
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    partnerId: 'partner-harbor-sanctuary',
    partnerSlug: 'harbor-sanctuary',
    partnerName: 'Harbor Sanctuary Beverly Hills',
    referralSource: 'Studio Dedicated Link',
    partnerCommission: 128.56,
    commissionStatus: 'APPROVED',
    trackingNumber: 'FDX-77401-2290',
    coldChainLogged: true,
    createdAt: '2026-03-30T17:40:00Z'
  },
  {
    id: 'ord-1004',
    orderNumber: 'WH-ORD-2026-1004',
    customerUid: 'cust-marcus-t',
    customerName: 'Marcus Turner',
    customerEmail: 'marcus.turner@example.com',
    shippingAddress: {
      fullName: 'Marcus Turner',
      addressLine1: '120 Ocean Ave',
      city: 'Santa Monica',
      state: 'CA',
      postalCode: '90401',
      country: 'USA'
    },
    items: [
      {
        productId: 'prod-semaglutide-b12',
        productName: 'Semaglutide + B12',
        productSlug: 'semaglutide-b12',
        selectedStrength: { label: '5mg / 10 Vials', vialsCount: 10, price: 145.00, pricePerVial: 14.50 },
        unitPrice: 145.00,
        quantity: 2,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADEFpNHAfbtXYTf9IUAD6Lv4Me4RgEOttQbBtQl-C8vAhlbtvno3moBfNSAAH06nV5MePh5kfGEHibARbJDztHKFwho-619QqKlsUV0yIPczT-_q0zUMu-CwkWGdvUFwtE0YJiLp_VYzeppKjHWQ4U6i4hhI8WXY2oWe05edrgBsv_5tUYojW09O80oyhtNRHcsbHO7uz7gtuIoiePCC7Pr9YbFYr9C8NBFM9DYuX-1sp2SnK0iolq'
      }
    ],
    subtotal: 290.00,
    volumeDiscount: 14.50, // 5% for 2 kits
    partnerDiscount: 0, // Direct organic customer
    shipping: 15.00,
    tax: 24.80,
    total: 315.30,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    commissionStatus: 'NONE',
    trackingNumber: 'FDX-66100-3301',
    coldChainLogged: true,
    createdAt: '2026-04-03T11:20:00Z'
  }
];

export const INITIAL_EARNINGS: PartnerEarning[] = [
  {
    id: 'earn-101',
    partnerId: 'partner-equinox',
    partnerSlug: 'equinox-longevity',
    orderId: 'ord-1001',
    orderNumber: 'WH-ORD-2026-1001',
    customerName: 'Sarah Miller',
    grossSales: 150.00,
    eligibleSales: 127.50,
    commissionRate: 0.25,
    earningAmount: 31.88,
    status: 'APPROVED',
    createdAt: '2026-03-28T14:32:00Z'
  },
  {
    id: 'earn-102',
    partnerId: 'partner-equinox',
    partnerSlug: 'equinox-longevity',
    orderId: 'ord-1002',
    orderNumber: 'WH-ORD-2026-1002',
    customerName: 'David Kim',
    grossSales: 285.00,
    eligibleSales: 242.25,
    commissionRate: 0.25,
    earningAmount: 60.56,
    status: 'PENDING',
    createdAt: '2026-04-01T09:15:00Z'
  },
  {
    id: 'earn-103',
    partnerId: 'partner-harbor-sanctuary',
    partnerSlug: 'harbor-sanctuary',
    orderId: 'ord-1003',
    orderNumber: 'WH-ORD-2026-1003',
    customerName: 'Elena Rostova',
    grossSales: 605.00,
    eligibleSales: 514.25,
    commissionRate: 0.25,
    earningAmount: 128.56,
    status: 'APPROVED',
    createdAt: '2026-03-30T17:40:00Z'
  }
];

export const INITIAL_ARTICLES: EducationalArticle[] = [
  {
    id: 'art-reconstitution',
    title: 'The Reconstitution & Cold-Chain Protocol',
    slug: 'reconstitution-cold-chain-protocol',
    category: 'Clinical Protocol',
    readTime: '8 Min Read',
    summary: 'A sterile step-by-step checklist on bacteriostatic water ratios, temperature control, and proper syringe calibration.',
    content: `
### Principles of Peptide Reconstitution

Peptide molecules are delicate chains of amino acids connected by fragile peptide bonds. Improper reconstitution can shear these chains, leading to reduced biological potency.

#### Step 1: Cold Chain Verification
Upon receiving your bio-thermo insulated packaging, verify the cold-chain temperature indicator. The lyophilized vials must feel cold to the touch and the integrity seal intact.

#### Step 2: Sterile Preparation
1. Clean your surface thoroughly with 70% isopropyl alcohol.
2. Wipe the rubber stopper of both the bacteriostatic water vial and the peptide vial with fresh alcohol swabs.
3. Allow the alcohol to air-dry completely (approx. 30 seconds).

#### Step 3: Gentle Dilution
1. Draw the recommended volume of bacteriostatic 0.9% benzyl alcohol saline (typically 1.0 mL to 2.0 mL depending on target concentration).
2. Angle the needle against the inner glass wall of the peptide vial.
3. Allow the liquid to trickle slowly down the glass wall. **Never spray directly onto the lyophilized powder.**
4. Swirl gently in slow horizontal motions. **Do not shake violently.** Shaking causes mechanical foaming that denatures peptides.

#### Step 4: Storage Parameters
- Store reconstituted solution in the refrigerator at **2°C – 8°C (36°F – 46°F)**.
- Keep away from light in the provided dark amber casing.
- Most reconstituted peptides remain biologically potent for 28 to 35 days when maintained at optimal cold-chain temperature.
    `,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl1iMhWOeIGPZBpHM6sUOlHQYW0NfMzztOVtFAhwozTFwqtIgW1eqJDHbBUsGBNgRZ2TK82pSuZ_Xw37KVYVYqx0Rqb_lpBaKMs3x0eOEUlhaEQtbPjpRfrMKjhqS6ya53uCBvlwtXH9INnMzY5wGNPFPOTOgE-iOL_nyomjSB5JD_v8UKSEtRRO2n_ITPK7zGz2USRw5RW21NfhGwhoe1M44SVMHkVKMf33iZNeqpbJ_1oGKmLSNc',
    author: 'Dr. Julian Vance, DO',
    status: 'PUBLISHED',
    createdAt: '2026-02-15T00:00:00Z'
  },
  {
    id: 'art-glp1-lean-mass',
    title: 'GLP-1 Optimization & Lean Mass Protection',
    slug: 'glp-1-optimization-lean-mass',
    category: 'Metabolic Nutrition',
    readTime: '12 Min Read',
    summary: 'How to structure high-density leucine intake and micronutrients to avoid lean muscle catabolism during active weight management.',
    content: `
### Balancing Rapid Adipose Loss with Muscle Preservation

During potent GLP-1 receptor agonism, appetite suppression can dramatically decrease total daily caloric and protein intake. If unmonitored, up to 35% of lost weight can come from lean structural muscle and bone mineral density.

#### Key Strategies:
1. **Target Protein Floor:** Maintain a minimum intake of 1.6g to 2.0g of high-quality protein per kilogram of ideal body mass.
2. **Leucine Threshold:** Ensure each meal provides at least 2.5g to 3.0g of free leucine to stimulate mammalian target of rapamycin (mTORC1) muscle protein synthesis.
3. **Resistance Training Stimulus:** Minimum 3 weekly progressive overload sessions to send strong mechanical retention signals to neuromuscular receptors.
    `,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvis2obR9kk4TcpsQkAvVdtWK973ZEKO5gwBg88HxfZ6FWIPTO8NscShdTxev_IqgffcJZwDBaMtI8ixlRMTSqfehqFYXfMuLkBAkR6aShnoojHsckIqUQ6wmb4ipPFuYNP0u_2DD3KyLQuX_a22jJhfDTHGloV-91JnTruoabCX2amwb4CUgbM-4uGDaBNUmMTUjrsn2IWxX4Px5vgGTfTZ6HQK-AevqubdIrotEZzbG1OMNTRUNT',
    author: 'Dr. Helena Vance, MD',
    status: 'PUBLISHED',
    createdAt: '2026-02-20T00:00:00Z'
  },
  {
    id: 'art-biomarkers-cellular-age',
    title: 'Deciphering Cellular Age & Inflammatory Markers',
    slug: 'deciphering-cellular-age-inflammatory-markers',
    category: 'Diagnostics',
    readTime: '10 Min Read',
    summary: 'Understanding your hs-CRP, fasting insulin, and IGF-1 levels to pinpoint true biological wear versus chronological age.',
    content: `
### Biomarkers That Truly Predict Longevity

Chronological age merely measures trips around the sun. Biological age reflects cumulative cellular senescence, systemic endothelial inflammation, and mitochondrial decline.

#### Vital Biomarkers Measured at Whole Harbor:
- **High-Sensitivity C-Reactive Protein (hs-CRP):** Goal < 0.5 mg/L. Indicates silent vascular and systemic inflammation.
- **Fasting Insulin & HOMA-IR:** Goal fasting insulin < 5.0 uIU/mL. The earliest indicator of metabolic inflexibility.
- **ApoB (Apolipoprotein B):** Particle count of all atherogenic lipoproteins. Optimal longevity target < 60 mg/dL.
- **Insulin-Like Growth Factor 1 (IGF-1):** Needs delicate balance—sufficient for lean mass and tissue repair, but kept from excessive elevation which accelerates senescence.
    `,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlqV1fL4va9ua1fjn0h5BM2IM-ge3AHkvCOZlSKhf1VWGm-gxNXWuVmwGFzeUwe8kIyu8nSWD3R7jzXUyRtQSjbGtAJPgnUg8f2QQjHoESUOD0Cgc637PNuduoQyj9Roi0RkzDwM2Q-NGPy1jh8mxMOm-YfmeelSTd2HfF1B3SQoto7P57Mt3iJnJeegTff_rYZnBTMX_mPjCd18YKIxkKT8eRT0sIO3Tqm8vwPpf9w47HwpCQfGHi',
    author: 'Jordan Vance',
    status: 'PUBLISHED',
    createdAt: '2026-03-01T00:00:00Z'
  }
];

export const INITIAL_FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How are Whole Harbor peptides synthesized and verified?',
    answer: 'Every peptide batch is synthesized in an FDA-registered, cGMP compliant facility. Batches undergo independent High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry testing to verify identity and confirm >99.4% active purity. A certificate of analysis (COA) is published with every lot.',
    category: 'Formulations & Purity',
    orderIndex: 1
  },
  {
    id: 'faq-2',
    question: 'What is the cold-chain shipping guarantee?',
    answer: 'All orders containing lyophilized or reconstituted formulations are packed in medical-grade insulated bio-thermo containers with phase-change cold packs. We utilize express FedEx overnight or 2-day priority air with digital thermal indicators to guarantee transit temperature remains between 2°C and 8°C.',
    category: 'Shipping & Delivery',
    orderIndex: 2
  },
  {
    id: 'faq-3',
    question: 'How does the Partner System work for gyms and clinics?',
    answer: 'Approved partners receive a dedicated co-branded portal (/partner/your-name), marketing QR counter displays, and tiered wholesale pricing. When your members or patients order through your link, they receive a VIP discount (e.g. 15%) while your practice earns transparent 25% commissions deposited bi-weekly via direct ACH.',
    category: 'Partnerships',
    orderIndex: 3
  },
  {
    id: 'faq-4',
    question: 'Do patients require a doctor consultation before starting?',
    answer: 'Yes. Every clinical protocol and prescription-grade formulation includes an asynchronous telemedicine intake reviewed by our licensed integrative medical board. Clients also receive access to dedicated customer support and verified educational materials.',
    category: 'Clinical Governance',
    orderIndex: 4
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Jordan Vance',
    role: 'Wellness Studio Director',
    organization: 'Whole Harbor Cohort Member',
    quote: 'Whole Harbor has completely replaced my fragmented stack of wellness apps, peptide suppliers, and functional labs. Having my CGM, biomarker telemetry, and batch testing in a single beautiful dashboard has transformed how I manage my cellular health.',
    rating: 5,
    verified: true,
    featured: true
  },
  {
    id: 'test-2',
    name: 'Dr. Helena Vance, MD',
    role: 'Medical Director',
    organization: 'Harbor Sanctuary Beverly Hills',
    quote: 'Whole Harbor transformed our clinic’s regenerative offerings in less than 30 days. Our patient retention is at 99.4% and the cold-chain verification gives us absolute clinical confidence.',
    rating: 5,
    verified: true,
    featured: true
  },
  {
    id: 'test-3',
    name: 'David Kim',
    role: 'Executive Member',
    organization: 'Equinox Longevity Suite',
    quote: 'The MOTS-c and NAD+ protocol took my afternoon brain fog down to zero. The reconstitution guide on the platform made administering it completely intuitive.',
    rating: 5,
    verified: true,
    featured: true
  }
];
