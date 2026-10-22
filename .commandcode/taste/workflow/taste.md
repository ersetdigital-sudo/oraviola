# Workflow preferences

- Wants the app actually running and visually seen ("pengen liat tampilannya") — launch the dev server, open it in a browser and verify with screenshots instead of only shipping code. Confidence: 0.85
- Research authoritative sources first (official vendor docs, Codashop, IAK API) before hardcoding domain data such as account-ID formats; do not guess formats. Confidence: 0.75
- Prefers lightweight validation in forms — no heavy/fussy verification flows. Confidence: 0.7
- Keep the existing UI/UX and layout intact; change only what was asked, and check other pages for regressions afterwards. Confidence: 0.75
- Prefer data-driven configuration (schema/field definitions in data + types files) over per-case hardcoded logic inside components. Confidence: 0.7
- Before declaring done, run the project's own gates: typecheck, production build, all routes returning 200, and a browser console check for errors. Confidence: 0.8
- When a detail cannot be resolved quickly (e.g. a devtools badge), note it and move on instead of burning many turns chasing it. Confidence: 0.6
- The user exercises the live app themselves and reports gaps by citing concrete identifiers (e.g. an order ID like ORV4221546) and the screen they were on — treat that report as the acceptance test and reproduce/verify that exact flow end-to-end. Confidence: 0.75
