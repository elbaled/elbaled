// إعدادات المشهد والكاميرا
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // لون السماء
scene.fog = new THREE.Fog(0x87CEEB, 100, 1500); // ضباب لإخفاء نهاية الخريطة

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
// موضع الكاميرا (كابينة السائق)
camera.position.set(0, 3.5, 0); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// الإضاءة
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(100, 200, 50);
scene.add(dirLight);

// بناء البيئة (الأرض والحقول)
const groundGeo = new THREE.PlaneGeometry(2000, 30000);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x55aa55 }); // لون أخضر للحقول
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.z = -14000;
scene.add(ground);

// بناء شريط السكة الحديد
const trackGroup = new THREE.Group();

// القضبان الحديدية
const railGeo = new THREE.BoxGeometry(0.1, 0.2, 30000);
const railMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const leftRail = new THREE.Mesh(railGeo, railMat);
leftRail.position.set(-1, 0.1, -14000);
const rightRail = new THREE.Mesh(railGeo, railMat);
rightRail.position.set(1, 0.1, -14000);
trackGroup.add(leftRail);
trackGroup.add(rightRail);

// الفلنكات (الأخشاب العرضية) باستخدام InstancedMesh للأداء العالي
const sleeperGeo = new THREE.BoxGeometry(3, 0.1, 0.5);
const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
const sleeperCount = 6000; // عدد الفلنكات
const sleepers = new THREE.InstancedMesh(sleeperGeo, sleeperMat, sleeperCount);

const dummy = new THREE.Object3D();
for (let i = 0; i < sleeperCount; i++) {
    dummy.position.set(0, 0.05, -(i * 5));
    dummy.updateMatrix();
    sleepers.setMatrixAt(i, dummy.matrix);
}
trackGroup.add(sleepers);
scene.add(trackGroup);

// المحطات
const stations = [
    { name: "الجيزة", z: -2000 },
    { name: "بني سويف", z: -6000 },
    { name: "المنيا", z: -10000 },
    { name: "أسيوط", z: -15000 },
    { name: "الأقصر", z: -20000 },
    { name: "أسوان", z: -26000 }
];

stations.forEach(station => {
    // رصيف المحطة
    const platformGeo = new THREE.BoxGeometry(10, 1.5, 200);
    const platformMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(6, 0.75, station.z);
    scene.add(platform);

    // مبنى المحطة (بسيط)
    const buildingGeo = new THREE.BoxGeometry(8, 10, 50);
    const buildingMat = new THREE.MeshLambertMaterial({ color: 0xf39c12 });
    const building = new THREE.Mesh(buildingGeo, buildingMat);
    building.position.set(12, 5, station.z);
    scene.add(building);
});

// فيزياء القطار
let speed = 0;
const maxSpeed = 120; // كم/س
const acceleration = 0.05;
const brakingForce = 0.15;
const friction = 0.01;

// حالة الأزرار
const controlsState = {
    accelerate: false,
    brake: false
};

// ربط واجهة المستخدم
const speedDisplay = document.getElementById('speed-display');
const stationDisplay = document.getElementById('station-display');
const messageOverlay = document.getElementById('message-overlay');
const btnAccel = document.getElementById('btn-accel');
const btnBrake = document.getElementById('btn-brake');

// أحداث لوحة المفاتيح
window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') controlsState.accelerate = true;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') controlsState.brake = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') controlsState.accelerate = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') controlsState.brake = false;
});

// أحداث اللمس للموبايل
btnAccel.addEventListener('touchstart', (e) => { e.preventDefault(); controlsState.accelerate = true; });
btnAccel.addEventListener('touchend', (e) => { e.preventDefault(); controlsState.accelerate = false; });
btnAccel.addEventListener('mousedown', () => controlsState.accelerate = true);
btnAccel.addEventListener('mouseup', () => controlsState.accelerate = false);

btnBrake.addEventListener('touchstart', (e) => { e.preventDefault(); controlsState.brake = true; });
btnBrake.addEventListener('touchend', (e) => { e.preventDefault(); controlsState.brake = false; });
btnBrake.addEventListener('mousedown', () => controlsState.brake = true);
btnBrake.addEventListener('mouseup', () => controlsState.brake = false);

// إخفاء رسالة الترحيب بعد قليل
setTimeout(() => { messageOverlay.style.opacity = '0'; }, 4000);

function showMessage(text) {
    messageOverlay.innerHTML = text;
    messageOverlay.style.opacity = '1';
    setTimeout(() => { messageOverlay.style.opacity = '0'; }, 3000);
}

// دالة التحديث المستمر (Render Loop)
let lastStationIndex = 0;

function animate() {
    requestAnimationFrame(animate);

    // حساب التسارع والفرامل
    if (controlsState.accelerate && speed < maxSpeed) {
        speed += acceleration;
    } else if (controlsState.brake && speed > 0) {
        speed -= brakingForce;
    } else {
        // الاحتكاك (توقف تدريجي)
        if (speed > 0) speed -= friction;
    }

    // منع السرعة من أن تصبح سالبة
    if (speed < 0) speed = 0;

    // تحديث لون السرعة (أخضر=أمان، برتقالي=تحذير، أحمر=سرعة قصوى)
    if (speed < 60) speedDisplay.style.color = "#00ff00";
    else if (speed < 100) speedDisplay.style.color = "#f39c12";
    else speedDisplay.style.color = "#ff0000";

    // تحريك الكاميرا (القطار) للأمام في محور Z
    // يتم ضرب السرعة في معامل لتبدو الحركة واقعية بالنسبة للمقياس
    const speedFactor = speed * 0.05; 
    camera.position.z -= speedFactor;

    // تحديث الواجهة
    speedDisplay.innerText = Math.floor(speed);

    // منطق المحطات
    let nextStation = stations[lastStationIndex];
    if (nextStation) {
        // المسافة للمحطة
        let distance = Math.abs(camera.position.z - nextStation.z);
        
        // عرض المسافة (نضرب في 5 لتبدو الأرقام كأنها أمتار واقعية)
        stationDisplay.innerText = `${nextStation.name} (${Math.floor(distance * 5)}م)`;

        // إذا اقتربنا جداً من المحطة
        if (distance < 50) {
            if (speed < 1) {
                showMessage(`توقف ممتاز في محطة ${nextStation.name}!`);
                lastStationIndex++; // الانتقال للهدف التالي
            } else if (camera.position.z < nextStation.z - 50) {
                // تجاوز المحطة بدون توقف
                showMessage(`لقد تجاوزت محطة ${nextStation.name}!`);
                lastStationIndex++;
            }
        }
    } else {
        stationDisplay.innerText = "نهاية الخط (أسوان)";
        if (speed === 0) showMessage("نهاية الرحلة، شكراً لركوبكم قطارات مصر!");
    }

    renderer.render(scene, camera);
}

// تعديل حجم الشاشة عند تدوير الموبايل أو تغيير حجم النافذة
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// بدء اللعبة
animate();
