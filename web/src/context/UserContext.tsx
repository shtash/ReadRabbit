"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    id: string;
    name: string;
    avatarSeed: string;
    isParent: boolean;
}

interface UserContextType {
    users: User[];
    currentUser: User | null;
    addUser: (name: string, isParent?: boolean) => void;
    switchUser: (userId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const MOCK_USERS: User[] = [
    { id: '1', name: 'Alex', avatarSeed: 'Alex', isParent: false },
    { id: '2', name: 'Sam', avatarSeed: 'Sam', isParent: false },
    { id: '3', name: 'Parent', avatarSeed: 'Parent', isParent: true },
];

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Initialize with the first user on client side
    useEffect(() => {
        const savedUserId = localStorage.getItem('currentUserId');
        const foundUser = users.find(u => u.id === savedUserId);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentUser(foundUser || users[0]);
    }, [users]);

    const addUser = (name: string, isParent: boolean = false) => {
        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            avatarSeed: name,
            isParent,
        };
        setUsers([...users, newUser]);
    };

    const switchUser = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('currentUserId', user.id);
        }
    };

    return (
        <UserContext.Provider value={{ users, currentUser, addUser, switchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
