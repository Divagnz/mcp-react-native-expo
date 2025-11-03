# Performance Fix: Memory Leaks

## Problem

Memory leaks in React Native apps lead to:
- Gradually increasing memory usage
- App crashes on low-memory devices
- Poor user experience
- Battery drain

Common causes:
- Event listeners not cleaned up
- Timers not cleared
- Subscriptions not cancelled
- Closures holding references

## Detection

The `analyze_codebase_performance` tool automatically detects:
- Missing cleanup in useEffect
- Uncleared timers and intervals
- Event listeners without removal
- Subscription leaks
- Closure memory issues

## Example 1: Event Listener Leak

### ❌ Before (Memory Leak)

```tsx
// UserLocation.tsx
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export const UserLocation: React.FC = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    // Memory leak: watchId never cleared
    const watchId = Geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );
  }, []);

  return (
    <View>
      <Text>
        Location: {location?.latitude}, {location?.longitude}
      </Text>
    </View>
  );
};
```

### Issues

1. **Critical**: Geolocation watcher never stopped
2. **High**: Component unmount doesn't cleanup
3. **High**: Multiple instances create multiple watchers
4. **Medium**: No error state handling

### ✅ After (Fixed)

```tsx
// UserLocation.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

interface Location {
  latitude: number;
  longitude: number;
}

interface UserLocationProps {
  onLocationChange?: (location: Location) => void;
}

/**
 * Component that tracks user's location with proper cleanup
 */
export const UserLocation: React.FC<UserLocationProps> = ({
  onLocationChange,
}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let watchId: number;

    // Start watching position
    watchId = Geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        setLoading(false);
        onLocationChange?.(newLocation);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    // Cleanup function: clear watcher when component unmounts
    return () => {
      if (watchId !== undefined) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [onLocationChange]);

  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View>
      <Text>
        Location: {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}
      </Text>
    </View>
  );
};
```

## Example 2: Timer Leak

### ❌ Before (Memory Leak)

```tsx
// CountdownTimer.tsx
import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

export const CountdownTimer: React.FC<{ seconds: number }> = ({ seconds }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    // Memory leak: interval never cleared
    setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
  }, []);

  return <Text>{timeLeft}s remaining</Text>;
};
```

### ✅ After (Fixed)

```tsx
// CountdownTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Text } from 'react-native';

interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
}

/**
 * Countdown timer with proper cleanup
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  seconds,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Reset timer when seconds prop changes
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    // Store interval ID in ref
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          // Clear interval when reaching zero
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onComplete?.();
        }
        return Math.max(0, newValue);
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLeft, onComplete]);

  return <Text>{timeLeft}s remaining</Text>;
};
```

## Example 3: Event Emitter Leak

### ❌ Before (Memory Leak)

```tsx
// NotificationListener.tsx
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { EventEmitter } from 'events';

const notificationEmitter = new EventEmitter();

export const NotificationListener: React.FC = () => {
  const [notification, setNotification] = useState<string>('');

  useEffect(() => {
    // Memory leak: listener never removed
    notificationEmitter.on('notification', (data) => {
      setNotification(data.message);
    });
  }, []);

  return (
    <View>
      <Text>{notification}</Text>
    </View>
  );
};
```

### ✅ After (Fixed)

```tsx
// NotificationListener.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { EventEmitter } from 'events';

const notificationEmitter = new EventEmitter();

interface NotificationData {
  message: string;
  timestamp: number;
}

/**
 * Component that listens for notifications with proper cleanup
 */
export const NotificationListener: React.FC = () => {
  const [notification, setNotification] = useState<string>('');

  // Memoize handler to ensure same reference
  const handleNotification = useCallback((data: NotificationData) => {
    setNotification(data.message);
  }, []);

  useEffect(() => {
    // Add listener
    notificationEmitter.on('notification', handleNotification);

    // Cleanup: remove listener when component unmounts
    return () => {
      notificationEmitter.off('notification', handleNotification);
    };
  }, [handleNotification]);

  return (
    <View>
      {notification ? (
        <Text>{notification}</Text>
      ) : (
        <Text>No notifications</Text>
      )}
    </View>
  );
};
```

## Example 4: Subscription Leak (Redux, Apollo, etc.)

### ❌ Before (Memory Leak)

```tsx
// UserProfileSubscription.tsx
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { apolloClient } from './apolloClient';
import { USER_PROFILE_SUBSCRIPTION } from './graphql/subscriptions';

export const UserProfileSubscription: React.FC<{ userId: string }> = ({
  userId,
}) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Memory leak: subscription never unsubscribed
    apolloClient
      .subscribe({
        query: USER_PROFILE_SUBSCRIPTION,
        variables: { userId },
      })
      .subscribe({
        next: (data) => setProfile(data.data.userProfile),
        error: (err) => console.error(err),
      });
  }, [userId]);

  return (
    <View>
      <Text>{profile?.name}</Text>
    </View>
  );
};
```

### ✅ After (Fixed)

```tsx
// UserProfileSubscription.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Subscription } from 'zen-observable-ts';
import { apolloClient } from './apolloClient';
import { USER_PROFILE_SUBSCRIPTION } from './graphql/subscriptions';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface UserProfileSubscriptionProps {
  userId: string;
}

/**
 * Component with GraphQL subscription and proper cleanup
 */
export const UserProfileSubscription: React.FC<UserProfileSubscriptionProps> = ({
  userId,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: Subscription | undefined;

    // Create subscription
    const observable = apolloClient.subscribe({
      query: USER_PROFILE_SUBSCRIPTION,
      variables: { userId },
    });

    subscription = observable.subscribe({
      next: (result) => {
        if (result.data?.userProfile) {
          setProfile(result.data.userProfile);
          setLoading(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      },
    });

    // Cleanup: unsubscribe when component unmounts or userId changes
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId]);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;
  if (!profile) return <Text>No profile data</Text>;

  return (
    <View>
      <Text>{profile.name}</Text>
      <Text>{profile.email}</Text>
    </View>
  );
};
```

## Using MCP Tools

### Step 1: Detect Memory Leaks

```
Analyze this component for memory leaks and performance issues:

[paste component code]
```

### Step 2: Get Specific Recommendations

```
Analyze codebase performance at /path/to/project

Focus on:
- Memory leaks
- Event listener cleanup
- Timer management
- Subscription handling
```

### Step 3: Remediate Automatically

```
Remediate this code to fix memory leaks:

[paste code]
```

### Step 4: Verify Fix

```
Analyze the remediated code to verify memory leaks are resolved
```

## Common Memory Leak Patterns

### Pattern 1: Missing Cleanup in useEffect

```tsx
// ❌ BAD
useEffect(() => {
  someSetup();
}, []);

// ✅ GOOD
useEffect(() => {
  someSetup();
  return () => someCleanup();
}, []);
```

### Pattern 2: Timers Without Cleanup

```tsx
// ❌ BAD
useEffect(() => {
  setTimeout(() => updateState(), 1000);
}, []);

// ✅ GOOD
useEffect(() => {
  const timer = setTimeout(() => updateState(), 1000);
  return () => clearTimeout(timer);
}, []);
```

### Pattern 3: Event Listeners Without Removal

```tsx
// ❌ BAD
useEffect(() => {
  emitter.on('event', handler);
}, []);

// ✅ GOOD
useEffect(() => {
  emitter.on('event', handler);
  return () => emitter.off('event', handler);
}, []);
```

### Pattern 4: Async Operations Without Cancellation

```tsx
// ❌ BAD
useEffect(() => {
  fetchData().then(setData);
}, []);

// ✅ GOOD
useEffect(() => {
  let cancelled = false;

  fetchData().then((result) => {
    if (!cancelled) {
      setData(result);
    }
  });

  return () => {
    cancelled = true;
  };
}, []);
```

## Best Practices

### 1. Always Return Cleanup Functions

Every `useEffect` that sets up a resource should clean it up:

```tsx
useEffect(() => {
  // Setup
  const resource = setup();

  // Cleanup
  return () => {
    cleanup(resource);
  };
}, [deps]);
```

### 2. Use useRef for Mutable Values

Store interval/timeout IDs in refs:

```tsx
const intervalRef = useRef<NodeJS.Timeout>();

useEffect(() => {
  intervalRef.current = setInterval(callback, 1000);
  return () => clearInterval(intervalRef.current);
}, []);
```

### 3. Memoize Event Handlers

Ensure handlers can be properly removed:

```tsx
const handleEvent = useCallback((data) => {
  // Handle event
}, [deps]);

useEffect(() => {
  emitter.on('event', handleEvent);
  return () => emitter.off('event', handleEvent);
}, [handleEvent]);
```

### 4. Check Component Mount Status

For async operations:

```tsx
useEffect(() => {
  let isMounted = true;

  fetchData().then((data) => {
    if (isMounted) {
      setState(data);
    }
  });

  return () => {
    isMounted = false;
  };
}, []);
```

## Testing for Memory Leaks

### Manual Testing

1. Open React Native Debugger
2. Go to Memory profiler
3. Take heap snapshot
4. Interact with component
5. Force garbage collection
6. Take another snapshot
7. Compare - look for retained objects

### Automated Testing

```tsx
// memory-leak.test.tsx
import { render, unmount } from '@testing-library/react-native';
import { CountdownTimer } from './CountdownTimer';

describe('CountdownTimer - Memory Leaks', () => {
  it('should cleanup timer on unmount', () => {
    jest.useFakeTimers();

    const { unmount } = render(<CountdownTimer seconds={10} />);

    // Unmount component
    unmount();

    // Verify no timers are still running
    expect(jest.getTimerCount()).toBe(0);

    jest.useRealTimers();
  });
});
```

## Tools for Detection

### React DevTools Profiler

1. Install React DevTools
2. Open Profiler tab
3. Record interactions
4. Check for:
   - Components that render too often
   - Long render times
   - Memory growth

### Flipper

1. Install Flipper
2. Enable "Layout Inspector"
3. Monitor memory usage
4. Look for gradual increases

### Xcode Instruments (iOS)

1. Open in Xcode
2. Product → Profile
3. Select "Leaks" instrument
4. Run app and interact
5. Check for memory leaks

### Android Profiler

1. Open Android Studio
2. View → Tool Windows → Profiler
3. Select Memory profiler
4. Record and analyze

## Memory Leak Checklist

Before releasing, verify:

- [ ] All timers cleared in cleanup
- [ ] All intervals cleared in cleanup
- [ ] All event listeners removed in cleanup
- [ ] All subscriptions unsubscribed in cleanup
- [ ] Async operations cancelled on unmount
- [ ] No closures holding unnecessary references
- [ ] useCallback used for event handlers
- [ ] useRef used for mutable values
- [ ] Component mount status checked for async ops
- [ ] Memory profiling shows no growth
- [ ] No warning about setting state on unmounted component

---

**Related Examples**:
- [List Performance](./list-performance.md)
- [Bundle Size Optimization](./bundle-size.md)
- [Hardcoded Secrets](../security-fixes/hardcoded-secrets.md)
