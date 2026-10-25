# FTR Atlas editorial publishing rules

- The user's instruction is to publish only case content they explicitly approve. Do not approve cases on the user's behalf as part of writing content, fixing notes, tests, or routine deployment.
- A review backup (`kind: ftr-editorial-backup`) contains private notes and drafts. Never copy it into the public repository or a public asset folder. Read only within the authorized task. Keep such working files outside the repository.
- A publication file (`kind: ftr-approved-release`) contains only approved case snapshots. Use the owner's exported publication package, or explicit owner approval identifying concrete case revisions. Do not treat a general request to expand or improve cases as approval of their content.
- Correcting a case, its modules, answer key, or source links invalidates its approval. Return an updated draft for review; do not silently carry the previous approval forward. Closing a correction note does not itself approve a case.
- The game imports only `src/data/published-release.json`. Candidate content is isolated in `src/data/candidate-bank.ts` for the separate review interface. Do not restore an automatic fallback from an empty release to all candidates.
- UI, architecture, documentation and bug fixes can be published within the user's authorized scope without approving case content. An empty approved release is valid.
- Before deployment run `pnpm quality` and `pnpm build`. Import a user-supplied publication package with `pnpm publication:import <file>`; the build validates the approval fingerprints and dependency graph.
- Checksums detect content changes; they are not authenticated digital signatures. Repository write access remains the publication authority. IndexedDB is local storage, not a hosted admin account or cross-device database.
