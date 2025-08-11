export const toSearchParams = (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(v => {
                if (v !== undefined && v !== null && v !== '') searchParams.append(key, v);
            });
        } else if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
        }
    });
    return searchParams;
}