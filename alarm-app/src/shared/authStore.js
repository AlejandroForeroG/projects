// Shared authentication store — localStorage-backed simulated auth
// No real backend, just client-side validation and storage

const USERS_KEY = 'alarm-app-users';
const CURRENT_USER_KEY = 'alarm-app-current-user';
const PENDING_CODE_KEY = 'alarm-app-pending-code';

// ── Helper Functions ────────────────────────────────────────────────

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUserEmail() {
  return localStorage.getItem(CURRENT_USER_KEY);
}

function setCurrentUserEmail(email) {
  localStorage.setItem(CURRENT_USER_KEY, email);
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function savePendingCode(email, code) {
  const data = {
    email,
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
  localStorage.setItem(PENDING_CODE_KEY, JSON.stringify(data));
}

function getPendingCode(email) {
  try {
    const raw = localStorage.getItem(PENDING_CODE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.email !== email) return null;
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(PENDING_CODE_KEY);
      return null;
    }
    return data.code;
  } catch {
    return null;
  }
}

function clearPendingCode() {
  localStorage.removeItem(PENDING_CODE_KEY);
}

// ── Validation Functions ────────────────────────────────────────────

function validateEmail(email) {
  const emailRegex = /.+@.+\..+/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

function validateCode(code) {
  return /^\d{6}$/.test(code);
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Register a new user
 * @param {string} email
 * @param {string} password
 * @returns {{success: boolean, error?: string, code?: string}}
 */
export function register(email, password) {
  // Validate input
  if (!validateEmail(email)) {
    return { success: false, error: 'Email inválido' };
  }
  if (!validatePassword(password)) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const users = loadUsers();
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return { success: false, error: 'Este email ya está registrado' };
  }

  // Create new user
  const newUser = {
    email,
    password, // In real app, this would be hashed
    verified: false,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Generate verification code
  const code = generateCode();
  savePendingCode(email, code);

  // Show code in console and alert for testing
  console.log(`🔐 Código de verificación para ${email}: ${code}`);
  alert(`Código de verificación: ${code}\n(En producción se enviaría por email)`);

  return { success: true, code };
}

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {{success: boolean, error?: string, code?: string, needsVerification?: boolean}}
 */
export function login(email, password) {
  // Validate input
  if (!validateEmail(email)) {
    return { success: false, error: 'Email inválido' };
  }
  if (!password) {
    return { success: false, error: 'La contraseña es requerida' };
  }

  const users = loadUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Contraseña incorrecta' };
  }

  // Check if user is already verified
  if (user.verified) {
    setCurrentUserEmail(email);
    return { success: true, needsVerification: false };
  }

  // User needs verification - generate new code
  const code = generateCode();
  savePendingCode(email, code);

  console.log(`🔐 Código de verificación para ${email}: ${code}`);
  alert(`Código de verificación: ${code}\n(En producción se enviaría por email)`);

  return { success: true, needsVerification: true, code };
}

/**
 * Verify code for a user
 * @param {string} email
 * @param {string} code
 * @returns {{success: boolean, error?: string}}
 */
export function verifyCode(email, code) {
  if (!validateCode(code)) {
    return { success: false, error: 'El código debe tener 6 dígitos' };
  }

  const pendingCode = getPendingCode(email);
  
  if (!pendingCode) {
    return { success: false, error: 'Código expirado o inválido' };
  }

  if (pendingCode !== code) {
    return { success: false, error: 'Código incorrecto' };
  }

  // Mark user as verified
  const users = loadUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  users[userIndex].verified = true;
  saveUsers(users);

  // Set as current user
  setCurrentUserEmail(email);
  clearPendingCode();

  return { success: true };
}

/**
 * Resend verification code
 * @param {string} email
 * @returns {{success: boolean, error?: string, code?: string}}
 */
export function resendCode(email) {
  const users = loadUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  const code = generateCode();
  savePendingCode(email, code);

  console.log(`🔐 Código de verificación reenviado para ${email}: ${code}`);
  alert(`Nuevo código de verificación: ${code}\n(En producción se enviaría por email)`);

  return { success: true, code };
}

/**
 * Logout current user
 */
export function logout() {
  clearCurrentUser();
  clearPendingCode();
}

/**
 * Get current authenticated user
 * @returns {{email: string, verified: boolean, createdAt: string} | null}
 */
export function getCurrentUser() {
  const email = getCurrentUserEmail();
  if (!email) return null;

  const users = loadUsers();
  const user = users.find(u => u.email === email);
  
  if (!user || !user.verified) {
    clearCurrentUser();
    return null;
  }

  return {
    email: user.email,
    verified: user.verified,
    createdAt: user.createdAt,
  };
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  const user = getCurrentUser();
  return user !== null && user.verified;
}
