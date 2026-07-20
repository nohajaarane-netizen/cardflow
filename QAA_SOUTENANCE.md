# CardFlow — 120 Questions / Réponses pour la Soutenance

---

## PARTIE 1 : PRÉSENTATION GÉNÉRALE DU PROJET (Q1–Q15)

---

### Q1 : Qu'est-ce que CardFlow ?
**R :** CardFlow est une plateforme de gestion de cartes de paiement virtuelles. Elle permet à une institution financière d'émettre, gérer et traiter des paiements avec des cartes Visa et Mastercard virtuelles, ciblant le marché marocain (devise : MAD — Dirham marocain).

---

### Q2 : Quel est le problème que CardFlow résout ?
**R :** Dans beaucoup de banques marocaines, la gestion des cartes virtuelles se fait encore manuellement ou via des outils vieillissants. CardFlow automatise tout : émission de cartes, traitement des paiements avec 3D Secure (OTP par SMS), détection de fraude, et suivi des transactions — le tout dans une interface web moderne.

---

### Q3 : Quelles sont les deux parties de l'application ?
**R :**
- **Admin** : Gère les clients, émet les cartes, voit les alertes fraude, consulte les analytics et exporte des rapports CSV.
- **Client** : Consulte ses cartes, effectue des paiements (avec OTP 3D Secure), gère ses bénéficiaires, et voit ses statistiques.

---

### Q4 : Quelle est la cible de CardFlow ?
**R :** Les institutions financières marocaines (banques, fintechs) qui souhaitent offrir des cartes virtuelles à leurs clients de manière sécurisée et automatisée.

---

### Q5 : Quels sont les rôles dans l'application ?
**R :** Deux rôles :
- **admin** : Accès total (clients, cartes, alertes, analytics, audit logs)
- **client** : Accès limité à ses propres cartes, paiements et bénéficiaires

**Exemple :** Un admin peut créer une carte pour un client. Un client ne peut que voir et bloquer sa propre carte.

---

### Q6 : Quel est le budget simulé de la plateforme ?
**R :** CardFlow est un projet de démonstration/poc (proof of concept). En production, les coûts incluraient : hébergement serveur (~100-500 MAD/mois), Twilio pour les SMS OTP (~0.5 MAD/SMS), et un certificat SSL.

---

### Q7 : Quelle est la devise utilisée ?
**R :** Le Dirham marocain (MAD). Tous les montants, plafonds et transactions sont exprimés en MAD.

---

### Q8 : CardFlow est-il un site web ou une application mobile ?
**R :** C'est une application web responsive (accessible sur mobile et desktop via un navigateur). Le frontend est un SPA (Single Page Application) construit avec React, le backend est une API REST construite avec Laravel.

---

### Q9 : Quelle est l'architecture globale de CardFlow ?
**R :** Architecture 3-tiers :
1. **Frontend** : React 19 + React Router + Tailwind CSS
2. **Backend (API)** : Laravel 11 (PHP 8.2) — API REST
3. **Base de données** : MySQL

**Exemple de flux :** Le client clique "Paiement" → React envoie une requête POST à `/api/payment/initiate` → Laravel vérifie la carte, la fraude, envoie l'OTP → le client saisit le code → Laravel confirme et enregistre la transaction.

---

### Q10 : Qu'est-ce qu'un SPA (Single Page Application) ?
**R :** Un SPA ne charge qu'une seule page HTML. Ensuite, React change le contenu dynamiquement sans recharger la page.

**Exemple :** Quand le client passe du Dashboard à "Mes Cartes", il n'y a pas de rechargement de page — React remplace simplement le composant affiché. C'est plus rapide et fluide.

---

### Q11 : Pourquoi avoir choisi Laravel pour le backend ?
**R :**
- Framework PHP mature et bien documenté
- ORM Eloquent puissant pour interagir avec la BDD
- Sanctum pour l'authentification par token
- Artisan CLI pour les migrations, seeds, etc.
- Écosystème riche (Pint pour le style de code, Pail pour les logs)

---

### Q12 : Pourquoi avoir choisi React pour le frontend ?
**R :**
- Bibliothèque populaire et flexible
- Composants réutilisables
- React Router pour la navigation côté client
- Écosystème riche (Vite pour le build, Tailwind pour le CSS)
- Bonne performance avec le Virtual DOM

---

### Q13 : Qu'est-ce que Tailwind CSS ?
**R :** Un framework CSS utility-first. Au lieu d'écrire des classes personnalisées, on utilise des classes prédéfinies.

**Exemple :** `<button className="bg-blue-500 text-white px-4 py-2 rounded">` crée un bouton bleu avec du texte blanc, du padding et des coins arrondis — sans écrire une seule ligne de CSS custom.

---

### Q14 : Qu'est-ce que Vite ?
**R :** Un outil de build rapide pour le frontend. Il transpile le JSX en JavaScript, regroupe les fichiers (bundling), et gère le hot reload (modification en temps réel pendant le développement).

---

### Q15 : Combien de temps a duré le développement ?
**R :** Le développement s'est étalé sur environ 3 semaines (juin-juillet 2026), couvrant la conception de la BDD, le backend API, le frontend React, l'intégration Twilio, et les tests.

---

## PARTIE 2 : AUTHENTIFICATION & SÉCURITÉ (Q16–Q35)

---

### Q16 : Comment fonctionne l'authentification dans CardFlow ?
**R :** Elle utilise **Laravel Sanctum** (token-based auth) :
1. Le client s'inscrit ou se connecte
2. Laravel génère un token unique
3. Le token est stocké côté client (localStorage)
4. Chaque requête API porte ce token dans le header `Authorization: Bearer <token>`

**Exemple de flux :**
```
POST /api/login  → { "email": "ahmed@mail.com", "password": "123456" }
Réponse : { "token": "abc123...", "user": { "name": "Ahmed", "role": "client" } }
Requête suivante : GET /api/cards  →  Header: Authorization: Bearer abc123...
```

---

### Q17 : Qu'est-ce que Sanctum ?
**R :** Sanctum est le package d'authentification officiel de Laravel. Il génère des tokens API uniques pour chaque utilisateur. Chaque token peut être révoqué individuellement (utile pour la déconnexion).

---

### Q18 : Les mots de passe sont-ils stockés en clair ?
**R :** Non ! Ils sont **hashés** avec `Hash::make()` (bcrypt). Même si la base de données est compromise, on ne peut pas retrouver le mot de passe original.

**Exemple :** Le mot de passe "123456" est stocké comme : `$2y$12$R...longue chaîne hashée...`

---

### Q19 : Comment fonctionne l'inscription ?
**R :** Le client envoie `POST /api/register` avec name, email, password, telephone. Laravel valide que :
- L'email est unique
- Le téléphone est au format marocain (+212XXXXXXXXX)
- Le mot de passe fait au moins 6 caractères
- Le rôle est forcément "client" (pas possible de s'inscrire en admin)

---

### Q20 : Pourquoi le numéro de téléphone est-il obligatoire ?
**R :** Parce qu'il sert à envoyer le code OTP par SMS lors du paiement 3D Secure. Sans numéro, pas de SMS, pas de paiement sécurisé.

---

### Q21 : Comment est validé le numéro de téléphone marocain ?
**R :** Avec une regex : `+212[5-7][0-9]{8}`. Ça garantit que le numéro commence par +212, suivi d'un chiffre entre 5 et 7 (mobile marocain), puis 8 chiffres.

**Exemple :** +212612345678 ✅ | +212412345678 ❌ (4 n'est pas mobile) | 0612345678 ❌ (pas de +212)

---

### Q22 : Comment fonctionne la déconnexion ?
**R :** `POST /api/logout` — Laravel supprime le token actuel de la table `personal_access_tokens`. Le token n'est plus valide pour les requêtes suivantes.

---

### Q23 : Qu'est-ce que le rôle admin ? Comment est-il créé ?
**R :** Le rôle admin est défini dans la base de données (migration `add_role_to_users_table`). Un admin est créé via un seeder. Un client ne peut pas devenir admin par l'interface — c'est un contrôle backend.

---

### Q24 : Comment est bloqué l'accès admin côté frontend ?
**R :** Avec un composant `RequireAdmin` dans React :
```jsx
function RequireAdmin({ children }) {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))
    if (!token || !user || user.role !== 'admin') {
        return <Navigate to="/" replace />
    }
    return children
}
```
Si l'utilisateur n'est pas admin, il est redirigé vers la page de connexion.

---

### Q25 : Et côté backend ?
**R :** Les routes admin vérifient le rôle dans chaque controller. Par exemple, dans `AlertController::index()` :
```php
if ($user->role !== 'admin') {
    return response()->json(['message' => 'Accès refusé'], 403);
}
```

---

### Q26 : Un client peut-il voir les cartes d'un autre client ?
**R :** Non. Dans `CardController::index()` :
```php
if ($user->role === 'admin') {
    $cards = Card::with('user')->get(); // admin voit tout
} else {
    $cards = Card::where('user_id', $user->id)->get(); // client ne voit que les siennes
}
```

---

### Q27 : Qu'est-ce que l'audit logging ?
**R :** Un système qui enregistre **chaque action importante** (login, logout, création de carte, paiement, etc.) dans la table `audit_logs` avec : qui a fait l'action, quoi, sur quel objet, à quelle heure, et depuis quelle IP.

**Exemple :** `{ user_id: 1, action: "block_card", model: "Card", model_id: 5, ip: "192.168.1.1" }`

---

### Q28 : Pourquoi l'audit logging est important ?
**R :** C'est essentiel pour :
- La sécurité (détecter des accès non autorisés)
- Le debugging (reproduire un problème)
- La conformité légale (les banques doivent tracer les opérations)

---

### Q29 : Qu'est-ce qu'un "personal access token" dans Sanctum ?
**R :** C'est un token unique généré pour chaque session de connexion. Quand l'utilisateur se connecte, Sanctum crée une entrée dans `personal_access_tokens` avec un token hashé. À la déconnexion, cette entrée est supprimée.

---

### Q30 : Le password est-il renvoyé dans les réponses API ?
**R :** Non. Le modèle User a `protected $hidden = ['password', 'remember_token']`, ce qui empêche Laravel de retourner ces champs dans任何 réponse JSON.

---

### Q31 : Qu'est-ce qu'un "remember token" ?
**R :** Un token utilisé pour la fonctionnalité "Se souvenir de moi" (persistent login). Il est stocké en BDD mais jamais exposé via l'API (grâce à `$hidden`).

---

### Q32 : Comment CardFlow protège-t-il contre les attaques CSRF ?
**R :** L'API utilise des tokens (Sanctum), pas des sessions cookies. Les attaques CSRF ciblent les cookies — avec des tokens Bearer dans les headers, ce type d'attaque est inefficace.

---

### Q33 : Qu'est-ce que le rate limiting ? Est-il appliqué ?
**R :** Le rate limiting limite le nombre de requêtes par IP/Utilisateur sur une période donnée. Laravel 11 l'intègre nativement. Dans CardFlow, la protection principale est le blocage automatique après 3 tentatives OTP échouées.

---

### Q34 : Un utilisateur peut-il modifier son profil ?
**R :** Oui, via `PATCH /api/me`. Il peut changer son nom, email et téléphone. L'email doit rester unique.

**Exemple :** `PATCH /api/me` avec `{ "name": "Ahmed Alami" }` → le nom est mis à jour, un log d'audit est créé.

---

### Q35 : Comment le téléphone est-il validé lors de la modification du profil ?
**R :** Avec la même regex marocaine : `regex:/^\+212[5-7][0-9]{8}$/`. Le message d'erreur personnalisé explique le format attendu.

---

## PARTIE 3 : BASE DE DONNÉES (Q36–Q55)

---

### Q36 : Combien de tables contient la base de données ?
**R :** 6 tables principales + 2 tables Laravel (cache, jobs) :
1. **users** — utilisateurs
2. **cards** — cartes virtuelles
3. **transactions** — opérations de paiement
4. **beneficiaries** — bénéficiaires de virements
5. **alerts** — alertes fraude/sécurité
6. **audit_logs** — journal d'audit

---

### Q37 : Quels sont les champs de la table users ?
**R :**
| Champ | Type | Description |
|---|---|---|
| id | int | Identifiant unique |
| name | string | Nom complet |
| email | string | Email (unique) |
| password | string | Mot de passe hashé |
| role | string | "admin" ou "client" |
| telephone | string | Numéro marocain (+212...) |
| created_at | timestamp | Date de création |

---

### Q38 : Quels sont les champs de la table cards ?
**R :**
| Champ | Type | Description |
|---|---|---|
| id | int | Identifiant unique |
| user_id | int | FK → users |
| pan | string | Numéro de carte (16 chiffres, Luhn) |
| cvv | string | Code CVV (3 chiffres) |
| type | string | "visa" ou "mastercard" |
| statut | string | "active", "blocked", "expired" |
| plafond | decimal | Plafond global (MAD) |
| plafond_journalier | decimal | Plafond journalier (MAD) |
| expiration | date | Date d'expiration (3 ans) |

---

### Q39 : Quels sont les champs de la table transactions ?
**R :**
| Champ | Type | Description |
|---|---|---|
| id | int | Identifiant unique |
| card_id | int | FK → cards |
| beneficiary_id | int | FK → beneficiaries (nullable) |
| montant | decimal | Montant en MAD |
| marchand | string | Nom du marchand/bénéficiaire |
| statut | string | "accepted", "refused", "suspicious" |
| code_reponse | string | Code réponse bancaire |
| otp | string | Code OTP utilisé |
| otp_verifie | boolean | OTP vérifié ou non |

---

### Q40 : Quels sont les champs de la table beneficiaries ?
**R :**
| Champ | Type | Description |
|---|---|---|
| id | int | Identifiant unique |
| user_id | int | FK → users (le client propriétaire) |
| prenom | string | Prénom du bénéficiaire |
| nom | string | Nom du bénéficiaire |
| rib | string | RIB marocain (24 chiffres) |
| banque | string | Nom de la banque |

---

### Q41 : Qu'est-ce qu'un RIB ?
**R :** Relevé d'Identité Bancaire — un identifiant unique de 24 chiffres pour les comptes bancaires marocains. Il contient le code banque, le code agence, le numéro de compte et une clé de contrôle.

**Exemple :** 011780000012345678901234 (24 chiffres exactement)

---

### Q42 : Quels sont les champs de la table alerts ?
**R :**
| Champ | Type | Description |
|---|---|---|
| id | int | Identifiant unique |
| card_id | int | FK → cards |
| transaction_id | int | FK → transactions (nullable) |
| type | string | "fraud", "blocked", "expiration", "security" |
| message | string | Description de l'alerte |
| lue | boolean | Alertes lues ou non |

---

### Q43 : Quels sont les types d'alertes ?
**R :**
- **fraud** : Transaction suspecte détectée par le FraudService
- **blocked** : Carte bloquée automatiquement (3 OTP échoués)
- **expiration** : Carte bientôt expirée
- **security** : Problème de sécurité (tentatives frauduleuses)

---

### Q44 : Qu'est-ce qu'une migration Laravel ?
**R :** Un fichier PHP qui définit comment créer/modifier une table en BDD. C'est le version control du schéma de la base de données.

**Exemple :** `create_cards_table.php` définit les colonnes id, user_id, pan, cvv, type, statut, plafond, etc.

---

### Q45 : Pourquoi utiliser les migrations plutôt que des SQL directs ?
**R :** Parce que les migrations sont :
- Versionnées (on peut revenir en arrière avec `php artisan migrate:rollback`)
- Portables (fonctionnent sur MySQL, SQLite, PostgreSQL...)
- Collaboratives (tout le monde a le même schéma)

---

### Q46 : Qu'est-ce qu'un Eloquent Model ?
**R :** Une classe PHP qui représente une table en BDD. Laravel Eloquent est l'ORM (Object-Relational Mapping) de Laravel.

**Exemple :** `Card::find(5)` retourne la carte avec id=5. `Card::where('statut', 'active')->get()` retourne toutes les cartes actives.

---

### Q47 : Qu'est-ce qu'une relation "belongsTo" ?
**R :** Indique qu'un enregistrement "appartient à" un autre. Exemple dans Card :
```php
public function user() {
    return $this->belongsTo(User::class);
}
```
Une carte appartient à un utilisateur. On peut faire `$card->user` pour obtenir l'utilisateur propriétaire.

---

### Q48 : Qu'est-ce qu'une relation "hasMany" ?
**R :** Indique qu'un enregistrement "a plusieurs" autres. Exemple dans User :
```php
public function cards() {
    return $this->hasMany(Card::class);
}
```
Un utilisateur a plusieurs cartes. On peut faire `$user->cards` pour obtenir toutes ses cartes.

---

### Q49 : Qu'est-ce que "fillable" dans un modèle ?
**R :** La liste des champs qu'on peut remplir avec `create()` ou `update()`. C'est une protection contre le "mass assignment" (assignation de masse).

**Exemple :** Si un attaquant envoie `{"role": "admin"}` dans un update, ça ne marchera pas si "role" n'est pas dans `$fillable`.

---

### Q50 : Qu'est-ce que "$hidden" dans User ?
**R :** La liste des champs **jamais retournés** dans les réponses JSON. Le mot de passe et le remember_token sont cachés pour des raisons de sécurité.

---

### Q51 : Qu'est-ce qu'un "seeder" ?
**R :** Un script qui remplit la base de données avec des données initiales (test ou production). Par exemple, le seeder Users crée un admin et quelques clients pour les tests.

---

### Q52 : Quelle est la différence entre SQLite et MySQL ?
**R :**
- **SQLite** : Base de données fichier unique, légère, idéale pour le développement/test
- **MySQL** : Serveur de base de données complet, pour la production

CardFlow utilise MySQL en production mais a un fallback SQLite pour le développement.

---

### Q53 : Qu'est-ce qu'un "cast" dans un modèle Laravel ?
**R :** Une conversion automatique de type. Par exemple dans Alert :
```php
protected $casts = ['lue' => 'boolean'];
```
Le champ "lue" (stocké comme 0/1 en BDD) est automatiquement converti en true/false en PHP.

---

### Q54 : Pourquoi le champ "details" dans audit_logs est-il un cast array ?
**R :** Parce qu'on stocke des données JSON (un objet) et le cast `array` permet à Laravel de convertir automatiquement le JSON en tableau PHP et vice versa.

**Exemple :** `['email' => 'ahmed@mail.com', 'role' => 'client']` est stocké en JSON et manipulé comme un tableau PHP.

---

### Q55 : Qu'est-ce que "firstOrCreate" utilisé pour les bénéficiaires ?
**R :** Une méthode Eloquent qui cherche un enregistrement et le crée s'il n'existe pas. Évite les doublons.

**Exemple :** `Beneficiary::firstOrCreate(['user_id' => 1, 'rib' => '01178...'], ['prenom' => 'Ali'])` — cherche un bénéficiaire avec ce RIB pour cet utilisateur, et le crée seulement s'il n'existe pas déjà.

---

## PARTIE 4 : PAIEMENT & 3D SECURE (Q56–Q80)

---

### Q56 : Combien de modes de paiement existe-t-il dans CardFlow ?
**R :** Deux modes :
1. **Paiement direct** (`POST /api/payment`) — pas d'OTP, transaction immédiate
2. **Paiement 3D Secure** (`POST /api/payment/initiate` puis `/api/payment/confirm`) — avec OTP par SMS

---

### Q57 : Comment fonctionne le paiement direct ?
**R :** Le client envoie card_id, montant et marchand. Le `PaymentService::process()` vérifie :
1. La carte existe
2. Elle n'est pas bloquée
3. Elle n'est pas expirée
4. Le montant ne dépasse pas le plafond
5. Le plafond journalier n'est pas atteint
6. Pas de fraude détectée

Si tout est OK → la transaction est enregistrée comme "accepted".

---

### Q58 : Comment fonctionne le paiement 3D Secure (OTP) ?
**R :** En 2 étapes :
1. **initiate** (`/api/payment/initiate`) : Vérifie la carte, la fraude, puis envoie un SMS avec un code OTP via Twilio
2. **confirm** (`/api/payment/confirm`) : Le client saisit le code reçu par SMS. Si correct → transaction acceptée. Si incorrect → tentative échouée (max 3).

---

### Q59 : Qu'est-ce que Twilio ?
**R :** Un service cloud pour envoyer des SMS, des appels, etc. CardFlow utilise Twilio Verify API pour envoyer les codes OTP par SMS aux clients marocains.

---

### Q60 : Qu'est-ce qu'un OTP ?
**R :** One-Time Password — un code à usage unique (6 chiffres) envoyé par SMS. Il est valide pendant 5 minutes. C'est le principe du 3D Secure : prouver qu'on est bien le titulaire de la carte en recevant un code sur son téléphone.

---

### Q61 : Que se passe-t-il si le code OTP est incorrect ?
**R :** Le compteur de tentatives augmente. Après 3 tentatives échouées :
1. La carte est **bloquée automatiquement**
2. Une alerte de sécurité est créée
3. Les données OTP en cache sont supprimées

**Exemple :** Tentative 1 → "Code incorrect — 2 tentatives restantes" | Tentative 2 → "Code incorrect — 1 tentative restante" | Tentative 3 → "Carte bloquée après 3 tentatives incorrectes"

---

### Q62 : Qu'est-ce que le "mode bypass OTP" ?
**R :** Un mode de développement qui permet de valider le paiement avec le code fixe `000000` sans envoyer de vrai SMS. Utile quand le numéro Twilio est en trial et ne peut pas envoyer de SMS vers tous les numéros.

---

### Q63 : Comment le code OTP est-il stocké ?
**R :** Le code n'est **pas stocké dans notre BDD**. Twilio gère lui-même la vérification. Nous stockons en **cache Redis** uniquement les données de la transaction (card_id, montant, marchand, téléphone) pendant 5 minutes.

---

### Q64 : Qu'est-ce que le Cache dans le paiement ?
**R :** Le cache (Redis ou file) stocke temporairement les données de la transaction en attendant la confirmation OTP. La clé de cache est `otp_{cardId}_{montant}`. Les données expirent après 5 minutes (300 secondes).

---

### Q65 : Pourquoi 5 minutes d'expiration ?
**R :** C'est le standard du 3D Secure. Un code OTP qui dure trop longtemps est un risque de sécurité ( quelqu'un pourrait le voler et l'utiliser plus tard).

---

### Q66 : Quels sont les codes de réponse bancaire utilisés ?
**R :**
| Code | Signification |
|---|---|
| 00 | Transaction acceptée |
| 05 | OTP invalide/expiré |
| 14 | Carte inval/introuvable |
| 51 | Plafond insuffisant |
| 54 | Carte expirée |
| 59 | Transaction suspecte (fraude) |
| 61 | Plafond journalier atteint |
| 62 | Carte bloquée |
| 96 | Erreur technique |

---

### Q67 : Qu'est-ce que le plafond global vs journalier ?
**R :**
- **Plafond** : Montant maximum total de la carte (ex: 10 000 MAD)
- **Plafond journalier** : Montant maximum par jour (ex: 3 000 MAD)

**Exemple :** Si la carte a un plafond de 10 000 MAD et un plafond journalier de 3 000 MAD, on peut faire 3 paiements de 1 000 MAD par jour, mais pas un seul de 4 000 MAD.

---

### Q68 : Comment est calculé le plafond journalier consommé ?
**R :** On somme les transactions "accepted" du jour en cours :
```php
$totalAujourdhui = Transaction::where('card_id', $card->id)
    ->where('statut', 'accepted')
    ->whereDate('created_at', today())
    ->sum('montant');
```

---

### Q69 : Qu'est-ce que l'algorithme de Luhn ?
**R :** Un algorithme de validation des numéros de carte bancaire. Il ajoute un chiffre de vérification (le 16ème) qui rend le total divisible par 10.

**Exemple simplifié :** Pour le préfixe "4532" (Visa), on génère 12 chiffres aléatoires, puis on calcule le 16ème chiffre avec Luhn pour que le numéro soit valide.

---

### Q70 : Pourquoi Visa commence par 4532 et Mastercard par 5412 ?
**R :** Ce sont les préfixes IIN (Issuer Identification Number) standards. Visa commence généralement par 4, Mastercard par 5. Les chiffres suivants identifient l'émetteur. CardFlow utilise ces préfixes pour simuler des cartes réalistes.

---

### Q71 : Le CVV est-il stocké en clair ?
**R :** Il est généré aléatoirement (`rand(100, 999)`) et stocké dans la BDD. Dans une vraie banque, le CVV serait chiffré (PCI-DSS). Dans CardFlow, il est exposé au client propriétaire via l'API mais jamais aux autres utilisateurs.

---

### Q72 : Comment le client voit-il les détails de sa carte ?
**R :** Via `CardResource`. Le PAN est masqué par défaut (4532 **** **** 2305), mais le propriétaire de la carte peut voir le PAN complet et le CVV. L'admin ne voit que le PAN masqué.

---

### Q73 : Qu'est-ce qu'un bénéficiaire dans CardFlow ?
**R :** Une personne ou entité à qui on peut faire un virement. Chaque client a sa propre liste de bénéficiaires avec : prénom, nom, RIB (24 chiffres) et banque.

---

### Q74 : Comment fonctionne l'ajout d'un bénéficiaire ?
**R :** `POST /api/beneficiaries` avec prenom, nom, rib, banque. Le RIB est validé (24 chiffres, unique par utilisateur). Le bénéficiaire est lié au client connecté.

---

### Q75 : Un bénéficiaire peut-il appartenir à plusieurs clients ?
**R :** Non. Chaque bénéficiaire est lié à un seul client (`user_id`). Cependant, deux clients peuvent avoir des bénéficiaires avec le même RIB (c'est normal — c'est le même compte bancaire cible).

---

### Q76 : Qu'est-ce que "resolveBeneficiary" dans PaymentService ?
**R :** Une méthode qui identifie le bénéficiaire d'un virement :
- Si le bénéficiaire existe déjà (a un `id`) → on renvoie son ID
- Si c'est un nouveau bénéficiaire (avec RIB) → on le crée automatiquement avec `firstOrCreate`

**Exemple :** Le client fait un virement vers "Ali" (RIB: 01178...) pour la première fois → le bénéficiaire est créé automatiquement. La prochaine fois, il sera déjà enregistré.

---

### Q77 : Le "marchand" dans une transaction, c'est quoi ?
**R :** Le nom du commerçant ou du bénéficiaire. Pour un paiement chez un marchand, c'est le nom du magasin. Pour un virement, c'est le nom complet du bénéficiaire.

**Exemple :** Paiement chez "Amazon Maroc" → marchand = "Amazon Maroc" | Virement vers Ali → marchand = "Ali Alami"

---

### Q78 : Que se passe-t-il si une carte bloquée est utilisée ?
**R :** Le `PaymentService` retourne immédiatement une erreur avec le code `62` (carte bloquée). La transaction est enregistrée comme "refused".

---

### Q79 : Que se passe-t-il si une carte expirée est utilisée ?
**R :** Le code `54` est retourné (carte expirée), la transaction est "refused". L'admin doit créer une nouvelle carte pour le client.

---

### Q80 : Comment un admin crée-t-il une carte ?
**R :** `POST /api/cards` avec user_id, type (visa/mastercard) et plafond. Le PAN est généré automatiquement avec Luhn, le CVV est généré aléatoirement, l'expiration est fixée à 3 ans.

---

## PARTIE 5 : DÉTECTION DE FRAUDE (Q81–Q95)

---

### Q81 : Comment CardFlow détecte-t-il la fraude ?
**R :** Le `FraudService` applique 3 règles sur chaque transaction :
1. Montant > 5 000 MAD → suspect
2. Plus de 3 transactions en 1 heure sur la même carte → suspect
3. Marchand dans la liste noire → suspect

Si au moins une règle est violée → la transaction est refusée et une alerte est créée.

---

### Q82 : Pourquoi 5 000 MAD comme seuil ?
**R :** C'est un seuil arbitraire pour la démo. En production, ce seuil serait configuré et adapté au profil de risque de chaque client.

---

### Q83 : Quels marchands sont dans la liste noire ?
**R :** "Unknown", "Test Fraud", "Suspicious Shop". La détection se fait avec `stripos()` (insensible à la casse).

**Exemple :** Si le marchand s'appelle "unknown shop", il sera détecté comme suspect.

---

### Q84 : La détection de fraude est-elle en temps réel ?
**R :** Oui. Elle est exécutée à chaque tentative de paiement (initiate ou process), avant de créer la transaction.

---

### Q85 : Que devient une transaction frauduleuse ?
**R :** Elle est enregistrée avec le statut "refused" et le code `59`. Une alerte de type "fraud" est créée dans la table `alerts`. Le client et l'admin sont notifiés.

---

### Q86 : L'admin voit-il les transactions frauduleuses ?
**R :** Oui, via la page "Disputes & Alertes" du panneau admin. Les alertes de type "fraud" y sont listées avec les détails de la carte et du client.

---

### Q87 : Peut-on ajouter de nouvelles règles de fraude ?
**R :** Oui. Il suffit d'ajouter une nouvelle condition dans `FraudService::analyze()`. Par exemple : vérifier la localisation géographique, le pays d'origine, etc.

**Exemple futur :** `if ($ip !== $user->usual_ip) { $reasons[] = 'IP inconnue'; }`

---

### Q88 : La fraude bloque-t-elle automatiquement la carte ?
**R :** Non. La fraude bloque uniquement la transaction. La carte reste active. Seules les 3 tentatives OTP échouées bloquent la carte.

---

### Q89 : Quelle est la différence entre "refused" et "suspicious" ?
**R :**
- **refused** : Transaction rejetée (carte bloquée, plafond dépassé, fraude)
- **suspicious** : Transaction marquée comme suspecte (peut être examinée manuellement par l'admin)

En pratique, les transactions frauduleuses sont enregistrées comme "refused" dans CardFlow.

---

### Q90 : Le système peut-il apprendre de la fraude ?
**R :** Pas dans la version actuelle. C'est un système basé sur des règles fixes. En production, on pourrait ajouter du machine learning pour détecter des patterns suspects plus fins.

---

### Q91 : Comment l'admin gère-t-il une alerte fraude ?
**R :** Il peut la marquer comme "lue" via `PATCH /api/alerts/{id}/read`. L'alerte reste dans l'historique mais n'est plus considérée comme "non traitée".

---

### Q92 : Qu'est-ce qu'une alerte de type "security" ?
**R :** Une alerte créée quand la carte est bloquée automatiquement après 3 tentatives OTP incorrectes. C'est un signe possible de vol de carte.

---

### Q93 : Les alertes sont-elles liées aux transactions ?
**R :** Oui. Chaque alerte a un `transaction_id` (nullable) et un `card_id`. Cela permet de retracer facilement quel événement a déclenché l'alerte.

---

### Q94 : Les alertes peuvent-elles être automatiquement supprimées ?
**R :** Pas dans la version actuelle. Elles restent en base pour l'historique. En production, on pourrait implémenter une politique de rétention (ex: suppression après 1 an).

---

### Q95 : Pourquoi la fraude est-elle un sujet critique dans le paiement en ligne ?
**R :** Parce que les pertes dues à la fraude bancaire se comptent en milliards chaque année. Un bon système de détection protège à la fois la banque, le commerçant et le client. Les régulateurs (Bank Al-Maghrib au Maroc) imposent des normes strictes.

---

## PARTIE 6 : FRONTEND REACT (Q96–Q110)

---

### Q96 : Quels sont les composants principaux du frontend ?
**R :**
- **Login** — Page de connexion/inscription
- **AdminLayout** — Layout avec sidebar pour l'admin
- **ClientLayout** — Layout avec sidebar pour le client
- **11 pages admin** : Dashboard, Clients, Cartes, Transactions, Alertes, Analytics, Rapports, Utilisateurs, Support, Audit Logs, Settings
- **7 pages client** : Dashboard, Cartes, Paiements, Bénéficiaires, Analytics, Support, Settings

---

### Q97 : Comment fonctionne la navigation côté client ?
**R :** Avec React Router v7. Les routes sont définies dans `app.jsx` :
- `/` → Login
- `/admin/*` → Pages admin (protégées par RequireAdmin)
- `/client/*` → Pages client (protégées par RequireClient)

---

### Q98 : Qu'est-ce que le "LanguageContext" ?
**R :** Un Context React qui gère la langue de l'interface (français/anglais). Le switcher de langue permet de basculer instantanément tous les textes de l'interface.

---

### Q99 : Comment fonctionne l'internationalisation (i18n) ?
**R :** Un système simple : un objet de traductions avec des clés. Exemple :
```javascript
const translations = {
  fr: { "dashboard.title": "Tableau de bord" },
  en: { "dashboard.title": "Dashboard" }
}
```
Le contexte fournit `t('dashboard.title')` qui retourne le texte dans la langue courante.

---

### Q100 : Comment les données sont-elles envoyées au backend ?
**R :** Avec `fetch()` ou `axios`. Exemple :
```javascript
const response = await fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ email, password })
});
```

---

### Q101 : Comment le token est-il stocké côté client ?
**R :** Dans `localStorage`. Lors de la connexion, le token et les infos utilisateur sont sauvegardés. À la déconnexion, ils sont supprimés.

---

### Q102 : Le CVV est-il masqué dans l'interface ?
**R :** Par défaut, oui. Le frontend peut afficher/masquer le CVV avec un bouton "Révéler" (toggle). Le backend envoie toujours le CVV au propriétaire (via `CardResource`), mais le frontend peut choisir de ne pas l'afficher.

---

### Q103 : Comment le dashboard admin affiche-t-il les statistiques ?
**R :** Il appelle des routes API qui retournent des agrégations :
- Nombre de clients
- Nombre de cartes actives/bloquées
- Nombre d'alertes non lues
- Solde total des plafonds
- Graphiques de distribution des cartes

---

### Q104 : Qu'est-ce que Recharts ?
**R :** Une bibliothèque de graphiques React utilisée dans CardFlow pour afficher les graphiques en barres, en secteurs, etc. dans les pages d'analytics.

---

### Q105 : Comment fonctionne l'export CSV ?
**R :** Le frontend appelle une route API qui retourne les données, puis génère un fichier CSV côté client avec les données formatées. L'utilisateur peut télécharger le fichier.

---

### Q106 : Le frontend vérifie-t-il les droits d'accès ?
**R :** Oui, à deux niveaux :
1. **Route Guard** : `RequireAdmin` / `RequireClient` empêche l'accès aux pages protégées
2. **Affichage conditionnel** : Les boutons/actions sont masqués selon le rôle

---

### Q107 : Comment fonctionne le "hot reload" avec Vite ?
**R :** Quand un fichier est modifié, Vite détecte le changement et recompile uniquement le fichier modifié. Le navigateur se met à jour instantanément sans rechargement complet. C'est très pratique en développement.

---

### Q108 : Qu'est-ce que "concurrently" dans le script dev ?
**R :** Un outil Node.js qui lance plusieurs processus en parallèle. Dans CardFlow, il lance :
1. Le serveur PHP (`php artisan serve`)
2. Le worker de queue (`php artisan queue:work`)
3. Le serveur Vite (frontend)
4. Les logs Laravel (Pail)

---

### Q109 : Comment le frontend gère-t-il les erreurs d'API ?
**R :** En vérifiant le code HTTP : 200/201 = succès, 401 = non autorisé, 422 = erreur de validation, 500 = erreur serveur. Le frontend affiche des messages d'erreur conviviaux à l'utilisateur.

---

### Q110 : Le frontend est-il responsive (mobile-friendly) ?
**R :** Oui, grâce à Tailwind CSS. Les classes comme `md:grid-cols-2`, `lg:block` permettent d'adapter la mise en page selon la taille de l'écran.

---

## PARTIE 7 : DÉPLOIEMENT & OUTILS (Q111–Q120)

---

### Q111 : Comment CardFlow est-il déployé ?
**R :** Pour le développement, on utilise `php artisan serve` (port 8000) + `npm run dev` (Vite sur port 5173). Pour la production, on compilerait le frontend (`npm run build`) et on déploierait sur un serveur avec Nginx/Apache + MySQL.

---

### Q112 : Qu'est-ce que HTTPS et pourquoi est-il utilisé ?
**R :** HTTPS chiffre la communication entre le navigateur et le serveur. CardFlow utilise des certificats locaux (mkcert) + Cloudflare Tunnel pour accéder à l'app depuis l'extérieur de manière sécurisée.

---

### Q113 : Qu'est-ce que Cloudflare Tunnel ?
**R :** Un outil qui crée un tunnel sécurisé entre le serveur local et Internet. Permet d'exposer l'app de développement depuis une URL publique sans ouvrir de ports. Utile pour les démos.

---

### Q114 : Comment les tests sont-ils organisés ?
**R :** Avec PHPUnit (框架 de test Laravel) :
- `tests/Unit/` — Tests unitaires (une seule classe/fonction)
- `tests/Feature/` — Tests d'intégration (test complet d'un endpoint)

**Exemple :** Un test unitaire vérifie que Luhn::generate() retourne un numéro valide. Un test feature envoie une requête POST à `/api/login` et vérifie la réponse.

---

### Q115 : Qu'est-ce que Laravel Pint ?
**R :** Un outil de formatage de code PHP (comme Prettier pour JS). Il applique des règles de style automatiquement pour garder le code propre et cohérent.

---

### Q116 : Qu'est-ce que Laravel Pail ?
**R :** Un outil de visualisation des logs en temps réel dans le terminal. Très utile pendant le développement pour voir les erreurs et les requêtes en direct.

---

### Q117 : Qu'est-ce que Laravel Sail ?
**R :** Un conteneur Docker officiel pour Laravel. Permet de lancer tout l'environnement (PHP, MySQL, Redis) avec une seule commande : `./vendor/bin/sail up`.

---

### Q118 : Quels sont les défis rencontrés lors du développement ?
**R :**
1. **Intégration Twilio** : Le mode trial limite les numéros — d'où le bypass OTP
2. **Synchronisation Frontend/Backend** : Gestion cohérente des erreurs et des states
3. **Sécurité** : Masquage du PAN/CVV, protection des routes admin
4. **Performance** : Requêtes SQL optimisées (with eager loading, sum optimisé)

---

### Q119 : Quelles améliorations futures sont envisagées ?
**R :**
1. **Machine Learning** pour la détection de fraude plus fine
2. **Notifications push** en temps réel (WebSocket)
3. **Application mobile** native (React Native)
4. **Paiement par empreinte digitale/Visage** (biométrie)
5. **Support multi-devises** (EUR, USD)
6. **Architecture microservices** pour la scalabilité

---

### Q120 : Qu'avez-vous appris en réalisant ce projet ?
**R :**
1. **Architecture full-stack** : Comprendre le lien entre frontend et backend
2. **Sécurité informatique** : Hashing, token auth, PCI-DSS basics
3. **Services tiers** : Intégration Twilio pour les SMS OTP
4. **Gestion de projet** : Organiser un projet complexe avec migration, modèle, controller, service
5. **Design patterns** : Service layer (PaymentService, FraudService), Repository pattern, API Resources
6. **Marché marocain** : Comprendre les spécificités (RIB, +212, MAD)

---
