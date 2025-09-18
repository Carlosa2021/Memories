// src/app/api/generate-nft-metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

export async function GET() {
  // Simple health check para UI
  const enabled = Boolean(process.env.OPENAI_API_KEY);
  console.log(
    '🔍 Verificando estado de IA:',
    enabled ? 'Habilitada' : 'Deshabilitada',
  );
  return NextResponse.json({ enabled });
}

export async function POST(req: NextRequest) {
  console.log('🚀 Iniciando generación de NFT con IA...');

  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      console.log('❌ Prompt inválido recibido');
      return NextResponse.json(
        { error: 'Prompt inválido. Proporciona una idea creativa.' },
        { status: 400 },
      );
    }

    console.log('📝 Prompt recibido:', prompt);

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY no configurada');
      return NextResponse.json(
        { error: 'IA no configurada. Falta OPENAI_API_KEY.' },
        { status: 503 },
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log('🤖 Generando metadatos con GPT-4...');

    // 1. Generar metadatos (nombre + descripción) con GPT-4
    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'Eres un generador de metadata NFT profesional. Responde SOLO con JSON válido, sin texto adicional.',
        },
        {
          role: 'user',
          content: `Crea un nombre y descripción profesional para un NFT basado en esta idea: "${prompt}". Devuélvelo en JSON: {"name":"...", "description":"..."}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const chatContent = chat.choices?.[0]?.message?.content || '{}';
    console.log('📋 Metadatos generados:', chatContent);

    let metadata;
    try {
      metadata = JSON.parse(chatContent);
    } catch (parseError) {
      console.error('❌ Error parseando JSON de metadatos:', parseError);
      return NextResponse.json(
        { error: 'Error en el formato de respuesta de la IA para metadatos.' },
        { status: 500 },
      );
    }

    if (!metadata.name || !metadata.description) {
      console.error('❌ Metadatos incompletos:', metadata);
      return NextResponse.json(
        { error: 'La IA no devolvió metadatos válidos.' },
        { status: 500 },
      );
    }

    console.log('🎨 Generando imagen con DALL-E 3...');

    // 2. Generar imagen con DALL·E 3 (más estable)
    const imageResp = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Create a high-quality, professional NFT artwork: ${prompt}`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = imageResp.data?.[0]?.url;

    if (!imageUrl) {
      console.error('❌ No se generó URL de imagen');
      return NextResponse.json(
        { error: 'No se generó la imagen.' },
        { status: 500 },
      );
    }

    console.log('🖼️ Imagen generada, descargando...', imageUrl);

    // Descargar imagen y convertir a base64
    const imageRes = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 segundos timeout
    });

    const buffer = Buffer.from(imageRes.data, 'binary');
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    console.log('✅ NFT generado exitosamente');

    return NextResponse.json({
      name: metadata.name,
      description: metadata.description,
      imageBase64: base64Image,
    });
  } catch (err) {
    console.error('❌ Error completo llamando a OpenAI:', err);

    if (err instanceof Error) {
      if (err.message.includes('rate_limit')) {
        return NextResponse.json(
          {
            error:
              'Límite de rate de OpenAI alcanzado. Intenta en unos minutos.',
          },
          { status: 429 },
        );
      }
      if (err.message.includes('insufficient_quota')) {
        return NextResponse.json(
          { error: 'Cuota de OpenAI agotada. Verifica tu cuenta.' },
          { status: 402 },
        );
      }
    }

    return NextResponse.json(
      { error: 'Error llamando a la IA. Revisa la consola o tu clave API.' },
      { status: 500 },
    );
  }
}
