
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const $ = id => document.getElementById(id);

const sceneRoot = $('scene');
const loading = $('loading');
const loadingText = $('loadingText');

let scene, camera, renderer, clock;
let trainSpeed = 0;
let distanceKm = 0;
let throttle = 0;
let braking = false;
let accelerating = false;
let paused = false;
let finished = false;
let toastTimer;
let animationId;
let sleeperGroup, sceneryGroup;
let lastTime = 0;
let hornAudio;
let lastStationIndex = -1;

const MAX_SPEED = 120;
const stations = [
  { name: 'المنيا', km: 0 },
  { name: 'سمالوط', km: 12 },
  { name: 'مطاي', km: 25 },
  { name: 'بني مزار', km: 39 },
  { name: 'مغاغة', km: 54 },
  { name: 'العدوة', km: 70 }
];

const segmentLength = 8;
const segmentCount = 28;
const sleepers = [];
const sceneryItems = [];

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function material(color, roughness = 0.9) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function makeBox(parent, x, y, z, sx, sy, sz, mat) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    mat
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeTree(parent, x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 2.4, 7),
    material(0x78502f)
  );
  trunk.position.y = 1.2;
  group.add(trunk);

  // شجرة ريفية ذات تاج أخضر
  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 8, 7),
    material(0x398448)
  );
  leaves.scale.set(1, 1.4, 0.9);
  leaves.position.y = 2.9;
  group.add(leaves);

  parent.add(group);
  return group;
}

function makePalm(parent, x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.19, 5.5, 7),
    material(0x94704a)
  );
  trunk.position.y = 2.75;
  group.add(trunk);

  const leafMat = material(0x2c8149);

  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 2.7),
      leafMat
    );

    leaf.position.set(
      Math.sin(angle) * 0.85,
      5.35 - Math.abs(Math.sin(angle)) * 0.4,
      Math.cos(angle) * 0.85
    );
    leaf.rotation.y = angle;
    leaf.rotation.x = -0.2;
    group.add(leaf);
  }

  parent.add(group);
  return group;
}

function makeHouse(parent, x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);

  const wallMat = material(0xd8b78b);
  const roofMat = material(0x995d39);

  makeBox(group, 0, 1.1, 0, 2.5, 2.2, 2, wallMat);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.9, 1.1, 4),
    roofMat
  );
  roof.position.y = 2.75;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  makeBox(group, 0, 0.55, 1.015, 0.45, 1.1, 0.06,
    material(0x61432d));

  makeBox(group, -0.65, 1.4, 1.02, 0.35, 0.35, 0.06,
    material(0x76b8d2));

  parent.add(group);
  return group;
}

function createWorld() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x92d2ef);
  scene.fog = new THREE.Fog(0x92d2ef, 100, 520);

  camera = new THREE.PerspectiveCamera(
    68,
    window.innerWidth / window.innerHeight,
    0.1,
    800
  );
  camera.position.set(0, 3.15, 5.8);
  camera.lookAt(0, 2.4, -30);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'low-power'
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  sceneRoot.replaceChildren(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xd7efff, 0x89744d, 2.0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffedc4, 2.2);
  sun.position.set(-40, 80, 30);
  scene.add(sun);

  // الأرض والحقول
  makeBox(scene, 0, -0.6, -160, 900, 0.7, 900,
    material(0x8fbd57));

  makeBox(scene, -20, -0.18, -160, 30, 0.1, 900,
    material(0x6ca348));

  makeBox(scene, 20, -0.18, -160, 30, 0.1, 900,
    material(0xb5b95b));

  // قاعدة مسار السكة
  makeBox(scene, 0, -0.12, -120, 5.5, 0.3, 800,
    material(0x6c665a));

  // قضبان السكة
  const railMat = material(0x525c66, 0.45);

  makeBox(scene, -1.05, 0.10, -120, 0.13, 0.13, 800, railMat);
  makeBox(scene, 1.05, 0.10, -120, 0.13, 0.13, 800, railMat);

  // فلنكات السكة المتكررة
  sleeperGroup = new THREE.Group();
  const sleeperMat = material(0x57483c);

  for (let i = 0; i < segmentCount; i++) {
    const z = -i * segmentLength;
    const sleeper = makeBox(
      sleeperGroup, 0, 0.015, z,
      3.2, 0.14, 0.36, sleeperMat
    );
    sleepers.push(sleeper);
  }
  scene.add(sleeperGroup);

  // جوانب المسار والمناظر الريفية
  sceneryGroup = new THREE.Group();
  scene.add(sceneryGroup);

  const roadMat = material(0xb7a37b);
  makeBox(sceneryGroup, -9, -0.12, -140, 1.6, 0.08, 700, roadMat);
  makeBox(sceneryGroup, 9, -0.12, -140, 1.6, 0.08, 700, roadMat);

  for (let i = 0; i < 50; i++) {
    const z = -18 - i * 11;
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (11 + (i % 5) * 3);

    if (i % 4 === 0) {
      sceneryItems.push(makePalm(
        sceneryGroup, x, z, 0.8 + (i % 3) * 0.12
      ));
    } else if (i % 4 === 1) {
      sceneryItems.push(makeHouse(
        sceneryGroup, x, z, 0.7 + (i % 3) * 0.1
      ));
    } else {
      sceneryItems.push(makeTree(
        sceneryGroup, x, z, 0.8 + (i % 3) * 0.15
      ));
    }
  }

  // كابينة القطار في مقدمة الشاشة
  const cab = new THREE.Group();

  const dark = material(0x263543);
  const metal = material(0x586a77, 0.4);
  const glass = new THREE.MeshStandardMaterial({
    color: 0x253d4c,
    metalness: 0.25,
    roughness: 0.25
  });

  makeBox(cab, 0, -1.2, -0.3, 9, 0.4, 1.8, dark);
  makeBox(cab, 0, -0.97, -0.95, 8.8, 0.15, 0.12, metal);

  // لوحة العدادات
  makeBox(cab, 0, -0.45, 0.15, 4.6, 0.75, 0.45, dark);

  // الزجاج الأمامي على جانبي مجال الرؤية
  makeBox(cab, -4.2, 0.7, 0.05, 0.12, 2.6, 0.12, metal);
  makeBox(cab, 4.2, 0.7, 0.05, 0.12, 2.6, 0.12, metal);
  makeBox(cab, 0, 2.05, 0.05, 8.5, 0.12, 0.12, metal);

  // مقابض تحكم مبسطة
  makeBox(cab, -1.25, -0.08, -0.1, 0.17, 0.5, 0.17,
    material(0xd1a247));

  makeBox(cab, 1.25, -0.08, -0.1, 0.17, 0.5, 0.17,
    material(0xc9d1d9));

  camera.add(cab);
  scene.add(camera);

  clock = new THREE.Clock();
}

function getNextStation() {
  return stations.find(s => s.km > distanceKm + 0.001)
    || stations[stations.length - 1];
}

function updateHUD() {
  $('speed').textContent = Math.round(trainSpeed);
  $('speedBar').style.width =
    Math.min(100, trainSpeed / MAX_SPEED * 100) + '%';

  $('throttle').textContent = Math.round(throttle * 100) + '%';
  $('distance').textContent = distanceKm.toFixed(2);

  const station = getNextStation();
  const remaining = Math.max(0, station.km - distanceKm);

  $('stationName').textContent = station.name;
  $('stationDistance').textContent =
    remaining < 1
      ? `المسافة: ${Math.round(remaining * 1000)} متر`
      : `المسافة: ${remaining.toFixed(1)} كم`;

  if (finished) {
    $('mission').textContent = 'وصلت إلى نهاية الرحلة';
  } else if (remaining < 0.2 && trainSpeed < 3) {
    $('mission').textContent = 'تم التوقف بالقرب من المحطة';
  } else if (remaining < 1 && trainSpeed > 50) {
    $('mission').textContent = 'خفّض السرعة استعدادًا للمحطة';
  } else {
    $('mission').textContent = 'تابع القيادة بأمان';
  }
}

function moveWorld(delta) {
  // تحويل السرعة من كم/ساعة إلى حركة مشهد تقريبية
  const movement = trainSpeed / 3.6 * delta * 1.5;

  for (const sleeper of sleepers) {
    sleeper.position.z += movement;
    if (sleeper.position.z > 5) {
      sleeper.position.z -= segmentCount * segmentLength;
    }
  }

  for (const item of sceneryItems) {
    item.position.z += movement;
    if (item.position.z > 25) {
      item.position.z -= 550;
    }
  }

  // اهتزاز بسيط للكابينة أثناء الحركة
  const t = clock.elapsedTime;
  const shake = trainSpeed > 3 ? Math.min(trainSpeed / 120, 1) : 0;

  camera.position.x = Math.sin(t * 7) * 0.025 * shake;
  camera.position.y = 3.15 + Math.sin(t * 11) * 0.018 * shake;
  camera.position.z = 5.8;

  camera.rotation.z = Math.sin(t * 2) * 0.002 * shake;
}

function checkStations() {
  for (let i = 1; i < stations.length; i++) {
    const station = stations[i];

    if (distanceKm >= station.km && lastStationIndex < i) {
      lastStationIndex = i;
      showToast(`🚉 وصلت إلى منطقة محطة ${station.name}`);

      if (i === stations.length - 1) {
        finished = true;
        showToast('🏁 انتهت الرحلة التجريبية! أحسنت القيادة.');
      }
    }
  }
}

function updatePhysics(delta) {
  if (paused || finished) return;

  if (accelerating && !braking) {
    trainSpeed += 13 * delta;
    throttle = Math.min(1, throttle + 0.8 * delta);
  } else {
    throttle = Math.max(0, throttle - 0.35 * delta);
  }

  if (braking) {
    trainSpeed -= 30 * delta;
  } else if (!accelerating) {
    // مقاومة الحركة عند ترك دواسة التسارع
    trainSpeed -= (0.7 + trainSpeed * 0.015) * delta;
  }

  trainSpeed = THREE.MathUtils.clamp(trainSpeed, 0, MAX_SPEED);

  distanceKm += trainSpeed / 3600 * delta;
  checkStations();
  moveWorld(delta);
  updateHUD();
}

function animate() {
  animationId = requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  if (!paused) {
    updatePhysics(delta);
    renderer.render(scene, camera);
  }
}

function setPressed(id, callbackDown, callbackUp) {
  const btn = $(id);

  btn.addEventListener('pointerdown', e => {
    e.preventDefault();
    btn.setPointerCapture?.(e.pointerId);
    btn.classList.add('active');
    callbackDown();
  });

  const release = e => {
    if (e) e.preventDefault();
    btn.classList.remove('active');
    callbackUp();
  };

  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('lostpointercapture', release);
  btn.addEventListener('contextmenu', e => e.preventDefault());
}

function playHorn() {
  try {
    if (!hornAudio) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        showToast('البوق الصوتي غير مدعوم في هذا المتصفح');
        return;
      }

      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(175, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.55);
      gain.gain.exponentialRampToValueAtTime(
        0.0001, ctx.currentTime + 0.8
      );

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
      hornAudio = { ctx };
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } else {
      hornAudio.ctx.resume();
      const ctx = hornAudio.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = 195;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001, ctx.currentTime + 0.65
      );

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    }
  } catch (error) {
    showToast('تعذر تشغيل البوق الصوتي');
  }
}

function togglePause() {
  paused = !paused;
  $('pauseScreen').classList.toggle('hidden', !paused);
  $('pauseBtn').textContent = paused ? '▶' : 'Ⅱ';
  accelerating = false;
  braking = false;

  if (paused) {
    showToast('تم إيقاف الرحلة مؤقتًا');
  }
}

function resetGame() {
  trainSpeed = 0;
  distanceKm = 0;
  throttle = 0;
  braking = false;
  accelerating = false;
  paused = false;
  finished = false;
  lastStationIndex = -1;

  sleepers.forEach((s, i) => {
    s.position.z = -i * segmentLength;
  });

  sceneryItems.forEach((item, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    item.position.z = -18 - i * 11;
    item.position.x = side * (11 + (i % 5) * 3);
  });

  $('pauseScreen').classList.add('hidden');
  $('pauseBtn').textContent = 'Ⅱ';

  updateHUD();
  showToast('بدأت رحلة جديدة من المنيا');
}

function handleKeyDown(e) {
  if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
    e.preventDefault();
  }

  if (e.repeat) return;

  if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
    accelerating = true;
  }

  if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
    braking = true;
  }

  if (e.key === ' ') playHorn();

  if (e.key.toLowerCase() === 'p') togglePause();
}

function handleKeyUp(e) {
  if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
    accelerating = false;
  }

  if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
    braking = false;
  }
}

function init() {
  try {
    loadingText.textContent = 'جاري إنشاء المسار والمناظر المصرية...';

    createWorld();

    setPressed('accelBtn',
      () => { accelerating = true; },
      () => { accelerating = false; }
    );

    setPressed('brakeBtn',
      () => { braking = true; },
      () => { braking = false; }
    );

    $('hornBtn').addEventListener('click', playHorn);
    $('pauseBtn').addEventListener('click', togglePause);
    $('resumeBtn').addEventListener('click', togglePause);
    $('resetBtn').addEventListener('click', resetGame);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    window.addEventListener('blur', () => {
      accelerating = false;
      braking = false;
    });

    window.addEventListener('resize', () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
      );
    });

    updateHUD();
    loading.classList.add('hidden');
    showToast('اضغط على تسارع لبدء الرحلة 🚆');

    animate();
  } catch (error) {
    console.error(error);
    loadingText.textContent =
      'تعذر تشغيل اللعبة. تأكد من اتصال الإنترنت ودعم WebGL.';
  }
}

init();
