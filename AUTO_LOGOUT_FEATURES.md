# Auto Logout Features Implementation

This document describes the implementation of auto logout features for the Shesha framework as requested in the requirements.

## Overview

The auto logout functionality has been implemented with two main features:

1. **Logout when browser is closed** - Automatically logs out users after a specified time when they close or navigate away from the browser
2. **Logout when user is inactive** - Automatically logs out users after a specified period of inactivity, with a countdown display

## Backend Implementation

### 1. SecuritySettings Class Updates
Added new properties to `SecuritySettings.cs`:
- `LogoutWhenBrowserClosed` (boolean) - Default: false
- `LogoutTimeoutSecondsBrowserClose` (int) - Default: 30 seconds
- `LogoutWhenUserInactive` (boolean) - Default: false  
- `LogoutTimeoutMinutesUserInactive` (int) - Default: 15 minutes

### 2. AuthorizationSettingsDto Updates
Extended the DTO to include the new auto logout properties for API communication.

### 3. AuthorizationSettingsAppService Updates
Updated the service to handle getting and setting the new auto logout configuration properties.

### 4. Database Migration
Created migration `M20250720171300.cs` to initialize the new settings with default values.

## Frontend Implementation

### 1. AutoLogoutHandler Component
Created a new React component (`/src/components/autoLogoutHandler/index.tsx`) that:

- **Browser Close Detection**: Uses `beforeunload` and `visibilitychange` events to detect when users leave the page
- **Session Storage**: Stores timestamps to track time away from the application
- **User Inactivity**: Extends the existing IdleTimerRenderer functionality
- **Countdown Display**: Shows a persistent countdown when user inactivity logout is enabled
- **Modal Dialog**: Displays warning dialog before automatic logout

### 2. Integration with Authentication Flow
Updated `withAuth` HOC to use the new `AutoLogoutHandler` instead of the commented-out `IdleTimerRenderer`.

## Configuration

### Settings Location
The auto logout settings are configured through the Security Settings in the admin panel:

1. Navigate to Admin Panel > Configurations > Security Settings
2. Configure the following options:

#### Logon Section Settings:
- **Logout when the browser is closed**: Enable/disable browser close logout
  - When enabled, shows: **Logout timeout (seconds)** - Time before logout when browser is closed
- **Logout when the user is inactive**: Enable/disable inactivity logout  
  - When enabled, shows: **Logout timeout (minutes)** - Inactivity period before logout
  - When enabled, shows countdown in the UI

### Default Values
- Browser close logout: **Disabled**
- Browser close timeout: **30 seconds**
- User inactivity logout: **Disabled**
- User inactivity timeout: **15 minutes**

## Features

### Browser Close Logout
When enabled:
- Detects when user closes browser tab/window or navigates away
- Starts countdown timer for specified seconds
- If user returns within timeout period, logout is cancelled
- If timeout expires, user is automatically logged out
- Shows login screen when user returns after timeout

### User Inactivity Logout  
When enabled:
- Monitors user activity (mouse, keyboard, touch)
- Shows persistent countdown display in top-right corner
- Displays modal warning before logout with options:
  - **Keep me signed in** - Resets the timer
  - **Logoff** - Immediate logout
- Automatic logout if no user response

### Backward Compatibility
- Maintains compatibility with existing `AutoLogoffTimeout` setting
- If new user inactivity setting is disabled, falls back to legacy timeout
- Existing IdleTimerRenderer functionality is preserved within AutoLogoutHandler

## Usage Examples

### Enable Browser Close Logout (30 second timeout)
```json
{
  "logoutWhenBrowserClosed": true,
  "logoutTimeoutSecondsBrowserClose": 30
}
```

### Enable User Inactivity Logout (15 minute timeout)
```json
{
  "logoutWhenUserInactive": true,
  "logoutTimeoutMinutesUserInactive": 15
}
```

### Enable Both Features
```json
{
  "logoutWhenBrowserClosed": true,
  "logoutTimeoutSecondsBrowserClose": 60,
  "logoutWhenUserInactive": true,
  "logoutTimeoutMinutesUserInactive": 10
}
```

## Technical Implementation Details

### Browser Events Handled
- `beforeunload` - Triggered when user tries to leave the page
- `visibilitychange` - Triggered when tab becomes hidden/visible

### Session Storage Usage
- `userLeftTimestamp` - Stores when user left the application
- Cleared when user returns within timeout period

### Timer Management
- Uses `setTimeout` for browser close logout timer
- Uses `react-idle-timer` for user inactivity detection
- Uses `react-use` interval hook for countdown display

### Error Handling
- Graceful fallback if settings are not available
- Console logging for debugging timeout issues
- Maintains application stability if logout fails

## Security Considerations

- Logout is performed server-side to ensure session termination
- Client-side timers are used for UX but don't replace server-side session management
- Session storage is cleaned up appropriately
- No sensitive data is stored in browser storage

## Testing

To test the auto logout features:

1. **Browser Close Logout**:
   - Enable the setting with short timeout (e.g., 10 seconds)
   - Close browser tab and wait for timeout
   - Reopen and verify login screen is shown

2. **User Inactivity Logout**:
   - Enable the setting with short timeout (e.g., 2 minutes)
   - Verify countdown appears in UI
   - Stop interacting and wait for modal warning
   - Test both "Keep signed in" and "Logoff" options

## Future Enhancements

Potential improvements for future versions:
- Server-side session timeout enforcement
- Advanced warning notifications
- Customizable countdown display options
- Integration with audit logging
- Support for different timeout values per user role