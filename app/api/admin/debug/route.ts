import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password');
  const envPwd = process.env.ADMIN_PASSWORD;
  
  return NextResponse.json({
    received: pwd,
    envSet: !!envPwd,
    envLength: envPwd?.length || 0,
    match: pwd === envPwd,
  });
}
