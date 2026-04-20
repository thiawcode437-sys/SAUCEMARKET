require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SELLER = {
  phone: '+221771111111',
  email: 'demo@saucemarket.sn',
  name: 'Boutique Demo',
  city: 'Dakar',
  isVerified: true,
};

// 3 produits par catégorie. Prix en FCFA.
const PRODUCTS = [
  // 👕 MODE
  { cat: 'mode', title: 'Boubou grand brodé homme', price: 25000, city: 'Dakar',
    desc: 'Boubou traditionnel 100% coton, broderies faites main. Taille L/XL. Parfait pour Tabaski et cérémonies.',
    img: 'boubou1' },
  { cat: 'mode', title: 'Robe en wax pour femme', price: 18000, city: 'Thiès',
    desc: 'Robe longue en tissu wax authentique, coupe moderne. Tailles 38-44 disponibles. Confection locale.',
    img: 'wax1' },
  { cat: 'mode', title: 'Baskets Nike Air Force (Taille 42)', price: 45000, city: 'Dakar',
    desc: 'Baskets blanches, neuves dans boîte. Achetées à Paris, taille 42. Prix négociable sur place.',
    img: 'nike1' },

  // 📱 TECH
  { cat: 'tech', title: 'Samsung Galaxy A54 128Go', price: 185000, city: 'Dakar',
    desc: 'Téléphone Samsung comme neuf, 6 mois d\'utilisation. 128Go, 8Go RAM. Boîte + chargeur + facture.',
    img: 'samsung1' },
  { cat: 'tech', title: 'iPhone 11 64Go déverrouillé', price: 220000, city: 'Dakar',
    desc: 'iPhone 11 noir, batterie 89%. Parfait état esthétique. Compatible tous opérateurs. Coque + câble inclus.',
    img: 'iphone1' },
  { cat: 'tech', title: 'Casque Bluetooth JBL Tune', price: 28000, city: 'Saint-Louis',
    desc: 'Casque sans fil JBL, autonomie 40h. Neuf sous emballage. Bass puissante, confort longue durée.',
    img: 'jbl1' },

  // 🏠 MAISON
  { cat: 'maison', title: 'Canapé 3 places en cuir', price: 150000, city: 'Dakar',
    desc: 'Canapé 3 places en simili cuir marron. Excellent état, 2 ans d\'usage. Livraison possible Dakar.',
    img: 'canape1' },
  { cat: 'maison', title: 'Ventilateur sur pied Moulinex', price: 28000, city: 'Dakar',
    desc: '3 vitesses, oscillation, télécommande. Neuf sous garantie 1 an. Idéal pour la chaleur.',
    img: 'vent1' },
  { cat: 'maison', title: 'Théière en argent travaillée', price: 80000, city: 'Touba',
    desc: 'Théière traditionnelle en argent, gravures à la main. Pièce unique d\'artisan. Contenance 1.2L.',
    img: 'theiere1' },

  // 💄 BEAUTÉ
  { cat: 'beaute', title: 'Beurre de karité pur 500g', price: 4500, city: 'Kaolack',
    desc: 'Beurre de karité brut, non raffiné, pressé à froid. Fabrication artisanale. Hydrate peau et cheveux.',
    img: 'karite1' },
  { cat: 'beaute', title: 'Huile de baobab 250ml', price: 8000, city: 'Dakar',
    desc: 'Huile de baobab 100% naturelle, bouteille ambre. Anti-âge, régénère la peau. Livraison Dakar gratuite.',
    img: 'baobab1' },
  { cat: 'beaute', title: 'Parfum oud Tabaski 50ml', price: 15000, city: 'Dakar',
    desc: 'Parfum mixte aux notes de oud et ambre. Tenue 12h. Importé Dubaï. Flacon élégant.',
    img: 'parfum1' },

  // 🍲 ALIMENTATION
  { cat: 'alimentation', title: 'Sac de riz parfumé 25kg', price: 18500, city: 'Dakar',
    desc: 'Riz thaï parfumé qualité premium, sac de 25kg scellé. Livraison possible dans tout Dakar.',
    img: 'riz1' },
  { cat: 'alimentation', title: 'Bissap séché 1kg (fleurs)', price: 3500, city: 'Thiès',
    desc: 'Fleurs de bissap séchées au soleil. Récolte 2026. Idéal pour jus et infusions. Sans additif.',
    img: 'bissap1' },
  { cat: 'alimentation', title: 'Café Touba moulu 500g', price: 4000, city: 'Touba',
    desc: 'Café Touba authentique préparé traditionnellement. Mélange café + graines de selim. Arôme intense.',
    img: 'cafe1' },

  // 🛠️ SERVICES
  { cat: 'services', title: 'Cours de français en ligne (1h)', price: 5000, city: 'Dakar',
    desc: 'Enseignant diplômé, 10 ans d\'expérience. Tous niveaux, enfants et adultes. Via WhatsApp ou Zoom.',
    img: 'cours1' },
  { cat: 'services', title: 'Réparation téléphone (écran)', price: 10000, city: 'Dakar',
    desc: 'Changement écran iPhone/Samsung sur place. Pièces d\'origine, garantie 3 mois. Rendez-vous Médina.',
    img: 'repair1' },
  { cat: 'services', title: 'Livraison Dakar en 1h', price: 2000, city: 'Dakar',
    desc: 'Service coursier express. Livraison documents, colis, courses. Moto rapide dans tout Dakar.',
    img: 'livr1' },

  // 🚗 AUTO & MOTO
  { cat: 'auto', title: 'Toyota Corolla 2015 diesel', price: 4500000, city: 'Dakar',
    desc: 'Toyota Corolla berline, 145 000 km, diesel, climatisation. Entretien à jour. Papiers en règle.',
    img: 'toyota1' },
  { cat: 'auto', title: 'Moto Jakarta neuve 125cc', price: 650000, city: 'Dakar',
    desc: 'Moto Jakarta 125cc neuve sous emballage. Facture + carte grise en cours. Garantie constructeur.',
    img: 'moto1' },
  { cat: 'auto', title: 'Pneus 195/65 R15 (lot de 4)', price: 100000, city: 'Rufisque',
    desc: 'Lot de 4 pneus neufs marque Michelin, taille 195/65 R15. Compatible Corolla, Civic, Sentra.',
    img: 'pneu1' },

  // 🏘️ IMMOBILIER
  { cat: 'immobilier', title: 'Studio meublé Plateau / mois', price: 150000, city: 'Dakar',
    desc: 'Studio 30m² entièrement meublé, Plateau. Clim, eau, électricité incluses. Caution 2 mois.',
    img: 'studio1' },
  { cat: 'immobilier', title: 'Villa 4 chambres Almadies / mois', price: 650000, city: 'Dakar',
    desc: 'Villa moderne 4 chambres + piscine, Almadies. Jardin, garage 2 voitures. Quartier sécurisé.',
    img: 'villa1' },
  { cat: 'immobilier', title: 'Terrain 300m² Keur Massar', price: 6000000, city: 'Keur Massar',
    desc: 'Terrain 300m² avec titre foncier, viabilisé. Quartier en développement. Prix négociable.',
    img: 'terrain1' },
];

async function main() {
  // Skip if demo products already exist
  const existingSeller = await prisma.user.findUnique({ where: { phone: SELLER.phone } });
  if (existingSeller) {
    const count = await prisma.product.count({ where: { sellerId: existingSeller.id } });
    if (count >= PRODUCTS.length) {
      console.log(`✓ ${count} produits demo déjà présents — skip.`);
      return;
    }
  }

  console.log('🛍️  Création des produits demo...');

  // 1. Create or get demo seller
  const seller = await prisma.user.upsert({
    where: { phone: SELLER.phone },
    update: {},
    create: { ...SELLER, role: 'SELLER' },
  });

  // 2. Active subscription (required to publish)
  const now = new Date();
  const endsAt = new Date(now.getTime() + 365 * 24 * 3600 * 1000);
  const existingSub = await prisma.subscription.findFirst({
    where: { userId: seller.id, status: 'ACTIVE' },
  });
  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        userId: seller.id,
        plan: 'MONTHLY_1000',
        amount: 1000,
        provider: 'WAVE',
        status: 'ACTIVE',
        startsAt: now,
        endsAt,
        autoRenew: false,
      },
    });
  }

  // 3. Get categories indexed by slug
  const cats = await prisma.category.findMany();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // 4. Create products (skip existing by title)
  let created = 0;
  for (const p of PRODUCTS) {
    const categoryId = catBySlug[p.cat];
    if (!categoryId) {
      console.warn(`  ⚠️  catégorie inconnue : ${p.cat}`);
      continue;
    }
    const existing = await prisma.product.findFirst({
      where: { sellerId: seller.id, title: p.title },
    });
    if (existing) continue;

    await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId,
        title: p.title,
        description: p.desc,
        price: p.price,
        city: p.city,
        status: 'PUBLISHED',
        views: Math.floor(Math.random() * 500),
        images: {
          create: [
            { url: `https://picsum.photos/seed/${p.img}/600/600`, order: 0 },
            { url: `https://picsum.photos/seed/${p.img}b/600/600`, order: 1 },
          ],
        },
      },
    });
    created++;
  }

  console.log(`✅ ${created} produits créés (total ${PRODUCTS.length}).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
