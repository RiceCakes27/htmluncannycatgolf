const gamewindow = document.getElementById('GameWindow');
const clickmarker = document.getElementById('ClickMark');
const player = document.getElementById('CatGolf');
const powerbar = document.getElementById('PowerBar');
const bgmusic = document.getElementById('bgmusic');
const goal = document.getElementById('GoalHole');
const thoughts = document.getElementById('Thoughts').querySelector('img');
const delay = ms => new Promise(res => setTimeout(res, ms));

let clickpoint, barlength, strokingIt;
let strokes = 0;
let ableToStroke = true;
let thoughtsQueue = "";
let globalTime = false;
let randopick = 0;

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

function onThoughtsAnimationFinished() {
    if (thoughts.src.includes("Static")) {
        switch (thoughtsQueue) {
            case "Backrooms":
            case "Dog":
            case "Car":
                randopick = getRandomInt(1, 1);
                think(thoughtsQueue + randopick);
                thoughtsQueue = "";
                break;
            case "Skull":
            case "Chuckle":
                randopick = getRandomInt(1, 3);
                think(thoughtsQueue + randopick);
                thoughtsQueue = "";
                break;
            case "Money":
                randopick = getRandomInt(1, 2);
                think(thoughtsQueue + randopick);
                thoughtsQueue = "";
                break;
            case "Move":
            case "Win":
                randopick = getRandomInt(1, 7);
                think(thoughtsQueue + randopick);
                thoughtsQueue = "";
                break;
            case "Death":
                randopick = getRandomInt(1, 11);
                think(thoughtsQueue + randopick);
                thoughtsQueue = "";
                break;
            default:
                if (globalTime) {
                    randopick = getRandomInt(1, 10);
                    think("Idle" + randopick);
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

let frameController;

function spriteAnim(image, frames, frameWidth, frameHeight, scale = 1, tv = false) {
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
                frameController = setInterval(nextFrame, 83.33);
            } else {
                setInterval(nextFrame, 83.33);
            }
        }
    });
}

function mousemove(cursor) {
    barlength = Math.min(Math.hypot(cursor.x - clickpoint.x, cursor.y - clickpoint.y), 300);
    let hue = (barlength / 300) * 260;

    powerbar.style.width = barlength+'px';
    powerbar.style.rotate = Math.atan2(clickpoint.y - cursor.y, clickpoint.x - cursor.x) * 180 / Math.PI+'deg';

    if (barlength < 32) {
        powerbar.style.opacity = 1;
        powerbar.style.backgroundColor = 'darkred';
    } else {
        powerbar.style.opacity = 0.5;
        powerbar.style.backgroundColor = `hsl(${260 - hue}, 100%, 50%)`;
    }
}

gamewindow.addEventListener('mousedown', (click) => {
    if (ableToStroke) {
        clickpoint = click;
        strokingIt = true;

        playSound('WhistleGrab');

        clickmarker.style.left = click.x+'px';
        clickmarker.style.top = click.y+'px';
        clickmarker.style.visibility = 'visible';

        powerbar.style = null;
        barlength = 0;
        powerbar.style.visibility = 'visible';
        
        document.addEventListener('mousemove', mousemove);
    }
});

document.addEventListener('mouseup', (click) => {
    if (strokingIt) {
        clickmarker.style.visibility = 'hidden';

        powerbar.style.visibility = 'hidden';

        document.removeEventListener('mousemove', mousemove);

        if (barlength > 32) {
            playSound('SillyTwang2');

            ableToStroke = false;
            applyForce((clickpoint.x-click.x)/14, (clickpoint.y-click.y)/14);
            
            strokes++;
            document.getElementById('GolfHitLabel').textContent = `Golf Hit: ${strokes}`
        } else if (barlength < 32) {
            playSound('XylophoneCancel');
        }
        if (barlength > 150) {
            addToQueue('Move');
        }

        strokingIt = false;
    }
});

//startup stuff
setTimeout(() => {
    think('Static');
}, 100);
document.querySelectorAll('#FlagHolder').forEach(element => {
    let frameWidth = 150;
    let frameHeight = 200;
    let image = element.firstElementChild;
    let frames = (image.width/frameWidth)*(image.height/frameHeight)-1
    spriteAnim(image, frames, frameWidth, frameHeight);
});

bgmusic.volume = 0.2;

//physics
const speed = { x: 0, y: 0 }; // Initial speed in x and y directions
const friction = 0.98; // Friction factor for slowing down
const stopThreshold = 0.1;
let isIntersected = false;

function isIntersecting(rect1, rect2) {
    return !(rect2.left > rect1.right || 
             rect2.right < rect1.left || 
             rect2.top > rect1.bottom || 
             rect2.bottom < rect1.top);
}

function applyForce(forceX, forceY) {
    speed.x += forceX;
    speed.y += forceY;
}

function update() {
    const playerRect = player.getBoundingClientRect();
    const containerRect = gamewindow.getBoundingClientRect();
    const goalRect = goal.querySelector('#Hole').getBoundingClientRect();

    let leftOffset = document.getElementById('HUD').getBoundingClientRect().width;

    player.style.left = playerRect.left-leftOffset + speed.x + window.pageXOffset + 'px';
    player.style.top = playerRect.top + speed.y + window.pageYOffset + 'px';

    // Check for wall collisions
    if (playerRect.left < containerRect.left || playerRect.right > containerRect.right) {
        speed.x *= -1; // Reverse x direction on collision
        player.style.left = Math.max(containerRect.left-leftOffset, Math.min(playerRect.left-leftOffset + speed.x, containerRect.right - playerRect.width)) + 'px'; // Clamp position
        playSound('WallBump2');
    }
    if (playerRect.top < containerRect.top || playerRect.bottom > containerRect.bottom) {
        speed.y *= -1; // Reverse y direction on collision
        player.style.top = Math.max(containerRect.top, Math.min(playerRect.top + speed.y, containerRect.bottom - playerRect.height)) + 'px'; // Clamp position
        playSound('WallBump2');
    }

    // Check if goal
    if (isIntersecting(playerRect, goalRect)) {
        if (!isIntersected) {
            playSound('Goal');
            addToQueue('Win');
            isIntersected = true;
        }
    } else {
        isIntersected = false; // Reset the flag when no longer intersecting
    }

    // Apply friction
    speed.x *= friction;
    speed.y *= friction;

    // Check if the player is stopped
    if (Math.abs(speed.x) < stopThreshold && Math.abs(speed.y) < stopThreshold) {
        ableToStroke = true;
    }

    requestAnimationFrame(update); // Loop to continuously update
}
// Start the movement
update();

//menu buttons
document.getElementById('StartButton').addEventListener('click', () => {
    bgmusic.pause();
    playSound('HardMode');

    let menu = document.getElementById('MainMenu');
    let menuButtons = menu.querySelector('.ButtonHolder').style;

    menuButtons.visibility = 'hidden';
    menu.style.backgroundColor = 'rgba(0,0,0,.8)';
    menu.style.backgroundImage = 'url(assets/graphics/uncanny.png)';
    menu.querySelectorAll('#Cats img').forEach(car => {
        car.src = 'assets/graphics/uncanny.png'
    });

    setTimeout(() => {
        bgmusic.src = 'assets/music/Stage0Theme.ogg';
        bgmusic.play();

        playSound('LevelStart2');

        document.getElementById('LevelLabels').style.visibility = 'visible';

        menu.style = null;
        menu.style.visibility = 'hidden';
        menuButtons.visibility = null;
        menu.querySelectorAll('#Cats img').forEach(car => {
            car.src = 'assets/graphics/canny.png'
        });

        globalTime = true;

        let min = 0, sec = 0;
        setInterval(() => {
            sec++;
            if (sec === 60) {
                min++;
                sec = 0;
            }
            document.getElementById('TimeLabel').textContent = `Total Time: ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        }, 1000);
    }, 2000);
});