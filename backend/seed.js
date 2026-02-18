// Seed script: 5 users (10 items each) + 1 admin user
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcrypt');

const adapter = new PrismaBetterSqlite3({ url: 'dev.db' });
const prisma = new PrismaClient({ adapter });

const users = [
    { email: 'admin@toyshare.com', name: 'Адмін Тарас', city: 'Київ', phone: '+380501234567', role: 'ADMIN' },
    { email: 'olena@example.com', name: 'Олена Петренко', city: 'Львів', phone: '+380671112233' },
    { email: 'ivan@example.com', name: 'Іван Коваленко', city: 'Одеса', phone: '+380932223344' },
    { email: 'maria@example.com', name: 'Марія Шевченко', city: 'Харків', phone: '+380503334455' },
    { email: 'dmytro@example.com', name: 'Дмитро Бондар', city: 'Дніпро', phone: '+380674445566' },
    { email: 'anna@example.com', name: 'Анна Мельник', city: 'Київ', phone: '+380935556677' },
];

const categories = ['Іграшки', 'Одяг', 'Книги', 'Електроніка', 'Спорт'];
const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];
const genders = ['BOY', 'GIRL', 'UNISEX'];
const ages = ['0-1', '1-3', '3-5', '5-7', '7-10', '10+'];
const types = ['Іграшка', 'Одяг', 'Книга', 'Настільна гра', 'Конструктор'];

const toyItems = [
    { title: 'LEGO Duplo Поїзд', description: 'Яскравий конструктор для малюків від 2 років. 59 деталей, легко збирається.' },
    { title: 'Плюшевий ведмедик', description: 'М\'який ведмедик 40 см, коричневий, в ідеальному стані.' },
    { title: 'Дитяча кухня', description: 'Ігрова кухня з аксесуарами: каструлі, тарілки, прибори. Висота 80 см.' },
    { title: 'Пазл "Карта світу"', description: 'Пазл на 100 деталей для дітей від 5 років. Розвиває логіку.' },
    { title: 'Машинка Hot Wheels', description: 'Металева машинка Hot Wheels, колекційна серія.' },
    { title: 'Лялька Барбі', description: 'Лялька Барбі з набором одягу та аксесуарів.' },
    { title: 'Настільна гра "Монополія"', description: 'Класична Монополія для всієї сім\'ї. Повний комплект.' },
    { title: 'Мʼяч футбольний Nike', description: 'Дитячий футбольний мʼяч, розмір 4, для дітей 8-12 років.' },
    { title: 'Книга "Гаррі Поттер"', description: 'Гаррі Поттер і філософський камінь, українською мовою.' },
    { title: 'Набір для малювання', description: 'Набір фломастерів, олівців та фарб. 120 предметів у валізці.' },
    { title: 'Робот-трансформер', description: 'Трансформер Optimus Prime, висота 25 см, рухомі деталі.' },
    { title: 'Дитячий велосипед', description: 'Велосипед 16" для дітей 4-6 років, з додатковими колесами.' },
    { title: 'Конструктор Магнітний', description: 'Магнітний конструктор 64 деталі. Розвиває просторове мислення.' },
    { title: 'Іграшковий динозавр', description: 'Тиранозавр Рекс з звуковими ефектами, 35 см.' },
    { title: 'Дитяча куртка Zara', description: 'Зимова куртка для хлопчика, розмір 122, синього кольору.' },
    { title: 'Набір Playmobil', description: 'Пожежна станція Playmobil з 3 фігурками та машиною.' },
    { title: 'Скейтборд дитячий', description: 'Скейтборд для початківців, до 50 кг, яскравий дизайн.' },
    { title: 'Коляска для ляльок', description: 'Рожева коляска для ляльок, складна, з козирком.' },
    { title: 'Ксилофон дерев\'яний', description: 'Музичний ксилофон з 8 нотами, дерев\'яний, для малюків від 1 року.' },
    { title: 'Nerf бластер Elite', description: 'Бластер Nerf з 10 м\'якими патронами, дальність до 20 м.' },
    { title: 'Дитячий рюкзак', description: 'Рюкзак для дошкільника з зображенням динозавра.' },
    { title: 'Набір лікаря', description: 'Ігровий набір лікаря з 12 інструментами у валізці.' },
    { title: 'Самокат Micro Mini', description: 'Самокат для дітей 2-5 років, до 20 кг, 3 колеса.' },
    { title: 'Конструктор LEGO City', description: 'Поліцейська дільниця LEGO City, 743 деталі, 6+ років.' },
    { title: 'Дитячий планшет', description: 'Навчальний планшет для дітей 3-7 років, 50 вікторин.' },
    { title: 'Дошка для малювання', description: 'Магнітна дошка для малювання, двостороння, з маркерами.' },
    { title: 'Гра "Дженга"', description: 'Класична Дженга, 54 дерев\'яних блоки. Для всієї сім\'ї.' },
    { title: 'Мʼяч баскетбольний', description: 'Дитячий баскетбольний мʼяч, розмір 5, для дітей 7-12 років.' },
    { title: 'Кукольний будинок', description: 'Дерев\'яний кукольний будинок, 3 поверхи, з меблями.' },
    { title: 'Набір Play-Doh', description: 'Набір пластиліну Play-Doh, 12 кольорів з формочками.' },
    { title: 'Водяний пістолет', description: 'Великий водяний пістолет з ємністю 1 л, дальність 8 м.' },
    { title: 'Казки народів світу', description: 'Збірка казок для дітей від 4 років, 256 сторінок, ілюстрована.' },
    { title: 'Настільний хокей', description: 'Настільна гра в хокей зі штангами, 50x30 см.' },
    { title: 'Дитячі ролики', description: 'Розсувні ролики, розмір 30-33, з захистом.' },
    { title: 'Іграшкова залізниця', description: 'Дерев\'яна залізниця з мостом і 3 вагонами.' },
    { title: 'Дитяча палатка', description: 'Ігрова палатка-вігвам, висота 120 см, бавовна.' },
    { title: 'Кубик Рубіка 3x3', description: 'Класичний кубик Рубіка для дітей від 6 років.' },
    { title: 'Набір Бейблейд', description: 'Бейблейд арена з 2 вовчками та пусковими механізмами.' },
    { title: 'Маска супергероя', description: 'Маска Людини-павука зі світловими ефектами.' },
    { title: 'Дитяча гітара', description: 'Дерев\'яна укулеле для дітей, 4 струни, 53 см.' },
    { title: 'Інтерактивний хомʼяк', description: 'Плюшевий хомʼяк, що повторює слова. Працює від батарейок.' },
    { title: 'Набір для випікання', description: 'Дитячий набір для випічки: формочки, качалка, фартух.' },
    { title: 'Танк на радіоуправлінні', description: 'Танк на пульті, стріляє м\'якими кульками, камуфляж.' },
    { title: 'Дитячі навушники', description: 'Навушники з обмеженням гучності до 85 дБ. Для дітей.' },
    { title: 'Гра "UNO"', description: 'Карткова гра UNO, оригінал Mattel, від 7 років.' },
    { title: 'Дитяча парасолька', description: 'Парасолька з динозаврами, автоматична, 8 спиць.' },
    { title: 'Мʼяка іграшка Пікачу', description: 'Плюшевий Пікачу 30 см, офіційний мерч Покемон.' },
    { title: 'Космічний корабель', description: 'Збірна модель космічного корабля, світ і звук.' },
    { title: 'Набір для дослідів', description: 'Хімічні досліди для дітей 8+. 30 безпечних експериментів.' },
    { title: 'Дитячий годинник', description: 'Наручний годинник для дитини з підсвіткою, водонепроникний.' },
];

const wishlists = [
    'Конструктор LEGO',
    'Настільну гру',
    'Книжку для дитини',
    'Мʼяч або спорт інвентар',
    'Ляльку або м\'яку іграшку',
    'Одяг для хлопчика 5-7 років',
    'Одяг для дівчинки 3-5 років',
    'Розвиваючу іграшку',
    'Що завгодно цікаве',
    'Конструктор або пазл',
];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log('🧹 Cleaning database...');
    await prisma.rating.deleteMany();
    await prisma.message.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.exchange.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.item.deleteMany();
    await prisma.user.deleteMany();

    console.log('👤 Creating users...');
    const password = await bcrypt.hash('password123', 10);
    const createdUsers = [];

    for (const u of users) {
        const user = await prisma.user.create({
            data: {
                email: u.email,
                password,
                name: u.name,
                city: u.city,
                phone: u.phone,
                role: u.role || 'USER',
                rating: Math.round((3 + Math.random() * 2) * 10) / 10,
            },
        });
        createdUsers.push(user);
        console.log(`  ✅ ${user.name} (${user.email}) — ${user.role}`);
    }

    console.log('\n🧸 Creating items...');
    let itemIdx = 0;
    for (const user of createdUsers) {
        for (let i = 0; i < 10; i++) {
            const itemData = toyItems[itemIdx % toyItems.length];
            await prisma.item.create({
                data: {
                    title: itemData.title,
                    description: itemData.description,
                    condition: pick(conditions),
                    category: pick(categories),
                    gender: pick(genders),
                    age: pick(ages),
                    type: pick(types),
                    wishlist: pick(wishlists),
                    isAvailable: true,
                    ownerId: user.id,
                },
            });
            itemIdx++;
        }
        console.log(`  ✅ 10 items for ${user.name}`);
    }

    console.log(`\n🎉 Done! Created ${createdUsers.length} users and ${itemIdx} items.`);
    console.log(`\n🔑 Admin login: admin@toyshare.com / password123`);
    console.log(`   User logins: olena@example.com / password123 (etc.)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
