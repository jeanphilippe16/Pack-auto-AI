-- Donnees exemple - 15 voitures
INSERT INTO cars (brand, model, year, category, type, price_rental_daily, price_sale, mileage, fuel_type, transmission, seats, image_url, description, features, available) VALUES
('Peugeot', '3008', 2023, 'SUV', 'both', 89, 35900, 12000, 'essence', 'automatique', 5,
'https://images.pexels.com/photos/14121166/pexels-photo-14121166.jpeg?auto=compress&cs=tinysrgb&w=800',
  'SUV compact polyvalent alliant confort et technologie. Interieur premium avec ecran tactile 10 pouces.',
  ARRAY['Ecran tactile', 'Climatisation auto', 'Camera de recul', 'Regulateur de vitesse', 'Sieges chauffants'], true),

('Renault', 'Captur', 2022, 'SUV', 'both', 65, 24900, 25000, 'essence', 'automatique', 5,
  'https://images.pexels.com/photos/32462521/pexels-photo-32462521.jpeg?auto=compress&cs=tinysrgb&w=800',
  'SUV urbain stylise et modulable. Top case amovible et interieur personnalisable.',
  ARRAY['Top case', 'Climatisation', 'Bluetooth', 'Android Auto', 'Capteurs de parking'], true),

('Skoda', 'Kodiaq', 2024, 'SUV', 'both', 110, 42900, 5000, 'diesel', 'automatique', 7,
  'https://images.pexels.com/photos/15194845/pexels-photo-15194845.jpeg?auto=compress&cs=tinysrgb&w=800',
  'SUV familial 7 places spacieux et confortable. Grand coffre et equipements complets.',
  ARRAY['7 places', 'Toit panoramique', 'Navigation GPS', 'Climatisation tri-zone', 'Assistance lane departure'], true),

('Peugeot', '508', 2023, 'Berline', 'both', 79, 32900, 18000, 'hybride', 'automatique', 5,
  'https://images.pexels.com/photos/10358892/pexels-photo-10358892.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Berline hybride elegante et performante. Design audacieux avec conduite semi-autonome.',
  ARRAY['Hybride rechargeable', 'Ecran 12.3 pouces', 'Sieges cuir', 'Ambiance LED', 'Freinage automatique'], true),

('Renault', 'Megane', 2022, 'Berline', 'rental', 55, 0, 30000, 'essence', 'manuelle', 5,
  'https://images.pexels.com/photos/6747188/pexels-photo-6747188.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Berline compacte dynamique et economique. Parfaite pour les deplacements quotidiens.',
  ARRAY['Climatisation', 'Radio DAB', 'Bluetooth', 'Airbags lateraux', 'ABS'], true),

('Volkswagen', 'Passat', 2023, 'Berline', 'sale', 0, 38500, 15000, 'diesel', 'automatique', 5,
  'https://images.pexels.com/photos/14973586/pexels-photo-14973586.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Berline routiere allemande au confort irreprochable. Finition haut de gamme.',
  ARRAY['Chassis adaptatif', 'Sieges ergonomiques', 'Navigation 3D', 'Jante 19 pouces', 'Detection angle mort'], true),

('Peugeot', '208', 2024, 'Citadine', 'both', 45, 19900, 8000, 'essence', 'manuelle', 5,
  'https://images.pexels.com/photos/18471354/pexels-photo-18471354.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Citadine primee pour son design et son agrement de conduite. Compacte et agile.',
  ARRAY['Ecran 7 pouces', 'Climatisation', 'Android Auto', 'Capteurs arriere', 'Regulateur-limitateur'], true),

('Renault', 'Clio', 2023, 'Citadine', 'rental', 42, 0, 20000, 'essence', 'manuelle', 5,
  'https://images.pexels.com/photos/16634642/pexels-photo-16634642.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Citadine populaire et fiable. Consommation reduite et entretien economique.',
  ARRAY['Climatisation', 'Bluetooth', 'USB', 'Airbags', 'Assistance freinage'], true),

('Fiat', '500e', 2024, 'Citadine', 'both', 55, 27900, 3000, 'electrique', 'automatique', 4,
  'https://images.pexels.com/photos/31536334/pexels-photo-31536334.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Citadine electrique iconique et stylee. Autonomie 320 km en WLTP. Zero emissions.',
  ARRAY['Electrique 320km', 'Recharge rapide', 'Ecran 10.25 pouces', 'Connectivite Uconnect', 'Camera 360'], true),

('BMW', 'M4', 2023, 'Sportive', 'rental', 195, 0, 12000, 'essence', 'automatique', 4,
  'https://images.pexels.com/photos/27353884/pexels-photo-27353884.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Sportive haute performance avec moteur 6 cylindres biturbo de 510 ch.',
  ARRAY['510 ch', 'Double embrayage', 'Diff actif M', 'Sieges baquets', 'Echappement M Performance'], true),

('Porsche', '911 Carrera', 2022, 'Sportive', 'rental', 295, 0, 8000, 'essence', 'automatique', 2,
  'https://images.pexels.com/photos/5101216/pexels-photo-5101216.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Iconique 911 avec moteur flat-6 turbo de 385 ch. PDK 8 rapports.',
  ARRAY['Flat-6 turbo', 'PDK 8 rap.', 'PASM', 'Sport Chrono', 'Echappement Sport'], true),

('Renault', 'Kangoo', 2023, 'Utilitaire', 'rental', 55, 0, 22000, 'diesel', 'manuelle', 5,
  'https://images.pexels.com/photos/4391469/pexels-photo-4391469.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Utilitaire compact polyvalent. Volume de charge generieux.',
  ARRAY['Porte coulissante', 'Volume 4m3', 'Climatisation', 'Bluetooth', 'Radar de recul'], true),

('Citroen', 'Berlingo', 2022, 'Utilitaire', 'both', 50, 22900, 28000, 'diesel', 'manuelle', 5,
  'https://images.pexels.com/photos/25956789/pexels-photo-25956789.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Utilitaire confortable et pratique. Modulable avec banquette rabattable.',
  ARRAY['Banquette modulable', 'Suspension progressive', 'Climatisation', 'Ecran tactile', 'Camera de recul'], true),

('Volkswagen', 'Golf SW', 2023, 'Break', 'both', 72, 29500, 16000, 'hybride', 'automatique', 5,
  'https://images.pexels.com/photos/11567718/pexels-photo-11567718.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Break compact hybride avec grand volume de coffre. Consommation reduite.',
  ARRAY['Hybride', 'Coffre 640L', 'Digital Cockpit', 'IQ.LIGHT', 'Travel Assist'], true),

('Tesla', 'Model Y', 2024, 'SUV', 'both', 120, 44990, 2000, 'electrique', 'automatique', 5,
  'https://images.pexels.com/photos/10029873/pexels-photo-10029873.jpeg?auto=compress&cs=tinysrgb&w=800',
  'SUV electrique haute autonomie 533 km. Autopilote et over-the-air updates.',
  ARRAY['Autonomie 533km', 'Autopilot', 'OTA updates', 'Ecran 15 pouces', 'Superchargeur'], true);