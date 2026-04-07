// QueueFlow API Test Suite
// Run: node tests/api.test.js (requires server to be running on port 3000)

const BASE_URL = 'http://localhost:3000';

async function runTests() {
    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`  ✅ PASS: ${name}`);
            passed++;
        } catch (e) {
            console.log(`  ❌ FAIL: ${name} — ${e.message}`);
            failed++;
        }
    }

    function assert(condition, msg) {
        if (!condition) throw new Error(msg || 'Assertion failed');
    }

    console.log('\n🧪 QueueFlow API Test Suite\n');

    // --- Queue Stats ---
    console.log('📦 Queue Stats');
    await test('GET /api/queue/stats returns 200', async () => {
        const res = await fetch(`${BASE_URL}/api/queue/stats`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
    });

    await test('Stats response has totalTokens field', async () => {
        const res = await fetch(`${BASE_URL}/api/queue/stats`);
        const data = await res.json();
        assert('totalTokens' in data, 'Missing totalTokens');
    });

    // --- Token Generation ---
    console.log('\n🎫 Token Generation');
    let createdTokenId;
    await test('POST /api/queue/token creates a pending token', async () => {
        const res = await fetch(`${BASE_URL}/api/queue/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceType: 'Doctor Consultation', customerName: 'Test User' })
        });
        const data = await res.json();
        assert(res.status === 201, `Expected 201, got ${res.status}`);
        assert(data.status === 'pending', `Expected status 'pending', got '${data.status}'`);
        createdTokenId = data.tokenId;
    });

    // --- Pending Approvals ---
    console.log('\n⏳ Staff Approval');
    await test('GET /api/queue/pending includes our new token', async () => {
        const res = await fetch(`${BASE_URL}/api/queue/pending`);
        const data = await res.json();
        const found = data.find(t => t.tokenId === createdTokenId);
        assert(found, `Token ${createdTokenId} not found in pending list`);
    });

    await test('PATCH /api/queue/approve/:id approves token', async () => {
        const res = await fetch(`${BASE_URL}/api/queue/approve/${createdTokenId}`, { method: 'PATCH' });
        const data = await res.json();
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        assert(data.token.status === 'waiting', `Expected status 'waiting', got '${data.token.status}'`);
    });

    // --- Services ---
    console.log('\n🏥 Services');
    await test('GET /api/services returns array', async () => {
        const res = await fetch(`${BASE_URL}/api/services`);
        const data = await res.json();
        assert(Array.isArray(data), 'Expected array of services');
        assert(data.length > 0, 'Expected at least one service');
    });

    // --- Summary ---
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);
}

runTests();
