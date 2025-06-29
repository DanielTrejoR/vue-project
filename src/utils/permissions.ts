export function hasPermission(
    userPermissions: string[] | undefined,
    required: string | string[]
): boolean {
    if (!userPermissions) return false;

    const needed = Array.isArray(required) ? required : [required];
    return needed.every((perm) => userPermissions.includes(perm));
}

export function hasRole(userRoles: string[] | undefined, role: string): boolean {
    return !!userRoles?.includes(role);
}