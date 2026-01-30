const STORAGE_KEY = 'uniclub_event_registrations';

export const getRegistrations = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const getRegistrationsMap = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const ids = data ? JSON.parse(data) : [];
        const map = {};
        ids.forEach((id) => {
            map[id] = true;
        });
        return map;
    } catch {
        return {};
    }
};

export const isRegistered = (eventId) => {
    const registrations = getRegistrations();
    return registrations.includes(eventId);
};

export const registerEvent = (eventId) => {
    const registrations = getRegistrations();
    if (!registrations.includes(eventId)) {
        registrations.push(eventId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    }
    return true;
};

export const unregisterEvent = (eventId) => {
    const registrations = getRegistrations();
    const filtered = registrations.filter((id) => id !== eventId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
};
