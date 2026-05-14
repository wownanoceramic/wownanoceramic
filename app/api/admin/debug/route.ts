import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const pwdHeader = req.headers.get('x-admin-password');
  const pwdQuery = req.nextUrl.searchParams.get('pwd');
  const envPwd = process.env.ADMIN_PASSWORD;
  
  return NextResponse.json({
    receivedHeader: pwdHeader,
    receivedQuery: pwdQuery,
    envSet: !!envPwd,
    envLength: envPwd?.length || 0,
    matchHeader: pwdHeader === envPwd,
    matchQuery: pwdQuery === envPwd,
    fullUrl: req.nextUrl.toString(),
  });
}
