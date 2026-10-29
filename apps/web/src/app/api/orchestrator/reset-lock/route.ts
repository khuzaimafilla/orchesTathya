import { NextResponse } from 'next/server';
import { lockManager } from '@/lib/lock-manager';

export async function POST() {
  const state = lockManager.release();
  return NextResponse.json({
    success: true,
    message: 'Engine mutex lock has been manually reset.',
    lock: state,
  });
}
