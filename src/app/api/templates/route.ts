import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'templates.json');

async function getTemplates() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'ENOENT') {
      await fs.writeFile(dataFilePath, '[]');
      return [];
    }
    throw error;
  }
}

export async function GET() {
  try {
    const templates = await getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to get templates:', error);
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newTemplate = await request.json();
    const templates = await getTemplates();
    templates.push(newTemplate);
    await fs.writeFile(dataFilePath, JSON.stringify(templates, null, 2));
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to save template:', error);
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const indexStr = searchParams.get('index');
    if (indexStr === null) {
      return NextResponse.json({ error: 'Index is required' }, { status: 400 });
    }
    const index = parseInt(indexStr, 10);
    const templates = await getTemplates();
    
    if (index < 0 || index >= templates.length) {
      return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
    }
    
    templates.splice(index, 1);
    await fs.writeFile(dataFilePath, JSON.stringify(templates, null, 2));
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
