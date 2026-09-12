# PayrollForSubs — fake-door №5

Лендинг для проверки спроса на certified payroll (WH-347 + формы штатов) для субподрядчиков на prevailing-wage проектах. Продукта нет: двухшаговая заявка уходит на factodus@gmail.com через FormSubmit (темы «PayrollForSubs step1/step2»).

- Домен: payrollforsubs.com (Cloudflare Registrar, аккаунт factodus); канонический адрес — https://www.payrollforsubs.com (FormSubmit активирован для www, apex редиректит).
- Хостинг: Cloudflare Workers static assets + Worker `src/worker.js`, который принимает `POST /e` и пишет события воронки в общую D1 `fakedoor-events`. Деплой: `npx wrangler deploy`.
- Оффер: $39/мес flat, безлимит проектов и отчётов, первые 4 отчёта бесплатно.
- Методология, пороги и статус эксперимента: [drbenzin/ideas → next-steps.md](https://github.com/drbenzin/ideas/blob/main/next-steps.md).
