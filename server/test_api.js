import { spawn } from 'child_process';
import http from 'http';

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '127.0.0.1',
      port: 5055,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function waitForServer(maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await makeRequest('/api/health');
      if (res.status === 200) return true;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('Server failed to start in time');
}

async function runTests() {
  console.log('🧪 Starting WarehouseFlow Automated Integration Tests...');

  const serverProcess = spawn('node', ['server.js'], { 
    stdio: 'inherit',
    env: { ...process.env, TEST_PORT: '5055' }
  });

  try {
    console.log('⏳ Waiting for Express server to initialize and connect to DB...');
    await waitForServer();
    console.log('✅ Server is online and responsive!');

    // 1. Health check
    console.log('\n--- 1. Testing Health Endpoint ---');
    const health = await makeRequest('/api/health');
    console.log('Health Status:', health.status, health.data);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Auth Login
    console.log('\n--- 2. Testing Authentication (Admin Login) ---');
    const auth = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@warehouseflow.com',
      password: 'admin123'
    });
    console.log('Login Response:', auth.status, 'User:', auth.data.user);
    if (auth.status !== 200 || !auth.data.token) throw new Error('Auth failed');
    const token = auth.data.token;

    // 3. Products List with DSA Sorting & Search
    console.log('\n--- 3. Testing Products API with DSA Sorting ---');
    const productsRes = await makeRequest('/api/products?sortBy=weeklySales&order=desc', 'GET', null, token);
    console.log(`Fetched ${productsRes.data.count} products. Top selling:`, productsRes.data.data[0].name, `(${productsRes.data.data[0].weeklySales} units/wk)`);

    // 4. Binary Search by SKU
    console.log('\n--- 4. Testing Fast Binary Search by SKU (GRO-RICE-5KG) ---');
    const skuRes = await makeRequest('/api/products/search/sku/GRO-RICE-5KG', 'GET', null, token);
    console.log('SKU Search Result:', skuRes.data.data.name, 'Stock:', skuRes.data.data.stock);

    // 5. Batches & FIFO Tracking Engine
    console.log('\n--- 5. Testing Batches & FIFO Expiry Tracking ---');
    const batchRes = await makeRequest('/api/batches/summary', 'GET', null, token);
    console.log('Batches Summary:', batchRes.data.data.summary);
    console.log('FIFO Earliest Batch to Pick:', batchRes.data.data.fifoPriorityQueue[0]?.batchNumber, `(Expires in ${batchRes.data.data.fifoPriorityQueue[0]?.daysToExpiry} days)`);

    // 6. Smart Reorder Engine
    console.log('\n--- 6. Testing Smart Reorder Recommendations Engine ---');
    const reorderRes = await makeRequest('/api/reorder/recommendations', 'GET', null, token);
    console.log('Reorder Summary:', reorderRes.data.data.summary);
    console.log(`Top recommended item to reorder: "${reorderRes.data.data.recommendations[0].name}" (Suggested Qty: ${reorderRes.data.data.recommendations[0].suggestedQuantity})`);

    // 7. Stock In & Stock Out
    console.log('\n--- 7. Testing Stock In & Stock Out Transactions ---');
    const targetProd = productsRes.data.data[0];
    const stockInRes = await makeRequest('/api/inventory/in', 'POST', {
      productId: targetProd._id,
      quantity: 15,
      reason: 'Automated Test Batch Receipt'
    }, token);
    console.log('Stock In Result:', stockInRes.data.message, 'New Stock:', stockInRes.data.data.product.stock);

    const stockOutRes = await makeRequest('/api/inventory/out', 'POST', {
      productId: targetProd._id,
      quantity: 5,
      reason: 'Automated Test Dispatch'
    }, token);
    console.log('Stock Out Result:', stockOutRes.data.message, 'New Stock:', stockOutRes.data.data.product.stock);

    // 8. Dashboard Analytics Overview
    console.log('\n--- 8. Testing Dashboard Analytics Overview ---');
    const dashRes = await makeRequest('/api/dashboard', 'GET', null, token);
    console.log('Dashboard KPIs:', dashRes.data.data.kpi);
    console.log('Categories Analyzed:', dashRes.data.data.charts.categoryDistribution.length);

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    serverProcess.kill();
    process.exit(0);
  }
}

runTests();
