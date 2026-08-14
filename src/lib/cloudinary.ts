import { v2 as cloudinary } from "cloudinary";

/**
 * Upload firmado desde el server (sección 1 y 8 del prompt maestro): el
 * `api_secret` NUNCA sale del servidor — solo se usa acá para calcular
 * una firma de un solo uso. El browser sube el archivo directo a
 * Cloudinary con esa firma (`api_key` sí viaja al cliente, pero no es
 * secreto: identifica la cuenta, no autoriza nada sin la firma).
 */

const CLOUDINARY_PRODUCT_FOLDER = "diamondva/products";

/** A diferencia de un error genérico, este mensaje sí se le muestra al admin. */
export class CloudinaryConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudinaryConfigError";
  }
}

function assertConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new CloudinaryConfigError(
      "Cloudinary no está configurado todavía — completá CLOUDINARY_CLOUD_NAME, " +
        "CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env para poder subir imágenes."
    );
  }
  return { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET };
}

export interface SignedUploadParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export function createSignedUploadParams(): SignedUploadParams {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = assertConfigured();

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: CLOUDINARY_PRODUCT_FOLDER },
    CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
    folder: CLOUDINARY_PRODUCT_FOLDER,
  };
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = assertConfigured();

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  await cloudinary.uploader.destroy(publicId);
}

/** Deriva el public_id de Cloudinary a partir de la URL guardada en ProductImage.url. */
export function extractCloudinaryPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}
