
const fetch = require('node-fetch'); // Ensure node-fetch is available or use built-in fetch in Node 18+

const API_URL = 'http://localhost:3000';

async function request(url, method, token, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${url}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const text = await res.text();
    try {
        return { status: res.status, data: JSON.parse(text) };
    } catch {
        return { status: res.status, data: text };
    }
}

async function main() {
    try {
        console.log('--- Starting Exchange Flow Test ---');

        // 1. Login/Register User 1
        let user1 = await request('/auth/login', 'POST', null, { email: 'test1@example.com', password: 'password123' });
        if (user1.status !== 201 && user1.status !== 200) {
            console.log('Registering User 1...');
            await request('/auth/register', 'POST', null, { email: 'test1@example.com', password: 'password123', name: 'User One' });
            user1 = await request('/auth/login', 'POST', null, { email: 'test1@example.com', password: 'password123' });
        }
        const token1 = user1.data.access_token;
        console.log('User 1 logged in');

        // 2. Login/Register User 2
        let user2 = await request('/auth/login', 'POST', null, { email: 'test2@example.com', password: 'password123' });
        if (user2.status !== 201 && user2.status !== 200) {
            console.log('Registering User 2...');
            await request('/auth/register', 'POST', null, { email: 'test2@example.com', password: 'password123', name: 'User Two' });
            user2 = await request('/auth/login', 'POST', null, { email: 'test2@example.com', password: 'password123' });
        }
        const token2 = user2.data.access_token;
        console.log('User 2 logged in');

        // 3. User 2 creates an item (to be requested)
        const itemRes = await request('/items', 'POST', token2, {
            title: 'Test Item for Exchange',
            description: 'Something to trade',
            condition: 'NEW',
            category: 'Other'
        });
        const itemId = itemRes.data.id;
        console.log('Item created by User 2:', itemId);

        // 4. User 1 proposes exchange
        const exchangeRes = await request('/exchanges', 'POST', token1, {
            requestedItemId: itemId,
            note: 'Let us trade'
        });
        const exchangeId = exchangeRes.data.id;
        console.log('Exchange proposed:', exchangeId);

        // 5. User 2 accepts
        const acceptRes = await request(`/exchanges/${exchangeId}/status`, 'PATCH', token2, { status: 'ACCEPTED' });
        console.log('User 2 Accept Status:', acceptRes.status, acceptRes.data.status);

        // 6. User 2 updates shipping (Triggers IN_PROGRESS)
        const shippingRes = await request(`/exchanges/${exchangeId}/shipping`, 'PATCH', token2, {
            postOffice: 'Post 1',
            meetingDate: new Date().toISOString()
        });
        console.log('Shipping Updated. Status:', shippingRes.data.status); // Should be IN_PROGRESS

        // 7. User 2 confirms completion
        console.log('User 2 confirming completion...');
        const confirm1 = await request(`/exchanges/${exchangeId}/status`, 'PATCH', token2, { status: 'COMPLETED' });
        console.log('User 2 Confirm Response:', confirm1.status, confirm1.data);

        // 8. User 1 confirms completion
        console.log('User 1 confirming completion...');
        const confirm2 = await request(`/exchanges/${exchangeId}/status`, 'PATCH', token1, { status: 'COMPLETED' });
        console.log('User 1 Confirm Response:', confirm2.status, confirm2.data);

        // Check final status
        const finalEx = await request(`/exchanges/${exchangeId}`, 'GET', token1);
        console.log('Final Exchange Status:', finalEx.data.status);
        console.log('InitiatorCompleted:', finalEx.data.initiatorCompleted);
        console.log('ReceiverCompleted:', finalEx.data.receiverCompleted);

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

main();
