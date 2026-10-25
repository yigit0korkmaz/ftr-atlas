import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Disclosure, Icon, Modal } from "../../components/ui";
import { backupSchema } from "../../editorial/schema";
import type { Backup } from "../../editorial/schema";
import {
  downloadJson,
  readJson,
  editorialError,
} from "../../editorial/downloads";
import { editorialRepository as repository } from "./repository";
export function TransferDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [pending, setPending] = useState<Backup | null>(null),
    [restore, setRestore] = useState(false),
    [releaseCount, setReleaseCount] = useState<number | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const backup = async () => {
    setBusy(true);
    try {
      downloadJson("ftr-inceleme-yedegi.json", await repository.backup());
      toast.success("Taslak, not ve onay yedeğin indirildi.");
    } catch (e) {
      toast.error(editorialError(e));
    } finally {
      setBusy(false);
    }
  };
  const release = async () => {
    setBusy(true);
    try {
      const r = await repository.release();
      downloadJson("ftr-approved-release.json", r);
      setReleaseCount(r.bank.cases.length);
      toast.success(
        `${r.bank.cases.length} onaylı vakalık yayın paketi hazır.`,
      );
    } catch (e) {
      toast.error(editorialError(e));
    } finally {
      setBusy(false);
    }
  };
  const read = async (f?: File) => {
    if (!f) return;
    try {
      const b = backupSchema.parse(await readJson(f));
      setPending(b);
      setRestore(false);
    } catch (e) {
      toast.error(editorialError(e));
    }
    if (file.current) file.current.value = "";
  };
  const load = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const r = await repository.importBackup(pending, restore);
      toast.success(
        `${r.imported} kayıt alındı; ${r.skipped} daha yeni yerel kayıt korundu.`,
      );
      setPending(null);
    } catch (e) {
      toast.error(editorialError(e));
    } finally {
      setBusy(false);
    }
  };
  const persist = async () => {
    try {
      const ok = await navigator.storage?.persist?.();
      toast(
        ok
          ? "Tarayıcı kalıcı saklama isteğini kabul etti. Yedek almaya devam et."
          : "Tarayıcı kalıcı saklamayı garanti etmedi. Yedeğini düzenli indir.",
      );
    } catch {
      toast.error("Saklama tercihi değiştirilemedi. Yedek indirebilirsin.");
    }
  };
  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        wide
        title="Yedekler ve yayın paketi"
        description="Notlarını ve taslaklarını koru. Herkese açık oyuna yalnız onaylı içerik gider."
      >
        <div className="review-transfer-card">
          <span className="icon-tile">
            <Icon name="download" />
          </span>
          <div>
            <h3>İnceleme yedeği</h3>
            <p>
              Tüm taslaklar, notlar, kapatma gerekçeleri, sürümler ve onaylar.
              Notlarına göre düzenleme yapmamı istediğinde bu dosyayı konuşmaya
              ekle.
            </p>
            <Button icon="download" disabled={busy} onClick={backup}>
              Not ve taslak yedeğini indir
            </Button>
          </div>
        </div>
        <div className="review-transfer-card">
          <span className="icon-tile">
            <Icon name="upload" />
          </span>
          <div>
            <h3>Yedeği geri yükle</h3>
            <p>
              Kayıtları birleştirir. Daha yeni yerel taslakları korur. Onayları
              geri almak ayrıca seçilir.
            </p>
            <Button
              icon="upload"
              variant="secondary"
              disabled={busy}
              onClick={() => file.current?.click()}
            >
              İnceleme yedeği seç
            </Button>
            <input
              ref={file}
              type="file"
              className="sr-only"
              aria-label="İnceleme yedeği dosyası"
              accept=".json,application/json"
              onChange={(e) => read(e.target.files?.[0])}
            />
          </div>
        </div>
        <div className="review-transfer-card">
          <span className="icon-tile">
            <Icon name="check-check" />
          </span>
          <div>
            <h3>Onaylı yayın paketi</h3>
            <p>
              Yalnız güncel içeriği onaylanmış ve engelleyici açık notu olmayan
              vakalar. İnceleme notları ve taslak geçmişi bu dosyaya girmez.
            </p>
            <Button icon="download" disabled={busy} onClick={release}>
              Onaylı yayın paketini indir
            </Button>
            {releaseCount !== null && (
              <p className="review-transfer-result">
                <Badge tone="green">{releaseCount} onaylı vaka</Badge> Paket
                indirildi. Henüz herkese açık siteyi değiştirmedi.
              </p>
            )}
          </div>
        </div>
        <Disclosure title="Paketi nasıl yayımlayacağım?" icon="info">
          <p>
            GitHub Pages, bu tarayıcıdaki onay veritabanını okuyamaz. Yayın
            paketini bu konuşmaya ekleyip yayımlamamı iste. Paket doğrulanır ve
            yalnız içerdiği onaylı sürümler GitHub’da yayımlanır. Yeni
            düzenlemeler için yeniden onay gerekir. Boş paket, oyunda hiç vaka
            yayımlanmaması anlamına gelir.
          </p>
        </Disclosure>
        <div className="review-local-notice">
          <Icon name="shield" />
          <p>
            Veriler yalnız bu tarayıcı ve cihazda. Tarayıcı verilerini silmek
            bunları silebilir; dosya yedeği al. Otomatik cihaz eşitlemesi ve
            yönetici hesabı yoktur.
          </p>
        </div>
        <Button variant="ghost" icon="shield" onClick={persist}>
          Kalıcı saklama iste
        </Button>
      </Modal>
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="İnceleme yedeğini birleştir"
        description="Dosyadaki taslaklar ve notlar yerel veritabanına alınır; daha yeni yerel içerik korunur."
      >
        <div className="review-import-summary">
          <span>{pending?.records.length} taslak</span>
          <span>{pending?.notes.length} not</span>
          <span>
            {pending?.records.filter((r) => r.approval).length} onay kaydı
          </span>
        </div>
        <label className="review-priority-toggle">
          <input
            type="checkbox"
            checked={restore}
            onChange={(e) => setRestore(e.target.checked)}
          />
          <span>
            Yedekteki geçerli onayları da geri yükle. Bu dosyadaki onay
            kayıtlarının bana ait olduğunu doğruluyorum.
          </span>
        </label>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setPending(null)}>
            Vazgeç
          </Button>
          <Button icon="upload" disabled={busy} onClick={load}>
            Yedeği birleştir
          </Button>
        </div>
      </Modal>
    </>
  );
}
