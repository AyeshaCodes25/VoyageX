/* ============================================================
   DESTINATION DATA — curated, static reference set for Explorer.
   Not user data; lives separately from VX storage.
   ============================================================ */

const DESTINATIONS = [
  { name: 'Japan', flag: '🇯🇵', lat: 36.2048, lon: 138.2529, blurb: 'Neon cities give way to quiet temples and slow train rides through the mountains.', bestMonths: 'Mar–May, Oct–Nov', budget: '$120–220/day', currency: 'JPY', attractions: ['Shibuya Crossing', 'Fushimi Inari', 'Mount Fuji', 'Arashiyama Bamboo Grove'] },
  { name: 'Italy', flag: '🇮🇹', lat: 41.8719, lon: 12.5674, blurb: 'Layers of history under a Mediterranean sun — ruins, coastlines, and long dinners.', bestMonths: 'Apr–Jun, Sep–Oct', budget: '$90–180/day', currency: 'EUR', attractions: ['Colosseum', 'Amalfi Coast', 'Venice Canals', 'Uffizi Gallery'] },
  { name: 'Turkey', flag: '🇹🇷', lat: 38.9637, lon: 35.2433, blurb: 'Where two continents meet — bazaars, hot air balloons, and Aegean coastline.', bestMonths: 'Apr–May, Sep–Oct', budget: '$50–110/day', currency: 'TRY', attractions: ['Hagia Sophia', 'Cappadocia', 'Pamukkale', 'Grand Bazaar'] },
  { name: 'Pakistan', flag: '🇵🇰', lat: 30.3753, lon: 69.3451, blurb: 'From Mughal architecture to some of the highest mountain roads on Earth.', bestMonths: 'Mar–May, Sep–Oct', budget: '$30–70/day', currency: 'PKR', attractions: ['Hunza Valley', 'Badshahi Mosque', 'Fairy Meadows', 'Lahore Fort'] },
  { name: 'France', flag: '🇫🇷', lat: 46.2276, lon: 2.2137, blurb: 'Paris anchors it, but the countryside — Provence, the Loire — is where it breathes.', bestMonths: 'Apr–Jun, Sep–Oct', budget: '$100–200/day', currency: 'EUR', attractions: ['Eiffel Tower', 'Louvre', 'Loire Valley Châteaux', 'French Riviera'] },
  { name: 'UAE', flag: '🇦🇪', lat: 23.4241, lon: 53.8478, blurb: 'Desert meets skyline — a stopover city that became a destination in its own right.', bestMonths: 'Nov–Mar', budget: '$110–250/day', currency: 'AED', attractions: ['Burj Khalifa', 'Dubai Desert Safari', 'Sheikh Zayed Mosque', 'Dubai Marina'] },
  { name: 'Thailand', flag: '🇹🇭', lat: 15.8700, lon: 100.9925, blurb: 'Temples, street food, and islands — built for both budget and slow travel.', bestMonths: 'Nov–Feb', budget: '$35–80/day', currency: 'THB', attractions: ['Grand Palace', 'Phi Phi Islands', 'Chiang Mai Temples', 'Floating Markets'] },
  { name: 'Indonesia', flag: '🇮🇩', lat: -0.7893, lon: 113.9213, blurb: 'Bali gets the postcards, but the archipelago runs far deeper than that.', bestMonths: 'Apr–Oct', budget: '$30–75/day', currency: 'IDR', attractions: ['Ubud Rice Terraces', 'Uluwatu Temple', 'Komodo Island', 'Borobudur'] },
  { name: 'Spain', flag: '🇪🇸', lat: 40.4637, lon: -3.7492, blurb: 'Gaudí\'s Barcelona, flamenco in the south, and tapas everywhere in between.', bestMonths: 'Apr–Jun, Sep–Oct', budget: '$80–160/day', currency: 'EUR', attractions: ['Sagrada Familia', 'Alhambra', 'Park Güell', 'Ibiza'] },
  { name: 'Maldives', flag: '🇲🇻', lat: 3.2028, lon: 73.2207, blurb: 'Overwater villas and reef diving — the archetypal honeymoon destination.', bestMonths: 'Nov–Apr', budget: '$250–600/day', currency: 'MVR', attractions: ['Overwater Bungalows', 'Coral Reef Diving', 'Sandbank Picnics', 'Manta Point'] },
];
