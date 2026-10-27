import { useEffect, useReducer, useRef, useState } from "react";
import { Link, useBlocker } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CircleHelp,
  EyeOff,
  Lightbulb,
  RotateCcw,
  Search,
  ShieldCheck,
  Shuffle,
  Trophy,
  Undo2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Modal } from "../../components/ui";
import { EquipmentArt } from "./EquipmentArt";
import {
  answerFor,
  bestQuestion,
  detectiveQuestions,
  detectiveSources,
  equipmentById,
  equipmentCards,
  questionById,
} from "./detective-data";
import {
  createDetective,
  detectiveTransition,
  DETECTIVE_KEY,
  restoreDetective,
  type DetectiveAction,
  type DetectiveGame,
  type DetectiveSettings,
} from "./detective-engine";
import "./games.css";
import "./detective.css";
const defaultSettings: DetectiveSettings = {
  mode: "solo",
  names: ["Dedektif", "Gizli kart"],
  winsTo: 2,
  guided: true,
};
function readSaved() {
  try {
    return restoreDetective(localStorage.getItem(DETECTIVE_KEY));
  } catch {
    return null;
  }
}
type Action = DetectiveAction | { type: "replace"; game: DetectiveGame | null };
function reducer(g: DetectiveGame | null, a: Action) {
  return a.type === "replace" ? a.game : g ? detectiveTransition(g, a) : null;
}
function LearningCard({ id }: { id: string }) {
  const card = equipmentById.get(id);
  if (!card) return null;
  const source = card.source
    ? detectiveSources[card.source as keyof typeof detectiveSources]
    : null;
  return (
    <div className="fd-learning">
      <EquipmentArt id={id} />
      <span className="fd-category">{card.group}</span>
      <h3>{card.name}</h3>
      <p>{card.description}</p>
      <p>{card.fact}</p>
      {source && (
        <a href={source.url} target="_blank" rel="noopener noreferrer">
          Kaynağı incele: {source.title} ↗
        </a>
      )}
    </div>
  );
}
function DetectiveRules() {
  return (
    <div className="pt-rules">
      <p>
        <strong>Amaç:</strong> Evet/hayır sorularıyla 16 ekipman arasından gizli
        kartı bul. Bu oyun, fizyoterapi ekipmanlarını tanıma ve özelliklerinden
        çıkarım yapma oyunudur.
      </p>
      <ol>
        <li>
          <strong>Tek kişilik keşif:</strong> Oyun gizli kartı rastgele seçer.
          İstediğin kadar farklı soru sorabilir, üç yanlış tahmin hakkın
          bitmeden kartı bulmaya çalışabilirsin.
        </li>
        <li>
          <strong>İki takım:</strong> Her takım diğerinden gizleyerek kendi
          kartını seçer. Sırası gelen takım rakibin kartını bulmaya çalışır.
          Başlangıç takımı ilk elde rastgele belirlenir, sonraki ellerde
          değişir.
        </li>
        <li>
          Bir sırada bir soru sor veya bir tahmin yap. Sorunun cevabını
          gördükten ya da yanlış tahminden sonra sıra diğer takıma geçer. Doğru
          tahmin eli kazandırır.
        </li>
        <li>
          Her takımın el başına üç yanlış tahmin hakkı vardır. Üçüncü yanlış
          tahmin eli rakibe kazandırır. Seçilen galibiyet sayısına ilk ulaşan
          takım maçı kazanır.
        </li>
        <li>
          <strong>Rehberli eleme:</strong> Yanıtla uyuşmayan kartlar otomatik
          elenir. <strong>Serbest eleme:</strong> Kartları kendin eleyip geri
          getirirsin. Son elemeyi geri almak soru geçmişini veya yanlış tahmin
          sayısını değiştirmez.
        </li>
        <li>
          Hazır soruları seçtiğinde oyun yanıtı verir. Soru önerisi yalnız kalan
          kartları en iyi bölen özelliği önerir; gizli kartı kullanmaz. Aynı
          soru aynı oyuncu tarafından bir elde tekrar sorulamaz.
        </li>
        <li>
          Sorular bu destedeki çizimleri ve oyun gruplarını esas alır. Örneğin
          her koşu bandı ekranlı olmak zorunda değildir; burada çizilen model
          ekranlıdır.
        </li>
        <li>
          İki takım aynı cihazı sırayla kullanır. Devir ekranında kartlar
          gizlenir. Gizli kart seçilirken rakip ekrana bakmaz. Bu, ayrı
          cihazlardan çevrim içi oynanan bir oyun değildir.
        </li>
      </ol>
      <p>
        Oyun bu tarayıcıya kaydedilir. Kayıtlı oyuna dönerken önce devir ekranı
        gösterilir. Paylaşılan cihazda kayıtları diğer kullanıcılar da açabilir.
      </p>
      <p>
        İçerik ekipman tanıtımı içindir; kişiye özel değerlendirme veya ekipman
        kullanımı önermez.
      </p>
      <details>
        <summary>İçerik kaynakları</summary>
        <ul>
          {Object.values(detectiveSources).map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title} ↗
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
export function Detective() {
  const [game, dispatch] = useReducer(reducer, null),
    [saved, setSaved] = useState(readSaved),
    [settings, setSettings] = useState<DetectiveSettings>(defaultSettings);
  const [rules, setRules] = useState(false),
    [reset, setReset] = useState(false),
    [catalog, setCatalog] = useState(false),
    [detail, setDetail] = useState<string | null>(null),
    [selected, setSelected] = useState<string | null>(null),
    [guess, setGuess] = useState<string | null>(null),
    [boardMode, setBoardMode] = useState<"eliminate" | "guess">("eliminate"),
    [question, setQuestion] = useState(""),
    [showEliminated, setShowEliminated] = useState(true),
    [notice, setNotice] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"questions" | "cards">(
    "questions",
  );
  const heading = useRef<HTMLHeadingElement>(null),
    boardTop = useRef<HTMLDivElement>(null);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!game &&
      game.stage !== "finished" &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (game)
      try {
        localStorage.setItem(DETECTIVE_KEY, JSON.stringify(game));
      } catch {
        setNotice(
          "Bu tarayıcı oyunu kaydedemedi. Sayfayı kapatmadan devam edebilirsin.",
        );
      }
  }, [game]);
  useEffect(() => {
    const old = document.title;
    document.title = "Ben Kimim? · Fizyo Dedektif · FTR Atlas";
    return () => {
      document.title = old;
    };
  }, []);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    if (game?.stage === "board")
      boardTop.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [game?.stage, game?.active]);
  useEffect(() => {
    setSelected(null);
    setBoardMode("eliminate");
    setQuestion("");
    setMobilePanel("questions");
  }, [game?.round, game?.selecting, game?.active]);
  useEffect(() => {
    if (!game || game.stage === "finished") return;
    const fn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [!!game, game?.stage === "finished"]);
  const active = game?.active ?? 0,
    candidates = game?.candidates[active] ?? [],
    logs = game?.logs[active] ?? [],
    asked = logs.map((l) => l.questionId),
    suggestion = bestQuestion(candidates, asked);
  const q =
    questionById.get(question) && !asked.includes(question)
      ? questionById.get(question)!
      : (suggestion ??
        detectiveQuestions.find((item) => !asked.includes(item.id)));
  const yesCount = q
    ? candidates.filter((id) => answerFor(id, q.id)).length
    : 0;
  const playing = !!game && ["board", "answer", "wrong"].includes(game.stage);
  function begin() {
    const names: [string, string] = [
      settings.names[0].trim(),
      settings.names[1].trim(),
    ];
    if (
      !names.every(Boolean) ||
      (settings.mode === "teams" &&
        names[0].toLocaleLowerCase("tr-TR") ===
          names[1].toLocaleLowerCase("tr-TR"))
    ) {
      setNotice("İki takıma birbirinden farklı adlar ver.");
      return;
    }
    setNotice("");
    setSaved(null);
    dispatch({
      type: "replace",
      game: createDetective({
        ...settings,
        names,
        winsTo: settings.mode === "solo" ? 1 : settings.winsTo,
      }),
    });
  }
  function clear() {
    dispatch({ type: "replace", game: null });
    setSaved(null);
    setReset(false);
    setSelected(null);
    setGuess(null);
    setNotice("");
    try {
      localStorage.removeItem(DETECTIVE_KEY);
    } catch {
      /* State is still cleared. */
    }
  }
  function switchMode(mode: "solo" | "teams") {
    setSettings((s) => ({
      ...s,
      mode,
      names:
        mode === "teams"
          ? ["Turkuaz Takım", "Lacivert Takım"]
          : ["Dedektif", "Gizli kart"],
    }));
  }
  function continueTurn() {
    setMobilePanel("cards");
    setGuess(null);
    dispatch({ type: "acknowledge" });
  }
  const solo = game?.settings.mode === "solo";
  return (
    <div className="fd-game">
      <div className="pt-game-top">
        <Link to="/games" className="pt-back">
          <ArrowLeft size={17} /> Oyunlar
        </Link>
        <button className="pt-tool" onClick={() => setRules(true)}>
          <BookOpen size={18} /> Nasıl oynanır?
        </button>
      </div>
      <header className="fd-heading">
        <img
          src={`${import.meta.env.BASE_URL}games/physiotech-logo.png`}
          width="64"
          height="64"
          alt="PhysioTech Öğrenci Topluluğu logosu"
        />
        <div>
          <span>PHYSIOTECH · BEN KİMİM?</span>
          <h1>
            Fizyo <em>Dedektif</em>
          </h1>
          <p>İyi bir soru, yeni bir ipucu.</p>
        </div>
      </header>
      {notice && (
        <p className="pt-notice" role="status">
          {notice}
        </p>
      )}
      {!game && (
        <>
          <section className="fd-intro">
            <div>
              <span className="fd-eyebrow">
                16 EKİPMAN · EVET / HAYIR · MANTIK YÜRÜTME
              </span>
              <h2>
                Bir gizem var.
                <br />
                Sorularınla çöz.
              </h2>
              <p>
                Gizli fizyoterapi ekipmanını bulmak için özelliklerini sorgula.
                Kartları ele, ipuçlarını birleştir ve tahminini yap.
              </p>
              <div className="fd-intro-facts">
                <span>
                  <Search size={17} />
                  24 hazır soru
                </span>
                <span>
                  <Users size={17} />
                  Tek kişi veya 2 takım
                </span>
                <span>
                  <ShieldCheck size={17} />
                  Süre baskısı yok
                </span>
              </div>
              <button
                className="fd-text-button"
                onClick={() => setCatalog(!catalog)}
              >
                {catalog ? "Kartları kapat" : "Önce ekipmanları tanı"}
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="fd-intro-art" aria-hidden="true">
              <div className="fd-display-card">
                <EquipmentArt id="goniometer" decorative />
                <span>İpucu #01</span>
                <strong>Ölçü çizgilerim var mı?</strong>
                <b>Evet.</b>
              </div>
              <span className="fd-floating-question">?</span>
            </div>
          </section>
          {saved && (
            <div className="fd-saved">
              <div>
                <strong>Dedektif dosyan burada.</strong>
                <p>
                  {saved.settings.mode === "solo"
                    ? "Tek kişilik keşif"
                    : saved.settings.names.join(" · ")}{" "}
                  · {saved.round}. el
                </p>
              </div>
              <button
                className="pt-button pt-primary"
                onClick={() => {
                  dispatch({ type: "replace", game: saved });
                  setSaved(null);
                }}
              >
                Kaldığım yerden devam et <ArrowRight size={17} />
              </button>
              <button className="fd-text-button" onClick={() => setReset(true)}>
                Kaydı sil
              </button>
            </div>
          )}
          <section className="fd-setup">
            <div>
              <span className="fd-eyebrow">OYUNUNU SEÇ</span>
              <h2>Keşfet veya karşılaş.</h2>
              <div className="fd-mode-picker">
                <button
                  aria-pressed={settings.mode === "solo"}
                  onClick={() => switchMode("solo")}
                >
                  <UserRound />
                  <strong>Tek kişilik keşif</strong>
                  <span>Oyun kartı seçsin, sen sorularla bul.</span>
                </button>
                <button
                  aria-pressed={settings.mode === "teams"}
                  onClick={() => switchMode("teams")}
                >
                  <Users />
                  <strong>İki takım</strong>
                  <span>Kartları gizleyin, sırayla birbirinizi çözün.</span>
                </button>
              </div>
              <div className="pt-fields">
                <label>
                  {settings.mode === "teams" ? "1. takım adı" : "Oyuncu adı"}
                  <input
                    value={settings.names[0]}
                    maxLength={30}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        names: [e.target.value, s.names[1]],
                      }))
                    }
                  />
                </label>
                {settings.mode === "teams" && (
                  <>
                    <label>
                      2. takım adı
                      <input
                        value={settings.names[1]}
                        maxLength={30}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            names: [s.names[0], e.target.value],
                          }))
                        }
                      />
                    </label>
                    <label>
                      Maçı kazanmak için
                      <select
                        value={settings.winsTo}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            winsTo: Number(e.target.value) as 1 | 2 | 3,
                          }))
                        }
                      >
                        <option value="1">1 el kazan</option>
                        <option value="2">2 el kazan</option>
                        <option value="3">3 el kazan</option>
                      </select>
                    </label>
                  </>
                )}
                <label>
                  Eleme biçimi
                  <select
                    value={settings.guided ? "guided" : "manual"}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        guided: e.target.value === "guided",
                      }))
                    }
                  >
                    <option value="guided">Rehberli · otomatik eleme</option>
                    <option value="manual">Serbest · kendim eleyeyim</option>
                  </select>
                </label>
              </div>
              <p className="fd-small-note">
                Her elde 3 yanlış tahmin hakkı. İki takım aynı cihazı sırayla
                kullanır.
              </p>
              <button className="pt-button pt-primary fd-start" onClick={begin}>
                Dedektif dosyasını aç <ArrowRight size={19} />
              </button>
            </div>
            <aside className="fd-mini-guide">
              <div>
                <b>01</b>
                <p>
                  <strong>Soru sor.</strong> Hazır sorulardan birini seç. Yanıtı
                  oyun versin.
                </p>
              </div>
              <div>
                <b>02</b>
                <p>
                  <strong>Seçenekleri azalt.</strong> Rehberli mod otomatik
                  eler; serbest modda karar senin.
                </p>
              </div>
              <div>
                <b>03</b>
                <p>
                  <strong>Ben kimim?</strong> Emin olduğunda bir kart seçip
                  tahminini doğrula.
                </p>
              </div>
              <small>
                Yanıtlar bu destedeki çizimlere göre verilir. Farklı ekipman
                modellerinin özellikleri değişebilir.
              </small>
            </aside>
          </section>
          {catalog && (
            <section className="fd-catalog">
              <h2>Ekipmanları tanı</h2>
              <p>Bir karta dokun, kısa açıklamasını oku.</p>
              <div className="fd-board">
                {equipmentCards.map((c) => (
                  <button
                    className="fd-equipment"
                    key={c.id}
                    onClick={() => setDetail(c.id)}
                  >
                    <EquipmentArt id={c.id} decorative />
                    <strong>{c.name}</strong>
                    <small>{c.group}</small>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      {game && (
        <>
          <div className="fd-score-strip">
            <span>
              <b>{solo ? "KEŞİF DOSYASI" : `${game.round}. EL`}</b>
              {game.settings.guided ? "Rehberli eleme" : "Serbest eleme"}
            </span>
            {!solo &&
              game.settings.names.map((n, i) => (
                <div key={i} className={active === i ? "fd-current" : ""}>
                  <span>{n}</span>
                  <strong>{game.scores[i]}</strong>
                </div>
              ))}
            {solo && (
              <div>
                <span>{game.settings.names[0]}</span>
                <strong>{game.logs[0].length} soru</strong>
              </div>
            )}
          </div>
          {game.stage === "pick" && (
            <section className="fd-private">
              <span className="fd-gate-icon">
                <EyeOff size={30} />
              </span>
              <span className="fd-eyebrow">GİZLİ KART SEÇİMİ</span>
              <h2 ref={heading} tabIndex={-1}>
                {game.settings.names[game.selecting]}, kartını seç.
              </h2>
              <p>
                Bu kartı rakibin bulmaya çalışacak. Seçim sırasında yalnız senin
                takımın ekrana baksın.
              </p>
              <button
                className="fd-text-button"
                onClick={() =>
                  setSelected(
                    equipmentCards[
                      Math.floor(Math.random() * equipmentCards.length)
                    ].id,
                  )
                }
              >
                <Shuffle size={17} /> Benim için rastgele seç
              </button>
              <div className="fd-board fd-pick-board">
                {equipmentCards.map((c) => (
                  <button
                    key={c.id}
                    className={`fd-equipment ${selected === c.id ? "fd-selected" : ""}`}
                    aria-pressed={selected === c.id}
                    onClick={() => setSelected(c.id)}
                  >
                    <EquipmentArt id={c.id} decorative />
                    <strong>{c.name}</strong>
                    {selected === c.id && (
                      <span className="fd-selected-label">
                        <Check size={14} />
                        Seçildi
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button
                disabled={!selected}
                className="pt-button pt-primary fd-start"
                onClick={() =>
                  selected && dispatch({ type: "pick", id: selected })
                }
              >
                <EyeOff size={18} /> Kartımı kilitle ve gizle
              </button>
            </section>
          )}
          {game.stage === "pick-handoff" && (
            <section className="fd-gate">
              <EyeOff size={38} />
              <h2 ref={heading} tabIndex={-1}>
                İlk kart kilitlendi.
              </h2>
              <p>
                Ekranı <strong>{game.settings.names[1]}</strong> takımına verin.
                Önceki takım şimdi ekrana bakmasın.
              </p>
              <button
                className="pt-button pt-primary"
                onClick={() => dispatch({ type: "pick-ready" })}
              >
                İkinci takım kartını seçsin <ArrowRight size={18} />
              </button>
            </section>
          )}
          {game.stage === "ready" && (
            <section className="fd-gate">
              <Search size={38} />
              <span className="fd-eyebrow">
                {solo ? "GİZLİ EKİPMAN HAZIR" : "SIRA BU TAKIMDA"}
              </span>
              <h2 ref={heading} tabIndex={-1}>
                {game.settings.names[active]}, hazır mısın?
              </h2>
              <p>
                {solo
                  ? "Oyun bir ekipman seçti. 16 kart ve 24 hazır soruyla ipuçlarının peşine düş."
                  : "Ekranı bu takıma verin. Rakip takımın gizli kartını bulmak için bir soru sorun veya tahmin yapın."}
              </p>
              <div className="fd-gate-badges">
                <span>16 ekipman</span>
                <span>3 yanlış tahmin hakkı</span>
                <span>
                  {game.settings.guided ? "Otomatik eleme" : "Elle eleme"}
                </span>
              </div>
              <button
                className="pt-button pt-primary"
                onClick={() => dispatch({ type: "start" })}
              >
                Ekran bende, başlayalım <ArrowRight size={18} />
              </button>
            </section>
          )}
          {playing && (
            <>
              <div className="fd-board-top" ref={boardTop}>
                <div>
                  <span className="fd-eyebrow">
                    {solo
                      ? "GİZEMİ ÇÖZ"
                      : `${game.settings.names[active]} · SIRA SENDE`}
                  </span>
                  <h2 ref={heading} tabIndex={-1}>
                    {candidates.length === 1
                      ? "Son bir aday kaldı."
                      : `${candidates.length} ekipman hâlâ oyunda.`}
                  </h2>
                </div>
                <div className="fd-turn-stats">
                  <span>
                    <b>{logs.length}</b> soru
                  </span>
                  <span>
                    <b>{3 - game.wrongs[active]}</b> tahmin hakkı
                  </span>
                </div>
              </div>
              <div className="fd-mobile-switch" aria-label="Oyun panelleri">
                <button
                  aria-pressed={mobilePanel === "questions"}
                  onClick={() => setMobilePanel("questions")}
                >
                  <CircleHelp size={17} /> Soru masası
                </button>
                <button
                  aria-pressed={mobilePanel === "cards"}
                  onClick={() => setMobilePanel("cards")}
                >
                  <Search size={17} /> Kart tahtası · {candidates.length}
                </button>
              </div>
              <div className={`fd-workspace fd-workspace--${mobilePanel}`}>
                <section className="fd-board-section">
                  <div className="fd-board-toolbar">
                    <div
                      className="fd-segmented"
                      aria-label="Kart işlem biçimi"
                    >
                      <button
                        aria-pressed={boardMode === "eliminate"}
                        onClick={() => {
                          setBoardMode("eliminate");
                          setSelected(null);
                        }}
                      >
                        Kart ele
                      </button>
                      <button
                        aria-pressed={boardMode === "guess"}
                        onClick={() => {
                          setBoardMode("guess");
                          setSelected(null);
                        }}
                      >
                        Tahmin seç
                      </button>
                    </div>
                    <button
                      className="fd-text-button"
                      onClick={() => setShowEliminated(!showEliminated)}
                    >
                      {showEliminated
                        ? "Elenenleri gizle"
                        : "Tüm kartları göster"}
                    </button>
                  </div>
                  <p className="fd-board-instruction">
                    {boardMode === "eliminate"
                      ? "Dokunarak kart ele veya geri getir."
                      : "Tahmin edeceğin kartı seç. Sonra tahminini doğrula."}
                  </p>
                  {candidates.length === 0 && (
                    <p className="pt-notice" role="status">
                      Bütün kartları eledin. Son elemeyi geri al veya elenen bir
                      kartı geri getir.
                    </p>
                  )}
                  <div className="fd-board">
                    {equipmentCards
                      .filter(
                        (c) => showEliminated || candidates.includes(c.id),
                      )
                      .map((c) => {
                        const eliminated = !candidates.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            className={`fd-equipment ${eliminated ? "fd-eliminated" : ""} ${boardMode === "guess" && selected === c.id ? "fd-selected" : ""}`}
                            aria-pressed={
                              boardMode === "eliminate"
                                ? eliminated
                                : selected === c.id
                            }
                            aria-label={`${c.name}${eliminated ? " · elendi" : ""}. ${boardMode === "eliminate" ? (eliminated ? "Geri getir" : "Ele") : "Tahmin için seç"}`}
                            disabled={
                              game.stage !== "board" ||
                              (boardMode === "guess" && eliminated)
                            }
                            onClick={() =>
                              boardMode === "eliminate"
                                ? dispatch({ type: "toggle", id: c.id })
                                : setSelected(c.id)
                            }
                          >
                            <EquipmentArt id={c.id} decorative />
                            <strong>{c.name}</strong>
                            {eliminated && (
                              <span className="fd-eliminated-mark">
                                <X size={17} />
                                Elendi
                              </span>
                            )}
                            {!eliminated &&
                              boardMode === "guess" &&
                              selected === c.id && (
                                <span className="fd-selected-label">
                                  <Check size={14} />
                                  Seçildi
                                </span>
                              )}
                          </button>
                        );
                      })}
                  </div>
                  <div className="fd-board-bottom">
                    <button
                      className="fd-text-button"
                      disabled={
                        !game.undo[active].length || game.stage !== "board"
                      }
                      onClick={() => dispatch({ type: "undo" })}
                    >
                      <Undo2 size={17} /> Son elemeyi geri al
                    </button>
                    {boardMode === "guess" && (
                      <button
                        className="pt-button pt-primary"
                        disabled={
                          !selected ||
                          !candidates.includes(selected) ||
                          game.stage !== "board"
                        }
                        onClick={() => setGuess(selected)}
                      >
                        Ben kimim? Tahmin et <ArrowRight size={17} />
                      </button>
                    )}
                  </div>
                </section>
                <aside className="fd-question-panel">
                  <span className="fd-eyebrow">
                    <CircleHelp size={16} /> SORU MASASI
                  </span>
                  <h3>Hangi özelliği sorgulayacaksın?</h3>
                  <label className="fd-question-label">
                    Sorunu seç
                    <select
                      value={q?.id ?? ""}
                      onChange={(e) => setQuestion(e.target.value)}
                      disabled={game.stage !== "board" || !q}
                    >
                      {["Grup", "Görünüm", "Ayırt edici"].map((section) => (
                        <optgroup key={section} label={section}>
                          {detectiveQuestions
                            .filter((item) => item.section === section)
                            .map((item) => (
                              <option
                                key={item.id}
                                value={item.id}
                                disabled={asked.includes(item.id)}
                              >
                                {asked.includes(item.id) ? "✓ " : ""}
                                {item.text}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  {q ? (
                    <>
                      <div className="fd-question-preview">
                        <strong>{q.text}</strong>
                        <details className="fd-question-scope">
                          <summary>Sorunun kapsamı</summary>
                          <p>{q.explanation}</p>
                        </details>
                        <span>
                          Kalan adaylarda: {yesCount} evet ·{" "}
                          {candidates.length - yesCount} hayır
                        </span>
                        {candidates.length > 1 &&
                          (yesCount === 0 ||
                            yesCount === candidates.length) && (
                            <small>
                              Bu soru kalan adayları ayırmıyor. Farklı bir
                              özellik seçebilirsin.
                            </small>
                          )}
                      </div>
                      <button
                        className="pt-button pt-primary fd-ask"
                        disabled={game.stage !== "board" || !candidates.length}
                        onClick={() => dispatch({ type: "ask", id: q.id })}
                      >
                        Soruyu sor <ArrowRight size={18} />
                      </button>
                    </>
                  ) : (
                    <p>
                      Hazır soruların hepsini kullandın. Geçmiş yanıtları
                      inceleyip tahminini yap.
                    </p>
                  )}
                  <button
                    className="fd-text-button fd-hint"
                    disabled={!suggestion || game.stage !== "board"}
                    onClick={() => {
                      if (suggestion) {
                        setQuestion(suggestion.id);
                        dispatch({ type: "hint" });
                      }
                    }}
                  >
                    <Lightbulb size={17} /> Ayırt edici soru öner
                  </button>
                  <small className="fd-question-foot">
                    Öneri, yalnızca kalan kartlara bakar; gizli kartı kullanmaz.
                    Bu elde {game.hints[active]} öneri aldın.
                  </small>
                  <div className="fd-history">
                    <h3>
                      Soru defteri <span>{logs.length}</span>
                    </h3>
                    {logs.length ? (
                      <ol>
                        {[...logs].reverse().map((log) => (
                          <li key={log.questionId}>
                            <strong>
                              {questionById.get(log.questionId)?.text}
                            </strong>
                            <span className={log.answer ? "fd-yes" : "fd-no"}>
                              {log.answer ? "Evet" : "Hayır"}
                            </span>
                            {game.settings.guided && (
                              <small>
                                {log.before} → {log.after} aday
                              </small>
                            )}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p>İlk sorunla defteri aç.</p>
                    )}
                  </div>
                  {!solo && (
                    <button
                      className="fd-text-button"
                      disabled={game.stage !== "board"}
                      onClick={() => dispatch({ type: "skip" })}
                    >
                      Sormadan sırayı devret <ArrowRight size={16} />
                    </button>
                  )}
                </aside>
              </div>
            </>
          )}
          {(game.stage === "result" || game.stage === "finished") && (
            <section className="fd-result">
              <Trophy size={45} />
              <span className="fd-eyebrow">
                {game.stage === "finished"
                  ? "DOSYA TAMAMLANDI"
                  : "EL TAMAMLANDI"}
              </span>
              <h2 ref={heading} tabIndex={-1}>
                {solo
                  ? game.reason === "correct"
                    ? "Gizemi çözdün!"
                    : "Gizem bu kez kartta kaldı."
                  : `${game.settings.names[game.winner ?? 0]} ${game.stage === "finished" ? "maçı" : "eli"} kazandı!`}
              </h2>
              <p>
                {game.reason === "attempts"
                  ? "Üç yanlış tahmin hakkı kullanıldı."
                  : "Doğru sorular, doğru tahmine götürdü."}
              </p>
              <div className="fd-result-stats">
                <span>
                  <b>{game.logs[active].length}</b> soru
                </span>
                <span>
                  <b>{game.wrongs[active]}</b> yanlış tahmin
                </span>
                <span>
                  <b>{game.hints[active]}</b> öneri
                </span>
              </div>
              <div className="fd-reveals">
                {game.secrets.map(
                  (id, i) =>
                    id && (
                      <section key={i}>
                        <span>
                          {solo
                            ? "Gizli ekipman"
                            : `${game.settings.names[i]} · gizli kart`}
                        </span>
                        <LearningCard id={id} />
                      </section>
                    ),
                )}
              </div>
              {game.stage === "result" ? (
                <button
                  className="pt-button pt-primary"
                  onClick={() => dispatch({ type: "next-round" })}
                >
                  Yeni el · gizli kartları seç <ArrowRight size={18} />
                </button>
              ) : (
                <button className="pt-button pt-primary" onClick={clear}>
                  <RotateCcw size={18} /> Yeni oyun kur
                </button>
              )}
              <Link className="fd-text-button" to="/games">
                Oyunlara dön <ArrowRight size={17} />
              </Link>
            </section>
          )}
          <div className="fd-game-footer">
            <span role="status">
              {game.stage === "board"
                ? `${game.settings.names[active]} için ${candidates.length} aday kaldı.`
                : game.stage === "ready"
                  ? "Kartlar gizli. Sıradaki oyuncu bekleniyor."
                  : game.stage === "pick" || game.stage === "pick-handoff"
                    ? "Gizli kartlar seçiliyor."
                    : game.stage === "finished"
                      ? "Oyun tamamlandı."
                      : "İpucu dosyan kaydediliyor."}
            </span>
            <button className="fd-text-button" onClick={() => setReset(true)}>
              <RotateCcw size={16} /> Yeni oyun
            </button>
          </div>
        </>
      )}
      <Modal
        open={rules}
        onClose={() => setRules(false)}
        title="Ben Kimim? · Oyun kuralları"
        description="Sor, ele, düşün ve gizli ekipmanı bul."
        wide
      >
        <DetectiveRules />
        <button
          className="pt-button pt-primary"
          onClick={() => setRules(false)}
        >
          Kurallar tamam
        </button>
      </Modal>
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={
          detail ? (equipmentById.get(detail)?.name ?? "Ekipman") : "Ekipman"
        }
        description="Ekipmanı tanı."
      >
        {detail && <LearningCard id={detail} />}
      </Modal>
      <Modal
        open={!!guess}
        onClose={() => setGuess(null)}
        title="Son kararın mı?"
        description="Yanlış tahmin bir hakkını kullanır; iki takımlı oyunda sıra da rakibe geçer."
      >
        {guess && (
          <div className="fd-guess-confirm">
            <EquipmentArt id={guess} />
            <strong>{equipmentById.get(guess)?.name}</strong>
            <div>
              <button
                className="pt-button pt-secondary"
                onClick={() => setGuess(null)}
              >
                Biraz daha düşüneyim
              </button>
              <button
                className="pt-button pt-primary"
                onClick={() => {
                  dispatch({ type: "guess", id: guess });
                  setGuess(null);
                  setSelected(null);
                }}
              >
                Tahminimi doğrula
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={game?.stage === "answer"}
        onClose={continueTurn}
        title={
          game?.pending?.answer
            ? "Evet. Güzel bir ipucu!"
            : "Hayır. Yeni bir ipucu."
        }
        description="Yanıt, bu destedeki çizime ve kart özelliklerine göre verildi."
      >
        {game?.pending && (
          <div className="fd-answer">
            <span
              className={game.pending.answer ? "fd-answer-yes" : "fd-answer-no"}
            >
              {game.pending.answer ? <Check size={30} /> : <X size={30} />}
            </span>
            <h3>{questionById.get(game.pending.questionId)?.text}</h3>
            <p>
              {game.settings.guided
                ? `${game.pending.before} adaydan ${game.pending.after} aday kaldı.`
                : "Bu yanıtı kullanarak sıran geldiğinde kartlarını eleyebilirsin."}
            </p>
            <button className="pt-button pt-primary" onClick={continueTurn}>
              {solo
                ? "İpuçlarını birleştir, devam et"
                : "Ekranı diğer takıma devret"}
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </Modal>
      <Modal
        open={game?.stage === "wrong"}
        onClose={continueTurn}
        title="Bu kez olmadı."
        description={
          game
            ? `${3 - game.wrongs[active]} yanlış tahmin hakkın kaldı.`
            : undefined
        }
      >
        <div className="fd-answer">
          <X size={35} />
          <h3>
            {game?.lastGuess ? equipmentById.get(game.lastGuess)?.name : ""}{" "}
            doğru kart değil.
          </h3>
          <p>
            Gizli ekipman açıklanmadı. Soru defterindeki yanıtları kullanmaya
            devam et.
          </p>
          <button className="pt-button pt-primary" onClick={continueTurn}>
            {solo ? "Keşfe devam et" : "Ekranı diğer takıma devret"}
            <ArrowRight size={17} />
          </button>
        </div>
      </Modal>
      <Modal
        open={reset}
        onClose={() => setReset(false)}
        title="Yeni bir dosya açılsın mı?"
        description="Mevcut oyunun skorları, gizli kartları ve soru geçmişi silinir."
      >
        <div className="pt-dialog-actions">
          <button
            className="pt-button pt-secondary"
            onClick={() => setReset(false)}
          >
            Oyuna dön
          </button>
          <button className="pt-button pt-primary" onClick={clear}>
            Kaydı sil, yeni oyun kur
          </button>
        </div>
      </Modal>
      <Modal
        open={blocker.state === "blocked"}
        onClose={() => blocker.state === "blocked" && blocker.reset()}
        title="Dedektif dosyasını kapatıyor musun?"
        description="Oyun bu tarayıcıda saklanır. Geri döndüğünde devam edebilirsin."
      >
        <div className="pt-dialog-actions">
          <button
            className="pt-button pt-secondary"
            onClick={() => blocker.state === "blocked" && blocker.reset()}
          >
            Oyunda kal
          </button>
          <button
            className="pt-button pt-primary"
            onClick={() => blocker.state === "blocked" && blocker.proceed()}
          >
            Kaydet ve ayrıl
          </button>
        </div>
      </Modal>
    </div>
  );
}
