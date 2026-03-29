'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { t, Lang } from './i18n';

interface LanguageContextType {
  lang: Lang;
  setLanguage: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'zh';
    return (localStorage.getItem('lang') as Lang) || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const setLanguage = (newLang: Lang) => {
    setLangState(newLang);
  };

  const translate = (key: string) => t(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  
  if (typeof window === 'undefined' || context === undefined) {
    return { lang: 'zh', setLanguage: () => {}, t: (key: string) => t('zh', key) };
  }
  
  return context;
}
