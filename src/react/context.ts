import { createContext, useContext as _useContext } from 'react';

const context = createContext({} as any);

export const ContextProvider = context.Provider;
export const useContext = <T = any>(): T => _useContext(context);
