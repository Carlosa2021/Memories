// src/app/api/generate-nft-metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: 'Prompt inválido. Proporciona una idea creativa.' },
      { status: 400 },
    );
  }

  try {
    // 1. Generar metadatos (nombre + descripción) con GPT-4
    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un generador de metadata NFT profesional.',
        },
        {
          role: 'user',
          content: `Crea un nombre y descripción profesional para un NFT basado en esta idea: "${prompt}". Devuélvelo en JSON: {"name":"...", "description":"..."}`,
        },
      ],
    });

    const chatContent = chat.choices?.[0]?.message?.content || '{}';
    const metadata = JSON.parse(chatContent);

    if (!metadata.name || !metadata.description) {
      return NextResponse.json(
        { error: 'La IA no devolvió metadatos válidos.' },
        { status: 500 },
      );
    }

    // 2. Generar imagen con DALL·E 3 (más estable)
    const imageResp = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });

    const imageUrl = imageResp.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No se generó la imagen.' },
        { status: 500 },
      );
    }

    // Descargar imagen y convertir a base64
    const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageRes.data, 'binary');
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      name: metadata.name,
      description: metadata.description,
      imageBase64: base64Image,
    });
  } catch (err) {
    console.error('❌ Error llamando a OpenAI:', err);
    return NextResponse.json(
      { error: 'Error llamando a la IA. Revisa la consola o tu clave API.' },
      { status: 500 },
    );
  }
}
