# Convex Migration Scripts

Quick reference for running database migrations.

## Reset Onboarding for Admin

```bash
cd web
npx convex run migrations:resetOnboarding --adminOnly true
```

## Reset Onboarding for Specific User

```bash
npx convex run migrations:resetOnboarding --email "your-email@example.com"
```

## Add Missing Fields to Old Users

Run this if users were created before `onboardingCompleted` field existed:

```bash
npx convex run migrations:addMissingFields
```

## Generic Field Reset

Reset any field for admin or specific users:

```bash
# Reset for admin
npx convex run migrations:resetField --field "onboardingCompleted" --value false --adminOnly true

# Reset for specific user
npx convex run migrations:resetField --field "allowPersonalization" --value true --email "user@example.com"
```

## List All Users (Debug)

```bash
npx convex run migrations:listUsers
```

## Common Workflows

### Testing Onboarding Flow

1. Reset admin onboarding:
   ```bash
   npx convex run migrations:resetOnboarding --adminOnly true
   ```

2. Sign out and sign in again to see the tutorial

### Fix Legacy Users

If users exist from before new fields were added:

```bash
npx convex run migrations:addMissingFields
```

This will add:
- `onboardingCompleted: false`
- `allowPersonalization: true`

to any users missing these fields.
