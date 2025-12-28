/**
 * © 2025 Noel Messages - All Rights Reserved.
 * Unauthorized copying, distribution, or commercial use of this code is strictly prohibited.
 * 
 * Noel Tree - Holiday Messaging System
 * Firebase Realtime Database Integration
 * Active Period: December 1 - February 1
 */

// ==========================================
// Firebase Imports
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, push, set, get, onValue, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// ==========================================
// Firebase Configuration
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyAo_RM85FOJZ6oG8KoHVGOC4YUdQvz1kzo",
    authDomain: "noel-tree-dd3a9.firebaseapp.com",
    databaseURL: "https://noel-tree-dd3a9-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "noel-tree-dd3a9",
    storageBucket: "noel-tree-dd3a9.firebasestorage.app",
    messagingSenderId: "990178371830",
    appId: "1:990178371830:web:335a223d5d39658e3a64d7",
    measurementId: "G-7RQE3M8PJZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ==========================================
// Constants
// ==========================================

const ORNAMENT_EMOJIS = ['🎁', '⭐', '🔔', '❄️', '🎀', '🍪', '🦌', '🎄', '💝'];
const MAX_VISIBLE_ORNAMENTS = 10;

// Season start and end days
const SEASON_START_MONTH = 12; // Aralık
const SEASON_START_DAY = 1;
const SEASON_END_MONTH = 2;   // Şubat
const SEASON_END_DAY = 1;

// ==========================================
// Encryption Functions
// ==========================================

/**
 * Encrypt text (Base64 + XOR)
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key (tree ID)
 */
function encryptText(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
    }
    // Base64 encode
    return btoa(unescape(encodeURIComponent(result)));
}

/**
 * Decrypt encrypted text
 * @param {string} encrypted - Encrypted text
 * @param {string} key - Encryption key (tree ID)
 */
function decryptText(encrypted, key) {
    try {
        // Base64 decode
        const decoded = decodeURIComponent(escape(atob(encrypted)));
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return result;
    } catch (e) {
        console.error('Decryption error:', e);
        return '[Mesaj okunamadı]';
    }
}

// ==========================================
// Language Settings
// ==========================================

let currentLang = localStorage.getItem('noelTreeLang') || 'tr';

const translations = {
    tr: {
        flag: '🇹🇷',
        code: 'TR',
        title: 'Noel Ağacı',
        subtitle: 'Sevdiklerinize yeni yıl dileklerinizi bırakın',
        countdown: 'Yeni Yıla Kalan',
        createBtn: 'Kendi Ağacını Oluştur',
        visitBtn: 'Başka Ağaca Git',
        treeOwner: '{name} yılbaşı ağacı',
        shareBtn: 'Paylaş',
        messageBtn: 'Not Bırak',
        viewAllBtn: 'Notları Oku',
        modalTitle: '💌 Yeni Yıl Mesajı',
        modalAllTitle: '🎄 Tüm Mesajlar',
        nameLabel: 'Adın',
        msgLabel: 'Mesajın',
        namePlace: 'Adını yaz...',
        msgPlace: 'Dileklerini yaz...',
        sendBtn: 'Mesajı As',
        noMsg1: '🎄 Henüz mesaj yok!',
        noMsg2: 'İlk mesajı sen bırak!',
        copyToast: '✓ Link Kopyalandı!',
        deleteToast: 'Mesaj Silindi!',
        deleteConfirm: 'Bu mesajı silmek istediğine emin misin?',
        createdToast: 'Ağacın Hazır!',
        visitTitle: 'Ağaç Ziyaret Et',
        treeIdLabel: 'Ağaç ID',
        treeIdPlace: 'Ağaç ID veya Linki yapıştır',
        goBtn: 'Ağaca Git',
        visitTreeIdLabel: '🌲 Ağaç ID (Zorunlu)',
        visitAdminIdLabel: '🔐 Admin ID (Opsiyonel)',
        visitAdminPlace: 'Mesaj silmek için girin',
        visitHintNew: 'Admin ID olmadan ziyaretçi olarak girersiniz',
        visitError: 'Ağaç bulunamadı!',
        notFoundTitle: 'Ağaç Bulunamadı',
        notFoundSubtitle: 'Bu ID\'ye ait bir ağaç yok.',
        backToHome: 'Ana Sayfaya Dön',
        visitDesc: 'Ziyaret etmek istediğin ağacın ID\'sini gir:',
        visitHint: 'Admin ID ile girerseniz mesaj silebilirsiniz',
        loading: 'Yükleniyor...',
        days: 'Gün',
        hours: 'Saat',
        minutes: 'Dakika',
        seconds: 'Saniye',
        deleteBtnTitle: 'Mesajı Sil',
        newTreeBtn: 'Yeni Ağaç Oluştur',
        myTreeBtn: 'Ağacım',
        footerWishes: 'Mutlu Yıllar!',
        orText: 'veya',
        treeCreatedTitle: '✨ Ağaç Oluşturuldu!',
        treeCreatedDesc: 'Ağacın hazır! Aşağıdaki ID\'leri kaydet:',
        treeIdLabelPublic: '🌲 Ağaç ID (Paylaşılabilir):',
        adminIdLabel: '🔐 Admin ID (Gizli Tut!):',
        adminWarning: '⚠️ Admin ID\'yi kaybetme! Mesaj silmek için lazım.',
        goToTreeBtn: 'Ağacıma Git',
        cancelBtn: 'Vazgeç',
        copiedToast: '✅ Kopyalandı!',
        confirmNewTreeTitle: 'Yeni Ağaç Oluştur?',
        confirmNewTreeDesc: 'Mevcut ağacınız silinmeyecek, sadece yeni ağaç varsayılan olacak.',
        confirmNewTreeYes: 'Evet, Oluştur'
    },
    en: {
        flag: '', // Flag removed
        code: 'EN',
        title: 'Noel Messages',
        subtitle: 'Share your Christmas wishes!',
        countdown: 'Time Until New Year',
        createBtn: 'Create Your Own Tree',
        newTreeBtn: 'Create New Tree',
        myTreeBtn: 'Go to Tree',
        visitBtn: 'Visit a Tree',
        treeOwner: '{name}\'s Christmas Tree',
        shareBtn: 'Share Tree',
        messageBtn: 'Leave a Message',
        viewAllBtn: 'View All Notes',
        modalTitle: '💌 Christmas Message',
        modalAllTitle: '🎄 All Messages',
        nameLabel: 'Your Name',
        msgLabel: 'Your Message',
        namePlace: 'Type your name...',
        msgPlace: 'Type your wishes...',
        sendBtn: 'Hang Message',
        noMsg1: '🎄 No messages yet!',
        noMsg2: 'Be the first to leave one!',
        copyToast: '✓ Link Copied!',
        deleteToast: 'Message Deleted!',
        deleteConfirm: 'Are you sure you want to delete this message?',
        createdToast: 'Your Tree is Ready!',
        visitTitle: 'Visit a Tree',
        treeIdLabel: 'Tree ID',
        treeIdPlace: 'e.g. ABC123',
        goBtn: 'Go to Tree',
        visitTreeIdLabel: '🌲 Tree ID (Required)',
        visitAdminIdLabel: '🔐 Admin ID (Optional)',
        visitAdminPlace: 'Enter to delete messages',
        visitHintNew: 'Without Admin ID you enter as a visitor',
        visitError: 'Tree not found!',
        notFoundTitle: 'Tree Not Found',
        notFoundSubtitle: 'No tree exists with this ID.',
        backToHome: 'Back to Home',
        visitDesc: 'Enter the ID of the tree you want to visit:',
        visitHint: 'Enter Admin ID to delete messages',
        loading: 'Loading...',
        days: 'Days',
        hours: 'Hours',
        minutes: 'Minutes',
        seconds: 'Seconds',
        deleteBtnTitle: 'Delete Message',
        footerWishes: 'Happy New Year!',
        orText: 'or',
        treeCreatedTitle: '✨ Tree Created!',
        treeCreatedDesc: 'Your tree is ready! Save the IDs below:',
        treeIdLabelPublic: '🌲 Tree ID (Shareable):',
        adminIdLabel: '🔐 Admin ID (Keep Secret!):',
        adminWarning: '⚠️ Don\'t lose Admin ID! You need it to delete messages.',
        goToTreeBtn: 'Go to Tree',
        cancelBtn: 'Cancel',
        copiedToast: '✅ Copied!',
        confirmNewTreeTitle: 'Create New Tree?',
        confirmNewTreeDesc: 'Your current tree won\'t be deleted, only the new tree will be set as default.',
        confirmNewTreeYes: 'Yes, Create'
    }
};

/**
 * Toggle Language
 */
function toggleLanguage() {
    currentLang = currentLang === 'tr' ? 'en' : 'tr';
    localStorage.setItem('noelTreeLang', currentLang);
    updateLanguage();
}

/**
 * Update page texts with language
 */
function updateLanguage() {
    const t = translations[currentLang];

    // Page Title stays fixed as "Noel Messages"
    document.title = 'Noel Messages';

    // Update language button
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.querySelector('.lang-text').textContent = t.code;
    }

    // Headers (Hero) - App name stays "Noel Messages"
    const mainTitle = document.querySelector('.hero-content h1');
    if (mainTitle) mainTitle.innerHTML = `<span class="icon"></span> Noel Messages`;

    const subTitle = document.querySelector('.hero-content p');
    if (subTitle) subTitle.textContent = t.subtitle;

    // Headers (Logo Section - Yellow Title) - UPDATE ALL
    // (Update all copies in Off-season and Home screen)
    const logoTitles = document.querySelectorAll('.logo-section .title');
    logoTitles.forEach(el => el.textContent = t.title);

    const logoSubtitles = document.querySelectorAll('.logo-section .subtitle');
    logoSubtitles.forEach(el => el.textContent = t.subtitle);

    const countdownTitle = document.querySelector('.countdown-title');
    if (countdownTitle) countdownTitle.innerHTML = `✨ ${t.countdown} ✨`;

    // Home Screen Buttons (Dynamic Control)
    const createBtn = document.getElementById('create-tree-btn');
    if (createBtn) {
        const existingTreeId = getMyTree(); // Is there a saved tree?
        if (existingTreeId) {
            createBtn.innerHTML = `<span class="btn-icon">🎄</span> ${t.myTreeBtn}`;
        } else {
            createBtn.innerHTML = `<span class="btn-icon">🎁</span> ${t.createBtn}`;
        }
    }

    // New Tree Button (If exists)
    const newTreeBtn = document.getElementById('new-tree-btn') || document.getElementById('create-new-tree-btn');
    if (newTreeBtn) newTreeBtn.innerHTML = `<span class="btn-icon">✨</span> ${t.newTreeBtn}`;

    const visitBtn = document.getElementById('visit-tree-btn');
    if (visitBtn) visitBtn.innerHTML = `<span class="btn-icon">🔍</span> ${t.visitBtn}`;

    // Tree Screen Buttons
    const shareBtn = document.getElementById('share-tree-btn');
    if (shareBtn) shareBtn.innerHTML = `<span class="btn-icon">🔗</span> ${t.shareBtn}`;

    const addMsgBtn = document.getElementById('add-message-btn');
    if (addMsgBtn) addMsgBtn.innerHTML = `<span class="btn-icon">💌</span> ${t.messageBtn}`;

    const viewAllBtn = document.getElementById('view-all-messages-btn');
    if (viewAllBtn) {
        const count = document.getElementById('message-count-badge')?.textContent || '0';
        viewAllBtn.innerHTML = `<span class="btn-icon">🎄</span> ${t.viewAllBtn} <span id="message-count-badge" class="badge">${count}</span>`;
        // Renew element reference (cache update)
        elements.messageCountBadge = document.getElementById('message-count-badge');
    }

    // Success Modal Texts (Tree Created)
    const treeCreatedTitle = document.getElementById('tree-created-title');
    if (treeCreatedTitle) treeCreatedTitle.textContent = t.treeCreatedTitle;

    const treeCreatedDesc = document.getElementById('tree-created-desc');
    if (treeCreatedDesc) treeCreatedDesc.textContent = t.treeCreatedDesc;

    const treeIdLabelEl = document.getElementById('tree-id-label');
    if (treeIdLabelEl) treeIdLabelEl.textContent = t.treeIdLabelPublic;

    const adminIdLabelEl = document.getElementById('admin-id-label');
    if (adminIdLabelEl) adminIdLabelEl.textContent = t.adminIdLabel;

    const adminWarningEl = document.getElementById('admin-warning');
    if (adminWarningEl) adminWarningEl.textContent = t.adminWarning;

    const startTreeBtn = document.getElementById('start-tree-btn');
    if (startTreeBtn) startTreeBtn.textContent = t.goToTreeBtn;

    const cancelTreeBtn = document.getElementById('cancel-tree-btn');
    if (cancelTreeBtn) cancelTreeBtn.textContent = t.cancelBtn;

    // Tree ID Label (Header)
    const treeIdHeaderLabel = document.querySelector('.tree-id-display .label');
    if (treeIdHeaderLabel) treeIdHeaderLabel.textContent = t.treeIdLabel + ':';

    // Modals
    const msgModalTitle = document.querySelector('#message-modal h2');
    if (msgModalTitle) msgModalTitle.textContent = t.modalTitle;

    const allMsgModalTitle = document.querySelector('#all-messages-modal h2');
    if (allMsgModalTitle) allMsgModalTitle.textContent = t.modalAllTitle;

    // No Messages Area
    const noMsg1 = document.querySelector('#no-messages p:first-child');
    if (noMsg1) noMsg1.textContent = t.noMsg1;

    const noMsg2 = document.querySelector('#no-messages p:last-child');
    if (noMsg2) noMsg2.textContent = t.noMsg2;

    // Form
    const nameLabel = document.querySelector('label[for="sender-name"]');
    if (nameLabel) nameLabel.textContent = t.nameLabel;

    const msgLabel = document.querySelector('label[for="message-text"]');
    if (msgLabel) msgLabel.textContent = t.msgLabel;

    const nameInput = document.getElementById('sender-name');
    if (nameInput) nameInput.placeholder = t.namePlace;

    const msgInput = document.getElementById('message-text');
    if (msgInput) msgInput.placeholder = t.msgPlace;

    const formBtn = document.querySelector('#message-form button[type="submit"]');
    if (formBtn) formBtn.innerHTML = `<span class="btn-icon">🎄</span> ${t.sendBtn}`;

    // Visit Modal
    const visitModalTitle = document.querySelector('#visit-modal h2');
    if (visitModalTitle) visitModalTitle.textContent = t.visitTitle;

    const treeIdLabel = document.querySelector('label[for="visit-tree-id"]');
    if (treeIdLabel) treeIdLabel.textContent = t.visitTreeIdLabel;

    const treeIdInput = document.getElementById('visit-tree-id');
    if (treeIdInput) treeIdInput.placeholder = t.treeIdPlace;

    const adminIdLabel = document.querySelector('label[for="visit-admin-id"]');
    if (adminIdLabel) adminIdLabel.textContent = t.visitAdminIdLabel;

    const adminIdInput = document.getElementById('visit-admin-id');
    if (adminIdInput) adminIdInput.placeholder = t.visitAdminPlace;

    const goTreeBtn = document.getElementById('go-to-tree-btn');
    if (goTreeBtn) goTreeBtn.innerHTML = `<span class="btn-icon">🚀</span> ${t.goBtn}`;

    const visitHint = document.querySelector('#visit-modal .input-hint');
    if (visitHint) visitHint.textContent = t.visitHintNew;

    // Not Found Screen
    const notFoundTitle = document.querySelector('#not-found-screen .title');
    if (notFoundTitle) notFoundTitle.textContent = t.notFoundTitle;

    const notFoundSubtitle = document.querySelector('#not-found-screen .subtitle');
    if (notFoundSubtitle) notFoundSubtitle.textContent = t.notFoundSubtitle;

    const backFromNotFoundBtn = document.getElementById('back-from-notfound-btn');
    if (backFromNotFoundBtn) backFromNotFoundBtn.innerHTML = `<span class="btn-icon">🏠</span> ${t.backToHome}`;

    // Footer Happy New Year Message
    const footerWishes = document.getElementById('footer-wishes');
    if (footerWishes) footerWishes.textContent = t.footerWishes;

    // "or" Text (Divider)
    const dividerText = document.querySelector('.divider span');
    if (dividerText) dividerText.textContent = t.orText;

    // Update time labels
    updateCountdownLabels();

    // Update tree owner (if exists)
    const headerTitle = document.getElementById('tree-header-title');
    if (headerTitle && currentTreeId) {
        // Let's try to get name from current title or memory
        // We will try to keep "Ahmet's Tree" format simply but
        // it would be more correct to use data from firebase to not lose the name in current structure.
        // For now we only update static texts.
    }
}

function updateCountdownLabels() {
    const t = translations[currentLang];
    const labels = document.querySelectorAll('.time-label');
    if (labels.length >= 4) {
        labels[0].textContent = t.days;
        labels[1].textContent = t.hours;
        labels[2].textContent = t.minutes;
        labels[3].textContent = t.seconds;
    }
}

// ==========================================
// DOM Elements
// ==========================================

const elements = {
    // Screens
    offSeasonScreen: document.getElementById('off-season-screen'),
    homeScreen: document.getElementById('home-screen'),
    loadingScreen: document.getElementById('loading-screen'),
    notFoundScreen: document.getElementById('not-found-screen'),
    treeScreen: document.getElementById('tree-screen'),

    // Home page buttons
    createTreeBtn: document.getElementById('create-tree-btn'),
    langBtn: document.getElementById('lang-btn'), // Language button
    visitTreeBtn: document.getElementById('visit-tree-btn'),

    // Visit modal
    visitModal: document.getElementById('visit-modal'),
    closeVisitModal: document.getElementById('close-visit-modal'),
    treeIdInput: document.getElementById('visit-tree-id'),
    adminIdInput: document.getElementById('visit-admin-id'),
    goToTreeBtn: document.getElementById('go-to-tree-btn'),

    // Tree Created Modal (with two IDs)
    treeCreatedModal: document.getElementById('tree-created-modal'),
    displayTreeId: document.getElementById('display-tree-id'),
    displayAdminId: document.getElementById('display-admin-id'),
    copyTreeIdBtn: document.getElementById('copy-tree-id-btn'),
    copyAdminIdBtn: document.getElementById('copy-admin-id-btn'),
    startTreeBtn: document.getElementById('start-tree-btn'),
    cancelTreeBtn: document.getElementById('cancel-tree-btn'),

    // Tree screen
    backHomeBtn: document.getElementById('back-home-btn'),
    currentTreeId: document.getElementById('current-tree-id'),
    copyIdBtn: document.getElementById('copy-id-btn'),
    shareBtn: document.getElementById('share-btn'),
    treeOrnaments: document.getElementById('tree-ornaments'),
    messageCountBadge: document.getElementById('message-count-badge'),

    // Message modal
    addMessageBtn: document.getElementById('add-message-btn'),
    messageModal: document.getElementById('message-modal'),
    closeMessageModal: document.getElementById('close-message-modal'),
    messageForm: document.getElementById('message-form'),
    senderName: document.getElementById('sender-name'),
    messageText: document.getElementById('message-text'),
    charCurrent: document.getElementById('char-current'),

    // All messages modal
    viewAllMessagesBtn: document.getElementById('view-all-messages-btn'),
    allMessagesModal: document.getElementById('all-messages-modal'),
    closeAllMessagesModal: document.getElementById('close-all-messages-modal'),
    allMessagesList: document.getElementById('all-messages-list'),
    noMessages: document.getElementById('no-messages'),

    // Not found
    backFromNotfoundBtn: document.getElementById('back-from-notfound-btn'),

    // Toast
    copyToast: document.getElementById('copy-toast'),

    // Countdown
    countdown: document.getElementById('countdown')
};

// ==========================================
// Variables
// ==========================================

let currentTreeId = null;
let currentYear = new Date().getFullYear();
let messagesUnsubscribe = null;
let isMyTree = false; // Is user on their own tree?
let currentAdminKey = null; // Stored admin key for session

// localStorage key for saving user's tree
const MY_TREE_KEY = 'noel_agacim_my_tree';
const ADMIN_KEY_PREFIX = 'noel_admin_key_'; // To store keys for multiple trees if needed

// ==========================================
// localStorage Functions (Tree Memory)
// ==========================================

/**
 * Save user's tree ID to localStorage
 */
function saveMyTree(treeId) {
    const seasonYear = getSeasonYear();
    localStorage.setItem(MY_TREE_KEY, JSON.stringify({
        treeId: treeId,
        seasonYear: seasonYear
    }));
}

/**
 * Get user's saved tree ID
 * Returns null if season changed
 */
function getMyTree() {
    const data = localStorage.getItem(MY_TREE_KEY);
    if (!data) return null;

    try {
        const parsed = JSON.parse(data);
        const currentSeasonYear = getSeasonYear();

        // Clear old tree if in different season
        if (parsed.seasonYear !== currentSeasonYear) {
            localStorage.removeItem(MY_TREE_KEY);
            return null;
        }

        return parsed.treeId;
    } catch {
        return null;
    }
}

/**
 * Delete user's tree
 */
function clearMyTree() {
    localStorage.removeItem(MY_TREE_KEY);
}

/**
 * Check if the viewed tree belongs to the user (via Admin Key)
 */
function checkIsMyTree(treeId) {
    // 1. Check legacy method (ownership by creation device)
    const storedTreeData = localStorage.getItem(MY_TREE_KEY);
    let legacyMatch = false;
    if (storedTreeData) {
        try {
            const parsed = JSON.parse(storedTreeData);
            if (parsed.treeId === treeId && parsed.seasonYear === getSeasonYear()) {
                legacyMatch = true;
            }
        } catch { }
    }

    // 2. Check Admin Key in localStorage
    const storedAdminKey = localStorage.getItem(ADMIN_KEY_PREFIX + treeId);

    // Return true if either legacy match or admin key exists
    return legacyMatch || !!storedAdminKey;
}

/**
 * Get the local admin key for this tree
 */
function getLocalAdminKey(treeId) {
    return localStorage.getItem(ADMIN_KEY_PREFIX + treeId);
}

// ==========================================
// Season Control Functions
// ==========================================

/**
 * Checks if current date is in Christmas season
 * Active Period: December 1 - February 1
 */
function isChristmasSeason() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    // December (December 1st and later)
    if (month === 12 && day >= SEASON_START_DAY) {
        return true;
    }

    // January (all)
    if (month === 1) {
        return true;
    }

    // February (including February 1st)
    if (month === 2 && day <= SEASON_END_DAY) {
        return true;
    }

    return false;
}

/**
 * Calculates current season year
 * Ex: Dec 2024 -> 2024, Jan 2025 -> 2024 (same season)
 */
function getSeasonYear() {
    const now = new Date();
    const month = now.getMonth() + 1;

    // If January or February, we are in previous year's season
    if (month === 1 || month === 2) {
        return now.getFullYear() - 1;
    }

    return now.getFullYear();
}

/**
 * Calculates time remaining until next season start
 */
function getCountdownToSeason() {
    const now = new Date();
    let targetDate;

    // If season passed, target next year's December 1st
    if (now.getMonth() + 1 >= 2 && now.getDate() > SEASON_END_DAY) {
        targetDate = new Date(now.getFullYear(), 11, 1); // December 1st this year
    } else if (now.getMonth() + 1 < 12) {
        targetDate = new Date(now.getFullYear(), 11, 1); // December 1st this year
    } else {
        targetDate = new Date(now.getFullYear() + 1, 11, 1); // December 1st next year
    }

    const diff = targetDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return days;
}




// ==========================================
// Helper Functions
// ==========================================

/**
 * Generates 6-character unique ID
 */
function generateTreeId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generates 8-character Admin Key
 */
function generateAdminKey() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1 to avoid confusion
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Switch screen
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

/**
 * Open confirmation modal for new tree creation
 */
function openConfirmNewTreeModal() {
    const modal = document.getElementById('confirm-new-tree-modal');
    const cancelBtn = document.getElementById('confirm-cancel-btn');
    const okBtn = document.getElementById('confirm-ok-btn');

    // Update texts with current language
    const t = translations[currentLang];
    document.getElementById('confirm-new-tree-title').textContent = t.confirmNewTreeTitle;
    document.getElementById('confirm-new-tree-desc').textContent = t.confirmNewTreeDesc;
    okBtn.textContent = t.confirmNewTreeYes;
    cancelBtn.textContent = t.cancelBtn;

    // Cancel button
    cancelBtn.onclick = () => {
        closeModal(modal);
    };

    // OK button - create new tree
    okBtn.onclick = async () => {
        closeModal(modal);
        showScreen('loading-screen');
        try {
            await createUniqueTree();
        } catch (error) {
            console.error('Ağaç oluşturulurken hata:', error);
            showScreen('home-screen');
        }
    };

    openModal(modal);
}

/**
 * Open/close modal
 */
function toggleModal(modal, show) {
    if (show) {
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
    }
}

/**
 * Open modal
 */
function openModal(modal) {
    modal.classList.add('active');
}

/**
 * Close modal
 */
function closeModal(modal) {
    modal.classList.remove('active');
}

/**
 * Show toast
 */
function showToast(message = 'ID Kopyalandı!') {
    const toast = elements.copyToast;
    toast.querySelector('span').textContent = `✓ ${message}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

/**
 * Get tree ID from URL
 */
function getTreeIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('tree');
}

/**
 * Update URL
 */
function updateURL(treeId) {
    const url = new URL(window.location.href);
    url.searchParams.set('tree', treeId);
    window.history.pushState({}, '', url);
}

/**
 * HTML escape
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// Firebase Functions
// ==========================================

/**
 * Check if tree exists
 */
async function checkTreeExists(treeId) {
    const seasonYear = getSeasonYear();
    const treeRef = ref(database, `trees/${seasonYear}/${treeId}`);
    const snapshot = await get(treeRef);
    return snapshot.exists();
}

/**
 * Create new tree
 */
async function createTree(treeId) {
    const seasonYear = getSeasonYear();
    const treeRef = ref(database, `trees/${seasonYear}/${treeId}`);

    await set(treeRef, {
        createdAt: Date.now(),
        seasonYear: seasonYear
    });
}

/**
 * Create tree with unique ID
 */
async function createUniqueTree() {
    let treeId;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
        treeId = generateTreeId();
        exists = await checkTreeExists(treeId);
        attempts++;
    }

    if (exists) {
        throw new Error('Benzersiz ID oluşturulamadı, lütfen tekrar deneyin.');
    }

    await createNewTree(treeId); // Call the new function
    return treeId;
}

/**
 * Add message (encrypted)
 */
async function addMessage(treeId, name, message) {
    const seasonYear = getSeasonYear();
    const messagesRef = ref(database, `trees/${seasonYear}/${treeId}/messages`);

    // Encrypt messages
    const encryptedName = encryptText(name, treeId);
    const encryptedMessage = encryptText(message, treeId);

    const newMessageRef = push(messagesRef);
    await set(newMessageRef, {
        n: encryptedName,      // encrypted name
        m: encryptedMessage,   // encrypted message
        d: new Date().toLocaleString('tr-TR'),
        t: Date.now()
    });
}

/**
 * Delete message
 */
async function deleteMessage(treeId, messageId) {
    const seasonYear = getSeasonYear();
    const messageRef = ref(database, `trees/${seasonYear}/${treeId}/messages/${messageId}`);
    await remove(messageRef);
}

/**
 * Listen to messages (realtime)
 */
function listenToMessages(treeId, callback) {
    const seasonYear = getSeasonYear();
    const messagesRef = ref(database, `trees/${seasonYear}/${treeId}/messages`);

    // Remove previous listener
    if (messagesUnsubscribe) {
        messagesUnsubscribe();
    }

    messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();

            // Decrypt
            const decryptedName = data.n ? decryptText(data.n, treeId) : (data.name || 'Anonim');
            const decryptedMessage = data.m ? decryptText(data.m, treeId) : (data.message || '');

            messages.push({
                id: childSnapshot.key,
                name: decryptedName,
                message: decryptedMessage,
                date: data.d || data.date,
                timestamp: data.t || data.timestamp || 0
            });
        });

        // Sort by timestamp
        messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        callback(messages);
    });
}

/**
 * Find tree by Admin ID
 * Searches all trees in the current season to find one with matching adminKey
 * Returns the treeId if found, null otherwise
 */
async function findTreeByAdminId(adminId) {
    const seasonYear = getSeasonYear();
    const treesRef = ref(database, `trees/${seasonYear}`);

    console.log('Searching for Admin ID:', adminId);
    console.log('Season year:', seasonYear);

    try {
        const snapshot = await get(treesRef);
        if (!snapshot.exists()) {
            console.log('No trees found in this season');
            return null;
        }

        let foundTreeId = null;
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            console.log('Tree:', childSnapshot.key, 'AdminKey:', data.adminKey);
            if (data.adminKey === adminId) {
                foundTreeId = childSnapshot.key;
                console.log('MATCH FOUND!', foundTreeId);
            }
        });

        if (!foundTreeId) {
            console.log('No matching Admin ID found');
        }

        return foundTreeId;
    } catch (e) {
        console.error('Error searching for Admin ID:', e);
        return null;
    }
}

// Create new tree
async function createNewTree(treeId) {
    const adminKey = generateAdminKey();
    const seasonYear = getSeasonYear();

    // Save to Firebase
    await set(ref(database, `trees/${seasonYear}/${treeId}`), {
        createdAt: Date.now(),
        seasonYear: seasonYear,
        adminKey: adminKey // Save secret key
    });

    // Save to LocalStorage (Owner)
    const treeData = {
        treeId: treeId,
        seasonYear: seasonYear,
        createdAt: Date.now()
    };
    localStorage.setItem(MY_TREE_KEY, JSON.stringify(treeData)); // Legacy/Fast Access
    localStorage.setItem(ADMIN_KEY_PREFIX + treeId, adminKey); // Admin Access

    // Clean input
    if (elements.treeIdInput) elements.treeIdInput.value = '';

    // Show Success Modal instead of direct redirect
    showSuccessModal(treeId, adminKey);
}

function showSuccessModal(treeId, adminId) {
    // Display both IDs
    if (elements.displayTreeId) elements.displayTreeId.textContent = treeId;
    if (elements.displayAdminId) elements.displayAdminId.textContent = adminId;

    // Copy Tree ID button
    if (elements.copyTreeIdBtn) {
        elements.copyTreeIdBtn.onclick = () => {
            navigator.clipboard.writeText(treeId).then(() => {
                showToast(translations[currentLang].copiedToast);
            });
        };
    }

    // Copy Admin ID button
    if (elements.copyAdminIdBtn) {
        elements.copyAdminIdBtn.onclick = () => {
            navigator.clipboard.writeText(adminId).then(() => {
                showToast(translations[currentLang].copiedToast);
            });
        };
    }

    // Setup button to go to tree
    elements.startTreeBtn.onclick = () => {
        closeModal(elements.treeCreatedModal);
        initializeTree(treeId, true);
    };

    // Setup cancel button to delete tree and go back
    if (elements.cancelTreeBtn) {
        elements.cancelTreeBtn.onclick = async () => {
            try {
                // Delete tree from Firebase
                const seasonYear = getSeasonYear();
                await remove(ref(database, `trees/${seasonYear}/${treeId}`));

                // Remove from localStorage
                localStorage.removeItem(MY_TREE_KEY);
                localStorage.removeItem(ADMIN_KEY_PREFIX + treeId);

                // Close modal and go home
                closeModal(elements.treeCreatedModal);
                showScreen('home-screen');
            } catch (error) {
                console.error('Error deleting tree:', error);
                // Still close and go home
                closeModal(elements.treeCreatedModal);
                showScreen('home-screen');
            }
        };
    }

    openModal(elements.treeCreatedModal);
}

// ==========================================
// Tree and Message Management
// ==========================================

/**
 * Initialize and show tree
 */
async function initializeTree(treeId, isNew = false) {
    showScreen('loading-screen');

    try {
        // If not new tree, check if exists
        if (!isNew) {
            const exists = await checkTreeExists(treeId);
            if (!exists) {
                showScreen('not-found-screen');
                return;
            }
        }

        currentTreeId = treeId;
        isMyTree = checkIsMyTree(treeId);
        elements.currentTreeId.textContent = treeId;
        updateURL(treeId);

        // Listen to messages
        listenToMessages(treeId, (messages) => {
            displayOrnaments(messages);
            updateMessageCount(messages.length);

            // Update if modal is open
            if (elements.allMessagesModal.classList.contains('active')) {
                displayAllMessages(messages);
            }
        });
        if (!isNew) { // Only show created toast if it's a new tree, not when visiting existing
            showToast(translations[currentLang].createdToast);
        }
        showScreen('tree-screen');

    } catch (error) {
        console.error('Ağaç yüklenirken hata:', error);
        showScreen('not-found-screen');
    }
}

/**
 * Update message count
 */
function updateMessageCount(count) {
    elements.messageCountBadge.textContent = count;
}

/**
 * Show messages as ornaments
 */
function displayOrnaments(messages) {
    elements.treeOrnaments.innerHTML = '';

    // Show last 10 messages
    const visibleMessages = messages.slice(-MAX_VISIBLE_ORNAMENTS);

    visibleMessages.forEach((msg, index) => {
        const ornament = document.createElement('div');
        ornament.className = `ornament pos-${index + 1}`; // Add position class
        ornament.innerHTML = ORNAMENT_EMOJIS[index % ORNAMENT_EMOJIS.length];

        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'ornament-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-name">${escapeHtml(msg.name)}</div>
            <div class="tooltip-message">${escapeHtml(msg.message)}</div>
        `;
        ornament.appendChild(tooltip);

        elements.treeOrnaments.appendChild(ornament);
    });
}

/**
 * List all messages
 */
function displayAllMessages(messages) {
    const list = elements.allMessagesList;
    const noMessages = elements.noMessages;

    list.innerHTML = '';

    if (messages.length === 0) {
        list.style.display = 'none';
        noMessages.style.display = 'block';
        return;
    }

    list.style.display = 'flex';
    noMessages.style.display = 'none';

    // Show messages in reverse order (newest on top)
    [...messages].reverse().forEach(msg => {
        const card = document.createElement('div');
        card.className = 'message-card';

        let cardContent = `
            <div class="message-header">
                <span class="message-sender">${escapeHtml(msg.name)}</span>
                <span class="message-date">${msg.date}</span>
            </div>
            <div class="message-text">${escapeHtml(msg.message)}</div>
        `;

        // Only tree owner can see delete button
        if (isMyTree) {
            cardContent += `
                <button class="btn-delete-message" data-id="${msg.id}" title="${translations[currentLang].deleteBtnTitle}">
                    🗑️
                </button>
            `;
        }

        card.innerHTML = cardContent;

        // Delete button event listener
        if (isMyTree) {
            const deleteBtn = card.querySelector('.btn-delete-message');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    await deleteMessage(currentTreeId, msg.id);
                    showToast(translations[currentLang].deleteToast);
                } catch (error) {
                    console.error('Mesaj silinirken hata:', error);
                }
            });
        }

        list.appendChild(card);
    });
}

// ==========================================
// Event Listeners
// ==========================================

// Language toggle button
if (elements.langBtn) {
    elements.langBtn.addEventListener('click', toggleLanguage);
}

// Create your own tree (or go to existing tree)
elements.createTreeBtn.addEventListener('click', async () => {
    // Check existing tree first
    const existingTreeId = getMyTree();

    if (existingTreeId) {
        // If tree exists, go directly to it
        await initializeTree(existingTreeId);
        return;
    }

    showScreen('loading-screen');

    try {
        await createUniqueTree(); // This will now call createNewTree and showSuccessModal
    } catch (error) {
        console.error('Ağaç oluşturulurken hata:', error);
        // Alert in case of error
        alert('Ağaç oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.\n\n' + error.message);
        showScreen('home-screen');
    }
});

// Click 'Visit Tree' button
elements.visitTreeBtn.addEventListener('click', () => {
    openModal(elements.visitModal);
    elements.treeIdInput.value = '';
    if (elements.adminIdInput) elements.adminIdInput.value = '';
    elements.treeIdInput.focus();
});

// Close visit modal
if (elements.closeVisitModal) {
    elements.closeVisitModal.addEventListener('click', () => closeModal(elements.visitModal));
}

// Go to tree button (with optional Admin ID)
elements.goToTreeBtn.addEventListener('click', async () => {
    const treeId = elements.treeIdInput.value.toUpperCase().trim();
    const adminId = elements.adminIdInput ? elements.adminIdInput.value.toUpperCase().trim() : '';

    // Validate Tree ID
    if (treeId.length !== 6) {
        alert('Lütfen 6 karakterlik geçerli bir Ağaç ID girin!');
        return;
    }

    closeModal(elements.visitModal);
    showScreen('loading-screen');

    try {
        // Check if tree exists
        const exists = await checkTreeExists(treeId);
        if (!exists) {
            showScreen('not-found-screen');
            return;
        }

        // If Admin ID provided, verify it
        if (adminId.length === 8) {
            const seasonYear = getSeasonYear();
            const treeRef = ref(database, `trees/${seasonYear}/${treeId}`);
            const snapshot = await get(treeRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.adminKey === adminId) {
                    // Admin key matches! Save to localStorage
                    localStorage.setItem(ADMIN_KEY_PREFIX + treeId, adminId);
                    console.log('Admin access granted for tree:', treeId);
                } else {
                    console.log('Admin ID does not match, entering as visitor');
                }
            }
        }

        // Initialize tree (will check isMyTree based on localStorage)
        await initializeTree(treeId);

    } catch (error) {
        console.error('Error visiting tree:', error);
        showScreen('not-found-screen');
    }
});

// Go to tree with Enter key
elements.treeIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.goToTreeBtn.click();
    }
});

// Return to home page
elements.backHomeBtn.addEventListener('click', () => {
    // Clean URL
    window.history.pushState({}, '', window.location.pathname);
    currentTreeId = null;
    isMyTree = false;

    // Remove message listener
    if (messagesUnsubscribe) {
        messagesUnsubscribe();
        messagesUnsubscribe = null;
    }

    showScreen('home-screen');
});

// Return to home page from Not found
elements.backFromNotfoundBtn.addEventListener('click', () => {
    window.history.pushState({}, '', window.location.pathname);
    showScreen('home-screen');
});

// Copy ID
elements.copyIdBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentTreeId).then(() => {
        showToast(translations[currentLang].copyToast);
    }).catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = currentTreeId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(translations[currentLang].copyToast);
    });
});

// Share button
elements.shareBtn.addEventListener('click', () => {
    const url = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: '🎄 Noel Ağacım',
            text: 'Benim Noel ağacıma gel ve yılbaşı mesajı bırak!',
            url: url
        }).catch(() => { });
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showToast(translations[currentLang].copyToast);
        });
    }
});

// Open add message modal
elements.addMessageBtn.addEventListener('click', () => {
    openModal(elements.messageModal);
    elements.senderName.value = '';
    elements.messageText.value = '';
    elements.charCurrent.textContent = '0';
    elements.senderName.focus();
});

// Close message modal
elements.closeMessageModal.addEventListener('click', () => {
    closeModal(elements.messageModal);
});

// Character counter
elements.messageText.addEventListener('input', () => {
    elements.charCurrent.textContent = elements.messageText.value.length;
});

// Submit message form
elements.messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = elements.senderName.value.trim();
    const message = elements.messageText.value.trim();

    if (!name || !message) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    try {
        // Disable submit button
        const submitBtn = elements.messageForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Gönderiliyor...';

        await addMessage(currentTreeId, name, message);

        closeModal(elements.messageModal);
        showToast('Mesaj Eklendi! 🎄');

        // Bring button back
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">🎄</span> Mesajı Ağaca As';

    } catch (error) {
        console.error('Mesaj gönderilirken hata:', error);
        alert('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');

        const submitBtn = elements.messageForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">🎄</span> Mesajı Ağaca As';
    }
});

// View all messages
elements.viewAllMessagesBtn.addEventListener('click', () => {
    const seasonYear = getSeasonYear();
    const messagesRef = ref(database, `trees/${seasonYear}/${currentTreeId}/messages`);

    get(messagesRef).then((snapshot) => {
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();

            // Decrypt
            const decryptedName = data.n ? decryptText(data.n, currentTreeId) : (data.name || 'Anonim');
            const decryptedMessage = data.m ? decryptText(data.m, currentTreeId) : (data.message || '');

            messages.push({
                id: childSnapshot.key,
                name: decryptedName,
                message: decryptedMessage,
                date: data.d || data.date,
                timestamp: data.t || data.timestamp || 0
            });
        });
        messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        displayAllMessages(messages);
        openModal(elements.allMessagesModal);
    });
});

// Close all messages modal
elements.closeAllMessagesModal.addEventListener('click', () => {
    closeModal(elements.allMessagesModal);
});

// Close when clicking outside modal (except visit modal and tree-created modal)
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            // Don't close these modals on outside click
            if (modal.id === 'visit-modal' || modal.id === 'tree-created-modal') {
                return; // Do nothing
            }
            closeModal(modal);
        }
    });
});

// Close modals with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal);
        });
    }
});

// ==========================================
// When Page Loads
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Season check
    if (!isChristmasSeason()) {
        // Show Countdown
        const daysLeft = getCountdownToSeason();
        if (elements.countdown) {
            elements.countdown.innerHTML = `<p>🗓️ Yılbaşı sezonuna <strong>${daysLeft}</strong> gün kaldı!</p>`;
        }
        showScreen('off-season-screen');
        return;
    }

    // Check if there is tree ID in URL
    const treeIdFromURL = getTreeIdFromURL();

    if (treeIdFromURL && treeIdFromURL.length === 6) {
        await initializeTree(treeIdFromURL.toUpperCase());
    } else {
        // Does user have a saved tree?
        const myTreeId = getMyTree();

        if (myTreeId) {
            // If saved tree exists, update button text
            updateHomeScreenWithExistingTree(myTreeId);
        }

        showScreen('home-screen');
    }
});

/**
 * Update home page with existing tree info
 */
function updateHomeScreenWithExistingTree(treeId) {
    // Change button text
    const createBtn = elements.createTreeBtn;
    createBtn.innerHTML = `
        <span class="btn-icon">🎄</span>
        Ağacıma Git (${treeId})
    `;

    // Add create new tree button (if it doesn't exist)
    if (!document.getElementById('create-new-tree-btn')) {
        const newTreeBtn = document.createElement('button');
        newTreeBtn.id = 'create-new-tree-btn';
        newTreeBtn.className = 'btn btn-secondary';
        newTreeBtn.innerHTML = `
            <span class="btn-icon">✨</span>
            Yeni Ağaç Oluştur
        `;
        newTreeBtn.style.marginTop = '10px';

        newTreeBtn.addEventListener('click', async () => {
            openConfirmNewTreeModal();
        });

        // Insert before Divider
        const divider = document.querySelector('.button-group .divider');
        divider.parentNode.insertBefore(newTreeBtn, divider);
    }
}

// ==========================================
// Firework Effect
// ==========================================

const FIREWORK_COLORS = [
    '#ff0000', '#ff4444', '#ff7777', // Kırmızı tonları
    '#ffff00', '#ffdd00', '#ffaa00', // Sarı/Altın tonları
    '#00ff00', '#44ff44', '#00dd00', // Yeşil tonları
    '#00ffff', '#44ffff', '#00dddd', // Cyan tonları
    '#ff00ff', '#ff44ff', '#dd00dd', // Mor tonları
    '#ffffff', '#aaaaff', '#ffaaff'  // Beyaz/Pembe tonları
];

/**
 * Create firework explosion
 */
function createFirework(x, y) {
    const container = document.getElementById('fireworks-container');
    if (!container) return;

    const particleCount = 30;
    const colors = FIREWORK_COLORS.sort(() => Math.random() - 0.5).slice(0, 5);

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';

        // Select random color
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Random size (4-12px)
        const size = Math.random() * 8 + 4;

        // Random direction (360 degrees)
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5);
        const distance = Math.random() * 150 + 100;

        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            --tx: ${tx}px;
            --ty: ${ty}px;
            box-shadow: 0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color};
        `;

        container.appendChild(particle);

        // Remove after animation ends
        setTimeout(() => {
            particle.remove();
        }, 1500);
    }

    // Center glow
    for (let i = 0; i < 8; i++) {
        const glow = document.createElement('div');
        glow.className = 'firework-glow';
        const color = colors[Math.floor(Math.random() * colors.length)];

        glow.style.cssText = `
            left: ${x - 5}px;
            top: ${y - 5}px;
            background: ${color};
            color: ${color};
        `;

        container.appendChild(glow);

        setTimeout(() => {
            glow.remove();
        }, 800);
    }
}

/**
 * Add click event to gift boxes
 */
function initializeGiftBoxes() {
    const giftBoxes = document.querySelectorAll('.gift-box');

    giftBoxes.forEach(box => {
        box.addEventListener('click', (e) => {
            const rect = box.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            // Firework explosion
            createFirework(x, y);

            // Shake box and move to new position
            box.style.animation = 'none';
            box.offsetHeight; // Reflow

            // New random position
            const newX = Math.random() * (window.innerWidth - 100) + 50;
            const newY = Math.random() * (window.innerHeight - 200) + 100;

            box.style.left = `${newX}px`;
            box.style.top = `${newY}px`;
            box.style.animation = 'giftFloat 3s ease-in-out infinite';
            box.style.animationDelay = `${Math.random() * 2}s`;
        });
    });
}

/**
 * Create gift boxes in random positions
 */
function createRandomGiftBoxes() {
    const container = document.getElementById('gift-boxes-container');
    if (!container) return;

    // Only gift box emoji
    const giftEmoji = '🎁';
    const giftCount = 10;

    // Forbidden zone (Tree and buttons)
    const getExclusionZone = () => {
        const centerX = window.innerWidth / 2;
        return {
            minX: centerX - 250,
            maxX: centerX + 250,
            minY: 50,
            maxY: 850
        };
    };

    const getRandomPosition = () => {
        const zone = getExclusionZone();
        let x, y;
        let attempts = 0;

        do {
            x = Math.random() * (window.innerWidth - 60) + 30;
            y = Math.random() * (window.innerHeight - 100) + 50;
            attempts++;

            if (x > zone.minX && x < zone.maxX && y > zone.minY && y < zone.maxY) {
                continue;
            } else {
                return { x, y };
            }
        } while (attempts < 50);

        return {
            x: Math.random() < 0.5 ? 50 : window.innerWidth - 50,
            y: Math.random() * (window.innerHeight - 100) + 50
        };
    };

    for (let i = 0; i < giftCount; i++) {
        const gift = document.createElement('div');
        gift.className = 'gift-box';
        gift.innerHTML = giftEmoji;

        const pos = getRandomPosition();
        gift.style.left = `${pos.x}px`;
        gift.style.top = `${pos.y}px`;
        gift.style.animationDelay = `${Math.random() * 3}s`;
        gift.style.fontSize = `${1.8 + Math.random() * 0.5}rem`;

        gift.addEventListener('click', () => {
            const rect = gift.getBoundingClientRect();
            const fx = rect.left + rect.width / 2;
            const fy = rect.top + rect.height / 2;

            createFirework(fx, fy);
            gift.style.display = 'none';

            // Come back faster (0.5 - 1.0 seconds)
            setTimeout(() => {
                const newPos = getRandomPosition();
                gift.style.left = `${newPos.x}px`;
                gift.style.top = `${newPos.y}px`;
                gift.style.display = 'block';

                gift.style.opacity = '0';
                gift.style.transform = 'scale(0)';
                gift.style.transition = 'all 0.5s ease';

                requestAnimationFrame(() => {
                    gift.style.opacity = '1';
                    gift.style.transform = 'scale(1)';
                    setTimeout(() => {
                        gift.style.transition = '';
                    }, 500);
                });
            }, 500 + Math.random() * 500);
        });

        container.appendChild(gift);
    }
}

/**
 * Create background stars
 */
function createBackgroundStars() {
    const container = document.getElementById('background-stars');
    if (!container) return;

    const starCount = 40;
    const starSymbol = '★';

    // Forbidden zone for stars (Keep behind tree empty)
    const getStarExclusionZone = () => {
        const centerX = window.innerWidth / 2;
        return {
            minX: centerX - 280,
            maxX: centerX + 280,
            minY: 0,
            maxY: 800
        };
    };

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('span');
        star.className = 'bg-star';
        star.innerHTML = starSymbol;

        // Random position (Except forbidden zone)
        let x, y, attempts = 0;
        const zone = getStarExclusionZone();

        do {
            x = Math.random() * 100;
            y = Math.random() * 100;
            attempts++;

            // Convert percentage to pixel and check
            const pxX = (x / 100) * window.innerWidth;
            const pxY = (y / 100) * window.innerHeight;

            if (pxX > zone.minX && pxX < zone.maxX && pxY > zone.minY && pxY < zone.maxY) {
                // In forbidden zone, try again
                continue;
            } else {
                break;
            }
        } while (attempts < 50);

        const size = 0.5 + Math.random() * 1.5;
        const duration = 2 + Math.random() * 4;
        const delay = Math.random() * 5;

        star.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            font-size: ${size}rem;
            --twinkle-duration: ${duration}s;
            --twinkle-delay: ${delay}s;
        `;

        container.appendChild(star);
    }
}

/**
 * Create tree ornaments and lights according to geometry
 */
function createDecorations() {
    const ornamentsContainer = document.getElementById('decorative-ornaments');
    const lightsContainer = document.getElementById('tree-lights');

    if (!ornamentsContainer || !lightsContainer) return;

    // Geometry of tree layers (Approximate values, in pixels, relative from top)
    const layers = [
        { top: 0, height: 55, widthTop: 0, widthBottom: 90 },     // Katman 1
        { top: 35, height: 70, widthTop: 0, widthBottom: 130 },   // Katman 2
        { top: 80, height: 85, widthTop: 0, widthBottom: 170 },   // Katman 3
        { top: 137, height: 100, widthTop: 0, widthBottom: 210 }  // Katman 4
    ];

    // Ornament Types (Colors/Emojis)
    const ornamentTypes = ['🔴', '🟡', '🔵', '🟣', '🟢'];
    // const ornamentTypes = ['decorative-ornaments span style css...']; 
    // Since only colored ball is requested in HTML, we can use emoji or CSS class.
    // There is .co-ornament style in CSS.

    // Random point selector (Inside tree)
    const getRandomPointInLayer = (layer) => {
        const yRel = Math.random() * layer.height; // Y inside layer
        const slope = (layer.widthBottom - layer.widthTop) / (2 * layer.height);
        const maxWidthAtY = (layer.widthTop / 2) + (yRel * slope);

        // Random X (between -maxWidth and +maxWidth)
        // Keep slightly inside (* 0.8)
        const x = (Math.random() * 2 - 1) * maxWidthAtY * 0.9;

        return {
            x: x,
            y: layer.top + yRel
        };
    };

    // 1. Create Ornaments - 15 pieces
    for (let i = 0; i < 15; i++) {
        // Select random layer
        const layerIndex = Math.floor(Math.random() * layers.length);
        const point = getRandomPointInLayer(layers[layerIndex]);

        const ornament = document.createElement('span');
        ornament.className = 'deco-ornament';
        ornament.innerHTML = ornamentTypes[Math.floor(Math.random() * ornamentTypes.length)];

        // Random string length (30px - 70px)
        const stringLength = 30 + Math.random() * 40;

        // Positioning
        // So that ball point (top = y + stringLength)
        // String will extend upwards.
        // But we give top, left.
        // Anchor point point.x, point.y (Tree branch)
        // Place where ornament will stand: point.x, point.y + stringLength

        ornament.style.left = `calc(50% + ${point.x}px)`;
        ornament.style.top = `${point.y + stringLength}px`;

        // Create string (more flexible with DOM element, not ::before)
        // We defined .deco-ornament .string in CSS.
        const string = document.createElement('div');
        string.className = 'string';
        string.style.height = `${stringLength}px`;
        // bottom: 80% already exists in CSS, or we can override here.
        // We use .string div instead of .deco-ornament::before in CSS.
        string.style.position = 'absolute';
        string.style.bottom = '80%'; // From top of ball
        string.style.left = '50%';
        string.style.width = '1px';
        string.style.background = 'rgba(255, 255, 255, 0.6)';
        string.style.transform = 'translateX(-50%)';
        string.style.zIndex = '-1';

        ornament.appendChild(string);
        ornamentsContainer.appendChild(ornament);
    }

    // 2. Create Lights - 12 pieces (Reduced)
    // Only inside, not connected to cable, sparkle.
    for (let i = 0; i < 12; i++) {
        const layerIndex = Math.floor(Math.random() * layers.length);
        const point = getRandomPointInLayer(layers[layerIndex]);

        const light = document.createElement('div');
        light.className = 'light';
        // Colors
        const colors = ['var(--color-red)', 'var(--color-gold)', '#00CED1'];
        light.style.background = colors[Math.floor(Math.random() * colors.length)];

        light.style.left = `calc(50% + ${point.x}px)`;
        light.style.top = `${point.y}px`;

        // Random animation delay
        light.style.animationDelay = `${Math.random() * 2}s`;

        lightsContainer.appendChild(light);
    }
}

// Start on page load
document.addEventListener('DOMContentLoaded', () => {
    // Apply language setting
    updateLanguage();

    // Start with slight delay
    setTimeout(() => {


        createBackgroundStars();
        createRandomGiftBoxes();
    }, 200);
});
