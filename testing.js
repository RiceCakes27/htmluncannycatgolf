walls.forEach(wall => {
    const el = document.createElement('div');
    const isHorizontal = wall.from[1] === wall.to[1];

    el.style.cssText = `
    position: absolute;
    z-index: 100;
    background: blue;
    left: ${Math.min(wall.from[0], wall.to[0])}px;
    top: ${Math.min(wall.from[1], wall.to[1])}px;
    width: ${isHorizontal ? Math.abs(wall.to[0] - wall.from[0]) : 1}px;
    height: ${isHorizontal ? 1 : Math.abs(wall.to[1] - wall.from[1])}px;
    `;

    gamewindow.appendChild(el);
});