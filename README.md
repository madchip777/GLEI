# GLEI — Gestion Logicielle et Infrastructure IT

> Plateforme de gestion IT interne développée dans le cadre du fil rouge Ynov.  
> Gestion de tickets de support, inventaire matériel & logiciel, et administration des utilisateurs.

![GLEI Logo](./logoGLEI.png)

---

## Table des matières

- [À propos du projet](#à-propos-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Schéma de base de données](#schéma-de-base-de-données)
- [Flux d'authentification](#flux-dauthentification)
- [API — Routes disponibles](#api--routes-disponibles)
- [Guide de démarrage](#guide-de-démarrage)
- [Comptes de test](#comptes-de-test)
- [Variables d'environnement](#variables-denvironnement)
- [Structure des dossiers](#structure-des-dossiers)

---

## À propos du projet

**GLEI** est une application web full-stack de gestion IT interne. Elle permet à une entreprise de centraliser :

- La **gestion de tickets** (incidents, demandes d'accès, problèmes réseau, etc.)
- L'**inventaire du matériel** (PC, écrans, claviers, etc.) avec assignation aux utilisateurs
- La **gestion des licences logicielles** avec suivi des expirations
- L'**administration des utilisateurs** avec un système de rôles hiérarchiques
- La **sécurité avancée** avec authentification 2FA (TOTP via Google Authenticator)

Le projet suit une architecture **SPA (Single Page Application)** avec un backend **REST API** découplé.

---

## Fonctionnalités

### 🎫 Système de tickets
- Création de tickets en brouillon, puis soumission
- Catégories : `it_issue`, `security_incident`, `access_request`, `other`
- Priorités : `low`, `medium`, `high`, `critical`
- Statuts : `draft` → `open` → `in_progress` → `resolved` → `closed`
- Messagerie intégrée avec pièces jointes (images JPEG/PNG/GIF, max 5 Mo)
- Historique complet des changements (assignation, statut, priorité)
- Gestion des participants (créateur + admin assigné + admins invités)

### 🖥️ Gestion du matériel
- CRUD complet sur les équipements (PC, écran, clavier, souris, etc.)
- Assignation/désassignation d'un équipement à un utilisateur
- Suivi de l'état (neuf, bon, usagé, défectueux) et du statut (disponible, assigné, en maintenance)
- Historique d'assignation

### 💿 Gestion des logiciels
- CRUD complet sur les licences logicielles
- Assignation multiple (une licence peut être assignée à plusieurs utilisateurs)
- Suivi des dates d'expiration de licence
- Détection des licences expirées

### 👥 Gestion des utilisateurs
- Création d'utilisateurs par un administrateur (avec envoi automatique d'email de bienvenue)
- Profil utilisateur (département, poste, téléphone)
- Réinitialisation de mot de passe (par l'admin ou via email)
- Forçage du changement de mot de passe à la première connexion

### 🔐 Sécurité
- Authentification via **Laravel Sanctum** (tokens Bearer)
- **Access token** à durée de vie courte (15 minutes)
- **Refresh token** pour le renouvellement silencieux de session
- **2FA obligatoire** via TOTP (compatible Google Authenticator, Authy, etc.)
- Contrôle d'accès basé sur les rôles (`user`, `admin`, `super_admin`)
- Audit log des connexions/déconnexions

### 📧 Notifications email
- Email de bienvenue lors de la création d'un compte
- Email de réinitialisation de mot de passe
- Compatible **Mailpit** pour le développement local

---

## Stack technique

| Couche       | Technologie                              |
|--------------|------------------------------------------|
| Backend      | PHP 8.4 / Laravel 10                     |
| Auth         | Laravel Sanctum (tokens) + Google2FA     |
| Frontend     | React 19 + Vite 8                        |
| Routing SPA  | React Router DOM 7                       |
| HTTP Client  | Axios 1.x                                |
| Base de données | MySQL (via WAMP) / SQLite (optionnel) |
| Mail (dev)   | Mailpit (SMTP local port 1025)           |
| 2FA          | pragmarx/google2fa-laravel               |

---

## Architecture du projet

```
GLEI/
├── backend/          # API REST — Laravel 10
├── frontend/         # SPA React — Vite
├── logoGLEI.png
├── runDev.sh         # Script de démarrage rapide (Linux/Mac/WSL)
└── composerInstaller.sh
```

### Backend — Architecture en couches

Le backend suit une architecture **Controller → Service → Repository** :

```
backend/app/
├── Http/
│   ├── Controllers/Api/        # Couche HTTP — Reçoit les requêtes, retourne du JSON
│   │   ├── AuthController          Connexion, déconnexion, refresh token
│   │   ├── TwoFactorController     Setup et vérification TOTP
│   │   ├── TicketController        CRUD tickets, messages, images
│   │   ├── HardwareController      CRUD matériel + assignation
│   │   ├── SoftwareController      CRUD logiciels + assignation
│   │   ├── UserController          CRUD utilisateurs + profil
│   │   ├── PasswordController      Changement et réinitialisation mdp
│   │   ├── AdminController         Dashboard admin
│   │   ├── SuperAdminController    Dashboard super admin
│   │   └── UserDashboardController Dashboard utilisateur
│   └── Middleware/
│       └── CheckRole.php           Contrôle d'accès RBAC
│
├── Services/                   # Couche métier — Logique applicative
│   ├── AuthService                 Login, logout, refresh
│   └── TicketService               Création, soumission, messagerie, images
│
├── Repositories/               # Couche d'accès aux données (pattern Repository)
│   ├── Interfaces/
│   │   └── UserRepositoryInterface
│   └── MockUserRepository
│
├── Models/                     # Modèles Eloquent ORM
│   ├── User
│   ├── Ticket
│   ├── TicketMessage
│   ├── TicketImage
│   ├── TicketHistory
│   ├── TicketParticipant
│   ├── Hardware
│   ├── Software
│   └── RefreshToken
│
└── Mail/                       # Mails transactionnels (Blade templates)
    ├── UserCreatedMail
    └── PasswordResetMail
```

### Frontend — Architecture React

```
frontend/src/
├── main.jsx                    # Point d'entrée React
├── App.jsx                     # Configuration du routeur (React Router DOM)
│
├── contexts/
│   └── AuthContext.jsx         # Context global — état d'authentification
│
├── components/
│   ├── Navbar.jsx              # Navigation principale
│   └── PrivateRoute.jsx        # HOC de protection des routes (RBAC)
│
├── pages/                      # Pages de l'application
│   ├── Login.jsx               # Connexion + flux 2FA (setup & verify)
│   ├── Dashboard.jsx           # Tableau de bord utilisateur
│   ├── AdminDashboard.jsx      # Tableau de bord admin
│   ├── SuperAdminDashboard.jsx # Tableau de bord super admin
│   ├── Tickets.jsx             # Liste des tickets
│   ├── CreateTicket.jsx        # Création d'un ticket
│   ├── TicketDetail.jsx        # Détail d'un ticket (messagerie, historique)
│   ├── UserList.jsx            # Gestion des utilisateurs (admin)
│   ├── UserProfile.jsx         # Profil d'un utilisateur
│   ├── HardwareList.jsx        # Inventaire matériel
│   ├── SoftwareList.jsx        # Inventaire logiciel
│   ├── Settings.jsx            # Paramètres du compte
│   ├── ChangePassword.jsx      # Changement de mot de passe
│   ├── ForgotPassword.jsx      # Mot de passe oublié
│   └── ResetPassword.jsx       # Réinitialisation via token email
│
├── services/
│   ├── api.js                  # Client Axios centralisé + intercepteurs
│   └── imageService.js         # Gestion des URLs d'images
│
└── styles/                     # CSS modulaire par section
    ├── auth.css
    ├── common.css
    ├── dashboard.css
    ├── navbar.css
    ├── tickets.css
    └── admin.css
```

---

## Schéma de base de données

```
users
  id, name, email, password, role, department, job_title, phone
  two_factor_secret, two_factor_confirmed_at, force_password_change

refresh_tokens
  id, user_id → users.id, token (hashed), plain_token, expires_at

tickets
  id, user_id → users.id, assigned_to → users.id
  title, description, category, status, priority

ticket_messages
  id, ticket_id → tickets.id, user_id → users.id, content

ticket_images
  id, message_id → ticket_messages.id
  original_path, thumbnail_path, mime_type, width, height

ticket_history
  id, ticket_id → tickets.id, changed_by → users.id
  action_type, old_values (JSON), new_values (JSON)

ticket_participants
  id, ticket_id → tickets.id, user_id → users.id, role

hardware
  id, category, brand, model, serial_number, purchase_date
  condition, status, assigned_to → users.id, assigned_at, notes

software
  id, name, category, version, license_key, license_expiry, status, notes

user_software  (pivot)
  id, user_id → users.id, software_id → software.id, assigned_at
```

---

## Flux d'authentification

Le système utilise un flux en deux étapes incluant une **2FA obligatoire** :

```
1. POST /api/login (email + password)
        │
        ├── Première connexion (2FA non configurée)
        │       → retourne: { requires_2fa_setup: true, setup_token }
        │       → GET /2fa/setup (header X-Setup-Token)
        │       → Affiche QR Code à scanner dans Authenticator
        │       → POST /2fa/confirm (code TOTP)
        │       → retourne: { access_token, refresh_token }
        │
        └── Connexions suivantes (2FA configurée)
                → retourne: { requires_2fa: true, temp_token }
                → POST /2fa/verify (code TOTP, header X-Temp-Token)
                → retourne: { access_token, refresh_token }

2. Requêtes authentifiées
        → Header: Authorization: Bearer {access_token}
        → Expiration: 15 minutes

3. Renouvellement silencieux
        → POST /api/refresh (body: { refresh_token })
        → retourne: nouvel access_token
        → Géré automatiquement par l'intercepteur Axios
```

---

## API — Routes disponibles

### Publiques
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/login` | Authentification (retourne setup_token ou temp_token) |
| POST | `/api/refresh` | Renouvellement du token d'accès |
| POST | `/api/password/reset` | Réinitialisation de mot de passe via token email |
| POST | `/api/2fa/verify` | Vérification du code TOTP (connexion) |
| POST | `/api/2fa/confirm` | Confirmation de la configuration 2FA |
| GET | `/api/2fa/setup` | Obtenir le QR code de configuration 2FA |

### Authentifiées (tous les utilisateurs)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/logout` | Déconnexion (révocation des tokens) |
| GET | `/api/user` | Informations de l'utilisateur courant |
| GET | `/api/profile` | Profil détaillé de l'utilisateur courant |
| GET | `/api/dashboard` | Données du tableau de bord |
| POST | `/api/password/change` | Changement de mot de passe |
| GET | `/api/tickets` | Liste des tickets (filtrée selon le rôle) |
| POST | `/api/tickets` | Créer un ticket (brouillon) |
| GET | `/api/tickets/{id}` | Détail d'un ticket |
| POST | `/api/tickets/{id}/submit` | Soumettre un ticket brouillon |
| POST | `/api/tickets/{id}/messages` | Ajouter un message |
| POST | `/api/tickets/{id}/messages/{msgId}/image` | Uploader une image |
| GET | `/api/tickets/{id}/images/{imageId}/view` | Afficher une image (protégé) |

### Authentifiées (admin & super_admin uniquement)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/admins` | Liste des administrateurs |
| POST | `/api/tickets/{id}/assign` | Assigner un ticket à un admin |
| POST | `/api/tickets/{id}/status` | Modifier le statut d'un ticket |
| POST | `/api/tickets/{id}/priority` | Modifier la priorité d'un ticket |
| POST | `/api/tickets/{id}/join` | Rejoindre un ticket en tant que participant |
| GET/POST | `/api/hardware` | CRUD matériel |
| GET/PUT/DELETE | `/api/hardware/{id}` | CRUD matériel (détail) |
| POST | `/api/hardware/{id}/assign` | Assigner matériel à un utilisateur |
| POST | `/api/hardware/{id}/unassign` | Désassigner le matériel |
| GET/POST | `/api/software` | CRUD logiciels |
| GET/PUT/DELETE | `/api/software/{id}` | CRUD logiciels (détail) |
| POST | `/api/software/{id}/assign` | Assigner licence à un utilisateur |
| POST | `/api/software/{id}/unassign` | Retirer une licence |
| GET | `/api/admin/dashboard` | Tableau de bord admin |
| GET/POST | `/api/users` | Gestion des utilisateurs |
| GET | `/api/users/{id}` | Profil d'un utilisateur |
| POST | `/api/users/{id}/reset-password` | Réinitialiser le mot de passe d'un utilisateur |

### Super Admin uniquement
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/super-admin/dashboard` | Tableau de bord super admin |
| GET | `/api/super-admin/system-config` | Configuration système |

---

## Guide de démarrage

### Prérequis

- **PHP** >= 8.4 avec les extensions `pdo`, `pdo_mysql`, `gd`
- **Composer** >= 2.x
- **Node.js** >= 18.x + **npm**
- **MySQL** (via WAMP, XAMPP, ou natif)
- **Mailpit** (optionnel, pour tester les emails en local)

---

### 1. Cloner le dépôt

```bash
git clone https://github.com/madchip777/GLEI.git
cd GLEI
```

---

### 2. Configuration du Backend

```bash
cd backend

# Installer les dépendances PHP
composer install

# Copier le fichier de configuration
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

Éditer le fichier `.env` avec vos paramètres :

```dotenv
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Base de données MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=glei_db
DB_USERNAME=root
DB_PASSWORD=

# Stockage des images uploadées
IMAGE_STORAGE_PATH=C:/chemin/vers/dossier/images

# Email (Mailpit en développement)
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_FROM_ADDRESS="noreply@glei.local"
```

```bash
# Créer la base de données (dans MySQL)
# CREATE DATABASE glei_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Lancer les migrations
php artisan migrate

# Seeder les données de test
php artisan db:seed --class=UserSeeder
# Optionnel : matériel, logiciels, tickets de démonstration
# php artisan db:seed --class=HardwareSeeder
# php artisan db:seed --class=SoftwareSeeder
# php artisan db:seed --class=TicketSeeder

# Démarrer le serveur backend
php artisan serve
# → Disponible sur http://localhost:8000
```

---

### 3. Configuration du Frontend

```bash
cd ../frontend

# Installer les dépendances Node.js
npm install

# Démarrer le serveur de développement
npm run dev
# → Disponible sur http://localhost:5173
```

---

### 4. Démarrage rapide (Linux / Mac / WSL)

Un script shell est disponible à la racine pour automatiser toutes les étapes :

```bash
chmod +x runDev.sh
./runDev.sh
```

Ce script :
1. Installe les dépendances Composer et npm du backend
2. Lance les migrations et le seeder utilisateurs
3. Installe les dépendances npm du frontend
4. Démarre `php artisan serve` en arrière-plan
5. Démarre `npm run dev` en premier plan

---

## Comptes de test

Après avoir lancé le seeder (`UserSeeder`), les comptes suivants sont disponibles :

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| Super Admin | `superadmin@company.com` | `password123` | Toutes les fonctionnalités |
| Admin | `admin@company.com` | `password123` | Gestion tickets, matériel, utilisateurs |
| Utilisateur | `user@company.com` | `password123` | Dashboard, tickets propres |
| Utilisateur | `jane@company.com` | `password123` | Dashboard, tickets propres |
| Utilisateur | `bob@company.com` | `password123` | Dashboard, tickets propres |

> **⚠️ Important :** La 2FA est **obligatoire** pour tous les comptes. Lors de la première connexion, un QR Code sera affiché — scannez-le avec **Google Authenticator** ou **Authy** pour finaliser la configuration.

---

## Variables d'environnement

### Backend (`backend/.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `APP_URL` | URL du backend | `http://localhost:8000` |
| `FRONTEND_URL` | URL du frontend (CORS) | `http://localhost:5173` |
| `DB_CONNECTION` | Driver BDD | `mysql` ou `sqlite` |
| `DB_DATABASE` | Nom de la base | `glei_db` |
| `IMAGE_STORAGE_PATH` | Dossier de stockage des images | `/var/www/glei/images` |
| `MAIL_HOST` | Serveur SMTP | `127.0.0.1` (Mailpit) |
| `MAIL_PORT` | Port SMTP | `1025` (Mailpit) |
| `SANCTUM_TOKEN_EXPIRATION` | Durée de vie du token (minutes) | `15` |

---

## Structure des dossiers

```
GLEI/
│
├── backend/                          # API Laravel 10
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/      # Contrôleurs REST
│   │   │   └── Middleware/           # CheckRole (RBAC)
│   │   ├── Models/                   # Modèles Eloquent
│   │   ├── Services/                 # Logique métier
│   │   ├── Repositories/             # Pattern Repository
│   │   └── Mail/                     # Emails transactionnels
│   ├── database/
│   │   ├── migrations/               # 18 migrations (avril → juin 2026)
│   │   └── seeders/                  # UserSeeder, HardwareSeeder, etc.
│   ├── resources/views/emails/       # Templates Blade pour les mails
│   ├── routes/api.php                # Définition de toutes les routes API
│   ├── .env.example                  # Modèle de configuration
│   └── composer.json
│
├── frontend/                         # SPA React 19 + Vite 8
│   ├── src/
│   │   ├── App.jsx                   # Routeur principal
│   │   ├── contexts/AuthContext.jsx  # État d'authentification global
│   │   ├── components/               # Navbar, PrivateRoute
│   │   ├── pages/                    # 16 pages (Login, Dashboard, Tickets…)
│   │   ├── services/api.js           # Client Axios + auto-refresh
│   │   └── styles/                   # CSS par module
│   ├── public/
│   └── package.json
│
├── .postman/                         # Collection Postman pour tester l'API
├── logoGLEI.png
├── runDev.sh                         # Script de démarrage Linux/Mac/WSL
└── README.md
```

---

## Système de rôles

```
super_admin
  └── Accès total (toutes les routes admin + configuration système)
  └── Peut gérer tous les utilisateurs, tickets, matériel, logiciels

admin
  └── Gestion des tickets (assignation, statut, priorité)
  └── Gestion matériel & logiciels
  └── Gestion des utilisateurs (création, reset mdp)
  └── Dashboard admin avec statistiques

user
  └── Créer et suivre ses propres tickets
  └── Messagerie sur ses tickets
  └── Voir son tableau de bord
  └── Modifier son profil et son mot de passe
```

---

## Licence

Ce projet est développé dans le cadre du **fil rouge Ynov** — usage pédagogique.  
Voir le fichier [LICENSE](./LICENSE) pour les détails.
