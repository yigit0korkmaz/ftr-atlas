import { useEffect, useReducer, useRef, useState } from "react";
import { Link, useBlocker } from "react-router-dom";
import {
  Gamepad2,
  ArrowRight,
  Timer,
  Users,
  Layers,
  Play,
  Pause,
  Check,
  X,
  SkipForward,
  Undo2,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Trophy,
  RotateCcw,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Modal } from "../../components/ui";
import { tabooCards } from "./cards";
import {
  activeTeam,
  createGame,
  passCount,
  points,
  restoreGame,
  STORAGE_KEY,
  transition,
  type Game,
  type Outcome,
  type Settings,
} from "./engine";
import "./games.css";

const logo = `${import.meta.env.BASE_URL}games/physiotech-logo.png`;
const defaults: Settings = {
  teams: ["Takım A", "Takım B"],
  seconds: 60,
  rounds: 3,
  passes: 3,
  difficulty: "Tümü",
  category: "Tümü",
  sound: false,
};
const names = { correct: "Doğru", taboo: "Yasak", pass: "Pas" };
const cardById = new Map(tabooCards.map((c) => [c.id, c]));
function readSaved() {
  try {
    return restoreGame(
      localStorage.getItem(STORAGE_KEY),
      tabooCards.map((c) => c.id),
    );
  } catch {
    return null;
  }
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`pt-brand ${compact ? "pt-brand--small" : ""}`}>
      <img
        src={logo}
        width="104"
        height="104"
        alt="Yozgat Bozok Üniversitesi PhysioTech Öğrenci Topluluğu logosu"
      />
      <div>
        <span>PHYSIOTECH TOPLULUĞU</span>
        <strong>Birlikte öğren, birlikte oyna.</strong>
      </div>
    </div>
  );
}
export function Games() {
  return (
    <div className="pt-hub">
      <div className="pt-hub-heading">
        <span className="pt-eyebrow">
          <Gamepad2 size={18} /> OYUNLAR
        </span>
        <h1>Bilgiyi oyuna dönüştür.</h1>
        <p>Arkadaşlarını topla. Teknoloji ve sağlığı birlikte keşfet.</p>
      </div>
      <section className="pt-feature">
        <div className="pt-feature-copy">
          <Brand />
          <span className="pt-pill">TEKNOLOJİ × SAĞLIK × TAKIM RUHU</span>
          <h2>
            Fizyo<span>Tabu</span>
          </h2>
          <p>
            Bir kavram, beş yasaklı ifade. Kelimelere takılmadan anlat;
            takımınla aynı frekansı yakala.
          </p>
          <div className="pt-facts">
            <span>
              <Layers size={18} />
              45 kart
            </span>
            <span>
              <Users size={18} />2 takım
            </span>
            <span>
              <Timer size={18} />
              30–120 saniye
            </span>
          </div>
          <Link className="pt-button pt-primary" to="/games/fizyotabu">
            Oyuna geç <ArrowRight size={20} />
          </Link>
          <small>Aynı cihazdan, yüz yüze oynanır. Üyelik gerekmez.</small>
        </div>
        <div className="pt-feature-art" aria-hidden="true">
          <div className="pt-orbit pt-orbit--one" />
          <div className="pt-orbit pt-orbit--two" />
          <div className="pt-mini-card pt-mini-card--back" />
          <div className="pt-mini-card">
            <span>ANLAT BAKALIM</span>
            <strong>Bluetooth</strong>
            <hr />
            <b>Kablosuz</b>
            <b>Kısa mesafe</b>
            <b>Eşleştirme</b>
            <b>Kulaklık</b>
            <b>Hoparlör</b>
            <small>PHYSIOTECH · FİZYOTABU</small>
          </div>
          <span className="pt-art-tag">
            <Sparkles size={17} /> Kelimelerin ötesinde düşün.
          </span>
        </div>
      </section>
      <div className="pt-hub-notes">
        <div>
          <ShieldCheck />
          <h3>Kurallar açık</h3>
          <p>
            Doğru +1, yasak −1. Pas 0 puan. İki takım da eşit sayıda tur oynar.
          </p>
        </div>
        <div>
          <BookOpen />
          <h3>Dil özenli</h3>
          <p>
            Türkçe kavramlar, özgün marka adları ve kabul edilen karşılıklar bir
            arada.
          </p>
        </div>
        <div>
          <Users />
          <h3>Oyun sende</h3>
          <p>
            Süreyi, tur sayısını, kart grubunu ve pas hakkını birlikte
            belirleyin.
          </p>
        </div>
      </div>
    </div>
  );
}
function Rules() {
  return (
    <div className="pt-rules">
      <p>
        <strong>Yüz yüze, aynı cihazdan oynayın.</strong> Kartı yalnız anlatıcı
        ve karşı takımdan hakem görür. Tahmin eden takım ekrana bakmaz.
      </p>
      <ol>
        <li>
          Başlığı, başlığın parçalarını ve bunların aynı kökten türeyen
          biçimlerini söylemeyin.
        </li>
        <li>
          Beş yasaklı ifadeyi, aynı kökten türeyen biçimlerini ve açık yabancı
          dil karşılıklarını kullanmayın. Örneğin 3D ile üç boyutlu aynı yasak
          sayılır.
        </li>
        <li>
          Kısaltmanın açılımını, doğrudan çevirisini, harflerini veya hecelerini
          vererek anlatmayın. İşaret etmek, yazmak, taklit etmek ve ses
          benzetmesi yapmak da yasak.
        </li>
        <li>
          Doğru cevap +1; yasak kelime −1; pas 0 puandır. Hakem işlemi seçer.
          Yanlış basılırsa son işlem geri alınabilir; süre geri gelmez.
        </li>
        <li>
          Başlık ve kartta belirtilen kabul edilen karşılıklar doğru sayılır.
          Eklenen karşılıklar anlatıcıya serbest ipucu değildir.
        </li>
        <li>
          Her iki takım seçilen sayıda tur oynar. Süre dolunca mevcut karttan
          puan alınmaz. Deste bitmeden kart tekrarlanmaz; deste tükenirse
          karıştırılarak yeniden kullanılır.
        </li>
        <li>
          Sekme arka plana geçtiğinde oyun duraklar. Devam etmeden önce cihazı
          ve ekranı yeni anlatıcıya verin.
        </li>
      </ol>
      <p>
        Kartlar bir kelime oyunudur; yasaklı ifadeler kavramın tanımı veya
        sağlık önerisi değildir. Zorluk etiketleri oyun içi sınıflandırmadır.
        Takımlar aynı kart havuzunu kullanır; çekilişlerin güçlüğü birebir eşit
        olmayabilir.
      </p>
      <p>
        Hakem kararını tur başlamadan belirlediğiniz bu kurallara göre verir.
      </p>
    </div>
  );
}
type UIAction =
  { type: "replace"; game: Game | null } | Parameters<typeof transition>[1];
function reducer(state: Game | null, action: UIAction): Game | null {
  return action.type === "replace"
    ? action.game
    : state
      ? transition(state, action)
      : null;
}
export function FizyoTabu() {
  const [game, dispatch] = useReducer(reducer, null);
  const [saved, setSaved] = useState(readSaved);
  const [settings, setSettings] = useState<Settings>(defaults);
  const [rules, setRules] = useState(false),
    [reset, setReset] = useState(false),
    [full, setFull] = useState(false),
    [notice, setNotice] = useState("");
  const [resuming, setResuming] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    heading = useRef<HTMLHeadingElement>(null),
    gameRef = useRef(game);
  const audio = useRef<AudioContext | null>(null),
    lastStage = useRef("");
  gameRef.current = game;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!game &&
      game.stage !== "finished" &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  const pool = tabooCards.filter(
    (c) =>
      (settings.category === "Tümü" || c.category === settings.category) &&
      (settings.difficulty === "Tümü" || c.difficulty === settings.difficulty),
  );
  function beep(end = false) {
    if (!gameRef.current?.settings.sound) return;
    try {
      const ctx = audio.current;
      if (!ctx) return;
      void ctx.resume();
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.frequency.value = end ? 440 : 740;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      /* Sound is optional. */
    }
  }
  function unlockAudio() {
    if (!audio.current) {
      try {
        audio.current = new AudioContext();
      } catch {
        return;
      }
    }
    void audio.current.resume().catch(() => {});
  }
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  useEffect(() => {
    if (!game) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    } catch {
      setNotice(
        "Bu tarayıcı oyunu kaydedemedi. Sayfayı kapatmadan oynamaya devam edebilirsiniz.",
      );
    }
    if (game.stage === "summary" && lastStage.current === "playing") beep(true);
    lastStage.current = game.stage;
  }, [game]);
  useEffect(() => {
    if (game?.stage !== "playing") return;
    const t = window.setInterval(
      () => dispatch({ type: "tick", now: Date.now() }),
      100,
    );
    const hide = () => {
      if (document.hidden) dispatch({ type: "pause", now: Date.now() });
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [game?.stage]);
  useEffect(() => {
    if (blocker.state === "blocked")
      dispatch({ type: "pause", now: Date.now() });
  }, [blocker.state]);
  useEffect(() => {
    if (!game || game.stage === "finished") return;
    const leave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [!!game, game?.stage === "finished"]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    if (game?.stage === "playing" || game?.stage === "paused") {
      root.current?.querySelector(".pt-play-area")?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [game?.stage]);
  useEffect(() => {
    const fn = () =>
      setFull(document.fullscreenElement === document.documentElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);
  function mark(outcome: Outcome) {
    const g = gameRef.current;
    if (
      !g ||
      g.stage !== "playing" ||
      rules ||
      reset ||
      blocker.state === "blocked"
    )
      return;
    dispatch({
      type: "mark",
      now: Date.now(),
      cardId: g.deck[g.cursor],
      cursor: g.cursor,
      cycle: g.cycle,
      outcome,
    });
    if (outcome !== "pass") beep();
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        (e.target instanceof Element &&
          e.target.closest(
            "input,textarea,select,[contenteditable=true],[role=dialog]",
          )) ||
        rules ||
        reset ||
        blocker.state === "blocked"
      )
        return;
      const g = gameRef.current;
      if (!g) return;
      const k = e.key.toLocaleLowerCase("tr-TR");
      if (g.stage === "playing" && ["d", "p", "t"].includes(k)) {
        e.preventDefault();
        mark(k === "d" ? "correct" : k === "p" ? "pass" : "taboo");
      }
      if (
        e.code === "Space" &&
        !(e.target instanceof Element && e.target.closest("button,a")) &&
        ["playing", "paused"].includes(g.stage)
      ) {
        e.preventDefault();
        dispatch({
          type: g.stage === "playing" ? "pause" : "resume",
          now: Date.now(),
        });
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [rules, reset, blocker.state]);
  const team = game ? activeTeam(game) : 0;
  const card = game ? cardById.get(game.deck[game.cursor]) : null;
  const running = game?.stage === "playing";
  function begin() {
    const teams: [string, string] = [
      settings.teams[0].trim(),
      settings.teams[1].trim(),
    ];
    if (
      !teams.every(Boolean) ||
      teams[0].toLocaleLowerCase("tr-TR") ===
        teams[1].toLocaleLowerCase("tr-TR")
    ) {
      setNotice("Takımlara birbirinden farklı iki ad verin.");
      return;
    }
    if (pool.length < 5) {
      setNotice("Bu seçimde en az 5 kart olmalı. Filtreleri genişletin.");
      return;
    }
    unlockAudio();
    setNotice("");
    dispatch({
      type: "replace",
      game: createGame(
        { ...settings, teams },
        pool.map((c) => c.id),
      ),
    });
    setSaved(null);
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else setNotice("Bu tarayıcı tam ekranı desteklemiyor.");
    } catch {
      setNotice("Tam ekran açılamadı; normal görünümde oynayabilirsiniz.");
    }
  }
  function clearGame() {
    dispatch({ type: "replace", game: null });
    setSaved(null);
    setReset(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Current screen still resets. */
    }
  }
  function openRules() {
    if (running) dispatch({ type: "pause", now: Date.now() });
    setRules(true);
  }
  return (
    <div className="pt-game" ref={root}>
      <div className="pt-game-top">
        <Link to="/games" className="pt-back">
          <ArrowLeft size={17} /> Oyunlar
        </Link>
        <div>
          <button className="pt-tool" onClick={openRules}>
            <BookOpen size={18} /> Kurallar
          </button>
          <button
            className="pt-tool"
            onClick={fullscreen}
            aria-label={full ? "Tam ekrandan çık" : "Tam ekrana geç"}
          >
            {full ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
      <header className="pt-game-heading">
        <Brand compact />
        <h1>
          Fizyo<span>Tabu</span>
        </h1>
        <p>Teknoloji, sağlık ve biraz da takım ruhu.</p>
      </header>
      {notice && (
        <p className="pt-notice" role="status">
          {notice}
        </p>
      )}
      {!game ? (
        <div className="pt-setup-grid">
          <section className="pt-setup">
            <span className="pt-eyebrow">OYUNU KUR</span>
            <h2>Takımını seç. Sözü al.</h2>
            <p>
              İki takım, tek cihaz. Kartları yalnız anlatıcı ve hakem görsün.
            </p>
            {saved && (
              <div className="pt-saved">
                <strong>Önceki oyunun burada.</strong>
                <span>{saved.settings.teams.join(" · ")}</span>
                <div>
                  <button
                    className="pt-button pt-primary"
                    onClick={() => {
                      unlockAudio();
                      dispatch({ type: "replace", game: saved });
                      setSaved(null);
                      setResuming(true);
                    }}
                  >
                    Kaydedilen oyuna devam et
                  </button>
                  <button
                    className="pt-button pt-secondary"
                    onClick={() => setReset(true)}
                  >
                    Kaydı sil
                  </button>
                </div>
              </div>
            )}
            <div className="pt-fields">
              <label>
                1. takım adı
                <input
                  maxLength={30}
                  value={settings.teams[0]}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      teams: [e.target.value, s.teams[1]],
                    }))
                  }
                />
              </label>
              <label>
                2. takım adı
                <input
                  maxLength={30}
                  value={settings.teams[1]}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      teams: [s.teams[0], e.target.value],
                    }))
                  }
                />
              </label>
              <label>
                Tur süresi
                <select
                  value={settings.seconds}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      seconds: Number(e.target.value),
                    }))
                  }
                >
                  {[30, 60, 90, 120].map((n) => (
                    <option key={n} value={n}>
                      {n} saniye
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Takım başına tur
                <select
                  value={settings.rounds}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      rounds: Number(e.target.value),
                    }))
                  }
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} tur
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tur başına pas hakkı
                <select
                  value={settings.passes}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      passes: Number(e.target.value),
                    }))
                  }
                >
                  {[0, 1, 2, 3, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} pas
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Kart grubu
                <select
                  value={settings.category}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, category: e.target.value }))
                  }
                >
                  {["Tümü", "Teknoloji", "Sağlık"].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                Zorluk
                <select
                  value={settings.difficulty}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, difficulty: e.target.value }))
                  }
                >
                  {["Tümü", "Kolay", "Orta", "Zor"].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label className="pt-sound">
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, sound: e.target.checked }))
                  }
                />
                {settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}{" "}
                Sesli bildirim
              </label>
            </div>
            <div className="pt-setup-bottom">
              <span>
                <Layers size={17} />
                {pool.length} kart hazır
              </span>
              <span>Doğru +1 · Yasak −1 · Pas 0</span>
            </div>
            <button
              className="pt-button pt-primary pt-start"
              onClick={begin}
              disabled={pool.length < 5}
            >
              Takımları hazırla <ArrowRight size={20} />
            </button>
            <p className="pt-local-note">
              Oyun yalnız bu tarayıcıda kaydedilir. Adlarınızı sunucuya
              göndermiyoruz.
            </p>
          </section>
          <aside className="pt-how">
            <span className="pt-eyebrow">NASIL OYNANIR?</span>
            <h2>Aynı frekansta buluşun.</h2>
            <div>
              <b>01</b>
              <section>
                <h3>Ekranı anlatıcıya ver</h3>
                <p>Karşı takımdan bir kişi yasakları kontrol etsin.</p>
              </section>
            </div>
            <div>
              <b>02</b>
              <section>
                <h3>Beş ifadeden uzak dur</h3>
                <p>
                  Kavramı, başlığını ve yasaklı kelimeleri kullanmadan anlat.
                </p>
              </section>
            </div>
            <div>
              <b>03</b>
              <section>
                <h3>Takımın tahmin etsin</h3>
                <p>Doğruyu, yasağı veya pası hakem işaretlesin.</p>
              </section>
            </div>
            <div>
              <b>04</b>
              <section>
                <h3>Sıra diğer takımda</h3>
                <p>Eşit sayıda turun sonunda yüksek puan kazansın.</p>
              </section>
            </div>
            <button className="pt-button pt-secondary" onClick={openRules}>
              Tüm kuralları oku <BookOpen size={17} />
            </button>
            <p>
              PDF kartlarındaki yazım ve terimler gözden geçirilerek
              hazırlanmıştır.
            </p>
          </aside>
        </div>
      ) : (
        <>
          <section className="pt-scoreboard" aria-label="Takım puanları">
            {game.settings.teams.map((name, i) => (
              <div
                key={i}
                className={
                  team === i && game.stage !== "finished" ? "is-active" : ""
                }
              >
                <span>
                  {i === 0 ? "01" : "02"} · {name}
                </span>
                <strong>{game.scores[i]}</strong>
                <small>
                  {game.stage !== "finished" && team === i
                    ? "Sıra bu takımda"
                    : "Toplam puan"}
                </small>
              </div>
            ))}
          </section>
          {["ready", "playing", "paused"].includes(game.stage) && (
            <div className="pt-turn-label">
              <span>
                Tur {Math.floor(game.turn / 2) + 1} / {game.settings.rounds}
              </span>
              <strong>{game.settings.teams[team]}</strong>
              <span>{game.pool.length} kartlık deste</span>
            </div>
          )}
          {game.stage === "ready" && (
            <section className="pt-gate">
              <span className="pt-gate-icon">
                <Users size={32} />
              </span>
              <h2 tabIndex={-1} ref={heading}>
                {game.settings.teams[team]}, hazır mısınız?
              </h2>
              <p>
                Ekranı anlatıcıya ve hakeme verin. Tahmin edecek kişiler kartı
                görmesin.
              </p>
              <div className="pt-gate-facts">
                <span>{game.settings.seconds} saniye</span>
                <span>{game.settings.passes} pas hakkı</span>
                <span>Doğru +1 · Yasak −1</span>
              </div>
              <button
                className="pt-button pt-primary"
                onClick={() => {
                  unlockAudio();
                  dispatch({ type: "start", now: Date.now() });
                }}
              >
                <Play size={19} /> Turu başlat
              </button>
            </section>
          )}
          {(running || game.stage === "paused") && (
            <section className="pt-play-area">
              <div className="pt-clock-row">
                <div
                  className={`pt-clock ${game.remaining <= 10000 ? "pt-clock--urgent" : ""}`}
                  aria-label={`Kalan süre ${Math.ceil(game.remaining / 1000)} saniye`}
                >
                  <Timer size={22} />
                  <strong>{Math.ceil(game.remaining / 1000)}</strong>
                  <span>saniye</span>
                </div>
                <span className="pt-live-score">
                  Bu tur:{" "}
                  <strong>
                    {game.plays.reduce((sum, p) => sum + points(p.outcome), 0)}
                  </strong>
                </span>
                <button
                  className="pt-tool"
                  onClick={() =>
                    dispatch({
                      type: running ? "pause" : "resume",
                      now: Date.now(),
                    })
                  }
                >
                  {running ? <Pause size={18} /> : <Play size={18} />}{" "}
                  {running ? "Duraklat" : "Devam et"}
                </button>
              </div>
              <div
                className="pt-time-track"
                role="progressbar"
                aria-label="Kalan tur süresi"
                aria-valuemin={0}
                aria-valuemax={game.settings.seconds}
                aria-valuenow={Math.ceil(game.remaining / 1000)}
              >
                <span
                  style={{
                    width: `${(100 * game.remaining) / (game.settings.seconds * 1000)}%`,
                  }}
                />
              </div>
              {running && card ? (
                <article className="pt-tabu-card">
                  <div className="pt-card-meta">
                    <span>{card.category}</span>
                    <span>
                      {card.difficulty} · #{card.id}
                    </span>
                  </div>
                  <h2 tabIndex={-1} ref={heading}>
                    {card.word}
                  </h2>
                  <p>YASAKLI İFADELER</p>
                  <ul>
                    {card.forbidden.map((word) => (
                      <li key={word}>{word}</li>
                    ))}
                  </ul>
                  {!!card.accepted.length && (
                    <small>
                      Kabul edilen karşılıklar: {card.accepted.join(" · ")}
                    </small>
                  )}
                  <span className="pt-card-brand">
                    PHYSIOTECH · KELİMELERİN ÖTESİNDE
                  </span>
                </article>
              ) : (
                <div className="pt-paused">
                  <Pause size={36} />
                  <h2 ref={heading} tabIndex={-1}>
                    Oyun duraklatıldı.
                  </h2>
                  <p>
                    {resuming
                      ? "Kayıtlı oyunun kaldığı yerden devam etmeye hazır."
                      : "Kart, diğer takım görmesin diye gizlendi."}
                  </p>
                  <button
                    className="pt-button pt-primary"
                    onClick={() => {
                      setResuming(false);
                      unlockAudio();
                      dispatch({ type: "resume", now: Date.now() });
                    }}
                  >
                    <Play size={18} /> Devam et
                  </button>
                </div>
              )}
              <div className="pt-game-actions">
                <button
                  disabled={!running}
                  onClick={() => mark("taboo")}
                  className="pt-action pt-action--taboo"
                >
                  <X size={23} />
                  <strong>Yasak</strong>
                  <small>−1 puan · T</small>
                </button>
                <button
                  disabled={!running || passCount(game) >= game.settings.passes}
                  onClick={() => mark("pass")}
                  className="pt-action pt-action--pass"
                >
                  <SkipForward size={23} />
                  <strong>Pas</strong>
                  <small>
                    {Math.max(0, game.settings.passes - passCount(game))} hak ·
                    P
                  </small>
                </button>
                <button
                  disabled={!running}
                  onClick={() => mark("correct")}
                  className="pt-action pt-action--correct"
                >
                  <Check size={23} />
                  <strong>Doğru</strong>
                  <small>+1 puan · D</small>
                </button>
              </div>
              <div className="pt-play-footer">
                <button
                  className="pt-tool"
                  disabled={!game.plays.length}
                  onClick={() => dispatch({ type: "undo", now: Date.now() })}
                >
                  <Undo2 size={17} /> Son işlemi geri al
                </button>
                <span>Boşluk: duraklat / devam et</span>
              </div>
            </section>
          )}
          {game.stage === "summary" && (
            <section className="pt-gate pt-summary">
              <span className="pt-eyebrow">TUR TAMAMLANDI</span>
              <h2 ref={heading} tabIndex={-1}>
                {game.settings.teams[team]}, süre doldu.
              </h2>
              <div className="pt-turn-stats">
                {(["correct", "taboo", "pass"] as Outcome[]).map((o) => (
                  <div key={o}>
                    <strong>
                      {game.plays.filter((p) => p.outcome === o).length}
                    </strong>
                    <span>{names[o]}</span>
                  </div>
                ))}
                <div>
                  <strong>{game.history.at(-1)?.score}</strong>
                  <span>Tur puanı</span>
                </div>
              </div>
              {!!game.plays.length && (
                <details className="pt-turn-review">
                  <summary>
                    Bu turdaki kartları incele ({game.plays.length})
                  </summary>
                  <ul>
                    {game.plays.map((p, i) => (
                      <li key={i}>
                        <span>{cardById.get(p.cardId)?.word}</span>
                        <b>
                          {names[p.outcome]} {points(p.outcome) > 0 ? "+" : ""}
                          {points(p.outcome)}
                        </b>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <p>
                {game.turn + 1 >= game.settings.rounds * 2
                  ? "İki takım da turlarını tamamladı."
                  : "Ekranı diğer takımın anlatıcısına verin. Kart, tur başlayana kadar gizli kalır."}
              </p>
              <button
                className="pt-button pt-primary"
                onClick={() => dispatch({ type: "next" })}
              >
                {game.turn + 1 >= game.settings.rounds * 2
                  ? "Maç sonucunu gör"
                  : "Sıradaki takıma geç"}
                <ArrowRight size={18} />
              </button>
            </section>
          )}
          {game.stage === "finished" && (
            <section className="pt-gate pt-finish">
              <Trophy size={52} />
              <span className="pt-eyebrow">MAÇ TAMAMLANDI</span>
              <h2 ref={heading} tabIndex={-1}>
                {game.scores[0] === game.scores[1]
                  ? "Dostluk kazandı!"
                  : `${game.settings.teams[game.scores[0] > game.scores[1] ? 0 : 1]} kazandı!`}
              </h2>
              <p>
                {game.scores[0] === game.scores[1]
                  ? "Puanlar eşit. İsterseniz yeni bir maçla devam edin."
                  : "Birlikte düşündünüz, anlattınız ve ürettiniz. İki takıma da teşekkürler."}
              </p>
              <div className="pt-match-log">
                <h3>Tur dökümü</h3>
                {Array.from({ length: game.settings.rounds }, (_, i) => (
                  <div key={i}>
                    <span>{i + 1}. tur</span>
                    <b>
                      {game.settings.teams[0]}:{" "}
                      {game.history[i * 2]?.score ?? 0}
                    </b>
                    <b>
                      {game.settings.teams[1]}:{" "}
                      {game.history[i * 2 + 1]?.score ?? 0}
                    </b>
                  </div>
                ))}
              </div>
              <button className="pt-button pt-primary" onClick={clearGame}>
                <RotateCcw size={18} /> Yeni oyun kur
              </button>
              <Link className="pt-button pt-secondary" to="/games">
                Oyunlara dön
              </Link>
            </section>
          )}
          <div className="pt-game-bottom">
            <span role="status">
              {game.stage === "playing"
                ? "Tur sürüyor."
                : game.stage === "paused"
                  ? "Süre durduruldu."
                  : game.stage === "summary"
                    ? "Tur sonucu hazır."
                    : game.stage === "finished"
                      ? "Maç tamamlandı."
                      : "Kart gizli, takım bekleniyor."}
            </span>
            <button
              className="pt-tool"
              onClick={() => {
                if (running) dispatch({ type: "pause", now: Date.now() });
                setReset(true);
              }}
            >
              <RotateCcw size={16} /> Oyunu sıfırla
            </button>
          </div>
        </>
      )}
      <Modal
        open={rules}
        onClose={() => setRules(false)}
        title="FizyoTabu oyun kuralları"
        description="İki takım için aynı kurallar, aynı puanlama."
        wide
      >
        <Rules />
        <button
          className="pt-button pt-primary"
          onClick={() => setRules(false)}
        >
          Kurallar tamam
        </button>
      </Modal>
      <Modal
        open={reset}
        onClose={() => setReset(false)}
        title="Oyun kaydı silinsin mi?"
        description="Takım puanları ve bu oyunun tur geçmişi silinir."
      >
        <div className="pt-dialog-actions">
          <button
            className="pt-button pt-secondary"
            onClick={() => setReset(false)}
          >
            Vazgeç
          </button>
          <button className="pt-button pt-primary" onClick={clearGame}>
            Sil ve yeni oyun kur
          </button>
        </div>
      </Modal>
      <Modal
        open={blocker.state === "blocked"}
        onClose={() => blocker.state === "blocked" && blocker.reset()}
        title="Oyundan ayrılıyor musun?"
        description="Oyun bu tarayıcıda saklanır. Oyun sayfasından kaldığın yerden devam edebilirsin."
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
