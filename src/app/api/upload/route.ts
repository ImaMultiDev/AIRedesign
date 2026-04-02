import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { configureCloudinary, cloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Archivo no válido" }, { status: 400 });
  }

  try {
    configureCloudinary();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cloudinary no configurado" },
      { status: 500 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "ainterior/showcase";

  try {
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto:good", fetch_format: "auto" }],
        },
        (err, res) => {
          if (err || !res) reject(err ?? new Error("Sin respuesta"));
          else resolve(res);
        },
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch {
    return NextResponse.json({ error: "Error subiendo a Cloudinary" }, { status: 500 });
  }
}
