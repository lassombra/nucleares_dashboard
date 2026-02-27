'use client';

import {useState, SetStateAction, useEffect, Dispatch} from 'react';

export default function useLocalStorageState<T>(key: string, initialValue: T, version: number = 1): [T, Dispatch<SetStateAction<T>>] {

    const [state, setState] = useState<T>(initialValue);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            try {
                const parsedValue = JSON.parse(storedValue);
                if (parsedValue.version !== version) {
                    console.warn(`Version mismatch for key "${key}": expected ${version}, got ${parsedValue.version}. Using initial value.`);
                } else {
                    setState(parsedValue.state);
                }
            } catch (e) {
                console.error(`Error parsing localStorage value for key "${key}":`, e);
            }
        }
        setLoaded(true);
    }, [key, version])
    useEffect(() => {
        if (loaded) {
            localStorage.setItem(key, JSON.stringify({state, version}));
        }
    }, [key, state, loaded, version]);

    return [state, setState];
}