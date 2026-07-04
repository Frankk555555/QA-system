"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import th from '../dictionaries/th.json';
import en from '../dictionaries/en.json';

export type Language = 'TH' | 'EN';

const dictionaries = { TH: th, EN: en };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('TH');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('app-language') as Language;
    if (saved && (saved === 'TH' || saved === 'EN')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'TH' ? 'EN' : 'TH');
  };

  const t = (key: string) => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = dictionaries[language];
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    return typeof value === 'string' ? value : key;
  };

  // Prevent hydration mismatch by returning a placeholder or just children until mounted
  // However, returning just children might cause hydration mismatch if children depend on language.
  // The simplest is to just render it. The default is 'TH', which matches SSR.
  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      <div data-language={language} className="contents">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
