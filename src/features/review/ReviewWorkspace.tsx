import { useEffect, useMemo, useState, useRef } from "react";
import {
  Link,
  Outlet,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { toast, Toaster } from "sonner";
import {
  candidateCases,
  candidateMap,
  candidateDiseases,
} from "../../data/candidate-bank";
import { cases as publishedCases } from "../../data";
import { useStore } from "../../state/store";
import {
  Badge,
  Button,
  Disclosure,
  EmptyState,
  Icon,
  IconButton,
  Modal,
  PageTitle,
  Panel,
} from "../../components/ui";
import { SelectField } from "../../components/SelectField";
import { pageSlice } from "../catalog/filter";
import { editorialRepository as repository } from "./repository";
import {
  canonical,
  normalizeBundle,
  validationIssues,
} from "../../editorial/schema";
import type { CaseBundle, ReviewRecord } from "../../editorial/schema";
import { editorialError } from "../../editorial/downloads";
import { StoryForm, DomainForm, SourceForm } from "./BundleForm";
import { ReviewNotes } from "./ReviewNotes";
import { TransferDialog } from "./TransferDialog";
import "../../styles/review.css";

const labels: Record<string, string> = {
  unreviewed: "İnceleme bekliyor",
  draft: "Taslak",
  changes_requested: "Düzeltme istendi",
  approved: "Onaylı",
};
function StatusBadge({ record }: { record?: Pick<ReviewRecord, "status"> }) {
  const status = record?.status || "unreviewed";
  return (
    <Badge
      tone={
        status === "approved"
          ? "green"
          : status === "changes_requested"
            ? "warm"
            : "lavender"
      }
      icon={status === "approved" ? "check-circle" : "clipboard"}
    >
      {labels[status]}
    </Badge>
  );
}
export function ReviewShell() {
  const route = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("review-main")?.focus({ preventScroll: true });
  }, [route.pathname]);
  const [transfer, setTransfer] = useState(false),
    prefs = useStore((s) => s.preferences),
    setPrefs = useStore((s) => s.setPreferences);
  const dark = prefs.theme !== "light";
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.setProperty(
      "--reading-size",
      `${prefs.readingSize}px`,
    );
  }, [dark, prefs.readingSize]);
  return (
    <div className="review-workspace">
      <a
        className="skip-link"
        href="#review-main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("review-main")?.focus();
        }}
      >
        İnceleme içeriğine geç
      </a>
      <header className="review-topbar">
        <Link to="/review" className="review-brand">
          <span className="brand-symbol">
            <Icon name="note" size={25} />
          </span>
          <span>
            FTR Atlas<strong>İnceleme atölyesi</strong>
          </span>
        </Link>
        <div className="review-header-tools">
          <Badge icon="shield">Yerel kayıt</Badge>
          <Link to="/" className="button button--ghost" aria-label="Oyuna dön">
            <Icon name="arrow-left" /> Oyuna dön
          </Link>
          <IconButton
            icon={dark ? "sun" : "moon"}
            label={dark ? "Açık temaya geç" : "Koyu temaya geç"}
            onClick={() => setPrefs({ theme: dark ? "light" : "dark" })}
          />
          <Button
            icon="download"
            variant="secondary"
            onClick={() => setTransfer(true)}
          >
            Yedek ve yayın
          </Button>
        </div>
      </header>
      <main className="review-main" id="review-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="review-footer">
        <Icon name="shield" size={18} />
        <span>
          Notlar ve onaylar bu tarayıcıda. Yayın için onaylı paketi ayrıca
          aktar. İnceleme adresi bir yönetici hesabıyla korunmaz; kişisel
          kayıtlar sunucuya gönderilmez.
        </span>
      </footer>
      <TransferDialog open={transfer} onClose={() => setTransfer(false)} />
      <Toaster
        richColors
        theme={dark ? "dark" : "light"}
        closeButton
        position="top-center"
      />
    </div>
  );
}
export function ReviewList() {
  const [params, setParams] = useSearchParams(),
    location = useLocation(),
    records = useLiveQuery(() => repository.listSummaries(), []),
    notes = useLiveQuery(() => repository.listNotes(), []);
  const map = useMemo(
    () => Object.fromEntries((records || []).map((r) => [r.caseId, r])),
    [records],
  );
  const disease = params.get("alan") || "all",
    status = params.get("durum") || "all",
    query = params.get("q") || "";
  const update = (key: string, value: string) =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set(key, value);
        p.delete("sayfa");
        return p;
      },
      { replace: true },
    );
  const filtered = useMemo(
    () =>
      candidateCases
        .map((c) =>
          map[c.id]
            ? {
                ...c,
                title: map[c.id].title,
                disease: map[c.id].disease,
                goals: [map[c.id].goal],
                story: map[c.id].searchText,
              }
            : c,
        )
        .filter(
          (c) =>
            (disease === "all" || c.disease === disease) &&
            (status === "all" ||
              (status === "published" &&
                publishedCases.some((p) => p.id === c.id)) ||
              (status === "unreviewed" && !map[c.id]) ||
              map[c.id]?.status === status) &&
            (!query ||
              `${c.id} ${c.title} ${c.disease} ${c.story}`
                .toLocaleLowerCase("tr")
                .includes(query.toLocaleLowerCase("tr"))),
        ),
    [map, disease, status, query],
  );
  const page = pageSlice(filtered, Number(params.get("sayfa") || 1));
  const openByCase = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of notes || [])
      if (n.state === "open") counts[n.caseId] = (counts[n.caseId] || 0) + 1;
    return counts;
  }, [notes]);
  return (
    <>
      <PageTitle
        eyebrow="İÇERİK KONTROL MERKEZİ"
        title="Her vakayı kendi gözünle incele."
        description="Öyküden doğru seçeneğe kadar bütün girdiler. Not bırak, düzenle ve yalnız hazır bulduğun sürümü onayla."
      />
      <div className="review-metrics">
        {[
          {
            n: candidateCases.length,
            label: "İncelenecek vaka",
            icon: "clipboard",
          },
          {
            n: records?.length || 0,
            label: "İşlem yaptığın vaka",
            icon: "note",
          },
          {
            n: records?.filter((r) => r.status === "approved").length || 0,
            label: "Onaylı sürüm",
            icon: "check-circle",
          },
          {
            n: publishedCases.length,
            label: "Oyunda yayımlanmış",
            icon: "external",
          },
        ].map((m) => (
          <Panel key={m.label}>
            <Icon name={m.icon} />
            <strong>{m.n.toLocaleString("tr-TR")}</strong>
            <span>{m.label}</span>
          </Panel>
        ))}
      </div>
      <Disclosure
        title="İnceleme, not ve yayın akışı nasıl çalışır?"
        icon="info"
      >
        <div className="review-process">
          <span>
            <b>1</b> Girdileri incele
          </span>
          <span>
            <b>2</b> Not yaz ve düzenle
          </span>
          <span>
            <b>3</b> Kaydet ve onayla
          </span>
          <span>
            <b>4</b> Yayın paketini aktar
          </span>
        </div>
        <p className="review-help">
          Başlangıçta hiçbir vaka senin adına onaylanmadı. Buradaki{" "}
          <strong>Onaylı</strong> durumu, yayın paketine uygunluğu gösterir;
          siteye kendiliğinden yükleme yapmaz. Notlarına göre düzenleme istemek
          için <strong>Yedek ve yayın</strong> bölümünden inceleme yedeğini
          indir.
        </p>
      </Disclosure>
      <div className="search-field">
        <Icon name="search" />
        <input
          aria-label="İnceleme vakalarında ara"
          value={query}
          placeholder="Başlık, bulgu, tanı veya vaka kodu…"
          onChange={(e) => update("q", e.target.value)}
        />
        {query && (
          <IconButton
            icon="x"
            label="İnceleme aramasını temizle"
            onClick={() => update("q", "")}
          />
        )}
      </div>
      <div className="catalog-selects review-list-filters">
        <SelectField
          label="Klinik alan"
          value={disease}
          onChange={(v) => update("alan", v)}
          options={[
            { value: "all", label: "Tüm klinik alanlar" },
            ...[
              ...new Set([
                ...candidateDiseases,
                ...(records || []).map((r) => r.disease),
              ]),
            ].map((d) => ({ value: d, label: d })),
          ]}
        />
        <SelectField
          label="İnceleme durumu"
          value={status}
          onChange={(v) => update("durum", v)}
          options={[
            { value: "all", label: "Tüm vakalar" },
            ...Object.entries(labels).map(([value, label]) => ({
              value,
              label,
            })),
            { value: "published", label: "Oyunda yayımlanmış" },
          ]}
        />
      </div>
      <div className="section-heading">
        <h2>Vaka dosyaları</h2>
        <p role="status">
          {page.start}–{page.end} / {page.total.toLocaleString("tr-TR")}
        </p>
      </div>
      {records === undefined ? (
        <div className="loading-screen">
          <span />
          Yerel veritabanı açılıyor…
        </div>
      ) : page.total ? (
        <>
          <div className="review-case-list">
            {page.items.map((c) => (
              <Link
                key={c.id}
                to={`/review/${c.id}`}
                state={{ backTo: location.pathname + location.search }}
                className="review-case-row"
              >
                <span className="review-case-symbol">
                  <Icon name="clipboard" />
                </span>
                <div className="review-case-row-main">
                  <div>
                    <code>{c.id}</code>
                    <span>{c.disease}</span>
                  </div>
                  <h3>{c.title}</h3>
                  <p>{c.goals[0]}</p>
                </div>
                <div className="review-case-row-status">
                  <StatusBadge record={map[c.id]} />
                  {!!openByCase[c.id] && (
                    <span>
                      <Icon name="note" size={16} />
                      {openByCase[c.id]} açık not
                    </span>
                  )}
                  {publishedCases.some((p) => p.id === c.id) && (
                    <small>Oyunda yayımlanmış</small>
                  )}
                </div>
                <Icon name="chevron" />
              </Link>
            ))}
          </div>
          <nav className="catalog-pagination" aria-label="İnceleme sayfaları">
            <Button
              variant="secondary"
              disabled={page.page <= 1}
              icon="arrow-left"
              onClick={() => {
                setParams((p) => {
                  p.set("sayfa", String(page.page - 1));
                  return p;
                });
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            >
              Önceki
            </Button>
            <span>
              Sayfa {page.page} / {page.pages}
            </span>
            <Button
              variant="secondary"
              disabled={page.page >= page.pages}
              endIcon="arrow-right"
              onClick={() => {
                setParams((p) => {
                  p.set("sayfa", String(page.page + 1));
                  return p;
                });
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            >
              Sonraki
            </Button>
          </nav>
        </>
      ) : (
        <EmptyState
          icon="search"
          title="Bu filtrelerle vaka bulunamadı."
          description="Aramanı veya inceleme durumunu değiştir."
        />
      )}
    </>
  );
}
export function ReviewCaseRoute() {
  const { id } = useParams();
  return candidateMap[id || ""] ? (
    <ReviewCase key={id} caseId={id!} />
  ) : (
    <EmptyState
      title="İnceleme dosyası bulunamadı."
      description="Listeden bir vaka açabilirsin."
    >
      <Link className="button button--primary" to="/review">
        İnceleme listesi
      </Link>
    </EmptyState>
  );
}
function ReviewCase({ caseId }: { caseId: string }) {
  const live = useLiveQuery(() => repository.load(caseId), [caseId]),
    notes = useLiveQuery(() => repository.listNotes(caseId), [caseId]) || [],
    events = useLiveQuery(() => repository.listEvents(caseId), [caseId]) || [],
    revisions =
      useLiveQuery(() => repository.getRevisions(caseId), [caseId]) || [],
    allRecords = useLiveQuery(() => repository.listSummaries(), []) || [];
  const [working, setWorking] = useState<{
      base: ReviewRecord;
      bundle: CaseBundle;
    } | null>(null),
    [tab, setTab] = useState("story"),
    [busy, setBusy] = useState(false),
    [scope, setScope] = useState("Genel vaka"),
    [focusToken, setFocusToken] = useState(0),
    [noteDirty, setNoteDirty] = useState(false),
    [json, setJson] = useState(""),
    [jsonDirty, setJsonDirty] = useState(false),
    [approval, setApproval] = useState(false),
    [consent, setConsent] = useState(false),
    [reload, setReload] = useState(false);
  const navigate = useNavigate(),
    location = useLocation(),
    noteSource = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (live && !working)
      setWorking({ base: live, bundle: structuredClone(live.draft) });
  }, [live, working]);
  const dirty =
      !!working && canonical(working.bundle) !== canonical(working.base.draft),
    stale = !!live && !!working && live.revision !== working.base.revision,
    issues = useMemo(
      () => (working ? validationIssues(working.bundle) : []),
      [working],
    );
  useEffect(() => {
    if (working && !jsonDirty) setJson(JSON.stringify(working.bundle, null, 2));
  }, [working, jsonDirty]);
  const unsaved = dirty || noteDirty || jsonDirty,
    blocker = useBlocker(unsaved);
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (unsaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [unsaved]);
  const change = (fn: (d: CaseBundle) => void) =>
    setWorking((w) => {
      if (!w) return w;
      const bundle = structuredClone(w.bundle);
      fn(bundle);
      return { ...w, bundle };
    });
  const save = async () => {
    if (!working) return;
    setBusy(true);
    try {
      const r = await repository.save(
        caseId,
        working.bundle,
        working.base.revision,
      );
      setWorking({ base: r, bundle: structuredClone(r.draft) });
      toast.success(
        "Taslak kaydedildi. Düzenleme yapılan sürüm için yeniden onay gerekir.",
      );
    } catch (e) {
      toast.error(editorialError(e));
    } finally {
      setBusy(false);
    }
  };
  const approve = async () => {
    if (!working || !consent || dirty || jsonDirty || noteDirty) return;
    setBusy(true);
    try {
      const r = await repository.approve(caseId, working.base.revision);
      setWorking({ base: r, bundle: structuredClone(r.draft) });
      setApproval(false);
      toast.success("Bu içerik sürümü onaylandı. Yayın paketine eklenebilir.");
    } catch (e) {
      toast.error(editorialError(e));
    } finally {
      setBusy(false);
    }
  };
  const withdraw = async () => {
    if (!working) return;
    setBusy(true);
    try {
      await repository.withdraw(caseId, working.base.revision);
      const r = await repository.load(caseId);
      setWorking((w) => (w ? { ...w, base: r } : w));
      toast.success("Onay geri alındı. Yeni yayın paketine girmez.");
    } catch (e) {
      toast.error(editorialError(e));
    } finally {
      setBusy(false);
    }
  };
  const note = (label: string) => {
    noteSource.current = document.activeElement as HTMLElement;
    setScope(label);
    setFocusToken((n) => n + 1);
  };
  const next = () => {
    const index = candidateCases.findIndex((c) => c.id === caseId),
      map = Object.fromEntries(allRecords.map((r) => [r.caseId, r]));
    const item = [
      ...candidateCases.slice(index + 1),
      ...candidateCases.slice(0, index),
    ].find((c) => map[c.id]?.status !== "approved");
    if (item) navigate("/review/" + item.id, { state: location.state });
    else toast("Diğer bütün vakalar onaylı.");
  };
  if (!working)
    return (
      <div className="loading-screen">
        <span />
        Vaka dosyası hazırlanıyor…
      </div>
    );
  const b = working.bundle,
    blocking = notes.filter((n) => n.state === "open" && n.blocking),
    approved = live?.status === "approved" && !dirty && !jsonDirty && !stale;
  return (
    <>
      <div className="review-case-navigation">
        <Link
          to={
            (location.state as { backTo?: string } | null)?.backTo || "/review"
          }
          className="back-link"
        >
          <Icon name="arrow-left" /> Vaka listesi
        </Link>
        <Button variant="ghost" endIcon="arrow-right" onClick={next}>
          Sonraki onaysız vaka
        </Button>
      </div>
      <div className="review-detail-heading">
        <div>
          <div className="button-row">
            <code className="review-id">{caseId}</code>
            <Badge>{b.case.disease}</Badge>
            <StatusBadge record={live} />
          </div>
          <h1>{b.case.title}</h1>
          <p>
            İncelediğin sürüm: {working.base.revision} ·{" "}
            {live?.updatedAt
              ? "Son kayıt " + new Date(live.updatedAt).toLocaleString("tr-TR")
              : "Henüz değiştirilmedi"}
          </p>
        </div>
        <Badge icon="shield">Yalnız bu vaka etkilenir</Badge>
      </div>
      {stale && (
        <div className="review-conflict" role="alert">
          <Icon name="info" />
          <div>
            <strong>Bu vaka başka bir sekmede güncellendi.</strong>
            <p>
              Yerel değişikliklerini kopyalayabilir, ardından güncel sürümü
              yükleyebilirsin. Eski sürümün üzerine sessizce yazılmaz.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setReload(true)}>
            Güncel sürümü yükle
          </Button>
        </div>
      )}
      <div className="review-editor-layout">
        <section className="review-editor-panel">
          <div
            className="page-tabs"
            role="tablist"
            aria-label="Vaka girdileri"
            onKeyDown={(e) => {
              const keys = ["story", "domains", "sources", "json"];
              let index = keys.indexOf(tab);
              if (e.key === "ArrowRight") index = (index + 1) % keys.length;
              else if (e.key === "ArrowLeft")
                index = (index + keys.length - 1) % keys.length;
              else if (e.key === "Home") index = 0;
              else if (e.key === "End") index = keys.length - 1;
              else return;
              e.preventDefault();
              setTab(keys[index]);
              document.getElementById("review-tab-" + keys[index])?.focus();
            }}
          >
            {[
              { id: "story", label: "Öykü ve hedefler", icon: "clipboard" },
              {
                id: "domains",
                label: "Alanlar ve testler",
                icon: "stethoscope",
              },
              { id: "sources", label: "Kaynaklar", icon: "book" },
              { id: "json", label: "Tüm girdiler", icon: "file" },
            ].map((t) => (
              <button
                key={t.id}
                id={"review-tab-" + t.id}
                role="tab"
                aria-selected={tab === t.id}
                aria-controls="review-tab-panel"
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
              >
                <Icon name={t.icon} />
                {t.label}
              </button>
            ))}
          </div>
          <div
            className="review-tab-content"
            id="review-tab-panel"
            role="tabpanel"
            aria-labelledby={"review-tab-" + tab}
          >
            {tab === "story" && (
              <StoryForm bundle={b} change={change} onNote={note} />
            )}{" "}
            {tab === "domains" && (
              <DomainForm bundle={b} change={change} onNote={note} />
            )}{" "}
            {tab === "sources" && (
              <SourceForm bundle={b} change={change} onNote={note} />
            )}{" "}
            {tab === "json" && (
              <>
                <h2>Bütün yapılandırılmış girdiler</h2>
                <p className="review-help">
                  Öykü, profil, alan, kaynak ve her soru aynı dosyada. Vaka
                  kimliği sabittir. Değişiklikleri önce taslağa uygula; ardından
                  kaydet ve yeniden onayla.
                </p>
                <label className="review-input-label" htmlFor="review-json">
                  Vaka girdileri (JSON)
                </label>
                <textarea
                  id="review-json"
                  className="review-json"
                  spellCheck={false}
                  value={json}
                  onChange={(e) => {
                    setJson(e.target.value);
                    setJsonDirty(true);
                  }}
                />
                <Button
                  variant="secondary"
                  icon="check"
                  disabled={!jsonDirty}
                  onClick={() => {
                    try {
                      const parsed = normalizeBundle(JSON.parse(json));
                      if (parsed.case.id !== caseId)
                        throw Error("Vaka kimliği değiştirilemez.");
                      setWorking((w) => (w ? { ...w, bundle: parsed } : w));
                      setJsonDirty(false);
                      toast.success(
                        "JSON değişiklikleri taslağa uygulandı; henüz kaydedilmedi.",
                      );
                    } catch (e) {
                      toast.error(editorialError(e));
                    }
                  }}
                >
                  JSON değişikliklerini taslağa uygula
                </Button>
              </>
            )}
          </div>
          <div className="review-validation" role="status">
            {issues.length ? (
              <Disclosure
                title={`${issues.length} yayın kontrolü düzeltilmeli`}
                icon="info"
              >
                <ul>
                  {issues.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </Disclosure>
            ) : (
              <div>
                <Icon name="check-circle" />
                <span>
                  Yapısal yayın kontrolleri uygun. Bu kontrol klinik doğruluk
                  onayı değildir.
                </span>
              </div>
            )}
          </div>
          <Disclosure title="İşlem geçmişi ve önceki taslaklar" icon="clock">
            <div className="review-event-list">
              {[...events]
                .sort((a, b) => b.at - a.at)
                .slice(0, 30)
                .map((e) => (
                  <article key={e.id}>
                    <strong>{e.message}</strong>
                    <span>
                      Sürüm {e.revision} ·{" "}
                      {new Date(e.at).toLocaleString("tr-TR")}
                    </span>
                  </article>
                ))}
            </div>
            {!events.length && <p>Bu vaka için henüz kaydedilmiş işlem yok.</p>}
            {[...revisions]
              .reverse()
              .slice(0, 15)
              .map((v) => (
                <div className="review-revision-row" key={v.id}>
                  <span>
                    Taslak {v.revision} ·{" "}
                    {new Date(v.at).toLocaleString("tr-TR")}
                  </span>
                  <Button
                    variant="ghost"
                    disabled={v.revision === working.base.revision}
                    onClick={() => {
                      setWorking((w) =>
                        w ? { ...w, bundle: structuredClone(v.bundle) } : w,
                      );
                      toast(
                        "Önceki içerik taslağa alındı. Kaydetmeden ve yeniden onaylamadan yayımlanmaz.",
                      );
                    }}
                  >
                    İçeriği taslağa getir
                  </Button>
                </div>
              ))}
          </Disclosure>
        </section>
        <ReviewNotes
          caseId={caseId}
          notes={notes}
          scope={scope}
          setScope={setScope}
          focusToken={focusToken}
          onDirty={setNoteDirty}
          onReturn={() => {
            noteSource.current?.scrollIntoView({ block: "center" });
            noteSource.current?.focus({ preventScroll: true });
          }}
        />
      </div>
      <div className="review-save-dock">
        <div>
          <strong>
            {dirty || jsonDirty
              ? "Kaydedilmemiş değişiklik var"
              : approved
                ? "Bu sürüm onaylı"
                : "Taslak kaydı güncel"}
          </strong>
          <small>
            {blocking.length
              ? `${blocking.length} açık düzeltme notu onayı engelliyor.`
              : noteDirty
                ? "Yazdığın notu kaydetmeyi unutma."
                : "Onay, yalnız kaydedilmiş bu içerik sürümü için geçerlidir."}
          </small>
        </div>
        <div className="button-row">
          {live?.approval && (
            <Button variant="ghost" disabled={busy || stale} onClick={withdraw}>
              Onayı geri al
            </Button>
          )}
          <Button
            variant="secondary"
            icon="check"
            disabled={busy || !dirty || jsonDirty || stale}
            onClick={save}
          >
            Taslağı kaydet
          </Button>
          <Button
            icon="check-check"
            disabled={
              busy ||
              unsaved ||
              stale ||
              !!issues.length ||
              !!blocking.length ||
              approved
            }
            onClick={() => {
              setConsent(false);
              setApproval(true);
            }}
          >
            Bu vakayı onayla
          </Button>
        </div>
      </div>
      <Modal
        open={approval}
        onClose={() => setApproval(false)}
        title="Bu içerik sürümünü onayla"
        description="Onay yalnız bu vakaya ve bu sürümdeki öykü, değerlendirme alanları, soru/yanıtlar ve kaynaklara uygulanır."
      >
        <div className="confirm-card">
          <Icon name="clipboard" />
          <div>
            <strong>{b.case.title}</strong>
            <span>
              {caseId} · Sürüm {working.base.revision}
            </span>
          </div>
        </div>
        <label className="review-priority-toggle review-approval-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Bu vakanın bütün girdilerini inceledim; bu sürümün yayın paketine
            alınmasını onaylıyorum.
          </span>
        </label>
        <p className="fine-print">
          Bu kişisel yayın onayı, bağımsız klinik uzman onayı veya sıfır hata
          garantisi değildir. Siteye aktarım yayın paketiyle ayrıca yapılır.
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setApproval(false)}>
            İncelemeye dön
          </Button>
          <Button
            icon="check-check"
            disabled={!consent || busy}
            onClick={approve}
          >
            Bu sürümü onayla
          </Button>
        </div>
      </Modal>
      <Modal
        open={blocker.state === "blocked"}
        onClose={() => blocker.state === "blocked" && blocker.reset()}
        title="Kaydedilmemiş girdiler var"
        description="Taslakta, JSON alanında veya not kutusunda kaydedilmemiş değişiklik bulunuyor. Kaydetmek için bu sayfada kalabilirsin."
      >
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() => blocker.state === "blocked" && blocker.reset()}
          >
            Bu sayfada kal
          </Button>
          <Button
            variant="danger"
            onClick={() => blocker.state === "blocked" && blocker.proceed()}
          >
            Kaydetmeden ayrıl
          </Button>
        </div>
      </Modal>
      <Modal
        open={reload}
        onClose={() => setReload(false)}
        title="Güncel sürümü yükle"
        description="Bu sayfadaki kaydedilmemiş taslak değişikliklerinin yerine veritabanındaki sürüm gelir. Gerekiyorsa önce metnini kopyala."
      >
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setReload(false)}>
            Vazgeç
          </Button>
          <Button
            onClick={() => {
              if (live)
                setWorking({ base: live, bundle: structuredClone(live.draft) });
              setJsonDirty(false);
              setReload(false);
            }}
          >
            Güncel sürümü yükle
          </Button>
        </div>
      </Modal>
    </>
  );
}
