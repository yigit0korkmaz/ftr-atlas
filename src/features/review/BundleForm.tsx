import { useState } from "react";
import type { ReactNode } from "react";
import type { Question } from "../../domain/types";
import type { CaseBundle } from "../../editorial/schema";
import { candidateBank } from "../../data/candidate-bank";
import {
  Badge,
  Button,
  Disclosure,
  Icon,
  IconButton,
} from "../../components/ui";
import { SelectField } from "../../components/SelectField";
type Change = (fn: (draft: CaseBundle) => void) => void;
export function ReviewField({
  label,
  scope = label,
  onNote,
  children,
}: {
  label: string;
  scope?: string;
  onNote: (scope: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="review-field">
      <div className="review-field-heading">
        <span>{label}</span>
        <IconButton
          icon="note"
          label={`${scope} için not ekle`}
          onClick={() => onNote(scope)}
        />
      </div>
      {children}
    </div>
  );
}
function RefSelector({
  ids,
  onChange,
  bundle,
  label,
}: {
  ids: string[];
  onChange: (ids: string[]) => void;
  bundle: CaseBundle;
  label: string;
}) {
  return (
    <details className="review-reference-picker">
      <summary>
        <Icon name="book" size={17} />
        {label} · {ids.length} kaynak
      </summary>
      <div>
        {bundle.sources.map((s) => (
          <label key={s.id}>
            <input
              type="checkbox"
              checked={ids.includes(s.id)}
              onChange={() =>
                onChange(
                  ids.includes(s.id)
                    ? ids.filter((x) => x !== s.id)
                    : [...ids, s.id],
                )
              }
            />
            <span>{s.title || s.id}</span>
          </label>
        ))}
      </div>
    </details>
  );
}
function QuestionForm({
  question: q,
  onChange,
  bundle,
  label,
  onNote,
}: {
  question: Question;
  onChange: (q: Question) => void;
  bundle: CaseBundle;
  label: string;
  onNote: (scope: string) => void;
}) {
  const patch = (p: Partial<Question>) => onChange({ ...q, ...p });
  return (
    <section className="review-question-editor">
      <h4>{label}</h4>
      <ReviewField label="Soru metni" scope={`${label} / Soru`} onNote={onNote}>
        <textarea
          value={q.prompt}
          onChange={(e) => patch({ prompt: e.target.value })}
          rows={3}
          aria-label={`${label} soru metni`}
        />
      </ReviewField>
      <SelectField
        label={`${label} seçim türü`}
        value={q.type}
        onChange={(v) => patch({ type: v as Question["type"] })}
        options={[
          { value: "single", label: "Tek doğru seçenek" },
          { value: "multi", label: "Birden fazla doğru seçenek" },
        ]}
      />
      <div className="review-option-editors">
        {q.options.map((o, i) => (
          <section key={o.id} className="review-option-editor">
            <div className="review-option-heading">
              <strong>{String.fromCharCode(65 + i)} seçeneği</strong>
              <label className="review-correct-toggle">
                <input
                  type="checkbox"
                  checked={o.correct}
                  onChange={(e) => {
                    const correct = e.target.checked;
                    patch({
                      options: q.options.map((x) =>
                        x.id === o.id
                          ? { ...x, correct }
                          : q.type === "single" && correct
                            ? { ...x, correct: false }
                            : x,
                      ),
                    });
                  }}
                />
                Doğru seçenek
              </label>
              <IconButton
                icon="x"
                label={`${label} ${String.fromCharCode(65 + i)} seçeneğini kaldır`}
                disabled={q.options.length <= 2}
                onClick={() =>
                  patch({ options: q.options.filter((x) => x.id !== o.id) })
                }
              />
            </div>
            <ReviewField
              label="Seçenek metni"
              scope={`${label} / ${String.fromCharCode(65 + i)} seçeneği`}
              onNote={onNote}
            >
              <textarea
                rows={2}
                value={o.text}
                aria-label={`${label} ${String.fromCharCode(65 + i)} metni`}
                onChange={(e) =>
                  patch({
                    options: q.options.map((x) =>
                      x.id === o.id ? { ...x, text: e.target.value } : x,
                    ),
                  })
                }
              />
            </ReviewField>
            <ReviewField
              label="Bu seçeneğin gerekçesi"
              scope={`${label} / ${String.fromCharCode(65 + i)} gerekçesi`}
              onNote={onNote}
            >
              <textarea
                rows={3}
                value={o.why}
                aria-label={`${label} ${String.fromCharCode(65 + i)} gerekçesi`}
                onChange={(e) =>
                  patch({
                    options: q.options.map((x) =>
                      x.id === o.id ? { ...x, why: e.target.value } : x,
                    ),
                  })
                }
              />
            </ReviewField>
          </section>
        ))}
      </div>
      <Button
        variant="ghost"
        icon="list"
        disabled={q.options.length >= 24}
        onClick={() =>
          patch({
            options: [
              ...q.options,
              {
                id: "opt-" + crypto.randomUUID(),
                text: "",
                correct: false,
                why: "",
              },
            ],
          })
        }
      >
        Seçenek ekle
      </Button>
      <ReviewField
        label="Soru sonrası açıklama"
        scope={`${label} / Açıklama`}
        onNote={onNote}
      >
        <textarea
          rows={3}
          value={q.explanation}
          aria-label={`${label} açıklaması`}
          onChange={(e) => patch({ explanation: e.target.value })}
        />
      </ReviewField>
      <RefSelector
        ids={q.sourceIds}
        onChange={(sourceIds) => patch({ sourceIds })}
        bundle={bundle}
        label="Sorunun kaynakları"
      />
    </section>
  );
}
export function StoryForm({
  bundle: b,
  change,
  onNote,
}: {
  bundle: CaseBundle;
  change: Change;
  onNote: (scope: string) => void;
}) {
  const c = b.case;
  return (
    <>
      <div className="review-two-fields">
        <ReviewField label="Vaka başlığı" onNote={onNote}>
          <input
            aria-label="Vaka başlığı"
            value={c.title}
            onChange={(e) =>
              change((d) => {
                d.case.title = e.target.value;
              })
            }
          />
        </ReviewField>
        <ReviewField label="Klinik alan" onNote={onNote}>
          <input
            aria-label="Vakanın klinik alanı"
            value={c.disease}
            onChange={(e) =>
              change((d) => {
                d.case.disease = e.target.value;
              })
            }
          />
        </ReviewField>
      </div>
      <div className="review-profile-editor">
        {Object.entries(c.profile).map(([key, value]) => (
          <ReviewField
            label={
              key === "age"
                ? "Yaş"
                : key === "setting"
                  ? "Ortam"
                  : key === "phase"
                    ? "Klinik dönem"
                    : key
            }
            key={key}
            onNote={onNote}
          >
            <input
              aria-label={`Profil ${key}`}
              value={value}
              onChange={(e) =>
                change((d) => {
                  d.case.profile[key] =
                    key === "age" && /^\d+$/.test(e.target.value)
                      ? Number(e.target.value)
                      : e.target.value;
                })
              }
            />
          </ReviewField>
        ))}
      </div>
      <ReviewField label="Hasta öyküsü" onNote={onNote}>
        <textarea
          className="review-story-input"
          aria-label="Hasta öyküsü"
          value={c.story}
          onChange={(e) =>
            change((d) => {
              d.case.story = e.target.value;
            })
          }
        />
      </ReviewField>
      <div className="review-section-title">
        <h3>Görüşme hedefleri</h3>
        <IconButton
          icon="note"
          label="Görüşme hedefleri için not ekle"
          onClick={() => onNote("Görüşme hedefleri")}
        />
      </div>
      {c.goals.map((g, i) => (
        <div className="review-goal-row" key={i}>
          <span>{i + 1}</span>
          <textarea
            rows={2}
            aria-label={`${i + 1}. görüşme hedefi`}
            value={g}
            onChange={(e) =>
              change((d) => {
                d.case.goals[i] = e.target.value;
              })
            }
          />
          <IconButton
            icon="x"
            label={`${i + 1}. hedefi kaldır`}
            onClick={() =>
              change((d) => {
                d.case.goals.splice(i, 1);
              })
            }
          />
        </div>
      ))}
      <Button
        variant="ghost"
        icon="target"
        onClick={() =>
          change((d) => {
            d.case.goals.push("");
          })
        }
      >
        Hedef ekle
      </Button>
      <RefSelector
        ids={c.sourceIds}
        onChange={(ids) =>
          change((d) => {
            d.case.sourceIds = ids;
          })
        }
        bundle={b}
        label="Vaka kaynakları"
      />
    </>
  );
}
export function DomainForm({
  bundle: b,
  change,
  onNote,
}: {
  bundle: CaseBundle;
  change: Change;
  onNote: (scope: string) => void;
}) {
  const [selected, setSelected] = useState("");
  const available = candidateBank.modules.filter(
    (m) => !b.case.domains.some((d) => d.moduleId === m.id),
  );
  const moduleId = available.some((m) => m.id === selected)
    ? selected
    : available[0]?.id || "";
  const add = () => {
    const m = candidateBank.modules.find((m) => m.id === moduleId);
    if (!m) return;
    change((d) => {
      d.modules.push(structuredClone(m));
      const refs = new Set([
        ...m.sourceIds,
        ...m.toolQuestion.sourceIds,
        ...m.applicationQuestion.sourceIds,
      ]);
      for (const s of candidateBank.sources.filter((s) => refs.has(s.id)))
        if (!d.sources.some((x) => x.id === s.id))
          d.sources.push(structuredClone(s));
      d.case.domains.push({
        id: d.case.id + "-added-" + crypto.randomUUID().slice(0, 8),
        label: m.title,
        moduleId: m.id,
        required: false,
        rationale: "",
        cue: "",
        sourceIds: [...m.sourceIds],
      });
    });
  };
  return (
    <>
      <p className="review-help">
        Her alanı tek tek aç. Öncelik kararı, dayanak, araç sorusu, doğru/yanlış
        seçenekler ve uygulama sorusu birlikte düzenlenir. Modül değişikliği
        yalnız bu vaka taslağını etkiler.
      </p>
      {b.case.domains.map((domain, i) => {
        const m = b.modules.find((m) => m.id === domain.moduleId);
        return (
          <Disclosure
            key={domain.id}
            title={`${i + 1}. ${domain.label}`}
            icon={domain.required ? "check-circle" : "list"}
          >
            <div className="review-domain-toolbar">
              <Badge tone={domain.required ? "green" : "lavender"}>
                {domain.required
                  ? "Öncelikli alan"
                  : "Bu görüşmede öncelikli değil"}
              </Badge>
              <Button
                variant="ghost"
                icon="x"
                onClick={() =>
                  change((d) => {
                    d.case.domains = d.case.domains.filter(
                      (x) => x.id !== domain.id,
                    );
                    d.modules = d.modules.filter(
                      (x) => x.id !== domain.moduleId,
                    );
                  })
                }
              >
                Alanı kaldır
              </Button>
            </div>
            <ReviewField
              label="Değerlendirme alanı"
              scope={`${domain.label} / Alan adı`}
              onNote={onNote}
            >
              <input
                value={domain.label}
                aria-label={`${i + 1}. alan adı`}
                onChange={(e) =>
                  change((d) => {
                    d.case.domains[i].label = e.target.value;
                  })
                }
              />
            </ReviewField>
            <label className="review-priority-toggle">
              <input
                type="checkbox"
                checked={domain.required}
                onChange={(e) =>
                  change((d) => {
                    d.case.domains[i].required = e.target.checked;
                  })
                }
              />
              <span>Bu görüşme için öncelikli değerlendirme alanı</span>
            </label>
            <ReviewField
              label="Öncelik kararının gerekçesi"
              scope={`${domain.label} / Öncelik gerekçesi`}
              onNote={onNote}
            >
              <textarea
                rows={4}
                value={domain.rationale}
                onChange={(e) =>
                  change((d) => {
                    d.case.domains[i].rationale = e.target.value;
                  })
                }
                aria-label={`${i + 1}. alan gerekçesi`}
              />
            </ReviewField>
            <ReviewField
              label="Vakadaki dayanak"
              scope={`${domain.label} / Dayanak`}
              onNote={onNote}
            >
              <textarea
                rows={3}
                value={domain.cue}
                onChange={(e) =>
                  change((d) => {
                    d.case.domains[i].cue = e.target.value;
                  })
                }
                aria-label={`${i + 1}. alan dayanağı`}
              />
            </ReviewField>
            <RefSelector
              bundle={b}
              ids={domain.sourceIds}
              label="Alanın kaynakları"
              onChange={(ids) =>
                change((d) => {
                  d.case.domains[i].sourceIds = ids;
                })
              }
            />
            {m ? (
              <>
                <ReviewField
                  label="Modül başlığı"
                  scope={`${domain.label} / Modül`}
                  onNote={onNote}
                >
                  <input
                    value={m.title}
                    aria-label={`${domain.label} modül başlığı`}
                    onChange={(e) =>
                      change((d) => {
                        d.modules.find((x) => x.id === m.id)!.title =
                          e.target.value;
                      })
                    }
                  />
                </ReviewField>
                <ReviewField
                  label="Modül özeti"
                  scope={`${domain.label} / Modül özeti`}
                  onNote={onNote}
                >
                  <textarea
                    value={m.summary}
                    rows={3}
                    aria-label={`${domain.label} modül özeti`}
                    onChange={(e) =>
                      change((d) => {
                        d.modules.find((x) => x.id === m.id)!.summary =
                          e.target.value;
                      })
                    }
                  />
                </ReviewField>
                <RefSelector
                  bundle={b}
                  ids={m.sourceIds}
                  label="Modül kaynakları"
                  onChange={(ids) =>
                    change((d) => {
                      d.modules.find((x) => x.id === m.id)!.sourceIds = ids;
                    })
                  }
                />
                {(["toolQuestion", "applicationQuestion"] as const).map(
                  (part) => (
                    <QuestionForm
                      key={part}
                      bundle={b}
                      question={m[part]}
                      label={`${domain.label} / ${part === "toolQuestion" ? "Araç seçimi" : "Uygulama kararı"}`}
                      onNote={onNote}
                      onChange={(q) =>
                        change((d) => {
                          d.modules.find((x) => x.id === m.id)![part] = q;
                        })
                      }
                    />
                  ),
                )}
              </>
            ) : (
              <p className="review-error">
                Bu alana bağlı modül bulunamadı. JSON girdilerini veya modül
                bağlantısını düzelt.
              </p>
            )}
          </Disclosure>
        );
      })}
      {available.length > 0 && (
        <div className="review-add-domain">
          <SelectField
            label="Eklenecek değerlendirme modülü"
            value={moduleId}
            onChange={setSelected}
            options={available.map((m) => ({ value: m.id, label: m.title }))}
          />
          <Button icon="list" variant="secondary" onClick={add}>
            Alan ekle
          </Button>
        </div>
      )}
    </>
  );
}
export function SourceForm({
  bundle: b,
  change,
  onNote,
}: {
  bundle: CaseBundle;
  change: Change;
  onNote: (scope: string) => void;
}) {
  return (
    <>
      <p className="review-help">
        Kaynak bağlantısını açıp dayanağı inceleyebilirsin. Kaynak metnini
        değiştirmek, o kaynağı kullanan diğer vakaları değiştirmez.
      </p>
      {b.sources.map((s, i) => (
        <Disclosure key={s.id} title={s.title || "Yeni kaynak"} icon="book">
          <code className="review-id">{s.id}</code>
          <ReviewField
            label="Kaynak başlığı"
            scope={`Kaynak ${s.id} / Başlık`}
            onNote={onNote}
          >
            <input
              value={s.title}
              aria-label={`${s.id} kaynak başlığı`}
              onChange={(e) =>
                change((d) => {
                  d.sources[i].title = e.target.value;
                })
              }
            />
          </ReviewField>
          <ReviewField
            label="Kaynak bağlantısı"
            scope={`Kaynak ${s.id} / Bağlantı`}
            onNote={onNote}
          >
            <input
              value={s.url}
              type="url"
              aria-label={`${s.id} kaynak bağlantısı`}
              onChange={(e) =>
                change((d) => {
                  d.sources[i].url = e.target.value;
                })
              }
            />
          </ReviewField>
          {s.url.startsWith("https://") && (
            <a
              className="text-link"
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Kaynağı aç <Icon name="external" size={17} />
            </a>
          )}
          <ReviewField
            label="Kaynak türü"
            scope={`Kaynak ${s.id} / Tür`}
            onNote={onNote}
          >
            <input
              value={s.kind}
              aria-label={`${s.id} kaynak türü`}
              onChange={(e) =>
                change((d) => {
                  d.sources[i].kind = e.target.value;
                })
              }
            />
          </ReviewField>
          <ReviewField
            label="Kaynak notu"
            scope={`Kaynak ${s.id} / Not`}
            onNote={onNote}
          >
            <textarea
              value={s.note || ""}
              rows={4}
              aria-label={`${s.id} kaynak notu`}
              onChange={(e) =>
                change((d) => {
                  d.sources[i].note = e.target.value;
                })
              }
            />
          </ReviewField>
          {s.verification !== undefined && (
            <ReviewField
              label="Kaynak doğrulama kaydı"
              scope={`Kaynak ${s.id} / Doğrulama`}
              onNote={onNote}
            >
              <textarea
                value={s.verification}
                rows={3}
                aria-label={`${s.id} doğrulama kaydı`}
                onChange={(e) =>
                  change((d) => {
                    d.sources[i].verification = e.target.value;
                  })
                }
              />
            </ReviewField>
          )}
          {s.accessedAt !== undefined && (
            <ReviewField
              label="Kaynağa erişim tarihi"
              scope={`Kaynak ${s.id} / Erişim tarihi`}
              onNote={onNote}
            >
              <input
                value={s.accessedAt}
                aria-label={`${s.id} erişim tarihi`}
                onChange={(e) =>
                  change((d) => {
                    d.sources[i].accessedAt = e.target.value;
                  })
                }
              />
            </ReviewField>
          )}
          <Button
            variant="ghost"
            icon="x"
            onClick={() =>
              change((d) => {
                d.sources.splice(i, 1);
              })
            }
          >
            Kaynağı taslaktan kaldır
          </Button>
        </Disclosure>
      ))}
      <Button
        variant="secondary"
        icon="book"
        onClick={() =>
          change((d) => {
            d.sources.push({
              id: "ref-" + crypto.randomUUID().slice(0, 8),
              title: "",
              url: "",
              kind: "Birincil kaynak",
              note: "",
            });
          })
        }
      >
        Kaynak ekle
      </Button>
    </>
  );
}
