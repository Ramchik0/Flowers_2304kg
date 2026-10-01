/* Каталог по умолчанию — работает, пока не подключён Supabase.
   image: путь к фото (например 'images/dahlia.jpg'). Если пусто — рисуется цветок.
   shape: rose | peony | poppy | dahlia | lily | lotus */
window.DEFAULT_PRODUCTS = [
  { title: 'Маки ростовые', category: 'special', shape: 'poppy', color: '#E8473A', is_new: true, description: 'Новый формат маков — в напольной вазе или поштучно.' },
  { title: 'Лотос-светильник', category: 'lotuses', shape: 'lotus', color: '#F4A7B9', is_new: true, description: 'Мягкий тёплый свет. Для спальни и детской.' },
  { title: 'Кувшинка-ночник', category: 'lamps', shape: 'lotus', color: '#FFFFFF', is_new: true, description: 'Полупрозрачные лепестки из изолона.' },
  { title: 'Алый георгин с подсветкой', category: 'lamps', shape: 'dahlia', color: '#E2392B', description: 'Светится изнутри — днём декор, вечером лампа.' },
  { title: 'Коралловый георгин', category: 'special', shape: 'dahlia', color: '#FF7A45', description: 'Глянцевые лепестки, яркий летний цвет.' },
  { title: 'Белая лилия', category: 'floor', shape: 'lily', color: '#F7F1EA', description: 'Торшер с прозрачными лепестками и тычинками.' },
  { title: 'Айвори с золотыми бусинами', category: 'photozones', shape: 'dahlia', color: '#EADBC4', description: 'Для свадебных фотозон и витрин.' },
  { title: 'Фиалка', category: 'special', shape: 'rose', color: '#6B3FA0', description: 'Сочный фиолетовый, глянцевые лепестки.' },
  { title: 'Пион нежно-розовый', category: 'peonies', shape: 'peony', color: '#F2A3B3', description: 'Пышный, многослойный, любого размера.' },
  { title: 'Пион пудровый', category: 'peonies', shape: 'peony', color: '#E9C9C2', description: 'Спокойный оттенок для интерьера.' },
  { title: 'Роза бордовая', category: 'roses', shape: 'rose', color: '#7A1630', description: 'Ростовая роза на устойчивой подставке.' },
  { title: 'Роза-торшер', category: 'floor', shape: 'rose', color: '#F48FA0', description: 'Напольный светильник в форме розы.' }
];
