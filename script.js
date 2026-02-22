const gamewindow = document.getElementById('GameWindow');
const clickmarker = document.getElementById('ClickMark');
const player = document.getElementById('CatGolf');
const powerbar = document.getElementById('PowerBar');
const bgmusic = document.getElementById('bgmusic');
const goal = document.getElementById('GoalHole');
const thoughts = document.getElementById('Thoughts').querySelector('img');
const stageresults = document.getElementById('StageResults');
const levellabels = document.getElementById('LevelLabels');
const scoreLabel = document.getElementById('ScoreLabel');
const timelabel = document.getElementById('TimeLabel');
const leveltimelabel = document.getElementById('LevelTimeLabel');
const golfhitlabel = document.getElementById('GolfHitLabel');
const golfhitr = document.getElementById('GolfHitR');
const resetlabel = document.getElementById('ResetLabel');
const stagenamelabel = document.getElementById('StageNameLabel');
const splashtext = document.getElementById('SplashLabel');
const uncannydeath = document.getElementById('UncannyDeath');
const mainmenu = document.getElementById('MainMenu');
const levelselectmenu = document.getElementById('LevelSelect');
const pausemenu = document.getElementById('PauseMenu');
const levelselectdisplay = document.getElementById('ChoiceDisplay');
const ending = document.getElementById('Ending');
const endingbg = document.getElementById('Endingbg');
const confetti = document.getElementById('WinConfetti')
const delay = ms => new Promise(res => setTimeout(res, ms));
const splash = [
	"honestly quite incredible",
	"golf for life",
	"yo mama",
	"jorkd too hard peenar fell off",
	"why so serious batman?",
    "RiceCakes27 is pretty cool"
];
const rankings = [{
        rank: "RankPeak",
        sfx: "PeakWin"
    },{
        rank: "RankSwag",
        sfx: "Swag"
    },{
        rank: "RankOK",
        sfx: "Okay"
    },{
        rank: "RankBelowAverage",
        sfx: "UhOhWavySynth"
    },{
        rank: "RankAwful",
        sfx: "EpicFail"
    },{
        rank: "RankUncanny",
    },{
        rank: "NoRank",
        sfx: "XylophoneCancel"
}];

let clickpoint, barlength, strokingIt, frameController, levelTimer, totalTimer;
let golfhit = 0, levelMins = 0, levelSecs = 0, world = 0, resets = 0, score = 0, finalbonus = 0;
let level = 1;
let notMoving = true;
let globalTime = false, ableToStroke = false, paused = false, walls = false;
let thoughtsQueue = "";
let peak_value = 12000;

function playSound(sound) {
    let sfx = new Audio(`assets/sounds/sfx${sound}.ogg`);
    sfx.volume = 0.2;
    sfx.play();
}

function addToQueue(animaname) {
    thoughtsQueue = animaname;

    if ((thoughtsQueue === "Money" && thoughts.src.includes("Money")) ||
        (thoughtsQueue === "Skull" && thoughts.src.includes("Skull")) ||
        (thoughtsQueue === "Chuckle" && thoughts.src.includes("Chuckle")) ||
        (thoughtsQueue === "Car" && thoughts.src.includes("Car"))) {
        thoughtsQueue = "";
    } else {
        think("Static");
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function onThoughtsAnimationFinished() {
    if (thoughts.src.includes("Static")) {
        switch (thoughtsQueue) {
            case "Backrooms":
            case "Dog":
            case "Car":
                think(thoughtsQueue + getRandomInt(1, 1));
                thoughtsQueue = "";
                break;
            case "Skull":
            case "Chuckle":
                think(thoughtsQueue + getRandomInt(1, 3));
                thoughtsQueue = "";
                break;
            case "Money":
                think(thoughtsQueue + getRandomInt(1, 2));
                thoughtsQueue = "";
                break;
            case "Move":
            case "Win":
                think(thoughtsQueue + getRandomInt(1, 7));
                thoughtsQueue = "";
                break;
            case "Death":
                think(thoughtsQueue + getRandomInt(1, 11));
                thoughtsQueue = "";
                break;
            default:
                if (globalTime) {
                    think("Idle" + getRandomInt(1, 10));
                } else {
                    think("Static");
                }
        }
    } else if (thoughts.src.includes("Backrooms1")) {
        think("Backrooms1");
    } else {
        think("Static");
    }
}

async function think(thought) {
    //console.log(thought);

    clearInterval(frameController);
    thoughts.src = `assets/graphics/TVThoughts/TV${thought}.png`;
    await delay(83.33);
    let scale = 1.62;
    let frameWidth = 109*scale;
    let frameHeight = 89*scale;
    let frames = Math.round(((thoughts.width*scale)/frameWidth)*((thoughts.height*scale)/frameHeight)-1);
    switch (thought) {
        case 'Chuckle1':
        case 'Move1':
        case 'Win3':
            frames -= 1;
        break;
        case 'Idle3':
            frames -= 21;
        break;
    }
    await spriteAnim(thoughts, frames, frameWidth, frameHeight, scale, true);
    onThoughtsAnimationFinished();
}

function spriteAnim(image, frames, frameWidth, frameHeight, scale = 1, tv = false, speed = 83.33) {
    return new Promise(resolve => {
        let currentFrame = 0;
        image.style.top = 0;
        image.style.left = 0;
        if (frames == 0) {
            setTimeout(() => {
                resolve();
            }, 2000);
        } else {
            function nextFrame() {
                //console.log(currentFrame, frames);

                image.style.left = image.style.left.split('px')[0]-frameWidth+'px';
                if (image.style.left.split('px')[0]-frameWidth < -image.width*scale) {
                    image.style.top = image.style.top.split('px')[0]-frameHeight+'px';
                    image.style.left = 0;
                }
                if (currentFrame == frames) {
                    currentFrame = 0
                    image.style.top = 0;
                    image.style.left = 0;
                    resolve();
                    //if (tv) clearInterval(frameController);
                }
                currentFrame++;
            }
            nextFrame();
            if (tv) {
                clearInterval(frameController);
                frameController = setInterval(nextFrame, speed);
            } else {
                setInterval(nextFrame, speed);
            }
        }
    });
}

const onTouchMove = (e) => {
    e.preventDefault();
    mousemove({x: e.touches[0].clientX, y: e.touches[0].clientY});
};

function mousemove(cursor) {
    barlength = Math.min(Math.hypot(cursor.x - clickpoint.x, cursor.y - clickpoint.y), 300);

    powerbar.style.width = barlength+'px';
    powerbar.style.rotate = Math.atan2(clickpoint.y - cursor.y, clickpoint.x - cursor.x) * 180 / Math.PI+'deg';

    if (barlength < 32) {
        powerbar.style.opacity = 1;
        powerbar.style.backgroundColor = 'darkred';
    } else {
        powerbar.style.opacity = 0.5;
        powerbar.style.backgroundColor = `hsl(${260 - (barlength / 300) * 260}, 100%, 50%)`;
    }
}

gamewindow.addEventListener('pointerdown', (click) => {
    if (notMoving && ableToStroke) {
        clickpoint = click;
        strokingIt = true;

        playSound('WhistleGrab');

        clickmarker.style.left = click.x+'px';
        clickmarker.style.top = click.y+'px';
        clickmarker.style.visibility = 'visible';

        barlength = 0;
        powerbar.style = null;
        powerbar.style.visibility = 'visible';
        
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
    }
});

document.addEventListener('pointerup', (click) => {
    if (strokingIt) {
        clickmarker.style.visibility = 'hidden';

        powerbar.style.visibility = 'hidden';

        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('touchmove', onTouchMove);

        if (barlength > 32) {
            playSound('SillyTwang2');

            notMoving = false;
            applyForce((clickpoint.x-click.x)/45, (clickpoint.y-click.y)/45);
            
            golfhit++;
            golfhitlabel.textContent = `Golf Hit: ${golfhit}`
        } else if (barlength < 32) {
            playSound('XylophoneCancel');
        }
        if (barlength > 150) addToQueue('Move');

        strokingIt = false;
    }
});

function svg2walls(svg) {
    let path = svg.querySelector('path').getAttribute('d').split(' ');
    let dindex = 0, linebegin = 0;
    let current = {x: 0, y: 0};
    let walls = [];
    function handleCommand() {
        let cords;
        switch (path[dindex]) {
            case 'M':
                cords = path[dindex+1].split(',');
                current = {x: +cords[0], y: +cords[1]};
            return true;
            case 'V':
                walls.push({from: [current.x, current.y], to: [current.x, +path[dindex+1]]});
                current.y = +path[dindex+1];
            return true;
            case 'H':
                walls.push({from: [current.x, current.y], to: [+path[dindex+1], current.y]});
                current.x = +path[dindex+1];
            return true;
            case 'v':
                walls.push({from: [current.x, current.y], to: [current.x, current.y+ +path[dindex+1]]});
                current.y = walls[walls.length-1].to[1];
            return true;
            case 'h':
                walls.push({from: [current.x, current.y], to: [current.x+ +path[dindex+1], current.y]});
                current.x = walls[walls.length-1].to[0];
            return true;
            case 'Z':
            case 'z':
                walls.push({from: [current.x, current.y], to: [walls[linebegin].from[0], walls[linebegin].from[1]]});
                current = {x: walls[linebegin].from[0], y: walls[linebegin].from[1]};
                linebegin = walls.length;
                dindex -= 1;
            return true;
            case 'm':
                cords = path[dindex+1].split(',');
                current = {x: current.x+ +cords[0], y: current.y+ +cords[1]};
            return true;
            default:
                return false;
        }
    }

    while (dindex < path.length) {
        if (!handleCommand()) break;
        dindex += 2;
    }

    return walls;
}

function resetErything() {
    paused = false;
    mainmenu.style.visibility = 'visible';
    pausemenu.style = null;
    levellabels.style = null;
    bgmusic.loop = true;
    bgmusicset('TitleTheme');
    ending.style = null;
    endingbg.classList = '';
    world = 0, level = 1;
    timelabel.textContent = 'Total Time: 00:00';
    scoreLabel.textContent = 'Score: 0';
    resetlabel.textContent = 'Resets: 0';
    clearInterval(totalTimer);
}

//startup stuff
setTimeout(() => {
    think('Static');
}, 100);

bgmusic.volume = 0.2;

splashtext.textContent = splash[getRandomInt(0, splash.length-1)];

uncannydeath.addEventListener('click', () => {
    uncannydeath.style = null;

    resets++;
    resetlabel.textContent = 'Resets: '+resets;

    startLevel();
});

stageresults.addEventListener('click', () => {
    if (stageresults.querySelector('#TimeTakenR').style.visibility == 'visible') {
        score += finalbonus;
        scoreLabel.textContent = `Score: ${score}`;

        level++;
        startLevel();

        stageresults.style = null;
        stageresults.classList = '';
        stageresults.querySelectorAll('h1, #RankTextR, #RankHolder').forEach((text) => {
            text.style = null;
        });

        confetti.classList.remove('sprite');
    }
});

document.getElementById('LevelSelectButton').addEventListener('click', () => {
    levelselectdisplay.textContent = `0-1`;
    levelselectmenu.style.visibility = 'visible';
});

function updateLevelDisplay(type, button) {
    const value = button.firstElementChild.textContent;
    if (type === 'world') world = Number(value);
    else level = Number(value);
    levelselectdisplay.textContent = `${world}-${level}`;
}

document.getElementById('WorldButtons').addEventListener('click', (e) => {
    const button = e.target.closest('.Button');
    if (button) updateLevelDisplay('world', button);
});

document.getElementById('LevelButtons').addEventListener('click', (e) => {
    const button = e.target.closest('.Button');
    if (button) updateLevelDisplay('level', button);
});

document.getElementById('Confirm').addEventListener('click', () => {
    //real game world 4 goes to 11 but 6-11 dont exist so leave as 5 for now but keep seperate
    if ((world == 0 && level <= 5) || (world >= 1 && world <= 3) || (world == 4 && level <= 5)) {
        levelselectmenu.style = null;
        startLevelFromMenu();
    } else playSound('XylophoneCancel');
});

document.getElementById('StartButton').addEventListener('click', () => startLevelFromMenu());

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        if (globalTime && ableToStroke || !globalTime && paused) {
            if (!paused) {
                paused = true;
                globalTime = false;
                pausemenu.style.visibility = 'visible';
                //sounds demonic but i ont got a way to pitch shift
                bgmusic.playbackRate = 0.75;
            }
        } else if (ending.style.visibility == 'visible') {
            resetErything();
        }
    }
});

document.getElementById('ResumeButton').addEventListener('click', () => {
    paused = false;
    globalTime = true;
    pausemenu.style = null;
    bgmusic.playbackRate = 1;
    requestAnimationFrame(update);
});
document.getElementById('MenuButton').addEventListener('click', () => {
    resetErything();
    requestAnimationFrame(update);
});

//physics
const speed = { x: 0, y: 0 }; // Initial speed in x and y directions
const friction = 0.995; // Friction factor for slowing down
const stopThreshold = 0.5;
const slowFactor = -0.002;
const intersectedUncannyCats = new Set();
let onGoal = false;

function isIntersecting(rect1, rect2) {
    return !(rect2.left > rect1.right || 
             rect2.right < rect1.left || 
             rect2.top > rect1.bottom || 
             rect2.bottom < rect1.top);
}

function resolveWallCollision(entity, wall, offsetX = 0, offsetY = 0) {
  const [fx, fy] = wall.from;
  const [tx, ty] = wall.to;
  const isHorizontal = fy === ty;

  const wallMinX = Math.min(fx, tx) + offsetX;
  const wallMaxX = Math.max(fx, tx) + offsetX;
  const wallMinY = Math.min(fy, ty) + offsetY;
  const wallMaxY = Math.max(fy, ty) + offsetY;

  // Previous position (before this frame's movement)
  const prevRect = {
    x: entity.left - speed.x,
    y: entity.top - speed.y,
    w: entity.width,
    h: entity.height
  };
  const currRect = { x: entity.left, y: entity.top, w: entity.width, h: entity.height };

  if (isHorizontal) {
    const wallY = fy  + offsetY;

    // Entity must overlap the wall's X span
    const overlapX = currRect.x < wallMaxX && currRect.x + currRect.w > wallMinX;
    if (!overlapX) return;

    // Was entity above the wall last frame? (bottom edge above wallY)
    const wasAbove = prevRect.y + prevRect.h <= wallY;
    // Was entity below the wall last frame? (top edge below wallY)
    const wasBelow = prevRect.y >= wallY;

    // Coming from above
    if (wasAbove && currRect.y + currRect.h > wallY || wasBelow && currRect.y < wallY) return 'y';

  } else {
    const wallX = fx  + offsetX;

    // Entity must overlap the wall's Y span
    const overlapY = currRect.y < wallMaxY && currRect.y + currRect.h > wallMinY;
    if (!overlapY) return;

    const wasLeft  = prevRect.x + prevRect.w <= wallX;
    const wasRight = prevRect.x >= wallX;

    // Coming from left
    if (wasLeft && currRect.x + currRect.w > wallX || wasRight && currRect.x < wallX) return 'x';

  }
}

function applyForce(forceX, forceY) {
    speed.x += forceX;
    speed.y += forceY;
}

function update() {
    const goalRect = goal.querySelector('#Hole').getBoundingClientRect();
    const leftOffset = gamewindow.offsetLeft;

    const playerRect = player.getBoundingClientRect();
    const playerLeft = playerRect.left;
    const playerRight = playerRect.right;
    const playerTop = playerRect.top;
    const playerBottom = playerRect.bottom;
    const playerWidth = playerRect.width;
    const playerHeight = playerRect.height;

    const containerRect = gamewindow.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const containerRight = containerRect.right;
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;

    // Check for wall collisions
    if (walls) {
        walls.forEach(wall => {
            switch (resolveWallCollision(playerRect, wall, 410)) {
                case 'x':
                    speed.x *= -1; // Reverse x direction on collision
                    player.style.left = Math.max(containerLeft-leftOffset, Math.min(playerLeft-leftOffset + speed.x, containerRight - playerWidth)) + 'px'; // Clamp position
                    playSound('WallBump2');
                break;
                case 'y':
                    speed.y *= -1; // Reverse y direction on collision
                    player.style.top = Math.max(containerTop, Math.min(playerTop + speed.y, containerBottom - playerHeight)) + 'px'; // Clamp position
                    playSound('WallBump2');
                break;
            }
        });
    } else {
        if (playerLeft <= containerLeft || playerRight >= containerRight) {
            speed.x *= -1; // Reverse x direction on collision
            player.style.left = Math.max(containerLeft-leftOffset, Math.min(playerLeft-leftOffset + speed.x, containerRight - playerWidth)) + 'px'; // Clamp position
            playSound('WallBump2');
        }
        if (playerTop <= containerTop || playerBottom >= containerBottom) {
            speed.y *= -1; // Reverse y direction on collision
            player.style.top = Math.max(containerTop, Math.min(playerTop + speed.y, containerBottom - playerHeight)) + 'px'; // Clamp position
            playSound('WallBump2');
        }
    }

    // Check if goal
    if (isIntersecting(playerRect, goalRect)) {
        if (!onGoal && ableToStroke) {
            playSound('Goal');

            addToQueue('Win');

            ableToStroke = false;

            confetti.classList.add('sprite');

            let golfhitbonus;
            if (golfhit <= 1) {
                golfhitbonus = 10000;
            } else {
                golfhitbonus = 6000 - 500 * golfhit;
                if (golfhitbonus < 0 || golfhitbonus > 5000) golfhitbonus = 0;
            }

            let timebonus = 6000 - 100 * (levelMins*60 + levelSecs);
            if (timebonus < 0) timebonus = 0;

            finalbonus = golfhitbonus + timebonus;// + collectiblebous;

            if (golfhit > 1) {
                golfhitr.textContent = 'Golf Hit Bonus: '+golfhitbonus;
            } else {
                golfhitr.textContent = `HOLE IN ${golfhit == 0 ? 'NONE' : 'ONE'}! Bonus: ${golfhitbonus}`;
                golfhitr.style.color = 'limegreen';
            }

            document.getElementById('TimeTakenR').textContent = 'Time Bonus: '+timebonus;
            document.getElementById('FinalScoreR').textContent = 'Final Stage Score: '+finalbonus;

            stageresults.style.visibility = 'visible';
            stageresults.classList.add('getDownHere');
            const results = stageresults.querySelectorAll('h1, #RankTextR');
            const prevlevel = level;
            for (let i = 0; i < results.length; i++) {
                setTimeout(() => {
                    if (prevlevel == level) {
                        results[i].style.visibility = 'visible';
                        playSound('ResultsBang');
                    }
                }, 1600 + i*300);
            }
            setTimeout(() => {
                if (prevlevel == level) {
                    document.getElementById('RankHolder').style.visibility = 'visible';
                    if (finalbonus <= 0) {
                        //$StageResults/Rank/AnimationPlayer.play("RankUncanny")
                    } else {
                        const rank_number = Math.min(4, Math.max(0, 8 - Math.floor(8.0 * finalbonus / peak_value)));
                        //$StageResults/Rank/AnimationPlayer.play(rankings[rank_number])
                        playSound(rankings[rank_number].sfx);
                    }
                }
            }, 1600 + results.length*300);

            clearInterval(levelTimer);

            onGoal = true;
        }
    } else {
        onGoal = false; // Reset the flag when no longer intersecting
    }

    // Check if uncanny cat
    document.querySelectorAll('#UncannyCats div').forEach(uncanny => {
        if (isIntersecting(playerRect, uncanny.getBoundingClientRect())) {
            if (!intersectedUncannyCats.has(uncanny)) {
                playSound('UncannyDeath');
                addToQueue('Death');

                ableToStroke = false;

                speed.x = 0;
                speed.y = 0;

                uncannydeath.style.visibility = 'visible';

                intersectedUncannyCats.add(uncanny);
            }
        } else {
            intersectedUncannyCats.delete(uncanny); // Reset the flag when no longer intersecting
        }
    });


    // Movement
    player.style.left = playerLeft-leftOffset + speed.x + window.pageXOffset + 'px';
    player.style.top = playerTop + speed.y + window.pageYOffset + 'px';

    const speedMagnitude = Math.sqrt(speed.x ** 2 + speed.y ** 2);
    
    // Apply dynamic friction: the slower the ball, the more friction applied
    const dynamicFriction = friction + slowFactor * (1 - Math.min(speedMagnitude / 50, 1));

    // Apply friction
    speed.x *= dynamicFriction;
    speed.y *= dynamicFriction;

    // Check if the player is stopped
    if (speedMagnitude < stopThreshold && !notMoving) {
        notMoving = true;
        if (ableToStroke) playSound('PickUpNotif');
        speed.x = 0;
        speed.y = 0;
    }

    if (!paused) requestAnimationFrame(update); // Loop to continuously update
}
// Start physics
update();

function startLevelFromMenu() {
    bgmusic.pause();
    playSound('HardMode');

    const menuButtons = mainmenu.querySelector('.ButtonHolder').style;

    menuButtons.visibility = 'hidden';
    mainmenu.style.backgroundColor = 'rgba(0,0,0,.8)';
    mainmenu.style.backgroundImage = 'url(assets/graphics/uncanny.png)';
    mainmenu.querySelectorAll('#Cats img').forEach(car => {
        car.src = 'assets/graphics/uncanny.png'
    });

    setTimeout(() => {
        mainmenu.style = null;
        mainmenu.style.visibility = 'hidden';
        menuButtons.visibility = null;
        mainmenu.querySelectorAll('#Cats img').forEach(car => {
            car.src = 'assets/graphics/canny.png'
        });

        splashtext.textContent = splash[getRandomInt(0, splash.length-1)];

        globalTime = true;

        let min = 0, sec = 0;
        totalTimer = setInterval(() => {
            if (!paused) {
                sec++;
                if (sec === 60) {
                    min++;
                    sec = 0;
                }
                timelabel.textContent = `Total Time: ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
            }
        }, 1000);

        startLevel();
    }, 2000);
}

function bgmusicset(audio) {
    const src = `assets/music/${audio}.ogg`;
    if (bgmusic.src.split('/')[5] !== src.split('/')[2]) {
        bgmusic.src = src;
        bgmusic.play();
    }
}

function ontoNextWorld() {
    level = 1;

    levellabels.style.visibility = 'hidden';

    bgmusicset(`World${world}VictoryTheme`);
    world++;
    const ontoworldscreen = document.getElementById(`OntoWorld${world}`);
    ontoworldscreen.style.visibility = 'visible';
    let clicks = 0, canClick = false;
    function ontoworldclick() {
        if (clicks == 0) {
            ontoworldscreen.classList.add('scroll');
            bgmusicset(`OntoWorld${world}Theme`);
            clicks++;
            setTimeout(() => canClick = true, 1000);
        } else if (clicks == 1 && canClick) {
            ontoworldscreen.style = null;
            ontoworldscreen.classList = '';
            ontoworldscreen.removeEventListener('click', ontoworldclick);
            startLevel();
        }
    }
    ontoworldscreen.addEventListener('click', ontoworldclick);
    setTimeout(() => {
        if (clicks !== 1) ontoworldclick();
    }, 6500);
}

function startLevel() {
    const levelbackground = document.getElementById('LevelBackground').firstElementChild;

    switch (world) {
        case 0:
            bgmusicset('Stage0Theme');
            switch (level) {
                case 1:
                    peak_value = 12000;
                    player.style = null;
                    goal.style = null;
                    //also reset uncanny
                    stagenamelabel.textContent = '0-1: Welcome to Uncanny Cat Golf!';
                    levelbackground.style = null;
                    walls = false;
                    document.querySelectorAll('#Tiles .active').forEach(e => e.classList.remove('active'));
                break;
                case 2:
                    peak_value = 10000;
                    player.style.top = '383px';
                    player.style.left = '230px';
                    goal.style.top = '234px';
                    goal.style.left = '665px';
                    stagenamelabel.textContent = '0-2: Hello, Walls';
                    levelbackground.style.left = '-820px';

                    const tiles = document.getElementById('w0l2');
                    tiles.classList.add('active');
                    walls = svg2walls(tiles);
                break;
                default:
                    ontoNextWorld();
                    return;
            }
        break;
        case 1:
            bgmusicset('Stage1Theme');
            switch (level) {
                case 1:
                    //stuff
                break;
                default:
                    ontoNextWorld();
                    return;
            }
        break;
        case 2:
            bgmusicset('Stage2Theme');
            switch (level) {
                case 1:
                    //stuff
                break;
                default:
                    ontoNextWorld();
                    return;
            }
        break;
        case 3:
            bgmusicset('Stage3Theme');
            switch (level) {
                case 1:
                    //stuff
                break;
                default:
                    ontoNextWorld();
                    return;
            }
        break;
        case 4:
            bgmusicset('Stage4Theme');
            switch (level) {
                case 1:
                    //stuff
                break;
                default:
                    bgmusicset('CreditsTheme');
                    bgmusic.loop = false;
                    levellabels.style.visibility = 'hidden';
                    clearInterval(totalTimer);
                    globalTime = false;
                    ending.style.visibility = 'visible';
                    endingbg.classList.add('credits');
                    return;
            }
        break;
    }

    playSound('LevelStart2');

    levellabels.style.visibility = 'visible';
    stagenamelabel.classList.add('stageLabel');

    golfhit = 0;
    golfhitlabel.textContent = 'Golf Hit: 0';
    leveltimelabel.textContent = 'Time: 00:00';

    player.classList.add('grow');

    levelMins = 0, levelSecs = 0;
    clearInterval(levelTimer);
    setTimeout(() => {
        playSound('PickUpNotif');

        setTimeout(() => {
            stagenamelabel.classList = '';
        }, 500);

        player.classList.remove('grow');

        ableToStroke = true;

        levelTimer = setInterval(() => {
            if (!paused) {
                levelSecs++;
                if (levelSecs === 60) {
                    levelMins++;
                    levelSecs = 0;
                }
                leveltimelabel.textContent = `Time: ${String(levelMins).padStart(2, '0')}:${String(levelSecs).padStart(2, '0')}`;
            }
        }, 1000);
    }, 1000);
}