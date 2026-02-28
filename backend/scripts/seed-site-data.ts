import { PrismaClient, ItemCondition, ExchangeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TARAS_ID = 'e1e2f6eb-47cd-453d-8437-0a85d8b32f2f';

const CLOUDINARY_URLS = {
  board:
    'https://res.cloudinary.com/devx2zrp6/image/upload/v1772276426/toyshare_seed/aixiyfmdyqlfzta4sbyp.png',
  doll: 'https://res.cloudinary.com/devx2zrp6/image/upload/v1772276427/toyshare_seed/tngq9vtiyn1fscbuz2bl.png',
  lego: 'https://res.cloudinary.com/devx2zrp6/image/upload/v1772276428/toyshare_seed/tq2aq3mfxosrqoxqongy.png',
  plush:
    'https://res.cloudinary.com/devx2zrp6/image/upload/v1772276429/toyshare_seed/dgqbplpax5a31lxb6uvn.png',
  rc: 'https://res.cloudinary.com/devx2zrp6/image/upload/v1772276430/toyshare_seed/o2f14w0hc6myjycwo3b2.png',
  stem: 'https://res.cloudinary.com/devx2zrp6/image/upload/v1772276431/toyshare_seed/xwvu2evfio9bu28ki4dm.png',
};

const CATEGORIES = [
  { name: 'LEGO', photo: CLOUDINARY_URLS.lego },
  { name: 'Ляльки', photo: CLOUDINARY_URLS.doll },
  { name: "М'які іграшки", photo: CLOUDINARY_URLS.plush },
  { name: 'Машинки', photo: CLOUDINARY_URLS.rc },
  { name: 'Настільні ігри', photo: CLOUDINARY_URLS.board },
  { name: 'Навчання', photo: CLOUDINARY_URLS.stem },
  { name: 'Пазли', photo: CLOUDINARY_URLS.stem },
  { name: 'Активні ігри', photo: CLOUDINARY_URLS.rc },
  { name: 'Музичні іграшки', photo: CLOUDINARY_URLS.plush },
  { name: 'Творчість', photo: CLOUDINARY_URLS.lego },
];

const USERS_DATA = [
  { name: 'Олена Коваленко', email: 'olena.kov@example.com', city: 'Київ' },
  { name: 'Андрій Петренко', email: 'andriy.p@example.com', city: 'Львів' },
  { name: 'Марина Іванова', email: 'marina.i@example.com', city: 'Одеса' },
  { name: 'Сергій Сидоренко', email: 'sergey.s@example.com', city: 'Дніпро' },
  { name: 'Юлія Мельник', email: 'yulia.m@example.com', city: 'Харків' },
  { name: 'Максим Бондаренко', email: 'max.bond@example.com', city: 'Вінниця' },
  { name: 'Ірина Лисенко', email: 'irina.l@example.com', city: 'Полтава' },
  {
    name: 'Олександр Шевченко',
    email: 'alex.sheva@example.com',
    city: 'Чернігів',
  },
  { name: 'Наталія Кравченко', email: 'natali.k@example.com', city: 'Суми' },
  { name: 'Денис Мороз', email: 'denis.m@example.com', city: 'Рівне' },
];

const TOY_NAMES = [
  'Конструктор Замок',
  'Барбі Русалка',
  'Ведмедик Тедді',
  'Радіокерована Машинка',
  'Монополія',
  'Набір Хіміка',
  'Спідкуб 3х3',
  "Дерев'яний Балансир",
  'Дитячий Ксилофон',
  'Набір для Ліплення',
  'Пожежна Станція LEGO',
  'Домівка для Ляльок',
  'Плюшевий Панда',
  'Трюкова Машина',
  'Шахи',
  'Мікроскоп для дітей',
  'Карта-Пазл Світу',
  'Самокат',
  'Набір Барабанів',
  'Малювання за номерами',
];

const TOY_DESCRIPTIONS = [
  'Чудовий подарунок для розвитку уяви та моторики.',
  'Яскрава іграшка з якісних матеріалів, стан ідеальний.',
  'Майже не гралися, шукаємо нового власника.',
  'Класична іграшка, яка подобається всім дітям.',
  'Набір у повному комплекті, коробка трохи потерта.',
  'Дуже цікава та пізнавальна річ для маленьких дослідників.',
];

async function seed() {
  console.log('🌱 Starting database seeding...');

  const password = await bcrypt.hash('password123', 10);

  const createdUsers: any[] = [];
  for (const userData of USERS_DATA) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password,
        city: userData.city,
        country: 'Україна',
        isEmailVerified: true,
      },
    });
    createdUsers.push(user);
    console.log(`👤 Created user: ${user.name}`);
  }

  for (const user of createdUsers) {
    console.log(`📦 Creating toys for ${user.name}...`);
    for (let i = 0; i < 10; i++) {
      const catIndex = (i + createdUsers.indexOf(user)) % CATEGORIES.length;
      const cat = CATEGORIES[catIndex];
      const toyName = TOY_NAMES[i % TOY_NAMES.length] + ' ' + (i + 1);
      const desc = TOY_DESCRIPTIONS[i % TOY_DESCRIPTIONS.length];

      await prisma.item.create({
        data: {
          title: toyName,
          description: desc,
          condition: ItemCondition.GOOD,
          category: cat.name,
          ownerId: user.id,
          photos: {
            create: {
              url: cat.photo,
            },
          },
        },
      });
    }
  }

  console.log('🤝 Creating exchange requests for Taras...');
  const tarasItems = await prisma.item.findMany({
    where: { ownerId: TARAS_ID },
  });

  // Create 3 incoming requests for Taras
  for (let i = 0; i < 3; i++) {
    const requester = createdUsers[i];
    const requesterItem = await prisma.item.findFirst({
      where: { ownerId: requester.id },
    });
    const requestedItem = tarasItems[i % tarasItems.length];

    if (requesterItem && requestedItem) {
      await prisma.exchange.create({
        data: {
          initiatorId: requester.id,
          receiverId: TARAS_ID,
          itemOfferedId: requesterItem.id,
          itemRequestedId: requestedItem.id,
          status: ExchangeStatus.PROPOSED,
        },
      });
      console.log(`✨ Created proposal from ${requester.name} to Taras`);
    }
  }

  console.log('✅ Seeding finished successfully.');
}

seed()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
