# 🃏 Le Saboteur

Un jeu multijoueur en ligne basé sur le jeu de société "Saboteur", conçu pour des groupes d’amis à distance. Deux équipes s’affrontent : les **Nains** cherchent la pépite, tandis que les **Saboteurs** tentent de les en empêcher.

---

## 🧭 Sommaire

1. [Diagramme C4](#-diagramme-c4)
2. [Design Patterns utilisés](#-design-patterns-utilisés)
3. [Architecture technique](#-architecture-technique)
4. [Fonctionnalités du jeu](#-fonctionnalités-du-jeu)
5. [Utilisation du jeu](#-utilisation-du-jeu)
6. [Plan de tests](#-plan-de-tests)
7. [Axes d'améliorations](#-axes-daméliorations)

---

## 🗺️ Diagramme C4

![Diagramme C4](./image-readme/diagram-c4.png)


---

## 🧩 Design Patterns utilisés

### **Singleton**
Utilisé pour les éléments centralisés du jeu (ex. gestionnaire de parties) afin d’éviter les duplications.

### **Adapter**
Permet de faire la liaison entre les entités internes et les représentations externes (DTO, WebSocket, etc.).

### **Decorator**
Utilisé pour ajouter dynamiquement des comportements aux cartes ou actions sans modifier leur structure d’origine.

### **Observer**
Mis en place pour notifier les joueurs des changements en temps réel via WebSocket.

### **Proxy**
Utilisé pour contrôler l’accès à certaines méthodes (ex. autoriser certaines actions uniquement au joueur courant).

---

## 🛠️ Architecture technique

Le projet est structuré en monorepo avec les dossiers principaux suivants :

- **`apps/`** : Contient les applications principales
  - **`frontend/`** : Application React pour l'interface utilisateur
  - **`api/`** : Serveur NestJS gérant la logique métier et les WebSockets
- **`packages/`** : Contient les packages réutilisables
  - **`eslint/`** : Configuration ESLint partagée

### Stack technologique

- **Frontend** : React + TypeScript
- **Backend** : NestJS (Node.js) avec WebSocket
- **Base de données** : PostgreSQL
- **Gestion des dépendances** : Yarn
- **Conteneurisation** : Docker avec `docker-compose`

---

## 🎮 Fonctionnalités du jeu

- Création, lancement et gestion de parties
- Attribution aléatoire des rôles : Nain ou Saboteur
- Pose de cartes pour construire des chemins ou saboter les autres joueurs
- Objectifs :
  - **Nains** : Atteindre la pépite d'or
  - **Saboteurs** : Empêcher les Nains d'atteindre la pépite
- Rotation des tours entre les joueurs
- Notifications en temps réel via WebSockets
- Fin de partie automatique avec annonce des vainqueurs

---

## 🧪 Utilisation du jeu

### Prérequis

- **Node.js** 
- **Yarn**
- **Docker** et **Docker Compose** (pour la base de données PostgreSQL)

### Installation

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/Maximauve/Saboteur.git
   ```

2. **Installer les dépendances :**

   ```bash
   cd Saboteur
   yarn install
   ```

3. **Configurer les variables d'environnement :**

   Copier le fichier `.env.example` en `.env` et renseigner les variables nécessaires.

4. **Démarrer la base de données avec Docker :**

   ```bash
   docker-compose up -d
   ```

5. **Lancer le backend (API) :**

   ```bash
   yarn dev:api
   ```

6. **Lancer le frontend :**

   ```bash
   yarn dev:frontend
   ```

### Accès à l'application

- **Frontend** : [http://localhost:8080/](http://localhost:8080/)
- **Swagger API** : [http://localhost:3000/swagger](http://localhost:3000/swagger)

---

## ✅ Plan de tests

- **Couverture de tests** : Objectif de 70%
- **Tests unitaires** : Vérification des cas d'utilisation et de la logique métier
- **Tests d'intégration** : Vérification des interactions entre les différents modules et services
- **Tests de composants** : Tests des composants React pour l'interface utilisateur

---

## 🚀 Axes d'améliorations

- Rendre l’interface utilisateur **responsive** pour une meilleure expérience sur mobile et tablette
- Mettre en place un processus de **déploiement continu (CI/CD)** pour automatiser les déploiements
- Déployer le projet sur une plateforme en ligne pour le rendre accessible au public
- Ajouter des fonctionnalités supplémentaires, telles que :
  - **Reconnexion automatique** en cas de déconnexion accidentelle
  - **Historique des parties** pour permettre aux joueurs de revoir leurs parties précédentes

---

## 👨‍💻 Auteurs

- **Maxime MOURGUES**
- **Mattéo FERREIRA SILVA**
- **Sandra HERAUD**

---

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).
