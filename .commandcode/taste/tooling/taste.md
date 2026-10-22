# Tooling / environment preferences

- Windows box: `cmd` does not expand `$COMMANDCODE_SCRATCHPAD` and `curl -o NUL` output comes out garbled — use PowerShell with `-LiteralPath`/`Move-Item`, or small Node scripts, for path moves and route checks. Confidence: 0.8
- Playwright CLI via `npx --yes playwright cli` is the browser tool of choice (open/goto/fill/select/eval/screenshot/console/close); filling must be React-aware — setting `input.value` through `eval` does not update React state. Inside `eval`, assign via the native `HTMLInputElement.prototype` value setter and dispatch an `input` event so React registers the change. Confidence: 0.9
- The dev server may auto-shift to another port when 3000 is taken by a different project; always confirm which port serves the intended app (check the page title/brand) before trusting an HTTP 200 as proof. Confidence: 0.75
- Background dev-server logs can appear empty through `shell_output`; read the shellout log file under the commandcode temp dir directly. Confidence: 0.65
- `read_file` fails on paths containing square brackets (e.g. Next.js dynamic routes like `src/app/pay/[id]/page.tsx`); read those files with `grep` against the parent directory instead. Confidence: 0.8
- Transient UI states (spinners, timed screens) are lost when `eval` and `screenshot` run as separate commands, because command overhead advances the app state. Capture them in a single `playwright cli run-code --filename=<script.js>` using the page API (`waitForTimeout` + `screenshot`). Confidence: 0.8
