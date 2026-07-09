# CardFlow — État du projet (contexte pour reprise de session)

> Ce document résume l'état actuel du projet CardFlow pour permettre à une nouvelle session Claude de reprendre le travail sans perdre le contexte.

## 1. Présentation du projet

CardFlow est une application de gestion de cartes bancaires virtuelles avec deux espaces :
- **Espace Client** : créer/gérer ses cartes, effectuer des paiements avec confirmation OTP (3D Secure), voir ses transactions, gérer des bénéficiaires.
- **Espace Admin** : supervision globale — clients, cartes, transactions, litiges/alertes, analytics, logs d'audit.

## 2. Stack technique

| Élément | Détail |
|---|---|
| Backend | Laravel 11 (PHP) |
| Frontend | React 19 (SPA, pas de SSR) |
| Bundler dev | Vite 6 (sans `laravel-vite-plugin` — voir section 4) |
| Base de données | MySQL (`cardflow_db`) |
| Auth | Laravel Sanctum (token Bearer) |
| Routing frontend | React Router (`BrowserRouter`) |
| i18n | Dictionnaire maison FR/EN (`resources/js/i18n/translations.js`) |
| Style | CSS-in-JS via template strings (`sharedCss` dans `resources/js/admin/theme.jsx`), pas de framework CSS |

## 3. Comment lancer le projet

Deux serveurs à lancer en parallèle, dans deux terminaux séparés :

```bash
# Terminal 1 — backend
cd C:\Users\HP\Desktop\cardflow
php artisan serve

# Terminal 2 — frontend
cd C:\Users\HP\Desktop\cardflow
npm run dev
```

Puis ouvrir le navigateur sur **`http://127.0.0.1:5173`** (PAS 8000 — voir section 4 pour le pourquoi).

Comptes de test (seedés) :
- Admin : `admin@cardflow.com` / `password123`
- Client : voir `database/seeders/UserSeeder.php` pour la liste complète

## 4. Décision d'architecture importante — Vite en mode SPA pur

⚠️ **Point sensible à ne pas casser** : le projet a oscillé entre deux modes et s'est **stabilisé sur le mode SPA pur** :

- `vite.config.js` **n'utilise PAS** `laravel-vite-plugin` (retiré volontairement).
- Il y a un `index.html` à la racine du projet (`c:\Users\HP\Desktop\cardflow\index.html`) qui est le point d'entrée SPA classique de Vite.
- `resources/views/welcome.blade.php` existe toujours (avec `@vite(...)`) mais **n'est plus utilisé en développement** — c'était l'ancien mode "Laravel sert le HTML", abandonné à la demande explicite de l'utilisateur.
- Le proxy `/api` dans `vite.config.js` redirige vers `http://127.0.0.1:8000` (Laravel), donc le backend doit tourner en parallèle.
- **Ne pas réintroduire `laravel-vite-plugin`** sauf demande explicite — ça casse le flux attendu par l'utilisateur (qui veut ouvrir directement `:5173`).

```js
// vite.config.js — état actuel
export default defineConfig({
    plugins: [react()],
    build: { outDir: 'public/build', manifest: 'manifest.json', rollupOptions: { input: 'resources/js/app.jsx' } },
    server: { host: '127.0.0.1', proxy: { '/api': 'http://127.0.0.1:8000' } }
})
```

`.env` : `APP_URL=http://127.0.0.1:8000`, aucune trace de ngrok (a été supprimé — il y avait un doublon `APP_URL` pointant vers une URL ngrok qui écrasait la config locale, source de bugs).

## 5. Fonctionnalités livrées cette session

### Tâche 1 — Expiration automatique des cartes
- `app/Console/Commands/ExpireCards.php` : commande `cards:expire`, cherche les cartes expirées non marquées, passe le statut à `expired`, crée une alerte (`type=security`) et un log d'audit (`card_expired`).
- Planifiée dans `routes/console.php` (Laravel 11 n'a pas de `Kernel.php`) : `Schedule::command('cards:expire')->dailyAt('00:00')`.
- Testée manuellement, fonctionne (`1 carte(s) expirée(s)`).

### Tâche 2 — Plafond journalier
- Migration déjà existante : `plafond_journalier` sur `cards` (decimal, défaut 1000).
- Ajouté au `$fillable` de `app/Models/Card.php`.
- `database/seeders/CardSeeder.php` calcule `plafond_journalier` selon des paliers (plafond ≤3000→500, ≤5000→1000, ≤10000→2000, sinon 3000).

### Tâche 3 — Pagination des logs d'audit
- `app/Http/Controllers/AuditLogController.php@index` : pagination réelle (`page`, `per_page`), filtres `action` et `user_id`, réponse `{ data, total, page, per_page }`.

### Tâche 4 — Code retour 61 (plafond journalier)
- `database/seeders/TransactionSeeder.php` : ajout du code `61` dans le mix de transactions refusées (70% acceptées / 10% code 51 / 5% code 62 / 5% code 05 / 5% code 61 / 5% code 59).

### Tâche 5 — Page Logs d'audit (frontend admin)
- `resources/js/admin/pages/AuditLogsPage.jsx` : appelle `/api/audit-logs` avec pagination serveur, filtre par action (dropdown), badges colorés par action (login=vert, logout=gris, block_card=rouge, create_card=bleu, payment_confirm=violet).
- Route `/admin/audit-logs` déjà branchée dans `app.jsx`, lien sidebar dans `AdminLayout.jsx` (icône `shield`).

## 6. Bugs corrigés cette session

| Bug | Cause | Fix |
|---|---|---|
| Login affichait toujours "email ou mot de passe incorrect" | `Login.jsx` catch générique masquait la vraie erreur (ex: backend éteint) | Affiche le vrai message d'erreur du serveur ou un message réseau explicite |
| Changements de code invisibles après `npm run dev` | `vite.config.js` n'utilisait pas `laravel-vite-plugin`, donc `@vite()` servait toujours les assets buildés (stale) | Résolu en abandonnant le mode Blade/`@vite()` au profit du SPA pur (voir section 4) |
| Page blanche sur `:8000` | `public/hot` pointait vers `[::1]:5173` (IPv6), non résolu par le navigateur | Non-pertinent maintenant qu'on est en SPA pur sur `:5173` |
| Processus zombies (jusqu'à 8 `php.exe` / 4 `node.exe` simultanés) | Terminaux relancés sans tuer les précédents | Nettoyage régulier via `taskkill //F //IM php.exe` / `node.exe` |
| `.env` avec `APP_URL` ngrok qui écrasait la config locale | Doublon de clé dans `.env` | Ligne ngrok + `SANCTUM_STATEFUL_DOMAINS` ngrok supprimées |
| Scrollbar visible sur la page login | — | `overflow:hidden` scopé (⚠️ attention, un essai global sur `html,body` dans `index.html` avait cassé le scroll des autres pages — **corrigé, revenu à un `body{margin:0}` simple dans `index.html`**) |
| Scrollbar moche dans le menu latéral admin | `.ad-nav { overflow-y: auto }` sans style de scrollbar | `scrollbar-width:none` + `::-webkit-scrollbar{display:none}` ajoutés dans `theme.jsx` |
| Dashboard client : message "paiements sécurisés" affiché à la place de vraies transactions alors qu'il en restait à charger | Condition dans `DashboardPage.jsx` comparait `filteredTx.length` (limité par pagination) au lieu de `filteredTxAll.length` (total réel) | Condition corrigée pour ne montrer le message que quand il n'y a vraiment plus rien à charger |

## 7. Tentative annulée (rollback effectué)

Une refonte visuelle de l'espace Client (sidebar navy dégradé, icônes colorées sur les StatCard) a été **demandée puis explicitement annulée par l'utilisateur**. Les fichiers `ClientLayout.jsx`, `AnalyticsPage.jsx`, `CardsPage.jsx` sont revenus à leur état d'origine (`git checkout`). **Ne pas réappliquer sans nouvelle demande explicite.**

## 8. Points d'attention pour la suite

- L'utilisateur n'est **pas expert technique** — toujours répondre en langage simple, éviter le jargon non expliqué.
- Toujours vérifier qu'il n'y a **pas de doublons de process** (`php.exe`/`node.exe`) avant de diagnostiquer un bug d'affichage — c'est une cause récurrente de confusion dans ce projet.
- Le style Client a été jugé "trop blanc / pas assez pro" par l'utilisateur à un moment — une demande de refonte visuelle pourrait revenir, mais elle doit rester **scopée à `.cf-client`** pour ne jamais toucher le style Admin partagé (`theme.jsx` / `sharedCss`).
- Palette de marque (HPS) déjà définie dans `resources/js/admin/theme.jsx` (objet `C`) : navy `#1B2340`, orange/accent `#F4A341`, rouge `#E63946`.

## 9. Fichiers clés à connaître

```
app/Console/Commands/ExpireCards.php
app/Http/Controllers/AuditLogController.php
app/Http/Controllers/AuthController.php
app/Models/Card.php
app/Services/AuditService.php
routes/api.php
routes/console.php
database/seeders/CardSeeder.php
database/seeders/TransactionSeeder.php
vite.config.js
index.html                              ← point d'entrée SPA (mode actif)
resources/views/welcome.blade.php       ← ancien point d'entrée (inactif en dev)
resources/js/app.jsx                    ← routes React
resources/js/admin/theme.jsx            ← design system partagé (couleurs, Icon, sharedCss)
resources/js/admin/AdminLayout.jsx
resources/js/client/ClientLayout.jsx
resources/js/client/pages/DashboardPage.jsx
resources/js/admin/pages/AuditLogsPage.jsx
resources/js/components/Login.jsx
resources/js/i18n/translations.js
```
