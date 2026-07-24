(() => {
  const root = document.querySelector("[data-aami-game]");
  const canvas = root?.querySelector("[data-pixel-game-canvas]");
  if (!root || !(canvas instanceof HTMLCanvasElement) || !window.Matter) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const { Engine, Bodies, Body, Composite, Events } = window.Matter;
  const PLAYER_X = 82;
  const PLAYER_WIDTH = 14;
  const PLAYER_HEIGHT = 18;
  const BASE_SPEED = 2.65;
  const stickerSources = [
    "assets/user-stickers/figma-sticker.png",
    "assets/user-stickers/smiley-flower.png",
    "assets/user-stickers/yellow-star.png",
    "assets/user-stickers/yellow-ami-star.png",
    "assets/user-stickers/designsbyaami-logo.png",
  ];
  const stickerImages = stickerSources.map((source) => {
    const image = new Image();
    image.src = source;
    return image;
  });

  let engine;
  let player;
  let terrain = [];
  let collectibles = [];
  let skyline = [];
  let state = "waiting";
  let grounded = false;
  let score = 0;
  let collectedTypes = [];
  let distance = 0;
  let speed = BASE_SPEED;
  let spawnX = 0;
  let chunkIndex = 0;
  let collectibleIndex = 0;
  let width = 1;
  let height = 278;
  let floorY = 210;
  let pixelRatio = 1;
  let previousTime = 0;
  let frameId = 0;

  const chunkPattern = [
    "calm",
    "blocks",
    "calm",
    "pit",
    "platforms",
    "calm",
    "steps",
    "pit",
    "blocks",
    "platforms",
    "calm",
  ];

  const addTerrain = (x, y, bodyWidth, bodyHeight, kind = "ground") => {
    const body = Bodies.rectangle(x + bodyWidth / 2, y + bodyHeight / 2, bodyWidth, bodyHeight, {
      isStatic: true,
      friction: 0,
      label: kind,
    });
    Composite.add(engine.world, body);
    terrain.push({ body, kind, width: bodyWidth, height: bodyHeight });
    return body;
  };

  const addGround = (x, groundWidth) => {
    addTerrain(x, floorY, groundWidth, height - floorY + 50, "ground");
  };

  const addCollectible = (x, y) => {
    collectibles.push({
      x,
      y,
      type: collectibleIndex % stickerImages.length,
      collected: false,
      phase: collectibleIndex * 0.9,
    });
    collectibleIndex += 1;
  };

  const addSkyline = (start, chunkWidth) => {
    let x = start + 8;
    while (x < start + chunkWidth - 16) {
      const buildingWidth = 14 + ((chunkIndex * 7 + Math.round(x)) % 18);
      const buildingHeight = 24 + ((chunkIndex * 19 + Math.round(x * 0.7)) % 62);
      skyline.push({ x, width: buildingWidth, height: buildingHeight });
      x += buildingWidth + 9;
    }
  };

  const spawnChunk = (forcedType) => {
    const type = forcedType || chunkPattern[chunkIndex % chunkPattern.length];
    const chunkWidth = 150 + (chunkIndex % 3) * 28;
    const start = spawnX;
    addSkyline(start, chunkWidth);

    if (type === "pit") {
      const lead = 50;
      const gap = 48 + (chunkIndex % 2) * 12;
      addGround(start, lead);
      addGround(start + lead + gap, chunkWidth - lead - gap);
      addCollectible(start + lead + gap / 2, floorY - 54);
    } else {
      addGround(start, chunkWidth);

      if (type === "blocks") {
        const blockX = start + 62;
        addTerrain(blockX, floorY - 48, 18, 18, "block");
        addTerrain(blockX + 20, floorY - 48, 18, 18, "block");
        addTerrain(blockX + 40, floorY - 48, 18, 18, "block");
        addCollectible(blockX + 29, floorY - 82);
      } else if (type === "platforms") {
        addTerrain(start + 44, floorY - 58, 58, 9, "platform");
        addCollectible(start + 73, floorY - 84);
        if (chunkIndex % 2 === 0) {
          addTerrain(start + 116, floorY - 91, 52, 9, "platform");
          addCollectible(start + 142, floorY - 117);
        }
      } else if (type === "steps") {
        addTerrain(start + 70, floorY - 18, 18, 18, "block");
        addTerrain(start + 88, floorY - 36, 18, 36, "block");
        addTerrain(start + 106, floorY - 54, 18, 54, "block");
        addCollectible(start + 115, floorY - 82);
      } else if (chunkIndex % 2 === 0) {
        addCollectible(start + chunkWidth * 0.62, floorY - 42);
      }
    }

    spawnX += chunkWidth;
    chunkIndex += 1;
  };

  const fillWorld = () => {
    spawnChunk("calm");
    spawnChunk("calm");
    while (spawnX < width + 320) spawnChunk();
  };

  const removeWorld = () => {
    if (engine) {
      terrain.forEach((item) => Composite.remove(engine.world, item.body));
    }
    terrain = [];
    collectibles = [];
    skyline = [];
  };

  const buildWorld = () => {
    if (engine) {
      Events.off(engine);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    }

    engine = Engine.create({ gravity: { x: 0, y: 1.05 } });
    engine.positionIterations = 8;
    engine.velocityIterations = 6;
    terrain = [];
    collectibles = [];
    skyline = [];
    chunkIndex = 0;
    collectibleIndex = 0;
    spawnX = -80;
    score = 0;
    collectedTypes = [];
    distance = 0;
    speed = BASE_SPEED;
    grounded = false;

    player = Bodies.rectangle(PLAYER_X, floorY - PLAYER_HEIGHT / 2 - 2, PLAYER_WIDTH, PLAYER_HEIGHT, {
      chamfer: { radius: 1 },
      friction: 0,
      frictionAir: 0,
      inertia: Infinity,
      restitution: 0,
      label: "player",
    });
    Composite.add(engine.world, player);
    fillWorld();

    Events.on(engine, "collisionActive", (event) => {
      if (state !== "playing") return;
      event.pairs.forEach((pair) => {
        const other = pair.bodyA === player ? pair.bodyB : pair.bodyB === player ? pair.bodyA : null;
        if (!other) return;

        const playerBottom = player.bounds.max.y;
        const isLanding = playerBottom <= other.bounds.min.y + 9 && player.velocity.y >= -0.5;
        if (isLanding) {
          grounded = true;
        } else if (other.label === "block") {
          endRun();
        }
      });
    });
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    floorY = Math.round(height * 0.72);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    buildWorld();
    state = "waiting";
  };

  const moveWorld = (amount) => {
    terrain.forEach((item) => Body.translate(item.body, { x: -amount, y: 0 }));
    collectibles.forEach((item) => {
      item.x -= amount;
    });
    skyline.forEach((building) => {
      building.x -= amount * 0.35;
    });
    spawnX -= amount;

    terrain = terrain.filter((item) => {
      if (item.body.bounds.max.x >= -90) return true;
      Composite.remove(engine.world, item.body);
      return false;
    });
    collectibles = collectibles.filter((item) => item.x > -60);
    skyline = skyline.filter((building) => building.x + building.width > -80);
    while (spawnX < width + 320) spawnChunk();
  };

  const collectStickers = () => {
    collectibles.forEach((item) => {
      if (item.collected) return;
      if (Math.abs(item.x - PLAYER_X) < 18 && Math.abs(item.y - player.position.y) < 24) {
        item.collected = true;
        score += 1;
        collectedTypes.push(item.type);
      }
    });
  };

  const startRun = () => {
    if (state === "dead") buildWorld();
    state = "playing";
    root.focus({ preventScroll: true });
  };

  const endRun = () => {
    state = "dead";
    Body.setVelocity(player, { x: 0, y: 0 });
  };

  const jump = () => {
    if (state === "waiting" || state === "dead") {
      startRun();
      return;
    }
    if (!grounded) return;
    Body.setVelocity(player, { x: 0, y: -8.4 });
    grounded = false;
  };

  const drawPixelText = (text, x, y, size = 10, align = "center") => {
    context.save();
    context.font = `700 ${size}px "Courier New", monospace`;
    context.textAlign = align;
    context.textBaseline = "middle";
    context.fillStyle = "#171a1c";
    context.fillText(text, Math.round(x), Math.round(y));
    context.restore();
  };

  const drawSky = () => {
    context.fillStyle = "rgba(20, 47, 61, .055)";
    skyline.forEach((building) => {
      const x = Math.round(building.x);
      const y = Math.round(floorY - building.height);
      context.fillRect(x, y, building.width, building.height);
      context.fillStyle = "rgba(20, 47, 61, .095)";
      for (let windowY = y + 8; windowY < floorY - 5; windowY += 10) {
        for (let windowX = x + 5; windowX < x + building.width - 3; windowX += 8) {
          context.fillRect(windowX, windowY, 2, 3);
        }
      }
      context.fillStyle = "rgba(20, 47, 61, .055)";
    });

    context.fillStyle = "rgba(20, 47, 61, .12)";
    const cloudX = width * 0.68 - (distance * 0.08) % (width + 100);
    context.fillRect(Math.round(cloudX), 34, 26, 4);
    context.fillRect(Math.round(cloudX + 7), 30, 12, 4);

    context.strokeStyle = "rgba(20, 47, 61, .34)";
    context.lineWidth = 1;
    for (let index = 0; index < 3; index += 1) {
      const birdX = (width * (0.25 + index * 0.29) - distance * (0.04 + index * 0.01)) % (width + 40);
      const birdY = 25 + index * 17;
      context.beginPath();
      context.moveTo(birdX - 4, birdY);
      context.lineTo(birdX, birdY + 2);
      context.lineTo(birdX + 4, birdY);
      context.stroke();
    }
  };

  const drawTerrain = () => {
    terrain.forEach((item) => {
      const bounds = item.body.bounds;
      const x = Math.round(bounds.min.x);
      const y = Math.round(bounds.min.y);
      const bodyWidth = Math.round(bounds.max.x - bounds.min.x);
      const bodyHeight = Math.round(bounds.max.y - bounds.min.y);

      if (item.kind === "ground") {
        context.fillStyle = "rgba(24, 28, 30, .9)";
        context.fillRect(x, y, bodyWidth, bodyHeight);
        context.fillStyle = "rgba(255, 255, 255, .46)";
        context.fillRect(x, y, bodyWidth, 3);
        context.strokeStyle = "rgba(255, 255, 255, .07)";
        for (let gridX = x; gridX < x + bodyWidth; gridX += 16) {
          context.beginPath();
          context.moveTo(gridX, y + 4);
          context.lineTo(gridX, height);
          context.stroke();
        }
        for (let gridY = y + 18; gridY < height; gridY += 16) {
          context.beginPath();
          context.moveTo(x, gridY);
          context.lineTo(x + bodyWidth, gridY);
          context.stroke();
        }
      } else if (item.kind === "platform") {
        context.fillStyle = "#4b4f4e";
        context.fillRect(x, y, bodyWidth, bodyHeight);
        context.fillStyle = "#727675";
        context.fillRect(x, y, bodyWidth, 3);
      } else {
        context.fillStyle = "#4b4f4e";
        context.fillRect(x, y, bodyWidth, bodyHeight);
        context.fillStyle = "#707473";
        context.fillRect(x, y, bodyWidth, 3);
        context.strokeStyle = "rgba(255, 255, 255, .16)";
        context.strokeRect(x + 0.5, y + 0.5, bodyWidth - 1, bodyHeight - 1);
      }
    });
  };

  const drawCollectibles = (time) => {
    collectibles.forEach((item) => {
      if (item.collected) return;
      const image = stickerImages[item.type];
      const bob = Math.round(Math.sin(time * 0.004 + item.phase) * 2);
      if (image.complete && image.naturalWidth) {
        context.drawImage(image, Math.round(item.x - 10), Math.round(item.y - 10 + bob), 20, 20);
      }
    });
  };

  const drawPlayer = () => {
    const x = Math.round(PLAYER_X - PLAYER_WIDTH / 2);
    const y = Math.round(player.position.y - PLAYER_HEIGHT / 2);
    const ponytailOffset = player.velocity.y < -0.4 ? -1 : 0;

    context.fillStyle = "#211316";
    context.fillRect(x + 3, y, 8, 3);
    context.fillRect(x + 1, y + 3, 12, 4);
    context.fillRect(x, y + 6 + ponytailOffset, 3, 6);
    context.fillRect(x + 11, y + 6 + ponytailOffset, 3, 6);

    context.fillStyle = "#f0b68f";
    context.fillRect(x + 4, y + 4, 6, 6);
    context.fillRect(x + 5, y + 9, 4, 2);

    context.fillStyle = "#10253a";
    context.fillRect(x + 5, y + 6, 1, 1);
    context.fillRect(x + 9, y + 6, 1, 1);
    context.fillStyle = "#df6f7f";
    context.fillRect(x + 7, y + 8, 2, 1);

    context.fillStyle = "#f7d24a";
    context.fillRect(x + 3, y + 10, 8, 5);
    context.fillStyle = "#8ed3f4";
    context.fillRect(x + 4, y + 11, 6, 3);

    context.fillStyle = "#f0b68f";
    context.fillRect(x + 1, y + 11, 2, 4);
    context.fillRect(x + 11, y + 11, 2, 4);

    context.fillStyle = "#27384a";
    context.fillRect(x + 4, y + 15, 3, 3);
    context.fillRect(x + 8, y + 15, 3, 3);
    context.fillStyle = "#0b1722";
    context.fillRect(x + 3, y + 17, 4, 1);
    context.fillRect(x + 8, y + 17, 4, 1);
  };

  const drawState = () => {
    if (state === "waiting") {
      drawPixelText("START", width / 2, 76, 11);
    } else if (state === "dead") {
      const panelWidth = 202;
      const panelX = Math.round(width / 2 - panelWidth / 2);
      context.fillStyle = "rgba(255, 255, 255, .86)";
      context.fillRect(panelX, 34, panelWidth, 112);
      context.strokeStyle = "rgba(23, 26, 28, .35)";
      context.strokeRect(panelX + 0.5, 34.5, panelWidth - 1, 111);
      drawPixelText("GAME OVER", width / 2, 54, 11);
      drawPixelText(`${score} STICKERS`, width / 2, 72, 8);

      const visibleStickers = collectedTypes.slice(-8);
      const iconSize = 18;
      const iconGap = 4;
      const rowWidth = visibleStickers.length * iconSize + Math.max(0, visibleStickers.length - 1) * iconGap;
      let iconX = width / 2 - rowWidth / 2;
      visibleStickers.forEach((type) => {
        const image = stickerImages[type];
        if (image?.complete && image.naturalWidth) {
          context.drawImage(image, Math.round(iconX), 83, iconSize, iconSize);
        }
        iconX += iconSize + iconGap;
      });
      if (collectedTypes.length > visibleStickers.length) {
        drawPixelText(`+${collectedTypes.length - visibleStickers.length}`, panelX + panelWidth - 8, 109, 7, "right");
      }

      drawPixelText("PLAY AGAIN", width / 2, 127, 8);
    }

    const scoreImage = stickerImages[2];
    if (scoreImage.complete && scoreImage.naturalWidth) {
      context.drawImage(scoreImage, width - 58, 14, 16, 16);
    }
    drawPixelText(String(score).padStart(2, "0"), width - 18, 23, 9, "right");
  };

  const render = (time) => {
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = false;
    drawSky();
    drawTerrain();
    drawCollectibles(time);
    drawPlayer();
    drawState();
  };

  const tick = (time) => {
    const elapsed = Math.min(32, time - previousTime || 16.67);
    previousTime = time;

    if (state === "playing") {
      speed = Math.min(4.6, BASE_SPEED + distance / 9000);
      moveWorld(speed * (elapsed / 16.67));
      grounded = false;
      Engine.update(engine, elapsed);
      Body.setPosition(player, { x: PLAYER_X, y: player.position.y });
      Body.setVelocity(player, { x: 0, y: player.velocity.y });
      collectStickers();
      distance += speed;

      if (player.position.y > height + 34) endRun();
    }

    render(time);
    frameId = requestAnimationFrame(tick);
  };

  root.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    jump();
  });
  root.addEventListener("keydown", (event) => {
    if (["ArrowUp", " ", "Spacebar", "w", "W"].includes(event.key)) {
      event.preventDefault();
      jump();
    }
  });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  previousTime = performance.now();
  frameId = requestAnimationFrame(tick);

  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frameId);
    removeWorld();
    resizeObserver.disconnect();
  }, { once: true });
})();
