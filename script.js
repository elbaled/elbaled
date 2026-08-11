/* =========================================================
   خدمة أهل البلد
   النسخة التجريبية النهائية
   ========================================================= */


/* =========================
   مفاتيح التخزين
========================= */

const USERS_KEY = "ahlElBaladUsers";
const SERVICES_KEY = "ahlElBaladServices";
const CURRENT_USER_KEY = "ahlElBaladCurrentUser";


/* =========================
   حساب Admin التجريبي
========================= */

const ADMIN_EMAIL = "admin@ahlelbald.com";
const ADMIN_PASSWORD = "Admin123";


/* =========================
   البيانات الافتراضية
========================= */

const defaultServices = [
    {
        id: "default-1",
        name: "مطعم أهل البلد",
        ownerId: "admin",
        provider: "إدارة أهل البلد",
        category: "مطاعم",
        phone: "01000000000",
        address: "وسط البلد",
        description: "مطعم يقدم الوجبات والمأكولات المحلية والعائلية.",
        icon: "🍔",
        active: true
    },
    {
        id: "default-2",
        name: "صيدلية الشفاء",
        ownerId: "admin",
        provider: "إدارة أهل البلد",
        category: "صيدليات",
        phone: "01022222222",
        address: "شارع الرئيسي",
        description: "صيدلية توفر الأدوية والمستلزمات الطبية.",
        icon: "💊",
        active: true
    },
    {
        id: "default-3",
        name: "سباك محترف",
        ownerId: "admin",
        provider: "إدارة أهل البلد",
        category: "حرفيين",
        phone: "01044444444",
        address: "المنطقة الشرقية",
        description: "خدمات السباكة وإصلاح الأعطال المنزلية.",
        icon: "🔧",
        active: true
    },
    {
        id: "default-4",
        name: "سوبر ماركت البلد",
        ownerId: "admin",
        provider: "إدارة أهل البلد",
        category: "محلات",
        phone: "01066666666",
        address: "شارع السوق",
        description: "مواد غذائية ومستلزمات منزلية.",
        icon: "🛒",
        active: true
    },
    {
        id: "default-5",
        name: "تاكسي البلد",
        ownerId: "admin",
        provider: "إدارة أهل البلد",
        category: "مواصلات",
        phone: "01088888888",
        address: "موقف البلد",
        description: "خدمة توصيل داخل البلد والمناطق القريبة.",
        icon: "🚕",
        active: true
    },
    {
        id: "default-6",
        name: "موظف مبيعات",
        ownerId: "admin",
        provider: "شركة أهل البلد",
        category: "وظائف",
        phone: "01012345678",
        address: "وسط البلد",
        description: "فرصة عمل لموظف مبيعات بدوام كامل.",
        icon: "💼",
        active: true
    }
];


/* =========================
   تحميل البيانات
========================= */

let users = JSON.parse(
    localStorage.getItem(USERS_KEY)
) || [];

let services = JSON.parse(
    localStorage.getItem(SERVICES_KEY)
) || [];

let currentUser = JSON.parse(
    localStorage.getItem(CURRENT_USER_KEY)
) || null;


/* =========================
   إضافة حساب Admin تلقائيًا
========================= */

function createAdminIfNeeded() {

    const adminExists = users.some(
        user => user.id === "admin"
    );

    if (!adminExists) {

        users.push({
            id: "admin",
            name: "أحمد - مطور الموقع",
            email: ADMIN_EMAIL,
            phone: "01000000000",
            password: ADMIN_PASSWORD,
            role: "admin",
            active: true
        });

        saveUsers();
    }
}


function initializeServices() {

    if (!localStorage.getItem(SERVICES_KEY)) {

        services = [...defaultServices];

        saveServices();

    }

}


/* =========================
   الحفظ
========================= */

function saveUsers() {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


function saveServices() {

    localStorage.setItem(
        SERVICES_KEY,
        JSON.stringify(services)
    );

}


/* =========================
   عناصر الصفحة
========================= */

const accountBtn =
    document.getElementById("accountBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const loginModal =
    document.getElementById("loginModal");

const registerModal =
    document.getElementById("registerModal");

const addModal =
    document.getElementById("addModal");

const detailsModal =
    document.getElementById("detailsModal");

const accountEditModal =
    document.getElementById("accountEditModal");

const servicesList =
    document.getElementById("servicesList");

const myServicesList =
    document.getElementById("myServicesList");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const serviceCount =
    document.getElementById("serviceCount");

const servicesTitle =
    document.getElementById("servicesTitle");

const emptyMessage =
    document.getElementById("emptyMessage");


/* =========================
   الأدوات
========================= */

function generateId() {

    return Date.now().toString()
        + Math.random()
            .toString(36)
            .substring(2, 8);

}


function getIcon(category) {

    const icons = {

        "مطاعم": "🍔",
        "صيدليات": "💊",
        "حرفيين": "🔧",
        "محلات": "🛒",
        "مواصلات": "🚕",
        "وظائف": "💼"

    };

    return icons[category] || "🏪";

}


function getUserById(id) {

    return users.find(
        user => user.id === id
    );

}


/* =========================
   عرض الخدمات
========================= */

function renderServices(list = services) {

    servicesList.innerHTML = "";

    const activeServices =
        list.filter(service => service.active !== false);

    serviceCount.textContent =
        `${activeServices.length} خدمة`;

    if (activeServices.length === 0) {

        emptyMessage.classList.remove("hidden");

        return;

    }

    emptyMessage.classList.add("hidden");


    activeServices.forEach(service => {

        const card =
            document.createElement("div");

        card.className = "service-card";

        const owner =
            getUserById(service.ownerId);

        const ownerName =
            owner
                ? owner.name
                : service.provider;

        card.innerHTML = `

            <div class="service-top">

                <div class="service-icon">
                    ${service.icon}
                </div>

                <div>

                    <h3>
                        ${escapeHTML(service.name)}
                    </h3>

                    <p>
                        ${escapeHTML(service.provider)}
                    </p>

                    <p>
                        📂 ${escapeHTML(service.category)}
                    </p>

                </div>

            </div>

            <div class="service-info">

                📍 ${escapeHTML(service.address)}

                <p class="service-owner">
                    👤 صاحب الخدمة: ${escapeHTML(ownerName)}
                </p>

            </div>

        `;

        card.addEventListener(
            "click",
            () => showDetails(service)
        );

        servicesList.appendChild(card);

    });

}


/* =========================
   تفاصيل الخدمة
========================= */

function showDetails(service) {

    const owner =
        getUserById(service.ownerId);

    const ownerName =
        owner
            ? owner.name
            : service.provider;

    document.getElementById(
        "detailsContent"
    ).innerHTML = `

        <div class="details-icon">
            ${service.icon}
        </div>

        <h2 class="details-title">
            ${escapeHTML(service.name)}
        </h2>

        <p class="details-provider">
            👤 صاحب الخدمة:
            ${escapeHTML(ownerName)}
        </p>

        <div class="detail-row">
            <b>📂 التصنيف</b>
            <br>
            ${escapeHTML(service.category)}
        </div>

        <div class="detail-row">
            <b>📍 العنوان</b>
            <br>
            ${escapeHTML(service.address)}
        </div>

        <div class="detail-row">
            <b>📞 الهاتف</b>
            <br>
            ${escapeHTML(service.phone)}
        </div>

        <div class="detail-row">
            <b>📝 الوصف</b>
            <br>
            ${escapeHTML(service.description)}
        </div>

    `;

    detailsModal.classList.remove("hidden");

}


/* =========================
   البحث
========================= */

function searchServices() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    if (!query) {

        servicesTitle.textContent =
            "الخدمات المتاحة";

        renderServices();

        return;
    }


    const results =
        services.filter(service => {

            const text = `

                ${service.name}
                ${service.provider}
                ${service.category}
                ${service.address}
                ${service.description}

            `.toLowerCase();

            return text.includes(query);

        });


    servicesTitle.textContent =
        `نتائج البحث عن "${searchInput.value}"`;

    renderServices(results);

}


searchInput.addEventListener(
    "input",
    searchServices
);

searchBtn.addEventListener(
    "click",
    searchServices
);


/* =========================
   التصنيفات
========================= */

document.querySelectorAll(
    ".category"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const category =
                button.dataset.category;

            const results =
                services.filter(
                    service =>
                        service.category === category &&
                        service.active !== false
                );

            servicesTitle.textContent =
                `خدمات ${category}`;

            renderServices(results);

            document
                .querySelector(".services-section")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

});


/* =========================
   عرض الكل
========================= */

document.getElementById(
    "showAllBtn"
).addEventListener(
    "click",
    () => {

        searchInput.value = "";

        servicesTitle.textContent =
            "الخدمات المتاحة";

        renderServices();

    }
);


/* =========================
   فتح الحساب
========================= */

accountBtn.addEventListener(
    "click",
    () => {

        if (!currentUser) {

            loginModal.classList.remove(
                "hidden"
            );

        } else {

            document
                .getElementById("accountSection")
                .classList.remove("hidden");

            updateAccountUI();

            document
                .getElementById("accountSection")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }

    }
);


/* =========================
   تسجيل الدخول
========================= */

document.getElementById(
    "loginForm"
).addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const email =
            document.getElementById(
                "loginEmail"
            ).value
                .trim()
                .toLowerCase();

        const password =
            document.getElementById(
                "loginPassword"
            ).value;


        const user =
            users.find(
                item =>
                    item.email.toLowerCase() === email &&
                    item.password === password
            );


        if (!user) {

            alert(
                "❌ البريد الإلكتروني أو كلمة المرور غير صحيحة"
            );

            return;

        }


        if (user.active === false) {

            alert(
                "🚫 هذا الحساب معطل من الإدارة"
            );

            return;

        }


        currentUser = user;

        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(currentUser)
        );


        loginModal.classList.add(
            "hidden"
        );

        document.getElementById(
            "loginForm"
        ).reset();


        updateAccountUI();

        alert(
            `✅ أهلاً بيك ${user.name}`
        );

    }
);


/* =========================
   إنشاء حساب
========================= */

document.getElementById(
    "registerForm"
).addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const name =
            document.getElementById(
                "registerName"
            ).value.trim();

        const email =
            document.getElementById(
                "registerEmail"
            ).value.trim().toLowerCase();

        const phone =
            document.getElementById(
                "registerPhone"
            ).value.trim();

        const password =
            document.getElementById(
                "registerPassword"
            ).value;


        const emailExists =
            users.some(
                user =>
                    user.email.toLowerCase() === email
            );


        if (emailExists) {

            alert(
                "⚠️ هذا البريد الإلكتروني مستخدم بالفعل"
            );

            return;

        }


        const newUser = {

            id: generateId(),

            name,

            email,

            phone,

            password,

            role: "user",

            active: true

        };


        users.push(newUser);

        saveUsers();


        currentUser = newUser;

        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(currentUser)
        );


        registerModal.classList.add(
            "hidden"
        );

        document.getElementById(
            "registerForm"
        ).reset();


        updateAccountUI();


        alert(
            "✅ تم إنشاء الحساب وتسجيل الدخول بنجاح"
        );

    }
);


/* =========================
   الانتقال بين Login/Register
========================= */

document.getElementById(
    "openRegisterFromLogin"
).addEventListener(
    "click",
    () => {

        loginModal.classList.add(
            "hidden"
        );

        registerModal.classList.remove(
            "hidden"
        );

    }
);


document.getElementById(
    "openLoginFromRegister"
).addEventListener(
    "click",
    () => {

        registerModal.classList.add(
            "hidden"
        );

        loginModal.classList.remove(
            "hidden"
        );

    }
);


/* =========================
   تسجيل الخروج
========================= */

logoutBtn.addEventListener(
    "click",
    () => {

        currentUser = null;

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

        updateAccountUI();

        alert(
            "✅ تم تسجيل الخروج"
        );

    }
);


/* =========================
   تحديث واجهة الحساب
========================= */

function updateAccountUI() {

    const accountSection =
        document.getElementById(
            "accountSection"
        );

    const myServicesSection =
        document.getElementById(
            "myServicesSection"
        );

    const adminSection =
        document.getElementById(
            "adminSection"
        );


    if (!currentUser) {

        accountBtn.textContent =
            "👤 تسجيل الدخول";

        logoutBtn.classList.add(
            "hidden"
        );

        accountSection.classList.add(
            "hidden"
        );

        myServicesSection.classList.add(
            "hidden"
        );

        adminSection.classList.add(
            "hidden"
        );

        return;

    }


    accountBtn.textContent =
        `👤 ${currentUser.name}`;

    logoutBtn.classList.remove(
        "hidden"
    );

    accountSection.classList.remove(
        "hidden"
    );

    myServicesSection.classList.remove(
        "hidden"
    );


    document.getElementById(
        "accountName"
    ).textContent =
        currentUser.name;


    document.getElementById(
        "accountEmail"
    ).textContent =
        `📧 ${currentUser.email}`;


    document.getElementById(
        "accountPhone"
    ).textContent =
        `📞 ${currentUser.phone}`;


    renderMyServices();


    if (currentUser.role === "admin") {

        adminSection.classList.remove(
            "hidden"
        );

        renderAdmin();

    } else {

        adminSection.classList.add(
            "hidden"
        );

    }

}


/* =========================
   إضافة / تعديل خدمة
========================= */

document.getElementById(
    "openAddBtn"
).addEventListener(
    "click",
    () => {

        if (!currentUser) {

            alert(
                "⚠️ لازم تعمل تسجيل دخول أولاً"
            );

            loginModal.classList.remove(
                "hidden"
            );

            return;

        }


        openAddServiceModal();

    }
);


function openAddServiceModal() {

    document.getElementById(
        "serviceModalTitle"
    ).textContent =
        "إضافة خدمة جديدة";


    document.getElementById(
        "editServiceId"
    ).value = "";


    document.getElementById(
        "serviceForm"
    ).reset();


    addModal.classList.remove(
        "hidden"
    );

}


function openEditService(service) {

    document.getElementById(
        "serviceModalTitle"
    ).textContent =
        "تعديل الخدمة";


    document.getElementById(
        "editServiceId"
    ).value =
        service.id;


    document.getElementById(
        "serviceName"
    ).value =
        service.name;


    document.getElementById(
        "category"
    ).value =
        service.category;


    document.getElementById(
        "phone"
    ).value =
        service.phone;


    document.getElementById(
        "address"
    ).value =
        service.address;


    document.getElementById(
        "description"
    ).value =
        service.description;


    addModal.classList.remove(
        "hidden"
    );

}


document.getElementById(
    "serviceForm"
).addEventListener(
    "submit",
    event => {

        event.preventDefault();


        if (!currentUser) {

            alert(
                "⚠️ سجل الدخول أولاً"
            );

            return;

        }


        const editId =
            document.getElementById(
                "editServiceId"
            ).value;


        const name =
            document.getElementById(
                "serviceName"
            ).value.trim();


        const category =
            document.getElementById(
                "category"
            ).value;


        const phone =
            document.getElementById(
                "phone"
            ).value.trim();


        const address =
            document.getElementById(
                "address"
            ).value.trim();


        const description =
            document.getElementById(
                "description"
            ).value.trim();


        if (editId) {

            const service =
                services.find(
                    item =>
                        item.id === editId
                );


            if (!service) {

                alert(
                    "❌ الخدمة غير موجودة"
                );

                return;

            }


            if (
                service.ownerId !== currentUser.id &&
                currentUser.role !== "admin"
            ) {

                alert(
                    "🚫 لا يمكنك تعديل هذه الخدمة"
                );

                return;

            }


            service.name = name;
            service.category = category;
            service.phone = phone;
            service.address = address;
            service.description = description;
            service.icon = getIcon(category);


            saveServices();

            addModal.classList.add(
                "hidden"
            );

            renderServices();

            renderMyServices();

            if (
                currentUser.role === "admin"
            ) {
                renderAdmin();
            }


            alert(
                "✅ تم تعديل الخدمة بنجاح"
            );


            return;

        }


        const newService = {

            id: generateId(),

            name,

            ownerId: currentUser.id,

            provider: currentUser.name,

            category,

            phone,

            address,

            description,

            icon: getIcon(category),

            active: true

        };


        services.push(
            newService
        );

        saveServices();


        addModal.classList.add(
            "hidden"
        );


        document.getElementById(
            "serviceForm"
        ).reset();


        renderServices();

        renderMyServices();


        if (
            currentUser.role === "admin"
        ) {
            renderAdmin();
        }


        alert(
            "✅ تم نشر الخدمة وربطها بحسابك"
        );

    }
);


/* =========================
   خدماتي
========================= */

function renderMyServices() {

    if (!currentUser) {
        return;
    }


    const myServices =
        services.filter(
            service =>
                service.ownerId === currentUser.id
        );


    document.getElementById(
        "myServicesCount"
    ).textContent =
        `${myServices.length} خدمة`;


    myServicesList.innerHTML = "";


    if (myServices.length === 0) {

        myServicesList.innerHTML = `
            <div class="empty">
                <div>📦</div>
                <h3>لسه مفيش خدمات</h3>
                <p>
                    أضف أول خدمة من زر إضافة خدمة
                </p>
            </div>
        `;

        return;

    }


    myServices.forEach(
        service => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "service-card";


            card.innerHTML = `

                <div class="service-top">

                    <div class="service-icon">
                        ${service.icon}
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(service.name)}
                        </h3>

                        <p>
                            ${escapeHTML(service.category)}
                        </p>

                        <p>
                            حالة الخدمة:
                            ${
                                service.active !== false
                                    ? "🟢 مفعلة"
                                    : "🔴 معطلة"
                            }
                        </p>

                    </div>

                </div>

                <div class="service-info">

                    📍 ${escapeHTML(service.address)}

                    <div class="admin-actions">

                        <button
                            class="edit-btn"
                            data-edit="${service.id}"
                        >
                            ✏️ تعديل
                        </button>

                        <button
                            class="danger-btn"
                            data-delete="${service.id}"
                        >
                            🗑️ حذف
                        </button>

                    </div>

                </div>

            `;


            myServicesList.appendChild(
                card
            );

        }
    );


    document
        .querySelectorAll(
            "[data-edit]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        const service =
                            services.find(
                                item =>
                                    item.id ===
                                    button.dataset.edit
                            );

                        if (service) {
                            openEditService(
                                service
                            );
                        }

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-delete]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        deleteMyService(
                            button.dataset.delete
                        );

                    }
                );

            }
        );

}


function deleteMyService(id) {

    const service =
        services.find(
            item => item.id === id
        );


    if (!service) {
        return;
    }


    if (
        service.ownerId !== currentUser.id &&
        currentUser.role !== "admin"
    ) {

        alert(
            "🚫 لا يمكنك حذف هذه الخدمة"
        );

        return;

    }


    const confirmDelete =
        confirm(
            "هل أنت متأكد من حذف الخدمة؟"
        );


    if (!confirmDelete) {
        return;
    }


    services =
        services.filter(
            item => item.id !== id
        );


    saveServices();

    renderServices();

    renderMyServices();

    if (
        currentUser.role === "admin"
    ) {
        renderAdmin();
    }


    alert(
        "✅ تم حذف الخدمة"
    );

}


/* =========================
   تعديل الحساب
========================= */

document.getElementById(
    "editAccountBtn"
).addEventListener(
    "click",
    () => {

        if (!currentUser) {
            return;
        }


        document.getElementById(
            "editAccountName"
        ).value =
            currentUser.name;


        document.getElementById(
            "editAccountPhone"
        ).value =
            currentUser.phone;


        accountEditModal.classList.remove(
            "hidden"
        );

    }
);


document.getElementById(
    "accountEditForm"
).addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const name =
            document.getElementById(
                "editAccountName"
            ).value.trim();


        const phone =
            document.getElementById(
                "editAccountPhone"
            ).value.trim();


        const user =
            users.find(
                item =>
                    item.id === currentUser.id
            );


        if (!user) {
            return;
        }


        user.name = name;
        user.phone = phone;


        currentUser = {
            ...user
        };


        saveUsers();


        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(currentUser)
        );


        /*
          تحديث اسم صاحب الخدمة
          للخدمات التي يملكها المستخدم
        */

        services.forEach(
            service => {

                if (
                    service.ownerId ===
                    currentUser.id
                ) {

                    service.provider =
                        name;

                }

            }
        );


        saveServices();


        accountEditModal.classList.add(
            "hidden"
        );


        updateAccountUI();

        renderServices();


        alert(
            "✅ تم تحديث بيانات الحساب"
        );

    }
);


/* =========================
   لوحة Admin
========================= */

function renderAdmin() {

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {
        return;
    }


    document.getElementById(
        "adminUsersCount"
    ).textContent =
        users.length;


    document.getElementById(
        "adminServicesCount"
    ).textContent =
        services.length;


    const adminServicesList =
        document.getElementById(
            "adminServicesList"
        );


    adminServicesList.innerHTML = "";


    services.forEach(
        service => {

            const owner =
                getUserById(
                    service.ownerId
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-item";


            item.innerHTML = `

                <strong>
                    ${escapeHTML(service.name)}
                </strong>

                <p>
                    صاحب الخدمة:
                    ${
                        owner
                            ? escapeHTML(owner.name)
                            : "غير معروف"
                    }
                </p>

                <p>
                    الحالة:
                    ${
                        service.active !== false
                            ? "🟢 مفعلة"
                            : "🔴 معطلة"
                    }
                </p>

                <div class="admin-actions">

                    <button
                        class="edit-btn"
                        data-admin-edit="${service.id}"
                    >
                        ✏️ تعديل
                    </button>

                    <button
                        class="edit-btn"
                        data-toggle-service="${service.id}"
                    >
                        ${
                            service.active !== false
                                ? "⛔ تعطيل"
                                : "✅ تفعيل"
                        }
                    </button>

                    <button
                        class="danger-btn"
                        data-admin-delete="${service.id}"
                    >
                        🗑️ حذف
                    </button>

                </div>

            `;


            adminServicesList.appendChild(
                item
            );

        }
    );


    const adminUsersList =
        document.getElementById(
            "adminUsersList"
        );


    adminUsersList.innerHTML = "";


    users.forEach(
        user => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-item";


            item.innerHTML = `

                <strong>
                    ${escapeHTML(user.name)}
                </strong>

                <p>
                    📧 ${escapeHTML(user.email)}
                </p>

                <p>
                    📞 ${escapeHTML(user.phone)}
                </p>

                <p>
                    الدور:
                    ${
                        user.role === "admin"
                            ? "🛠️ Admin"
                            : "👤 مستخدم"
                    }
                </p>

                <p>
                    الحالة:
                    ${
                        user.active !== false
                            ? "🟢 فعال"
                            : "🔴 معطل"
                    }
                </p>

                ${
                    user.id !== "admin"
                        ? `
                            <div class="admin-actions">

                                <button
                                    class="edit-btn"
                                    data-toggle-user="${user.id}"
                                >
                                    ${
                                        user.active !== false
                                            ? "⛔ تعطيل الحساب"
                                            : "✅ تفعيل الحساب"
                                    }
                                </button>

                                <button
                                    class="danger-btn"
                                    data-delete-user="${user.id}"
                                >
                                    🗑️ حذف الحساب
                                </button>

                            </div>
                        `
                        : ""
                }

            `;


            adminUsersList.appendChild(
                item
            );

        }
    );


    /* تعديل خدمة Admin */

    document
        .querySelectorAll(
            "[data-admin-edit]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const service =
                            services.find(
                                item =>
                                    item.id ===
                                    button.dataset.adminEdit
                            );

                        if (service) {
                            openEditService(
                                service
                            );
                        }

                    }
                );

            }
        );


    /* تعطيل / تفعيل الخدمة */

    document
        .querySelectorAll(
            "[data-toggle-service]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const service =
                            services.find(
                                item =>
                                    item.id ===
                                    button.dataset.toggleService
                            );

                        if (!service) {
                            return;
                        }


                        service.active =
                            service.active === false;


                        saveServices();

                        renderServices();

                        renderAdmin();

                        renderMyServices();

                    }
                );

            }
        );


    /* حذف خدمة Admin */

    document
        .querySelectorAll(
            "[data-admin-delete]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteAdminService(
                            button.dataset.adminDelete
                        );

                    }
                );

            }
        );


    /* تعطيل / تفعيل الحساب */

    document
        .querySelectorAll(
            "[data-toggle-user]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const user =
                            users.find(
                                item =>
                                    item.id ===
                                    button.dataset.toggleUser
                            );

                        if (!user) {
                            return;
                        }


                        user.active =
                            user.active === false;


                        saveUsers();

                        renderAdmin();

                        alert(
                            user.active
                                ? "✅ تم تفعيل الحساب"
                                : "⛔ تم تعطيل الحساب"
                        );

                    }
                );

            }
        );


    /* حذف حساب */

    document
        .querySelectorAll(
            "[data-delete-user]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteUser(
                            button.dataset.deleteUser
                        );

                    }
                );

            }
        );

}


function deleteAdminService(id) {

    const confirmDelete =
        confirm(
            "هل تريد حذف هذه الخدمة نهائيًا؟"
        );


    if (!confirmDelete) {
        return;
    }


    services =
        services.filter(
            service =>
                service.id !== id
        );


    saveServices();

    renderServices();

    renderAdmin();

    renderMyServices();


    alert(
        "✅ تم حذف الخدمة"
    );

}


function deleteUser(id) {

    const user =
        users.find(
            item => item.id === id
        );


    if (!user) {
        return;
    }


    if (user.id === "admin") {

        alert(
            "🚫 لا يمكن حذف حساب Admin الرئيسي"
        );

        return;

    }


    const confirmDelete =
        confirm(
            `هل تريد حذف حساب ${user.name}؟`
        );


    if (!confirmDelete) {
        return;
    }


    users =
        users.filter(
            item => item.id !== id
        );


    /*
      حذف خدمات المستخدم أيضًا
    */

    services =
        services.filter(
            service =>
                service.ownerId !== id
        );


    saveUsers();

    saveServices();

    renderServices();

    renderAdmin();

    renderMyServices();


    alert(
        "✅ تم حذف الحساب وخدماته"
    );

}


/* =========================
   إغلاق النوافذ
========================= */

document.getElementById(
    "closeLogin"
).addEventListener(
    "click",
    () => loginModal.classList.add("hidden")
);


document.getElementById(
    "closeRegister"
).addEventListener(
    "click",
    () => registerModal.classList.add("hidden")
);


document.getElementById(
    "closeAdd"
).addEventListener(
    "click",
    () => addModal.classList.add("hidden")
);


document.getElementById(
    "closeDetails"
).addEventListener(
    "click",
    () => detailsModal.classList.add("hidden")
);


document.getElementById(
    "closeAccountEdit"
).addEventListener(
    "click",
    () =>
        accountEditModal.classList.add(
            "hidden"
        )
);


/* =========================
   الضغط خارج النافذة
========================= */

[
    loginModal,
    registerModal,
    addModal,
    detailsModal,
    accountEditModal
].forEach(
    modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );

                }

            }
        );

    }
);


/* =========================
   حماية النصوص
========================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================
   بدء الموقع
========================= */

createAdminIfNeeded();

initializeServices();

updateAccountUI();

renderServices();