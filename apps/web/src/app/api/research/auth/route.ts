import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

// Read secret PIN from environment, default to 123456 if not set
const VALID_PIN = process.env.RESEARCH_PIN || '123456';

// Generate a deterministic token for the active PIN session
function generateSessionToken(pin: string): string {
  return crypto.createHash('sha256').update(`orchestathya_pin_${pin}_salt_skripsi`).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pin = String(body.pin || '').trim();

    if (!pin) {
      return NextResponse.json({ success: false, error: 'PIN tidak boleh kosong' }, { status: 400 });
    }

    if (pin === VALID_PIN) {
      const token = generateSessionToken(pin);
      return NextResponse.json({
        success: true,
        message: 'Autentikasi PIN Peneliti Berhasil',
        token,
      });
    }

    return NextResponse.json(
      { success: false, error: 'PIN tidak valid. Akses ditolak.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const expectedToken = generateSessionToken(VALID_PIN);

  if (token && token === expectedToken) {
    return NextResponse.json({ valid: true });
  }

  return NextResponse.json({ valid: false }, { status: 401 });
}
