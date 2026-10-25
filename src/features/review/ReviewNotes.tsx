import { useEffect, useRef, useState } from "react";
import type { ReviewNote } from "../../editorial/schema";
import { editorialRepository as repository } from "./repository";
import { Badge, Button, EmptyState, Icon, Modal } from "../../components/ui";
import { SelectField } from "../../components/SelectField";
import { editorialError } from "../../editorial/downloads";
import { toast } from "sonner";
export function ReviewNotes({
  caseId,
  notes,
  scope,
  setScope,
  focusToken,
  onDirty,
  onReturn,
}: {
  caseId: string;
  notes: ReviewNote[];
  scope: string;
  setScope: (s: string) => void;
  focusToken: number;
  onDirty: (dirty: boolean) => void;
  onReturn: () => void;
}) {
  const [body, setBody] = useState(""),
    [blocking, setBlocking] = useState(true),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState("open"),
    [target, setTarget] = useState<ReviewNote | null>(null),
    [resolution, setResolution] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => onDirty(!!body.trim()), [body, onDirty]);
  useEffect(() => {
    if (focusToken) {
      input.current?.scrollIntoView({ block: "center" });
      input.current?.focus({ preventScroll: true });
    }
  }, [focusToken]);
  const save = async () => {
    setBusy(true);
    try {
      await repository.addNote(caseId, scope, body, blocking);
      setBody("");
      toast.success("İnceleme notu kaydedildi.");
    } catch (e) {
      toast.error(editorialError(e));
    } finally {
      setBusy(false);
    }
  };
  const resolve = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await repository.resolveNote(target.id, resolution);
      setTarget(null);
      setResolution("");
      toast.success("Not kapatıldı. Vaka yeniden onaylanabilir.");
    } catch (e) {
      toast.error(editorialError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <aside className="review-notes-panel">
      <div className="review-section-title">
        <h2>
          <Icon name="note" /> İnceleme notlarım
        </h2>
        <Badge>{notes.filter((n) => n.state === "open").length} açık</Badge>
      </div>
      <p className="review-help">
        Alanların yanındaki not simgesiyle ilgili girdiye not bırakabilirsin.
        Notlar yayın paketine eklenmez.
      </p>
      <label className="review-input-label" htmlFor="editor-note-scope">
        Notun ilgili olduğu bölüm
      </label>
      <input
        id="editor-note-scope"
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        maxLength={400}
      />
      <label className="review-input-label" htmlFor="editor-note-body">
        Not / düzeltme isteği
      </label>
      <textarea
        id="editor-note-body"
        ref={input}
        rows={5}
        value={body}
        maxLength={20000}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Örneğin: Bu vakanın hedefiyle denge testinin seçimi arasındaki gerekçe daha açık olmalı."
      />
      <label className="review-priority-toggle">
        <input
          type="checkbox"
          checked={blocking}
          onChange={(e) => setBlocking(e.target.checked)}
        />
        <span>Bu not ele alınmadan onay verilmesin</span>
      </label>
      <Button
        icon="note"
        disabled={busy || !body.trim() || !scope.trim()}
        onClick={save}
      >
        Notu kaydet
      </Button>
      {focusToken > 0 && (
        <Button variant="ghost" icon="arrow-left" onClick={onReturn}>
          Düzenlediğim girdiye dön
        </Button>
      )}
      <div className="review-notes-filter">
        <SelectField
          label="Gösterilen notlar"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "open", label: "Açık notlar" },
            { value: "resolved", label: "Kapatılan notlar" },
            { value: "all", label: "Tüm notlar" },
          ]}
        />
      </div>
      <div className="review-note-list">
        {notes
          .filter((n) => filter === "all" || n.state === filter)
          .map((n) => (
            <article className="review-note" key={n.id}>
              <div>
                <Badge
                  tone={
                    n.state === "resolved"
                      ? "green"
                      : n.blocking
                        ? "warm"
                        : "lavender"
                  }
                >
                  {n.state === "resolved"
                    ? "Ele alındı"
                    : n.blocking
                      ? "Onayı engeller"
                      : "Bilgi notu"}
                </Badge>
                <time>{new Date(n.createdAt).toLocaleString("tr-TR")}</time>
              </div>
              <strong>{n.scope}</strong>
              <p>{n.body}</p>
              {n.resolution && (
                <div className="review-note-resolution">
                  <Icon name="check-circle" size={18} />
                  <p>{n.resolution}</p>
                </div>
              )}
              {n.state === "open" && (
                <Button
                  variant="ghost"
                  icon="check"
                  onClick={() => {
                    setTarget(n);
                    setResolution("");
                  }}
                >
                  Nasıl ele alındığını yaz
                </Button>
              )}
            </article>
          ))}
      </div>
      {!notes.some((n) => filter === "all" || n.state === filter) && (
        <EmptyState
          icon="note"
          title="Bu görünümde not yok."
          description="İncelediğin alan için ilk notunu bırakabilirsin."
        />
      )}
      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Düzeltme notunu kapat"
        description="Ne değiştiğini veya notun neden kapatıldığını açıkla. Notu kapatmak vakayı otomatik onaylamaz."
      >
        <p className="review-note-quote">{target?.body}</p>
        <label className="review-input-label" htmlFor="note-resolution">
          Yapılan düzenleme / gerekçe
        </label>
        <textarea
          id="note-resolution"
          className="review-modal-textarea"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={5}
        />
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setTarget(null)}>
            Vazgeç
          </Button>
          <Button
            icon="check"
            disabled={busy || !resolution.trim()}
            onClick={resolve}
          >
            Notu kapat
          </Button>
        </div>
      </Modal>
    </aside>
  );
}
