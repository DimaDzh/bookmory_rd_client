import "server-only";

const dictionaries = {
  en: () =>
    import("../../dictionaries/en.json").then(
      (module) => module.default as Dictionary
    ),
  uk: () =>
    import("../../dictionaries/uk.json").then(
      (module) => module.default as Dictionary
    ),
};

export type Dictionary = {
  common: {
    loading: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    user: string;
  };
  auth: {
    login: {
      title: string;
      description: string;
      signIn: string;
      signingIn: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      noAccount: string;
      signUp: string;
      success: string;
    };
    register: {
      title: string;
      description: string;
      createAccount: string;
      creatingAccount: string;
      firstNamePlaceholder: string;
      lastNamePlaceholder: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      confirmPasswordPlaceholder: string;
      alreadyHaveAccount: string;
      signIn: string;
      success: string;
    };
    logout: {
      success: string;
    };
    validation: {
      emailRequired: string;
      passwordRequired: string;
      invalidEmail: string;
      passwordMinLength: string;
      passwordsDontMatch: string;
    };
  };
  dashboard: {
    title: string;
    welcomeBack: string;
    subtitle: string;
    searchBooks: string;
  };
  library: {
    title: string;
    subtitle: string;
    loading: string;
    loadingDescription: string;
    searchPlaceholder: string;
    bookCount: string;
    filterByStatus: string;
    allBooks: string;
    noBooks: string;
    noBooksDescription: string;
    noFilterResults: string;
    noSearchResults: string;
    adjustFilters: string;
    removeSuccess: string;
    removeFailed: string;
    progressUpdated: string;
    progressFailed: string;
    statusUpdated: string;
    statusFailed: string;
    updateSuccess: string;
    updateFailed: string;
    updateStatus: string;
    status: string;
  };
  readingStatus: {
    wantToRead: string;
    reading: string;
    finished: string;
    paused: string;
    dnf: string;
  };
  currentlyReading: {
    title: string;
    subtitle: string;
    booksInProgress: string;
    noBooks: string;
    noBooksDescription: string;
    reading: string;
    startedOn: string;
    updateProgress: string;
    currentPage: string;
    pageProgress: string;
    cancel: string;
    update: string;
    updating: string;
  };
  libraryStats: {
    totalBooks: string;
    reading: string;
    finished: string;
    favorites: string;
    pagesRead: string;
  };
  meta: {
    title: string;
    description: string;
  };
  errors: {
    general: string;
    authRequired: string;
  };
};

export const getDictionary = async (
  locale: keyof typeof dictionaries
): Promise<Dictionary> => {
  return dictionaries[locale]?.() ?? dictionaries.uk();
};
