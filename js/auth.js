const STORAGE_USERS = 'aerolinea-users';
const STORAGE_CURRENT_USER = 'aerolinea-current-user';

const defaultUsers = [
  {
    name: 'Administrador Aerolínea',
    email: 'admin@aerolinea.com',
    password: 'Admin1234',
    role: 'admin',
    registeredAt: new Date().toISOString(),
  },
  {
    name: 'Cliente Ejemplo',
    email: 'cliente@aerolinea.com',
    password: 'Cliente1234',
    role: 'user',
    registeredAt: new Date().toISOString(),
  },
];

function loadUsers() {
  try {
    const storedValue = localStorage.getItem(STORAGE_USERS);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function ensureUsers() {
  const users = loadUsers();
  if (!Array.isArray(users) || users.length === 0) {
    saveUsers(defaultUsers);
    return defaultUsers;
  }

  return users;
}

function loadCurrentUser() {
  try {
    const storedValue = localStorage.getItem(STORAGE_CURRENT_USER);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER);
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

const auth = {
  initialize() {
    ensureUsers();
  },

  login({ email, password }) {
    const users = ensureUsers();
    const normalizedEmail = normalizeEmail(email);
    const user = users.find((storedUser) => {
      return storedUser.email.toLowerCase() === normalizedEmail
        && storedUser.password === password;
    });

    if (!user) {
      throw new Error('Email o contraseña incorrectos.');
    }

    const currentUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      loggedInAt: new Date().toISOString(),
    };

    saveCurrentUser(currentUser);
    return loadCurrentUser();
  },

  register({ name, email, password }) {
    const users = ensureUsers();
    const normalizedEmail = normalizeEmail(email);
    const alreadyExists = users.some((storedUser) => storedUser.email.toLowerCase() === normalizedEmail);

    if (alreadyExists) {
      throw new Error('Este email ya está registrado.');
    }

    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'user',
      registeredAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const currentUser = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      loggedInAt: new Date().toISOString(),
    };

    saveCurrentUser(currentUser);
    return loadCurrentUser();
  },

  logout() {
    saveCurrentUser(null);
  },

  getCurrentUser: loadCurrentUser,

  isAdmin(user) {
    return Boolean(user && user.role === 'admin');
  },
};

export { auth };
