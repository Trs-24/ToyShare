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

async function main() {
    // Check existing items
    const existing = await request('GET', '/items');
    const existingTitles = new Set(existing.map(i => i.title));
    console.log('Existing items:', existingTitles.size);

    // Get tokens for all users
    const logins = [
        { email: 'oksana@test.com', password: '123456' },
        { email: 'andriy@test.com', password: '123456' },
        { email: 'natalia@test.com', password: '123456' },
        { email: 'oleksandr@test.com', password: '123456' },
        { email: 'iryna@test.com', password: '123456' },
    ];

    const tokens = [];
    for (const l of logins) {
        const r = await request('POST', '/auth/login', l);
        tokens.push(r.access_token);
    }

    // Missing items - avoiding apostrophes
    const missing = [
        // Oksana
        [0, [
            { title: 'Плюшевий ведмедик 40 см', description: 'Затишний ведмедик коричневого кольору. Гіпоалергенний наповнювач, чудовий подарунок для малюка.', condition: 'LIKE_NEW', category: 'М\'які іграшки', gender: 'UNISEX', age: '0-1', type: 'gift' },
            { title: 'Книга Незнайко на Місяці', description: 'Книга у твердій обкладинці з яскравими ілюстраціями. Класика дитячої літератури.', condition: 'LIKE_NEW', category: 'Книги', gender: 'UNISEX', age: '5-8', type: 'gift' },
            { title: 'Набір для малювання 72 предмети', description: 'Художній набір: фарби акварельні, гуаш, пензлі, кольорові олівці та фломастери у валізці.', condition: 'LIKE_NEW', category: 'Творчість', gender: 'UNISEX', age: '3-5', type: 'exchange' },
        ]],
        // Andriy
        [1, [
            { title: 'Дерев яний ляльковий будинок', description: 'Ляльковий будиночок ручної роботи з набором меблів. Три поверхи, висота 60 см.', condition: 'FAIR', category: 'Ляльки', gender: 'GIRL', age: '3-5', type: 'exchange_or_gift' },
            { title: 'Настільна гра Дженга дерев яна', description: 'Класична вежа з деревяних брусків. 54 бруски, оригінальна версія для компанії.', condition: 'GOOD', category: 'Настільні ігри', gender: 'UNISEX', age: '5-8', type: 'exchange' },
        ]],
        // Natalia
        [2, [
            { title: 'Дерев яна залізниця 100 дет', description: 'Великий набір залізниці: рейки, мости, станція, потяг та вагони. Сумісна з BRIO.', condition: 'GOOD', category: 'Ігрові набори', gender: 'UNISEX', age: '3-5', type: 'exchange' },
            { title: 'Кубики Рубіка набір 3 шт', description: 'Три кубики різної складності: 2x2, 3x3, 4x4. Плавне обертання, яскраві наклейки.', condition: 'LIKE_NEW', category: 'Головоломки', gender: 'UNISEX', age: '8-12', type: 'exchange' },
        ]],
        // Oleksandr
        [3, [
            { title: 'Конструктор BRIO деревяний', description: 'Екологічний деревяний конструктор 100 деталей. Натуральне дерево, розвиває уяву та моторику.', condition: 'LIKE_NEW', category: 'Конструктори', gender: 'UNISEX', age: '3-5', type: 'exchange' },
            { title: 'LEGO Friends Будинок дерево', description: 'Набір Лего Френдз 500 деталей. Будиночок на дереві з мініфігурками та аксесуарами.', condition: 'GOOD', category: 'Конструктори', gender: 'GIRL', age: '5-8', type: 'exchange' },
        ]],
        // Iryna
        [4, [
            { title: 'Дитячий електромобіль білий', description: 'Джип на акумуляторі з пультом для батьків, MP3, LED фари. Витримує до 30 кг.', condition: 'FAIR', category: 'Транспорт', gender: 'UNISEX', age: '1-3', type: 'exchange_or_gift' },
        ]],
    ];

    let added = 0;
    for (const [idx, items] of missing) {
        for (const item of items) {
            if (existingTitles.has(item.title)) continue;
            const r = await request('POST', '/items', item, tokens[idx]);
            if (r?.id) { added++; console.log(`  + ${item.title}`); }
            else console.log(`  ✗ ${item.title}:`, JSON.stringify(r).substring(0, 100));
        }
    }

    const final = await request('GET', '/items');
    console.log(`\nДодано: ${added}. Усього: ${final.length}`);
}

main().catch(console.error);
