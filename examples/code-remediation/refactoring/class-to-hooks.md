# Refactoring: Class Components to Hooks

## Problem

Class components in React Native have several limitations:
- Verbose syntax with boilerplate code
- Complex lifecycle methods
- `this` binding confusion
- Harder to reuse stateful logic
- Larger bundle size
- More difficult to optimize

## Benefits of Hooks

- ✅ Less boilerplate code
- ✅ Better code reusability with custom hooks
- ✅ Easier to understand and maintain
- ✅ Better TypeScript integration
- ✅ Improved performance optimization
- ✅ Simplified testing

## Example 1: Simple State Component

### ❌ Before (Class Component)

```tsx
// UserCard.tsx (Class Component)
import React, { Component } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface UserCardProps {
  userId: string;
  onDelete: (userId: string) => void;
}

interface UserCardState {
  isExpanded: boolean;
  deleteCount: number;
}

export class UserCard extends Component<UserCardProps, UserCardState> {
  constructor(props: UserCardProps) {
    super(props);
    this.state = {
      isExpanded: false,
      deleteCount: 0,
    };

    // Binding methods
    this.handleToggle = this.handleToggle.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleToggle() {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded,
    }));
  }

  handleDelete() {
    this.setState(
      (prevState) => ({
        deleteCount: prevState.deleteCount + 1,
      }),
      () => {
        this.props.onDelete(this.props.userId);
      }
    );
  }

  render() {
    const { userId } = this.props;
    const { isExpanded, deleteCount } = this.state;

    return (
      <View style={styles.container}>
        <Text>User ID: {userId}</Text>
        {isExpanded && <Text>Delete Count: {deleteCount}</Text>}
        <Button title="Toggle" onPress={this.handleToggle} />
        <Button title="Delete" onPress={this.handleDelete} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
});
```

### ✅ After (Functional Component with Hooks)

```tsx
// UserCard.tsx (Functional Component)
import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface UserCardProps {
  userId: string;
  onDelete: (userId: string) => void;
}

/**
 * User card component with expandable details
 */
export const UserCard: React.FC<UserCardProps> = ({ userId, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleDelete = useCallback(() => {
    setDeleteCount((prev) => prev + 1);
    onDelete(userId);
  }, [userId, onDelete]);

  return (
    <View style={styles.container}>
      <Text>User ID: {userId}</Text>
      {isExpanded && <Text>Delete Count: {deleteCount}</Text>}
      <Button title="Toggle" onPress={handleToggle} />
      <Button title="Delete" onPress={handleDelete} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
});
```

### Improvements

- **Lines of code**: Reduced from ~60 to ~40 lines
- **No constructor**: Direct state initialization
- **No binding**: Automatic with hooks
- **Better TypeScript**: Inferred types
- **Performance**: Memoized callbacks with useCallback

## Example 2: Lifecycle Methods to Hooks

### ❌ Before (Class with Lifecycle)

```tsx
// DataFetcher.tsx (Class Component)
import React, { Component } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface DataFetcherProps {
  url: string;
}

interface DataFetcherState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

export class DataFetcher extends Component<DataFetcherProps, DataFetcherState> {
  private mounted = false;

  constructor(props: DataFetcherProps) {
    super(props);
    this.state = {
      data: null,
      loading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.fetchData();
  }

  componentDidUpdate(prevProps: DataFetcherProps) {
    if (prevProps.url !== this.props.url) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async fetchData() {
    this.setState({ loading: true, error: null });

    try {
      const response = await fetch(this.props.url);
      const data = await response.json();

      if (this.mounted) {
        this.setState({ data, loading: false });
      }
    } catch (error) {
      if (this.mounted) {
        this.setState({
          error: error.message,
          loading: false,
        });
      }
    }
  }

  render() {
    const { data, loading, error } = this.state;

    if (loading) return <ActivityIndicator />;
    if (error) return <Text>Error: {error}</Text>;
    if (!data) return <Text>No data</Text>;

    return (
      <View>
        <Text>{JSON.stringify(data)}</Text>
      </View>
    );
  }
}
```

### ✅ After (Functional with useEffect)

```tsx
// DataFetcher.tsx (Functional Component)
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface DataFetcherProps {
  url: string;
}

/**
 * Component that fetches and displays data from an API
 */
export const DataFetcher: React.FC<DataFetcherProps> = ({ url }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        const result = await response.json();

        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [url]); // Re-fetch when URL changes

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;
  if (!data) return <Text>No data</Text>;

  return (
    <View>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
};
```

### Lifecycle Method Mapping

| Class Component | Functional Component |
|----------------|---------------------|
| `constructor` | `useState` initialization |
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` |
| `componentWillUnmount` | `useEffect` cleanup function |
| `shouldComponentUpdate` | `React.memo` |
| `getDerivedStateFromProps` | State updates in render |

## Example 3: Custom Hook Extraction

### Before: Duplicated Logic

```tsx
// UserProfile.tsx
export const UserProfile: React.FC = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile().then(setData).catch(setError);
  }, []);

  // Component logic...
};

// PostsList.tsx
export const PostsList: React.FC = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts().then(setData).catch(setError);
  }, []);

  // Component logic...
};
```

### After: Custom Hook

```tsx
// hooks/useFetch.ts
import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for data fetching with loading and error states
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true }));

    fetchFn()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}

// UserProfile.tsx
export const UserProfile: React.FC = () => {
  const { data, loading, error } = useFetch(fetchUserProfile);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return <Text>{data?.name}</Text>;
};

// PostsList.tsx
export const PostsList: React.FC = () => {
  const { data, loading, error } = useFetch(fetchPosts);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return data?.map((post) => <Post key={post.id} {...post} />);
};
```

## Using MCP Tools

### Step 1: Analyze Class Component

```
Analyze this class component and recommend refactoring to hooks:

[paste class component]
```

### Step 2: Automatic Refactoring

```
Refactor this class component to a functional component with hooks:

[paste class component]
```

The `refactor_component` tool will:
- Convert class to functional component
- Replace lifecycle methods with useEffect
- Add proper TypeScript types
- Extract reusable logic into custom hooks
- Optimize with useCallback and useMemo

### Step 3: Verify Refactoring

```
Analyze the refactored component to ensure:
- All functionality preserved
- Proper cleanup implemented
- Performance optimized
- TypeScript types correct
```

## Refactoring Checklist

When converting class to hooks, ensure:

- [ ] All state variables converted to useState
- [ ] Constructor logic moved to useState initialization
- [ ] Event handlers wrapped in useCallback
- [ ] Side effects moved to useEffect
- [ ] Cleanup functions added where needed
- [ ] Props properly destructured
- [ ] TypeScript types added/updated
- [ ] Tests updated
- [ ] Performance optimizations added (memo, useCallback, useMemo)
- [ ] No breaking changes in component API

## Best Practices

### 1. Start with Simple Components

Begin refactoring simple components before tackling complex ones.

### 2. Test Thoroughly

Always have tests before refactoring:
```tsx
describe('UserCard', () => {
  it('should toggle expansion', () => {
    // Test works with both class and functional
  });
});
```

### 3. Use Custom Hooks

Extract reusable logic:
```tsx
// Before: Logic in component
const [data, setData] = useState(null);
useEffect(() => { /* fetch logic */ }, []);

// After: Custom hook
const { data } = useFetch(url);
```

### 4. Memoize Callbacks

Prevent unnecessary re-renders:
```tsx
const handleClick = useCallback(() => {
  doSomething(props.value);
}, [props.value]);
```

### 5. Add React.memo for Expensive Components

```tsx
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  // Expensive rendering logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data === nextProps.data;
});
```

## Common Pitfalls

### 1. Missing Dependencies

```tsx
// ❌ BAD
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// ✅ GOOD
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 2. Stale Closures

```tsx
// ❌ BAD
useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1); // Stale closure
  }, 1000);
  return () => clearInterval(interval);
}, []);

// ✅ GOOD
useEffect(() => {
  const interval = setInterval(() => {
    setCount((prev) => prev + 1); // Use updater function
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

### 3. Overusing useEffect

```tsx
// ❌ BAD
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ GOOD
const fullName = `${firstName} ${lastName}`;
```

---

**Related Examples**:
- [Memory Leaks](../performance-fixes/memory-leaks.md)
- [Getting Started](../../basic-usage/getting-started.md)
- [Testing Examples](../../testing/)
