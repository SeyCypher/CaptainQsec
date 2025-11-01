// ============================================
// PARTY QUEST - JEU DE PLATEAU FESTIF
// ============================================

class PartyQuestGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.boardSize = 30; // Nombre de cases sur le plateau
        this.boardCells = [];
        this.gameState = 'menu'; // menu, playing, minigame, ended
        this.themes = [
            { name: 'Géographie', color: '#FF6B6B', icon: '🌍' },
            { name: 'Musique', color: '#4ECDC4', icon: '🎵' },
            { name: 'Cinéma', color: '#FFE66D', icon: '🎬' },
            { name: 'Jeux Vidéo', color: '#95E1D3', icon: '🎮' },
            { name: 'Sport', color: '#F38181', icon: '⚽' },
            { name: 'Célébrités', color: '#AA96DA', icon: '⭐' }
        ];
        this.avatars = ['🦁', '🐯', '🐻', '🐼', '🦊', '🐸'];
        this.miniGames = ['speed', 'celebrity', 'memory'];
        this.wheelRotation = 0;
        this.isSpinning = false;
        this.questionsAnswered = 0;

        this.initQuestions();
        this.generateBoard();
    }

    // ============================================
    // NAVIGATION ENTRE SCÈNES
    // ============================================

    showScene(sceneId) {
        document.querySelectorAll('.scene').forEach(scene => {
            scene.classList.remove('active');
        });
        document.getElementById(sceneId).classList.add('active');
    }

    showMainMenu() {
        this.showScene('main-menu');
        this.gameState = 'menu';
    }

    showRules() {
        this.showScene('rules-screen');
    }

    showCredits() {
        this.showScene('credits-screen');
    }

    showPlayerSelection() {
        this.showScene('player-selection');
    }

    // ============================================
    // CONFIGURATION DES JOUEURS
    // ============================================

    setPlayerCount(count) {
        this.players = [];
        for (let i = 0; i < count; i++) {
            this.players.push({
                id: i,
                name: `Joueur ${i + 1}`,
                avatar: this.avatars[i % this.avatars.length],
                position: 0,
                bottles: 0
            });
        }
        this.showPlayerConfig();
    }

    showPlayerConfig() {
        this.showScene('player-config');
        const configList = document.getElementById('players-config-list');
        configList.innerHTML = '';

        this.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-config-item';
            playerDiv.innerHTML = `
                <div class="player-number">${index + 1}</div>
                <input type="text"
                       placeholder="Nom du joueur ${index + 1}"
                       value="${player.name}"
                       onchange="game.updatePlayerName(${index}, this.value)"
                       maxlength="15">
                <div class="avatar-selector">
                    ${this.avatars.map(avatar => `
                        <div class="avatar-option ${player.avatar === avatar ? 'selected' : ''}"
                             onclick="game.updatePlayerAvatar(${index}, '${avatar}')">
                            ${avatar}
                        </div>
                    `).join('')}
                </div>
            `;
            configList.appendChild(playerDiv);
        });
    }

    updatePlayerName(index, name) {
        this.players[index].name = name || `Joueur ${index + 1}`;
    }

    updatePlayerAvatar(index, avatar) {
        this.players[index].avatar = avatar;
        this.showPlayerConfig(); // Refresh pour montrer la sélection
    }

    // ============================================
    // DÉMARRAGE DU JEU
    // ============================================

    startGame() {
        if (this.players.length === 0) {
            alert('Veuillez sélectionner au moins un joueur !');
            return;
        }

        this.currentPlayerIndex = 0;
        this.questionsAnswered = 0;
        this.gameState = 'playing';

        // Réinitialiser les positions
        this.players.forEach(player => {
            player.position = 0;
            player.bottles = 0;
        });

        this.showScene('game-board');
        this.drawBoard();
        this.updatePlayersInfo();
        this.updateTurnInfo();
    }

    // ============================================
    // GÉNÉRATION DU PLATEAU
    // ============================================

    generateBoard() {
        this.boardCells = [];

        // Case de départ
        this.boardCells.push({
            type: 'start',
            theme: null,
            color: '#FFD700'
        });

        // Cases normales avec thèmes aléatoires
        for (let i = 1; i < this.boardSize - 1; i++) {
            const theme = this.themes[Math.floor(Math.random() * this.themes.length)];
            this.boardCells.push({
                type: 'normal',
                theme: theme,
                color: theme.color
            });
        }

        // Case d'arrivée
        this.boardCells.push({
            type: 'end',
            theme: null,
            color: '#00FF00'
        });
    }

    drawBoard() {
        const canvas = document.getElementById('board-canvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Effacer le canvas
        ctx.clearRect(0, 0, width, height);

        // Définir le parcours en spirale
        const cellSize = 60;
        const padding = 20;
        const positions = this.calculateBoardPositions(width, height, cellSize, padding);

        // Dessiner chaque case
        positions.forEach((pos, index) => {
            const cell = this.boardCells[index];

            // Ombre
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;

            // Case
            ctx.fillStyle = cell.color;
            ctx.beginPath();
            ctx.roundRect(pos.x - cellSize/2, pos.y - cellSize/2, cellSize, cellSize, 10);
            ctx.fill();

            // Réinitialiser l'ombre
            ctx.shadowColor = 'transparent';

            // Bordure
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Numéro de case
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(index, pos.x, pos.y - cellSize/2 + 5);

            // Icône du thème
            if (cell.theme) {
                ctx.font = '24px Arial';
                ctx.textBaseline = 'middle';
                ctx.fillText(cell.theme.icon, pos.x, pos.y + 10);
            } else if (cell.type === 'start') {
                ctx.font = '30px Arial';
                ctx.fillText('🚀', pos.x, pos.y + 10);
            } else if (cell.type === 'end') {
                ctx.font = '30px Arial';
                ctx.fillText('🏆', pos.x, pos.y + 10);
            }
        });

        // Stocker les positions pour les pions
        this.cellPositions = positions;
        this.updatePlayerPieces();
    }

    calculateBoardPositions(width, height, cellSize, padding) {
        const positions = [];
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - cellSize - padding;

        for (let i = 0; i < this.boardSize; i++) {
            const angle = (i / this.boardSize) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            positions.push({ x, y });
        }

        return positions;
    }

    updatePlayerPieces() {
        const container = document.getElementById('player-pieces');
        container.innerHTML = '';

        this.players.forEach((player, index) => {
            const piece = document.createElement('div');
            piece.className = 'player-piece';
            piece.innerHTML = player.avatar;
            piece.id = `piece-${player.id}`;

            const pos = this.cellPositions[player.position];
            const offset = this.getPlayerOffset(index, this.players.filter(p => p.position === player.position).length);

            piece.style.left = (pos.x + offset.x) + 'px';
            piece.style.top = (pos.y + offset.y) + 'px';

            container.appendChild(piece);
        });
    }

    getPlayerOffset(playerIndex, playersOnCell) {
        // Décalage pour éviter que les pions se superposent
        const offsets = [
            { x: 0, y: 0 },
            { x: -15, y: -15 },
            { x: 15, y: -15 },
            { x: -15, y: 15 },
            { x: 15, y: 15 },
            { x: 0, y: -20 }
        ];
        return offsets[playerIndex % offsets.length];
    }

    // ============================================
    // INTERFACE DE JEU
    // ============================================

    updatePlayersInfo() {
        const container = document.getElementById('players-info');
        container.innerHTML = '';

        this.players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'player-info-card';
            if (index === this.currentPlayerIndex) {
                card.classList.add('active');
            }

            card.innerHTML = `
                <div class="player-avatar">${player.avatar}</div>
                <div class="player-stats">
                    <div class="name">${player.name}</div>
                    <div class="position">Case ${player.position}/${this.boardSize - 1}</div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    updateTurnInfo() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        document.getElementById('current-player-name').textContent = currentPlayer.name;
    }

    // ============================================
    // SYSTÈME DE DÉ
    // ============================================

    rollDice() {
        const btn = document.getElementById('roll-dice-btn');
        btn.disabled = true;

        // Animation du dé
        const resultDiv = document.getElementById('dice-result');
        let count = 0;
        const interval = setInterval(() => {
            resultDiv.textContent = '🎲 ' + (Math.floor(Math.random() * 6) + 1);
            count++;
            if (count > 10) {
                clearInterval(interval);
                const result = Math.floor(Math.random() * 6) + 1;
                resultDiv.textContent = '🎲 ' + result;

                setTimeout(() => {
                    this.movePlayer(result);
                }, 500);
            }
        }, 100);
    }

    movePlayer(spaces) {
        const player = this.players[this.currentPlayerIndex];
        const newPosition = Math.min(player.position + spaces, this.boardSize - 1);

        // Animation du déplacement
        let currentStep = 0;
        const moveInterval = setInterval(() => {
            if (player.position < newPosition) {
                player.position++;
                this.updatePlayerPieces();
                this.updatePlayersInfo();
                currentStep++;
            } else {
                clearInterval(moveInterval);

                // Vérifier si le joueur a atteint la fin
                if (player.position === this.boardSize - 1) {
                    this.endGame(player);
                } else {
                    // Poser une question
                    setTimeout(() => this.askQuestion(), 500);
                }
            }
        }, 300);
    }

    // ============================================
    // QUESTIONS
    // ============================================

    initQuestions() {
        this.questions = {
            'Géographie': [
                { q: 'Quelle est la capitale de la France ?', answers: ['Paris', 'Lyon', 'Marseille', 'Bordeaux'], correct: 0 },
                { q: 'Quel est le plus grand océan du monde ?', answers: ['Atlantique', 'Indien', 'Pacifique', 'Arctique'], correct: 2 },
                { q: 'Dans quel pays se trouve la tour de Pise ?', answers: ['France', 'Italie', 'Espagne', 'Grèce'], correct: 1 },
                { q: 'Quel est le plus long fleuve du monde ?', answers: ['Nil', 'Amazone', 'Mississippi', 'Yangtsé'], correct: 1 },
                { q: 'Quelle est la capitale du Japon ?', answers: ['Osaka', 'Kyoto', 'Tokyo', 'Hiroshima'], correct: 2 },
                { q: 'Combien de continents y a-t-il ?', answers: ['5', '6', '7', '8'], correct: 2 },
                { q: 'Quel pays a la plus grande superficie ?', answers: ['Canada', 'Chine', 'États-Unis', 'Russie'], correct: 3 },
                { q: 'Quelle est la capitale de l\'Australie ?', answers: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2 }
            ],
            'Musique': [
                { q: 'Qui a chanté "Thriller" ?', answers: ['Prince', 'Michael Jackson', 'Elvis Presley', 'Whitney Houston'], correct: 1 },
                { q: 'Quel groupe a chanté "Bohemian Rhapsody" ?', answers: ['The Beatles', 'Led Zeppelin', 'Queen', 'Pink Floyd'], correct: 2 },
                { q: 'Quel instrument a 88 touches ?', answers: ['Orgue', 'Piano', 'Accordéon', 'Synthétiseur'], correct: 1 },
                { q: 'Qui est le King of Rock and Roll ?', answers: ['Chuck Berry', 'Elvis Presley', 'Jerry Lee Lewis', 'Little Richard'], correct: 1 },
                { q: 'Combien y a-t-il de notes de musique ?', answers: ['5', '7', '8', '12'], correct: 1 },
                { q: 'Quel rappeur s\'appelle Marshall Mathers ?', answers: ['Dr Dre', 'Eminem', 'Snoop Dogg', '50 Cent'], correct: 1 },
                { q: 'Quelle chanteuse a chanté "Rolling in the Deep" ?', answers: ['Adele', 'Amy Winehouse', 'Beyoncé', 'Lady Gaga'], correct: 0 },
                { q: 'Quel groupe a chanté "Stairway to Heaven" ?', answers: ['The Rolling Stones', 'Led Zeppelin', 'The Who', 'Deep Purple'], correct: 1 }
            ],
            'Cinéma': [
                { q: 'Qui a réalisé "Titanic" ?', answers: ['Steven Spielberg', 'James Cameron', 'Martin Scorsese', 'Ridley Scott'], correct: 1 },
                { q: 'Dans quel film trouve-t-on la phrase "May the Force be with you" ?', answers: ['Star Trek', 'Star Wars', 'Stargate', 'Interstellar'], correct: 1 },
                { q: 'Quel acteur joue Iron Man ?', answers: ['Chris Evans', 'Chris Hemsworth', 'Robert Downey Jr', 'Mark Ruffalo'], correct: 2 },
                { q: 'Quel film a remporté l\'Oscar du meilleur film en 2020 ?', answers: ['Joker', '1917', 'Parasite', 'Once Upon a Time in Hollywood'], correct: 2 },
                { q: 'Qui joue Jack dans "Titanic" ?', answers: ['Brad Pitt', 'Tom Cruise', 'Leonardo DiCaprio', 'Johnny Depp'], correct: 2 },
                { q: 'Quel film de Disney met en scène deux sœurs dont une a des pouvoirs de glace ?', answers: ['Raiponce', 'La Reine des Neiges', 'Moana', 'Vaiana'], correct: 1 },
                { q: 'Dans quel film dit-on "I\'ll be back" ?', answers: ['Die Hard', 'Rambo', 'Terminator', 'Predator'], correct: 2 },
                { q: 'Qui a réalisé "Le Seigneur des Anneaux" ?', answers: ['Peter Jackson', 'Guillermo del Toro', 'Christopher Nolan', 'James Cameron'], correct: 0 }
            ],
            'Jeux Vidéo': [
                { q: 'Quel plombier italien est le héros de Nintendo ?', answers: ['Luigi', 'Wario', 'Mario', 'Yoshi'], correct: 2 },
                { q: 'Dans quel jeu capture-t-on des créatures avec des Pokéballs ?', answers: ['Digimon', 'Yu-Gi-Oh', 'Pokémon', 'Monster Hunter'], correct: 2 },
                { q: 'Quel jeu met en scène un hérisson bleu ultra-rapide ?', answers: ['Crash Bandicoot', 'Sonic', 'Spyro', 'Rayman'], correct: 1 },
                { q: 'Quel est le jeu de construction en blocs le plus vendu ?', answers: ['Lego Worlds', 'Minecraft', 'Terraria', 'Roblox'], correct: 1 },
                { q: 'Dans quel jeu incarne-t-on Link ?', answers: ['Final Fantasy', 'The Legend of Zelda', 'Skyrim', 'Dragon Quest'], correct: 1 },
                { q: 'Quel Battle Royale a popularisé les danses d\'émotes ?', answers: ['PUBG', 'Apex Legends', 'Fortnite', 'Call of Duty Warzone'], correct: 2 },
                { q: 'Quelle entreprise a créé la PlayStation ?', answers: ['Nintendo', 'Microsoft', 'Sony', 'Sega'], correct: 2 },
                { q: 'Dans quel jeu joue-t-on un assassin à capuche ?', answers: ['Hitman', 'Assassin\'s Creed', 'Dishonored', 'Thief'], correct: 1 }
            ],
            'Sport': [
                { q: 'Combien de joueurs y a-t-il dans une équipe de football ?', answers: ['9', '10', '11', '12'], correct: 2 },
                { q: 'Quel sport pratique Rafael Nadal ?', answers: ['Football', 'Tennis', 'Golf', 'Basket'], correct: 1 },
                { q: 'Où ont eu lieu les JO d\'été 2024 ?', answers: ['Tokyo', 'Paris', 'Los Angeles', 'Londres'], correct: 1 },
                { q: 'Combien de sets faut-il gagner pour remporter un match de tennis masculin à Roland-Garros ?', answers: ['2', '3', '4', '5'], correct: 1 },
                { q: 'Quel pays a remporté le plus de Coupes du Monde de football ?', answers: ['Allemagne', 'Argentine', 'Brésil', 'Italie'], correct: 2 },
                { q: 'Dans quel sport utilise-t-on un club et une petite balle blanche ?', answers: ['Cricket', 'Hockey', 'Golf', 'Baseball'], correct: 2 },
                { q: 'Qui est considéré comme le meilleur basketteur de tous les temps ?', answers: ['LeBron James', 'Kobe Bryant', 'Michael Jordan', 'Magic Johnson'], correct: 2 },
                { q: 'Combien de points vaut un essai au rugby ?', answers: ['3', '5', '6', '7'], correct: 1 }
            ],
            'Célébrités': [
                { q: 'Qui a joué Harry Potter au cinéma ?', answers: ['Tom Felton', 'Daniel Radcliffe', 'Rupert Grint', 'Matthew Lewis'], correct: 1 },
                { q: 'Quelle chanteuse est mariée à Jay-Z ?', answers: ['Rihanna', 'Beyoncé', 'Alicia Keys', 'Jennifer Lopez'], correct: 1 },
                { q: 'Quel acteur a joué le Joker dans "The Dark Knight" ?', answers: ['Jared Leto', 'Joaquin Phoenix', 'Heath Ledger', 'Jack Nicholson'], correct: 2 },
                { q: 'Qui est le créateur de Facebook ?', answers: ['Elon Musk', 'Bill Gates', 'Steve Jobs', 'Mark Zuckerberg'], correct: 3 },
                { q: 'Quelle actrice joue Wonder Woman ?', answers: ['Gal Gadot', 'Scarlett Johansson', 'Margot Robbie', 'Brie Larson'], correct: 0 },
                { q: 'Qui chante "Shape of You" ?', answers: ['Justin Bieber', 'Ed Sheeran', 'Shawn Mendes', 'Bruno Mars'], correct: 1 },
                { q: 'Quel rappeur s\'appelle Aubrey Graham ?', answers: ['Drake', 'Kanye West', 'Travis Scott', 'Post Malone'], correct: 0 },
                { q: 'Quelle actrice a joué Hermione dans Harry Potter ?', answers: ['Emma Roberts', 'Emma Stone', 'Emma Watson', 'Emily Blunt'], correct: 2 }
            ]
        };
    }

    askQuestion() {
        const player = this.players[this.currentPlayerIndex];
        const cell = this.boardCells[player.position];

        if (!cell.theme) return this.nextPlayer();

        const themeName = cell.theme.name;
        const themeQuestions = this.questions[themeName];
        const question = themeQuestions[Math.floor(Math.random() * themeQuestions.length)];

        // Afficher la modal de question
        const modal = document.getElementById('question-modal');
        const themeDiv = document.getElementById('question-theme');
        const questionDiv = document.getElementById('question-text');
        const answersDiv = document.getElementById('question-answers');

        themeDiv.textContent = cell.theme.icon + ' ' + themeName;
        themeDiv.style.background = cell.theme.color;
        questionDiv.textContent = question.q;

        answersDiv.innerHTML = '';
        question.answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = answer;
            btn.onclick = () => this.checkAnswer(index, question.correct, player);
            answersDiv.appendChild(btn);
        });

        modal.classList.add('active');
    }

    checkAnswer(selected, correct, player) {
        const answersDiv = document.getElementById('question-answers');
        const buttons = answersDiv.querySelectorAll('.answer-btn');

        // Désactiver tous les boutons
        buttons.forEach(btn => btn.disabled = true);

        // Marquer la réponse
        buttons[selected].classList.add(selected === correct ? 'correct' : 'incorrect');
        if (selected !== correct) {
            buttons[correct].classList.add('correct');
        }

        setTimeout(() => {
            document.getElementById('question-modal').classList.remove('active');
            this.showResult(selected === correct, player);
        }, 1500);
    }

    showResult(isCorrect, player) {
        const modal = document.getElementById('result-modal');
        const content = document.getElementById('result-content');

        if (isCorrect) {
            content.innerHTML = `
                <div class="result-success">✅</div>
                <h3>Bonne réponse !</h3>
                <p>${player.name} reste sur sa case.</p>
            `;
        } else {
            // Reculer d'une case
            if (player.position > 0) {
                player.position--;
            }
            player.bottles++;

            content.innerHTML = `
                <div class="result-failure">❌</div>
                <h3>Mauvaise réponse !</h3>
                <p>${player.name} recule d'une case.</p>
                <p style="font-size: 2em; margin-top: 20px;">🍺 Bois une gorgée !</p>
            `;

            this.updatePlayerPieces();
            this.updatePlayersInfo();
        }

        modal.classList.add('active');
    }

    continueAfterQuestion() {
        document.getElementById('result-modal').classList.remove('active');

        this.questionsAnswered++;

        // Si tous les joueurs ont joué, lancer un mini-jeu
        if (this.questionsAnswered >= this.players.length) {
            this.questionsAnswered = 0;
            setTimeout(() => this.showWheelModal(), 500);
        } else {
            this.nextPlayer();
        }
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.updatePlayersInfo();
        this.updateTurnInfo();

        // Réactiver le bouton de dé
        const btn = document.getElementById('roll-dice-btn');
        btn.disabled = false;
        document.getElementById('dice-result').textContent = '';
    }

    // ============================================
    // ROUE DES MINI-JEUX
    // ============================================

    showWheelModal() {
        const modal = document.getElementById('wheel-modal');
        modal.classList.add('active');

        this.drawWheel();

        document.getElementById('spin-wheel-btn').disabled = false;
    }

    drawWheel() {
        const canvas = document.getElementById('wheel-canvas');
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 180;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const games = [
            { name: 'Rapidité', color: '#FF6B6B', icon: '⚡' },
            { name: 'Célébrité', color: '#4ECDC4', icon: '⭐' },
            { name: 'Mémoire', color: '#FFE66D', icon: '🧠' }
        ];

        const anglePerSection = (Math.PI * 2) / games.length;

        games.forEach((game, index) => {
            const startAngle = anglePerSection * index + this.wheelRotation;
            const endAngle = startAngle + anglePerSection;

            // Section
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = game.color;
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Texte
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + anglePerSection / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(game.icon, radius * 0.7, 0);
            ctx.font = 'bold 14px Arial';
            ctx.fillText(game.name, radius * 0.7, 20);
            ctx.restore();
        });

        // Centre de la roue
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Indicateur
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius - 20);
        ctx.lineTo(centerX - 15, centerY - radius - 40);
        ctx.lineTo(centerX + 15, centerY - radius - 40);
        ctx.closePath();
        ctx.fillStyle = '#FF0000';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    spinWheel() {
        if (this.isSpinning) return;

        this.isSpinning = true;
        document.getElementById('spin-wheel-btn').disabled = true;

        const spins = 5 + Math.random() * 3;
        const finalRotation = spins * Math.PI * 2 + Math.random() * Math.PI * 2;
        const duration = 3000;
        const startTime = Date.now();
        const startRotation = this.wheelRotation;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing
            const easeOut = 1 - Math.pow(1 - progress, 3);

            this.wheelRotation = startRotation + finalRotation * easeOut;
            this.drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                setTimeout(() => this.launchMiniGame(), 500);
            }
        };

        animate();
    }

    launchMiniGame() {
        // Déterminer quel mini-jeu a été sélectionné
        const normalizedRotation = this.wheelRotation % (Math.PI * 2);
        const section = Math.floor(normalizedRotation / (Math.PI * 2 / 3));

        const miniGameTypes = ['speed', 'celebrity', 'memory'];
        const selectedGame = miniGameTypes[2 - section]; // Inversé car rotation dans le sens horaire

        document.getElementById('wheel-modal').classList.remove('active');

        setTimeout(() => {
            if (selectedGame === 'speed') {
                this.startSpeedGame();
            } else if (selectedGame === 'celebrity') {
                this.startCelebrityGame();
            } else {
                this.startMemoryGame();
            }
        }, 500);
    }

    // ============================================
    // MINI-JEU : RAPIDITÉ
    // ============================================

    startSpeedGame() {
        this.showScene('minigame-speed');

        const btn = document.getElementById('speed-button');
        const resultsDiv = document.getElementById('speed-results');
        resultsDiv.innerHTML = '<p>Préparez-vous...</p>';

        btn.disabled = true;
        btn.className = 'speed-btn';
        btn.textContent = 'Préparez-vous...';

        this.speedGameResults = [];

        // Temps aléatoire avant de passer au vert
        const delay = 2000 + Math.random() * 3000;

        setTimeout(() => {
            btn.disabled = false;
            btn.className = 'speed-btn ready';
            btn.textContent = 'Attention...';

            const goDelay = 1000 + Math.random() * 2000;

            setTimeout(() => {
                btn.className = 'speed-btn go';
                btn.textContent = 'MAINTENANT !';
                this.speedGameStartTime = Date.now();

                btn.onclick = () => {
                    const reactionTime = Date.now() - this.speedGameStartTime;
                    btn.disabled = true;
                    btn.onclick = null;

                    resultsDiv.innerHTML = `
                        <h3>Temps de réaction : ${reactionTime}ms</h3>
                        <p>Passez le contrôle aux autres joueurs !</p>
                        <button class="continue-btn" onclick="game.continueSpeedGame(${reactionTime})">
                            Joueur suivant
                        </button>
                    `;
                };
            }, goDelay);
        }, delay);
    }

    continueSpeedGame(time) {
        this.speedGameResults.push({
            player: this.players[this.speedGameResults.length],
            time: time
        });

        if (this.speedGameResults.length < this.players.length) {
            // Joueur suivant
            this.startSpeedGame();
        } else {
            // Tous les joueurs ont joué, déterminer le gagnant
            this.endSpeedGame();
        }
    }

    endSpeedGame() {
        const resultsDiv = document.getElementById('speed-results');

        // Trier par temps de réaction
        this.speedGameResults.sort((a, b) => a.time - b.time);

        const winner = this.speedGameResults[0].player;
        winner.position = Math.min(winner.position + 1, this.boardSize - 1);

        let html = '<h3>🏆 Résultats 🏆</h3>';
        this.speedGameResults.forEach((result, index) => {
            html += `
                <p>
                    ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊'}
                    ${result.player.name}: ${result.time}ms
                </p>
            `;
        });
        html += `<p style="margin-top: 20px; font-weight: bold; color: #667eea;">
            ${winner.name} avance d'une case bonus !
        </p>`;
        html += '<button class="continue-btn" onclick="game.endMiniGame()">Continuer</button>';

        resultsDiv.innerHTML = html;
    }

    // ============================================
    // MINI-JEU : RECONNAISSANCE DE CÉLÉBRITÉ
    // ============================================

    startCelebrityGame() {
        this.showScene('minigame-celebrity');

        const celebrities = [
            { name: 'Barack Obama', emoji: '👨🏾‍💼', desc: 'Ex-président américain' },
            { name: 'Taylor Swift', emoji: '👩🏼‍🎤', desc: 'Chanteuse pop' },
            { name: 'Cristiano Ronaldo', emoji: '⚽', desc: 'Footballeur' },
            { name: 'Elon Musk', emoji: '🚀', desc: 'Entrepreneur tech' },
            { name: 'Beyoncé', emoji: '👑', desc: 'Queen B' },
            { name: 'Leonardo DiCaprio', emoji: '🎬', desc: 'Acteur' }
        ];

        const celebrity = celebrities[Math.floor(Math.random() * celebrities.length)];

        // Créer des réponses fausses
        const wrongAnswers = celebrities.filter(c => c !== celebrity)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(c => c.name);

        const allAnswers = [...wrongAnswers, celebrity.name].sort(() => Math.random() - 0.5);

        document.getElementById('celebrity-image').innerHTML = `
            <div style="font-size: 8em;">${celebrity.emoji}</div>
            <p style="font-size: 1.2em; color: #666; margin-top: 20px;">${celebrity.desc}</p>
        `;

        const answersDiv = document.getElementById('celebrity-answers');
        answersDiv.innerHTML = '';

        this.celebrityAnswered = false;

        allAnswers.forEach(answer => {
            const btn = document.createElement('button');
            btn.className = 'celebrity-btn';
            btn.textContent = answer;
            btn.onclick = () => this.checkCelebrityAnswer(answer === celebrity.name);
            answersDiv.appendChild(btn);
        });

        document.getElementById('celebrity-results').innerHTML = '';
    }

    checkCelebrityAnswer(isCorrect) {
        if (this.celebrityAnswered) return;
        this.celebrityAnswered = true;

        const buttons = document.querySelectorAll('.celebrity-btn');
        buttons.forEach(btn => btn.disabled = true);

        const resultsDiv = document.getElementById('celebrity-results');

        if (isCorrect) {
            const currentPlayer = this.players[this.currentPlayerIndex];
            currentPlayer.position = Math.min(currentPlayer.position + 1, this.boardSize - 1);

            resultsDiv.innerHTML = `
                <h3 style="color: #28a745;">✅ Bonne réponse !</h3>
                <p>${currentPlayer.name} avance d'une case bonus !</p>
                <button class="continue-btn" onclick="game.endMiniGame()">Continuer</button>
            `;
        } else {
            resultsDiv.innerHTML = `
                <h3 style="color: #dc3545;">❌ Mauvaise réponse !</h3>
                <p>Aucun bonus cette fois.</p>
                <button class="continue-btn" onclick="game.endMiniGame()">Continuer</button>
            `;
        }
    }

    // ============================================
    // MINI-JEU : MÉMOIRE
    // ============================================

    startMemoryGame() {
        this.showScene('minigame-memory');

        const grid = document.getElementById('memory-sequence');
        grid.innerHTML = '';

        // Créer une grille 4x4
        this.memoryCells = [];
        for (let i = 0; i < 12; i++) {
            const cell = document.createElement('div');
            cell.className = 'memory-cell';
            cell.dataset.index = i;
            grid.appendChild(cell);
            this.memoryCells.push(cell);
        }

        // Générer une séquence aléatoire
        const sequenceLength = 3 + Math.floor(Math.random() * 3);
        this.memorySequence = [];
        for (let i = 0; i < sequenceLength; i++) {
            let index;
            do {
                index = Math.floor(Math.random() * 12);
            } while (this.memorySequence.includes(index));
            this.memorySequence.push(index);
        }

        document.getElementById('memory-results').innerHTML = '<p>Mémorisez la séquence...</p>';

        // Afficher la séquence
        this.showMemorySequence();
    }

    showMemorySequence() {
        let index = 0;
        const interval = setInterval(() => {
            if (index > 0) {
                this.memoryCells[this.memorySequence[index - 1]].classList.remove('active');
            }

            if (index < this.memorySequence.length) {
                this.memoryCells[this.memorySequence[index]].classList.add('active');
                index++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    this.memoryCells.forEach(cell => cell.classList.remove('active'));
                    this.startMemoryInput();
                }, 500);
            }
        }, 800);
    }

    startMemoryInput() {
        document.getElementById('memory-results').innerHTML = '<p>Reproduisez la séquence !</p>';

        this.memoryPlayerSequence = [];

        this.memoryCells.forEach((cell, index) => {
            cell.onclick = () => this.memoryInputClick(index);
        });
    }

    memoryInputClick(index) {
        this.memoryPlayerSequence.push(index);

        const cell = this.memoryCells[index];
        cell.classList.add('active');

        setTimeout(() => {
            cell.classList.remove('active');
        }, 300);

        // Vérifier si la séquence est correcte jusqu'ici
        const currentIndex = this.memoryPlayerSequence.length - 1;
        if (this.memoryPlayerSequence[currentIndex] !== this.memorySequence[currentIndex]) {
            // Mauvaise réponse
            this.endMemoryGame(false);
            return;
        }

        // Vérifier si la séquence est complète
        if (this.memoryPlayerSequence.length === this.memorySequence.length) {
            this.endMemoryGame(true);
        }
    }

    endMemoryGame(success) {
        this.memoryCells.forEach(cell => {
            cell.onclick = null;
        });

        const resultsDiv = document.getElementById('memory-results');

        if (success) {
            const currentPlayer = this.players[this.currentPlayerIndex];
            currentPlayer.position = Math.min(currentPlayer.position + 1, this.boardSize - 1);

            resultsDiv.innerHTML = `
                <h3 style="color: #28a745;">✅ Parfait !</h3>
                <p>${currentPlayer.name} avance d'une case bonus !</p>
                <button class="continue-btn" onclick="game.endMiniGame()">Continuer</button>
            `;
        } else {
            resultsDiv.innerHTML = `
                <h3 style="color: #dc3545;">❌ Raté !</h3>
                <p>La séquence était incorrecte.</p>
                <button class="continue-btn" onclick="game.endMiniGame()">Continuer</button>
            `;
        }
    }

    // ============================================
    // FIN DE MINI-JEU
    // ============================================

    endMiniGame() {
        // Retour au plateau
        this.showScene('game-board');
        this.updatePlayerPieces();
        this.updatePlayersInfo();

        // Vérifier si un joueur a gagné
        const winner = this.players.find(p => p.position >= this.boardSize - 1);
        if (winner) {
            setTimeout(() => this.endGame(winner), 500);
            return;
        }

        // Passer au joueur suivant
        this.nextPlayer();
    }

    // ============================================
    // FIN DE PARTIE
    // ============================================

    endGame(winner) {
        this.gameState = 'ended';
        this.showScene('victory-screen');

        document.getElementById('winner-info').innerHTML = `
            <div style="font-size: 5em; margin: 30px 0;">${winner.avatar}</div>
            <h2>${winner.name} remporte la partie !</h2>
            <p style="font-size: 1.3em; margin-top: 20px;">
                Position finale : Case ${winner.position}<br>
                Gorgées bues : ${winner.bottles} 🍺
            </p>
        `;
    }

    playAgain() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.questionsAnswered = 0;
        this.generateBoard();
        this.showPlayerSelection();
    }
}

// ============================================
// INITIALISATION DU JEU
// ============================================

const game = new PartyQuestGame();

// Ajouter un écouteur pour la touche Entrée dans les inputs de nom
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && game.gameState === 'menu') {
            const activeScene = document.querySelector('.scene.active');
            if (activeScene && activeScene.id === 'player-config') {
                game.startGame();
            }
        }
    });
});
