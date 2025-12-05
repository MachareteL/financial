import type { IStorageRepository } from "@/domain/interfaces/storage.repository.interface";
import type { SupabaseClient } from "@supabase/supabase-js";

export class StorageRepository implements IStorageRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async upload(file: File, path: string, bucket: string): Promise<string> {
    const { error: uploadError } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase storage error:", uploadError.message);
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);

    if (!data.publicUrl) {
      throw new Error("Não foi possível obter a URL pública do arquivo.");
    }

    return data.publicUrl;
  }
}
