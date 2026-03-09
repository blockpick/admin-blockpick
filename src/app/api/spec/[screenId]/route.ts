import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// manifest에서 screenId에 해당하는 spec-data 파일 경로 찾기
function findSpecFile(screenId: string): string | null {
  const manifestPath = path.join(process.cwd(), 'spec-data/_manifest.json');
  if (!fs.existsSync(manifestPath)) return null;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const screen = manifest.screens.find((s: { id: string }) => s.id === screenId);
  return screen?.specDataFile || null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ screenId: string }> },
) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { screenId } = await params;
  const specFile = findSpecFile(screenId);
  if (!specFile) {
    return NextResponse.json({ error: 'Screen not found' }, { status: 404 });
  }

  const specPath = path.join(process.cwd(), specFile);
  if (!fs.existsSync(specPath)) {
    return NextResponse.json({ error: 'Spec file not found' }, { status: 404 });
  }

  const specData = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
  return NextResponse.json(specData);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ screenId: string }> },
) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { screenId } = await params;
  const body = await request.json();
  const editsPath = path.join(process.cwd(), 'spec-data/_edits.json');

  let editsFile: { edits: Record<string, unknown>; lastUpdated: string } = {
    edits: {},
    lastUpdated: '',
  };
  if (fs.existsSync(editsPath)) {
    editsFile = JSON.parse(fs.readFileSync(editsPath, 'utf-8'));
  }

  if (!editsFile.edits) editsFile.edits = {};
  editsFile.edits[screenId] = body.edits;
  editsFile.lastUpdated = new Date().toISOString();

  fs.writeFileSync(editsPath, JSON.stringify(editsFile, null, 2), 'utf-8');

  return NextResponse.json({ success: true });
}
