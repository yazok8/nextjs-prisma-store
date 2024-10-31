// src/app/api/test-url/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:8080';
  const downloadUrl = `${serverUrl}/download/test-id`;
  return NextResponse.json({ downloadUrl });
}
