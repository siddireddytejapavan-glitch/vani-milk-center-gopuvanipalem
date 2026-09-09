import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file = data.get('file');

    if (!file || typeof file === 'string' || typeof (file as any).arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No valid image file uploaded' }, { status: 400 });
    }

    const uploadedFile = file as unknown as File;

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validMimes.includes(uploadedFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload JPG, PNG, WEBP, or SVG.' },
        { status: 400 }
      );
    }

    // Limit to 5MB
    if (uploadedFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum allowed size is 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${uploadedFile.type};base64,${base64}`;

    let finalUrl = dataUrl;
    // In local development, optionally save to public/uploads if filesystem is writable
    if (process.env.NODE_ENV !== 'production') {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const origName = uploadedFile.name || 'product.jpg';
        const ext = path.extname(origName) || '.jpg';
        const cleanBase =
          path
            .basename(origName, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 30) || 'upload';
        const filename = `${cleanBase}_${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        await writeFile(filePath, buffer);
        finalUrl = `/uploads/${filename}`;
      } catch (fsError) {
        console.warn('Local filesystem write failed, using data URL:', fsError);
        finalUrl = dataUrl;
      }
    }

    return NextResponse.json({
      message: 'Image uploaded successfully',
      url: finalUrl,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
