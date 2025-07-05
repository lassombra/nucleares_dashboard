'use client';

import {useState, SetStateAction, useEffect, Dispatch} from 'react';

export default function useLocalStorageState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {

    const [state, setState] = useState<T>(initialValue);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            try {
                const parsedValue = JSON.parse(storedValue);
                setState(parsedValue);
            } catch (e) {
                console.error(`Error parsing localStorage value for key "${key}":`, e);
            }
        }
        setLoaded(true);
    }, [key])
    useEffect(() => {
        if (loaded) {
            localStorage.setItem(key, JSON.stringify(state));
        }
    }, [key, state, loaded])

    return [state, setState];
}