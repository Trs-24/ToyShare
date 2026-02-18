const http = require('http');

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, 'http://localhost:3000');
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: url.hostname, port: url.port, path: url.pathname, method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(body); } });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

const USER = {
    name: 'Тарас Лозовой',
    email: 'taras.lozovoy@test.com',
    password: '123456',
    phone: '+380501112233',
    city: 'Київ',
};

const ITEMS = [
    {
        title: 'Конструктор LEGO City Поліцейська станція',
        description: 'Великий набір LEGO City 743 деталі. Поліцейська станція з вертольотом, машинками та 6 мініфігурками. Повний комплект з інструкцією. Стан чудовий, зібрано лише раз.',
        condition: 'LIKE_NEW',
        category: 'Конструктори',
        gender: 'boy',
        age: '6-12',
        type: 'exchange',
    },
    {
        title: 'Настільна гра Каркассон',
        description: 'Популярна стратегічна настільна гра для всієї родини. Повний комплект: 72 тайли, 40 фігурок, правила. Грали кілька разів, все у відмінному стані.',
        condition: 'LIKE_NEW',
        category: 'Настільні ігри',
        gender: 'unisex',
        age: '6-14',
        type: 'exchange',
    },
    {
        title: 'Самокат Razor A5 Lux срібний',
        description: 'Якісний двоколісний самокат для дітей від 6 років. Алюмінієва рама, великі колеса 200 мм, складний механізм. Є невеликі потертості на деці.',
        condition: 'GOOD',
        category: 'Транспорт',
        gender: 'unisex',
        age: '6-12',
        type: 'exchange',
    },
    {
        title: 'Плюшевий динозавр Рекс 50 см',
        description: 'Великий м\'який динозавр яскраво-зеленого кольору. Гіпоалергенний наповнювач, можна прати в машинці. Чудовий подарунок для маленьких любителів динозаврів.',
        condition: 'LIKE_NEW',
        category: 'М\'які іграшки',
        gender: 'unisex',
        age: '2-8',
        type: 'gift',
    },
    {
        title: 'Набір для дослідів Юний Хімік',
        description: 'Захопливий набір з 40 безпечних хімічних експериментів. Містить реактиви, пробірки, окуляри та детальну інструкцію українською мовою. Ідеально для допитливих дітей.',
        condition: 'LIKE_NEW',
        category: 'Наука',
        gender: 'unisex',
        age: '8-14',
        type: 'exchange',
    },
];

async function main() {
    console.log('🔐 Реєстрація користувача Тарас Лозовой...');

    let result = await request('POST', '/auth/register', USER);
    let token = result?.access_token;

    if (!token) {
        console.log('  Акаунт вже існує, логінимось...');
        result = await request('POST', '/auth/login', { email: USER.email, password: USER.password });
        token = result?.access_token;
    }

    if (!token) {
        console.error('❌ Не вдалось отримати токен:', JSON.stringify(result));
        return;
    }

    console.log(`  ✅ ${USER.name} (${USER.email}) — ${USER.city}`);

    console.log('\n🧸 Створення товарів...');
    let created = 0;
    for (const item of ITEMS) {
        const r = await request('POST', '/items', item, token);
        if (r?.id) {
            created++;
            console.log(`  ✅ ${item.title}`);
        } else {
            console.log(`  ✗ ${item.title}:`, JSON.stringify(r).substring(0, 150));
        }
    }

    console.log(`\n📊 Створено ${created} з ${ITEMS.length} товарів`);
    console.log('\n🎉 Готово!');
    console.log(`\n📋 Дані для входу: ${USER.email} / ${USER.password}`);
}

main().catch(console.error);
