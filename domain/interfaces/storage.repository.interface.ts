export interface IStorageRepository {
  /**
   * Faz upload de um arquivo para um bucket e retorna a URL pública.
   * @param file O arquivo (File object) a ser enviado.
   * @param path O caminho completo, incluindo o nome do arquivo (ex: "user-id/arquivo.jpg").
   * @param bucket O nome do bucket (ex: "receipts").
   * @returns A promise que resolve com a URL pública do arquivo.
   */
  upload(file: File, path: string, bucket: string): Promise<string>;
}