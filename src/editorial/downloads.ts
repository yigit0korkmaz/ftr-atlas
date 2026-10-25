export function downloadJson(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export async function readJson(file: File) {
  if (file.size > 100 * 1024 * 1024)
    throw Error("Dosya 100 MB sınırını aşıyor.");
  return JSON.parse(await file.text()) as unknown;
}
export function editorialError(error: unknown) {
  if (error instanceof Error && error.name === "ZodError")
    return "Dosya veya alan yapısı geçersiz. JSON girdilerini ve alan türlerini kontrol et.";
  return error instanceof Error ? error.message : "İşlem tamamlanamadı.";
}
