# 🎉 Party Quest - Jeu de Plateau Festif

Un jeu d'alcool numérique inspiré de Mario Party, entièrement développé en HTML5 et fonctionnant 100% en local.

## 🎮 Caractéristiques

- **100% Local** : Aucune connexion internet requise
- **1 à 6 Joueurs** : Jouable seul ou entre amis
- **Contrôle à la Souris** : Interface intuitive et facile à utiliser
- **Design Moderne** : Interface colorée et festive avec animations fluides
- **Responsive** : S'adapte à différentes tailles d'écran

## 🎯 Comment Jouer

### Installation

1. Téléchargez ou clonez ce dépôt
2. Ouvrez le fichier `index.html` dans votre navigateur web
3. C'est tout ! Aucune installation supplémentaire requise

### Règles du Jeu

#### Objectif
Soyez le premier à atteindre la case d'arrivée en répondant correctement aux questions de culture générale et en remportant les mini-jeux !

#### Déroulement d'un Tour

1. **Lancer le Dé** : Cliquez sur le bouton pour lancer le dé virtuel (1-6)
2. **Avancer sur le Plateau** : Votre pion avance automatiquement
3. **Répondre à la Question** : Une question apparaît selon le thème de votre case
   - ✅ **Bonne réponse** : Vous restez sur votre case
   - ❌ **Mauvaise réponse** : Vous reculez d'une case ET vous buvez une gorgée 🍺
4. **Tour Suivant** : Le joueur suivant joue
5. **Mini-Jeu** : Après que tous les joueurs aient répondu, une roue aléatoire sélectionne un mini-jeu
6. **Bonus** : Le gagnant du mini-jeu avance d'une case supplémentaire !

## 🎨 Thèmes de Questions

Le plateau comporte 6 thèmes de culture générale, chacun avec sa couleur :

- 🌍 **Géographie** (Rouge) - Pays, capitales, océans...
- 🎵 **Musique** (Turquoise) - Artistes, chansons, instruments...
- 🎬 **Cinéma** (Jaune) - Films, acteurs, réalisateurs...
- 🎮 **Jeux Vidéo** (Vert) - Personnages, consoles, jeux célèbres...
- ⚽ **Sport** (Rose) - Athlètes, règles, compétitions...
- ⭐ **Célébrités** (Violet) - Stars, personnalités connues...

## 🎪 Mini-Jeux

### ⚡ Test de Rapidité
Cliquez sur le bouton dès qu'il devient vert ! Le joueur avec le meilleur temps de réaction gagne.

### ⭐ Reconnaissance de Célébrité
Identifiez la célébrité le plus rapidement possible parmi 4 choix.

### 🧠 Test de Mémoire
Mémorisez une séquence de cases qui s'illuminent, puis reproduisez-la correctement.

## 🎭 Personnalisation

Lors de la configuration des joueurs, vous pouvez :
- Choisir votre **pseudo** (jusqu'à 15 caractères)
- Sélectionner votre **avatar** parmi 6 emojis animaux :
  - 🦁 Lion
  - 🐯 Tigre
  - 🐻 Ours
  - 🐼 Panda
  - 🦊 Renard
  - 🐸 Grenouille

## 🏆 Victoire

Le premier joueur à atteindre la **case d'arrivée** remporte la partie ! Un écran de victoire affiche :
- L'avatar du gagnant
- Son nom
- Sa position finale
- Le nombre de gorgées bues pendant la partie

## ⚠️ Avertissement

Ce jeu contient des mécaniques liées à la consommation d'alcool.

**À consommer avec modération.**

- Ne forcez personne à boire
- Respectez les limites de chacun
- Ne conduisez pas après avoir bu
- Jeu réservé aux personnes majeures selon la législation de votre pays

## 🛠️ Technologies Utilisées

- **HTML5** : Structure et Canvas pour le plateau
- **CSS3** : Design moderne avec animations et gradients
- **JavaScript ES6** : Logique du jeu, orienté objet

## 📝 Contenu

Le jeu contient actuellement :
- **48 questions** (8 par thème)
- **30 cases** sur le plateau
- **3 mini-jeux** différents
- Support pour **1 à 6 joueurs**

## 🔧 Structure des Fichiers

```
/
├── index.html    # Structure HTML du jeu
├── styles.css    # Tous les styles et animations
├── game.js       # Logique complète du jeu
└── README.md     # Ce fichier
```

## 🎨 Personnalisation Avancée

Vous pouvez facilement modifier le jeu :

### Ajouter des Questions
Dans `game.js`, trouvez la méthode `initQuestions()` et ajoutez vos questions :

```javascript
'Thème': [
    {
        q: 'Votre question ?',
        answers: ['Réponse 1', 'Réponse 2', 'Réponse 3', 'Réponse 4'],
        correct: 0  // Index de la bonne réponse (0-3)
    }
]
```

### Modifier les Couleurs
Dans `styles.css`, modifiez les gradients et couleurs selon vos préférences.

### Changer le Nombre de Cases
Dans `game.js`, modifiez la valeur de `this.boardSize` dans le constructeur.

## 🐛 Bugs Connus

Aucun bug majeur connu. Si vous en trouvez un, n'hésitez pas à le signaler !

## 📄 Licence

Ce projet est à usage personnel. Libre à vous de le modifier et de l'adapter à vos soirées !

## 🎉 Amusez-vous bien !

Profitez du jeu entre amis et passez une excellente soirée !

**N'oubliez pas : l'important c'est de s'amuser, pas de boire !** 🎊
