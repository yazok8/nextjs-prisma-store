
//src/lib/server/testUrl.ts


export function testUrlConstruction() {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:8080';
    const downloadUrl = `${serverUrl}/download/test-id`;
    console.log(`Download URL: ${downloadUrl}`);
  }
  
  testUrlConstruction();