import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tipoDocumento = formData.get("tipo_documento") as string;

    if (!file) {
      return Response.json({ error: "Arquivo é obrigatório" }, { status: 400 });
    }

    if (!tipoDocumento) {
      return Response.json({ error: "Tipo de documento é obrigatório" }, { status: 400 });
    }

    // Salvar arquivo no filesystem local
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadPath = path.join(UPLOAD_DIR, empresaId);
    
    await fs.mkdir(uploadPath, { recursive: true });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadPath, fileName);
    await fs.writeFile(filePath, buffer);

    // Salvar metadados no banco
    const storagePath = `${empresaId}/${fileName}`;
    
    const inserted = await db
      .insert(schema.documentosEmpresa)
      .values({
        empresaId,
        nomeArquivo: file.name,
        tipoDocumento,
        urlStorage: storagePath,
        metadados: {
          tamanho: file.size,
          tipo_mime: file.type,
          upload_timestamp: new Date().toISOString(),
        },
      })
      .returning();

    return Response.json({
      success: true,
      data: inserted[0],
    }, { status: 201 });

  } catch (err) {
    console.error('Erro geral:', err);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    const documentos = await db
      .select()
      .from(schema.documentosEmpresa)
      .where(eq(schema.documentosEmpresa.empresaId, empresaId))
      .orderBy(desc(schema.documentosEmpresa.createdAt));

    return Response.json({
      success: true,
      data: documentos,
      total: documentos.length,
    });

  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
