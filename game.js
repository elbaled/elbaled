import * as THREE from
  'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const $ = id => document.getElementById(id);

const root = $('scene');
const loading = $('loading');

let scene, camera, renderer, clock, dashboard;
let speed = 0;
let distance = 0;
let throttle = 0;
let accelerating = false;
let braking = false;
let paused = false;
let toastTimer;

const sleepers = [];
const scenery = [];
const signs = [];

const stations = [
  { name: 'المنيا', km: 0 },
  { name: 'سمالوط', km: 12 },
  { name: 'مطاي', km: 25 },
  { name: 'بني مزار', km: 39 },
  { name: 'مغاغة', km: 54 },
  { name: 'العدوة', km: 70 }
];

function material(color, metalness = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness
  });
}

function cube(parent, x, y, z, w, h, d, mat) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    mat
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, x, y, z, r1, r2, h, mat) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(r1, r2, h, 8),
    mat
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function palm(parent, x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);

  cylinder(
    group, 0, 2.5, 0,
    .13, .22, 5,
    material(0x89613e)
  );

  const green = material(0x247344);

  for (let i = 0; i < 9; i++) {
    const angle = i * Math.PI * 2 / 9;

    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(.18, .12, 2.8),
      green
    );

    leaf.position.set(
      Math.sin(angle) * .9,
      4.95,
      Math.cos(angle) * .9
    );

    leaf.rotation.y = angle;
    leaf.rotation.x = -.22;
    group.add(leaf);
  }

  parent.add(group);
  return group;
}

function tree(parent, x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);

  cylinder(
    group, 0, 1.1, 0,
    .13, .18, 2.2,
    material(0x795032)
  );

  const crown = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 1),
    material(0x387d3d)
  );

  crown.position.y = 2.6;
  crown.scale.set(1, 1.15, .9);
  group.add(crown);

  parent.add(group);
  return group;
}

function house(parent, x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);

  cube(
    group, 0, 1.1, 0,
    3.2, 2.2, 2.5,
    material(0xd7bd91)
  );

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.4, 1.2, 4),
    material(0x8f5b3d)
  );

  roof.position.y = 2.8;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  cube(
    group, 0, .6, 1.28,
    .5, 1.2, .06,
    material(0x4c3529)
  );

  cube(
    group, -1, 1.4, 1.29,
    .45, .45, .05,
    material(0x79b6ce)
  );

  cube(
    group, 1, 1.4, 1.29,
    .45, .45, .05,
    material(0x79b6ce)
  );

  parent.add(group);
  return group;
}

function textSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#173d33';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#f0c35e';
  ctx.lineWidth = 7;
  ctx.strokeRect(4, 4, 504, 120);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 45px Tahoma, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64, 470);

  const texture = new THREE.CanvasTexture(canvas);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture })
  );

  sprite.scale.set(4.1, 1.03, 1);
  return sprite;
}

function stationSign(parent, x, z, label) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  cylinder(
    group, 0, 1.35, 0,
    .07, .08, 2.7,
    material(0x495563)
  );

  cube(
    group, 0, 2.4, 0,
    3.3, .8, .15,
    material(0x173d33)
  );

  cube(
    group, 0, 1.98, .09,
    3.25, .05, .04,
    material(0xf0c35e)
  );

  parent.add(group);

  const sprite = textSprite(label);
  sprite.position.set(x, 2.43, z + .12);
  parent.add(sprite);

  signs.push({ group, sprite, initialZ: z });
}

function signal(parent, x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  cylinder(
    group, 0, 1.7, 0,
    .08, .1, 3.4,
    material(0x333b43)
  );

  cube(
    group, 0, 3, 0,
    .7, 1.3, .3,
    material(0x20262d)
  );

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(.17, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0x4ee58a })
  );

  lamp.position.set(0, 3.25, .18);
  group.add(lamp);

  parent.add(group);
  scenery.push(group);
}

function createCabin() {
  const cab = new THREE.Group();

  const dark = material(0x172a3a, .2);
  const trim = material(0x526777, .4);

  // لوحة القيادة الأمامية.
  cube(
    cab, 0, -1.2, -.3,
    8.5, .45, 1.5,
    dark
  );

  // إطار الزجاج الأمامي.
  cube(
    cab, -4.1, .25, -.9,
    .14, 2.5, .15,
    trim
  );

  cube(
    cab, 4.1, .25, -.9,
    .14, 2.5, .15,
    trim
  );

  cube(
    cab, 0, 1.5, -.9,
    8.2, .14, .15,
    trim
  );

  const glass = new THREE.MeshStandardMaterial({
    color: 0x5795af,
    transparent: true,
    opacity: .22,
    roughness: .2
  });

  cube(
    cab, 0, .2, -.94,
    8.1, 2.3, .03,
    glass
  );

  dashboard = new THREE.Group();

  cube(
    dashboard, 0, -.45, .08,
    4.4, .7, .7,
    dark
  );

  for (let i = 0; i < 5; i++) {
    const dial = new THREE.Mesh(
      new THREE.CylinderGeometry(.14, .14, .04, 20),
      material(i === 1 ? 0x1d9e7a : 0x91a9b6, .3)
    );

    dial.rotation.x = Math.PI / 2;
    dial.position.set(-1.35 + i * .67, -.34, -.3);
    dashboard.add(dial);
  }

  cylinder(
    dashboard, -1.25, .05, 0,
    .07, .1, .55,
    material(0xd8a94e)
  );

  cylinder(
    dashboard, 1.2, .05, 0,
    .07, .1, .55,
    material(0xc2d1d9)
  );

  cab.add(dashboard);
  camera.add(cab);
}

function createWorld() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9bd4ef);
  scene.fog = new THREE.Fog(0x9bd4ef, 100, 470);

  camera = new THREE.PerspectiveCamera(
    73,
    innerWidth / innerHeight,
    .1,
    900
  );

  camera.position.set(0, 2.85, 5.7);
  camera.lookAt(0, 2, -45);

  renderer = new THREE.WebGLRenderer({
    antialias: innerWidth > 650,
    powerPreference: 'low-power'
  });

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.4));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  root.replaceChildren(renderer.domElement);

  scene.add(
    new THREE.HemisphereLight(0xdff4ff, 0x8a7449, 2)
  );

  const sun = new THREE.DirectionalLight(0xffe8bd, 2);
  sun.position.set(-30, 70, 45);
  scene.add(sun);

  // الأرض والحقول الزراعية.
  cube(
    scene, 0, -.65, -200,
    900, .6, 900,
    material(0x8eaf58)
  );

  // طبقة الحصى أسفل السكة.
  cube(
    scene, 0, -.18, -200,
    5.3, .22, 900,
    material(0x6e6a60)
  );

  // قضبان حديدية ثلاثية الأبعاد.
  const steel = material(0x64717a, .75);

  for (const x of [-1.02, 1.02]) {
    cube(scene, x, .015, -200, .19, .08, 900, steel);
    cube(scene, x, .085, -200, .10, .13, 900, steel);
    cube(scene, x, .16, -200, .18, .045, 900, steel);
  }

  // الفلنكات، مع إعادة تدويرها أثناء الحركة.
  const sleeperMat = material(0x51483e);
  const edgeMat = material(0x716253);

  for (let i = 0; i < 42; i++) {
    const z = -i * 7;

    const sleeper = cube(
      scene, 0, -.005, z,
      3.35, .16, .48,
      sleeperMat
    );

    sleepers.push(sleeper);

    cube(
      scene, 0, .079, z,
      3.12, .018, .07,
      edgeMat
    );
  }

  cube(scene, -3.2, -.17, -200, .45, .06, 900, material(0x8a8170));
  cube(scene, 3.2, -.17, -200, .45, .06, 900, material(0x8a8170));

  // الحقول والبيوت والأشجار على جانبي القطار.
  for (let i = 0; i < 48; i++) {
    const z = -18 - i * 11.3;
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (12 + (i % 5) * 3.2);

    let item;

    if (i % 6 === 0) {
      item = palm(scene, x, z, .8);
    } else if (i % 6 === 1 || i % 6 === 4) {
      item = house(scene, x, z, .7);
    } else {
      item = tree(scene, x, z, .8);
    }

    scenery.push(item);

    // صفوف المحاصيل الزراعية.
    if (i % 3 === 0) {
      const field = new THREE.Group();
      field.position.set(0, 0, z - 4);

      for (let j = 0; j < 9; j++) {
        cube(
          field,
          side * (8 + j * 1.1),
          -.12,
          (j % 2) * 1.2,
          .42, .035, 13,
          material(j % 2 ? 0x5d963e : 0x9db84c)
        );
      }

      scene.add(field);
      scenery.push(field);
    }
  }

  // لوحات المحطات والإشارات.
  stationSign(scene, -6.5, -150, 'سمالوط');
  stationSign(scene, 6.5, -290, 'مطاي');
  stationSign(scene, -6.5, -430, 'بني مزار');

  signal(scene, -4.2, -163);
  signal(scene, 4.2, -303);
  signal(scene, -4.2, -443);

  createCabin();
  clock = new THREE.Clock();
}

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 2400);
}

function nextStation() {
  return stations.find(s => s.km > distance + .001)
    || stations[stations.length - 1];
}

function updateHUD() {
  $('speed').textContent = Math.round(speed);
  $('speedBar').style.width = Math.min(100, speed / 120 * 100) + '%';
  $('throttle').textContent = Math.round(throttle * 100) + '%';
  $('distance').textContent = distance.toFixed(2);

  const station = nextStation();
  const remaining = Math.max(0, station.km - distance);

  $('stationName').textContent = station.name;

  $('stationDistance').textContent =
    remaining < 1
      ? `المسافة: ${Math.round(remaining * 1000)} متر`
      : `المسافة: ${remaining.toFixed(1)} كم`;

  $('mission').textContent =
    remaining < 1 && speed > 50
      ? 'خفّض السرعة استعدادًا للمحطة'
      : 'تابع القيادة بأمان';
}

function moveWorld(dt) {
  const movement = speed / 3.6 * dt * 1.6;

  for (const sleeper of sleepers) {
    sleeper.position.z += movement;

    if (sleeper.position.z > 7) {
      sleeper.position.z -= 42 * 7;
    }
  }

  for (const item of scenery) {
    item.position.z += movement;

    if (item.position.z > 24) {
      item.position.z -= 560;
    }
  }

  for (const sign of signs) {
    sign.group.position.z += movement;
    sign.sprite.position.z += movement;

    if (sign.group.position.z > 30) {
      sign.group.position.z -= 560;
      sign.sprite.position.z -= 560;
    }
  }

  // اهتزاز خفيف يتزايد مع السرعة.
  const t = clock.elapsedTime;
  const shake = speed / 120;

  camera.position.x =
    Math.sin(t * (7 + speed * .08)) * .018 * shake;

  camera.position.y =
    2.85 + Math.sin(t * (12 + speed * .1)) *
    (.012 + .014 * shake);

  camera.position.z = 5.7;

  camera.rotation.z =
    Math.sin(t * 2.1) * .0018 * shake;

  dashboard.rotation.z =
    Math.sin(t * 9) * .003 * shake;
}

function updatePhysics(dt) {
  if (paused) return;

  if (accelerating && !braking) {
    speed += 8.5 * dt;
    throttle = Math.min(1, throttle + .58 * dt);
  } else {
    throttle = Math.max(0, throttle - .42 * dt);
  }

  if (braking) {
    speed -= 22 * dt;
  } else if (!accelerating) {
    speed -= (.45 + speed * .009) * dt;
  }

  speed = THREE.MathUtils.clamp(speed, 0, 120);
  distance += speed / 3600 * dt;

  moveWorld(dt);
  updateHUD();
}

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), .045);

  updatePhysics(dt);
  renderer.render(scene, camera);
}

function holdButton(id, onDown, onUp) {
  const button = $(id);

  button.addEventListener('pointerdown', e => {
    e.preventDefault();

    if (paused) return;

    button.setPointerCapture(e.pointerId);
    button.classList.add('active');
    onDown();
  });

  const release = e => {
    e.preventDefault();
    button.classList.remove('active');
    onUp();
  };

  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', () => {
    button.classList.remove('active');
    onUp();
  });
}

let audioContext;

function horn() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;

    if (!AudioCtx) {
      toast('الصوت غير مدعوم في المتصفح');
      return;
    }

    if (!audioContext) audioContext = new AudioCtx();

    audioContext.resume();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(175, now + .42);

    gain.gain.setValueAtTime(.0001, now);
    gain.gain.linearRampToValueAtTime(.07, now + .06);
    gain.gain.setValueAtTime(.07, now + .42);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .72);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(now + .74);
  } catch (error) {
    console.error(error);
    toast('تعذر تشغيل البوق');
  }
}

function togglePause() {
  paused = !paused;

  accelerating = false;
  braking = false;

  $('pauseScreen').classList.toggle('hidden', !paused);
  $('pauseBtn').textContent = paused ? '▶' : 'Ⅱ';
}

function resetGame() {
  speed = 0;
  distance = 0;
  throttle = 0;
  accelerating = false;
  braking = false;
  paused = false;

  sleepers.forEach((item, i) => {
    item.position.z = -i * 7;
  });

  scenery.forEach((item, i) => {
    item.position.z = -18 - i * 11.3;
  });

  signs.forEach(sign => {
    sign.group.position.z = sign.initialZ;
    sign.sprite.position.z = sign.initialZ + .12;
  });

  $('pauseScreen').classList.add('hidden');
  $('pauseBtn').textContent = 'Ⅱ';

  updateHUD();
  toast('بدأت رحلة جديدة');
}

function init() {
  try {
    createWorld();

    holdButton(
      'accelBtn',
      () => accelerating = true,
      () => accelerating = false
    );

    holdButton(
      'brakeBtn',
      () => braking = true,
      () => braking = false
    );

    $('hornBtn').addEventListener('click', horn);
    $('pauseBtn').addEventListener('click', togglePause);
    $('resumeBtn').addEventListener('click', togglePause);
    $('resetBtn').addEventListener('click', resetGame);

    window.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();

      if (['arrowup', 'arrowdown', ' '].includes(key)) {
        e.preventDefault();
      }

      if (key === 'arrowup' || key === 'w') {
        accelerating = !paused;
      }

      if (key === 'arrowdown' || key === 's') {
        braking = !paused;
      }

      if (key === ' ') horn();

      if (key === 'p' || key === 'escape') {
        togglePause();
      }
    });

    window.addEventListener('keyup', e => {
      const key = e.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') {
        accelerating = false;
      }

      if (key === 'arrowdown' || key === 's') {
        braking = false;
      }
    });

    window.addEventListener('blur', () => {
      accelerating = false;
      braking = false;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        accelerating = false;
        braking = false;
      }
    });

    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.4));
    });

    updateHUD();
    loading.classList.add('hidden');

    toast('اضغط باستمرار على تسارع لبدء الرحلة 🚆');

    animate();
  } catch (error) {
    console.error('Game initialization error:', error);

    $('loadingText').textContent =
      'تعذر تشغيل اللعبة. تأكد من اتصال الإنترنت ودعم WebGL.';

    document.querySelector('.loader').style.display = 'none';
  }
}

init();
