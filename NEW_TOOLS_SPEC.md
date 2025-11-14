# New Tools Specification

**Document Version:** 1.0
**Last Updated:** 2025-11-10
**Status:** Planning Phase

This document specifies new MCP tools that should be implemented to address critical pain points identified in production usage.

---

## Process Management Tools

### `expo_sessions_list`

**Purpose:** List all active Expo sessions with status information

**Priority:** P0 (Critical)

**Why Needed:** Users must manually track session IDs and cannot see what's running

#### Parameters

```typescript
interface ExpoSessionsListParams {
  show_ports?: boolean;      // Show port information (default: true)
  show_zombies?: boolean;    // Show zombie sessions (default: true)
  type_filter?: 'dev_server' | 'local_build' | 'cloud_build' | 'all';  // Filter by type (default: 'all')
}
```

#### Response

```typescript
interface ExpoSessionsListResponse {
  active_sessions: ExpoSession[];
  zombie_sessions: ExpoSession[];
  total_active: number;
  ports_in_use: number[];
}

interface ExpoSession {
  id: string;                 // Session ID (e.g., "expo-dev-1762809634019")
  type: 'dev_server' | 'local_build' | 'cloud_build';
  platform?: 'android' | 'ios' | 'all';
  pid?: number;               // Process ID (null if zombie)
  port?: number;              // Port number (8081, 19000, etc.)
  status: 'starting' | 'running' | 'building' | 'stopped' | 'zombie';
  started_at: string;         // ISO 8601 timestamp
  last_activity: string;      // Human-readable (e.g., "2s ago")
  uptime: string;             // Human-readable (e.g., "5m 23s")
  project_path?: string;      // Project directory
}
```

#### Example Usage

```typescript
// List all sessions
expo_sessions_list()

// List only dev servers
expo_sessions_list(type_filter: 'dev_server')

// List with port information
expo_sessions_list(show_ports: true, show_zombies: false)
```

#### Example Response

```json
{
  "success": true,
  "message": "Found 2 active sessions",
  "data": {
    "active_sessions": [
      {
        "id": "expo-dev-1762809634019",
        "type": "dev_server",
        "platform": "android",
        "pid": 12345,
        "port": 8081,
        "status": "running",
        "started_at": "2025-11-10T14:23:18Z",
        "last_activity": "2s ago",
        "uptime": "5m 23s",
        "project_path": "/home/user/my-app"
      },
      {
        "id": "expo-build-android-1762828818107",
        "type": "local_build",
        "platform": "android",
        "pid": 12346,
        "status": "building",
        "started_at": "2025-11-10T14:28:18Z",
        "last_activity": "1s ago",
        "uptime": "45s",
        "project_path": "/home/user/my-app"
      }
    ],
    "zombie_sessions": [
      {
        "id": "expo-dev-1762809123456",
        "type": "dev_server",
        "pid": null,
        "status": "zombie",
        "started_at": "2025-11-10T13:00:00Z",
        "last_activity": "1h ago",
        "uptime": "N/A"
      }
    ],
    "total_active": 2,
    "ports_in_use": [8081]
  }
}
```

#### Implementation Notes

- Store session metadata in SQLite or JSON file
- Track process health via periodic PID checks
- Clean up zombie sessions automatically
- Persist across MCP server restarts

---

### `expo_kill_process`

**Purpose:** Kill Expo processes by PID, port, or session ID

**Priority:** P0 (Critical)

**Why Needed:** Users manually run `lsof -ti:8081 | xargs kill -9` to free ports

#### Parameters

```typescript
interface ExpoKillProcessParams {
  pid?: number;              // Kill by process ID
  port?: number;             // Kill process using port
  session_id?: string;       // Kill by session ID
  force?: boolean;           // Force kill (SIGKILL vs SIGTERM, default: false)
  cleanup?: boolean;         // Cleanup session metadata (default: true)
}
```

#### Response

```typescript
interface ExpoKillProcessResponse {
  killed: boolean;
  process?: {
    pid: number;
    name: string;
    port?: number;
  };
  session_cleaned?: string;  // Session ID that was cleaned
}
```

#### Example Usage

```typescript
// Kill by port (most common)
expo_kill_process(port: 8081)

// Kill by session ID
expo_kill_process(session_id: "expo-dev-1762809634019")

// Kill by PID with force
expo_kill_process(pid: 12345, force: true)

// Kill without cleanup (keep session metadata)
expo_kill_process(port: 8081, cleanup: false)
```

#### Example Response

```json
{
  "success": true,
  "message": "Killed process on port 8081",
  "data": {
    "killed": true,
    "process": {
      "pid": 12345,
      "name": "node metro-bundler",
      "port": 8081
    },
    "session_cleaned": "expo-dev-1762809634019"
  }
}
```

#### Implementation Notes

- Platform-specific process killing (Windows, macOS, Linux)
- Graceful shutdown first (SIGTERM), then force (SIGKILL) if needed
- Verify process is actually killed
- Clean up session metadata
- Handle permission errors gracefully

---

### `expo_cleanup`

**Purpose:** Kill all Expo-related processes and clean up resources

**Priority:** P1 (High)

**Why Needed:** Users need "nuclear option" to clean slate

#### Parameters

```typescript
interface ExpoCleanupParams {
  force?: boolean;           // Force kill all processes (default: false)
  clean_cache?: boolean;     // Clear Metro bundler cache (default: false)
  clean_sessions?: boolean;  // Remove all session metadata (default: true)
}
```

#### Response

```typescript
interface ExpoCleanupResponse {
  killed_processes: Array<{
    pid: number;
    name: string;
    port?: number;
  }>;
  freed_ports: number[];
  cleaned_sessions: string[];
  cache_cleared: boolean;
}
```

#### Example Usage

```typescript
// Basic cleanup
expo_cleanup()

// Full cleanup with cache
expo_cleanup(force: true, clean_cache: true)

// Clean processes but keep sessions
expo_cleanup(clean_sessions: false)
```

#### Example Response

```json
{
  "success": true,
  "message": "Cleaned up 3 processes and freed 2 ports",
  "data": {
    "killed_processes": [
      {"pid": 12345, "name": "node metro-bundler", "port": 8081},
      {"pid": 12346, "name": "gradle", "port": null},
      {"pid": 12347, "name": "java", "port": null}
    ],
    "freed_ports": [8081, 19000],
    "cleaned_sessions": [
      "expo-dev-1762809634019",
      "expo-build-android-1762828818107"
    ],
    "cache_cleared": false
  }
}
```

---

## Diagnostics & Validation Tools

### `expo_doctor`

**Purpose:** Run comprehensive health checks and return structured results

**Priority:** P0 (Critical)

**Why Needed:** Users manually run `npx expo-doctor` and fix issues one by one (15+ minutes)

#### Parameters

```typescript
interface ExpoDoctorParams {
  auto_fix?: boolean;        // Automatically fix issues (default: false)
  verbose?: boolean;         // Show detailed check information (default: false)
  checks?: string[];         // Run specific checks only (default: all)
}
```

#### Response

```typescript
interface ExpoDoctorResponse {
  checks_passed: number;
  checks_failed: number;
  overall_health: 'healthy' | 'warning' | 'error';
  issues: DoctorIssue[];
  fixes_available: boolean;
  fixes_applied?: number;    // If auto_fix was true
}

interface DoctorIssue {
  type: 'duplicate_dependencies' | 'version_mismatch' | 'missing_peer_deps' |
        'config_error' | 'environment_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_packages?: string[];
  affected_files?: string[];
  fix_command: string;       // Command to fix the issue
  auto_fixable: boolean;
  docs_url?: string;
}
```

#### Example Usage

```typescript
// Basic health check
expo_doctor()

// Auto-fix all issues
expo_doctor(auto_fix: true)

// Check specific areas
expo_doctor(checks: ['dependencies', 'environment'])

// Verbose output
expo_doctor(verbose: true, auto_fix: false)
```

#### Example Response

```json
{
  "success": true,
  "message": "15/17 checks passed, 2 issues found",
  "data": {
    "checks_passed": 15,
    "checks_failed": 2,
    "overall_health": "warning",
    "issues": [
      {
        "type": "duplicate_dependencies",
        "severity": "high",
        "title": "Duplicate dependencies detected",
        "description": "3 packages have multiple versions installed",
        "affected_packages": [
          "@expo/vector-icons: 14.1.0, 15.0.3",
          "expo-constants: 17.1.7, 18.0.10",
          "expo-font: 13.3.2, 14.0.9"
        ],
        "fix_command": "expo_install_check --fix-duplicates",
        "auto_fixable": true,
        "docs_url": "https://expo.fyi/resolving-dependency-issues"
      },
      {
        "type": "version_mismatch",
        "severity": "critical",
        "title": "27 packages out of date",
        "description": "Package versions don't match Expo SDK 54",
        "affected_packages": [
          "@expo/vector-icons: 14.1.0 → ^15.0.3",
          "expo-av: 15.1.7 → ~16.0.7",
          "react-native: 0.79.6 → 0.81.5"
        ],
        "fix_command": "expo_install_check --auto-fix",
        "auto_fixable": true,
        "docs_url": "https://expo.fyi/dependency-validation"
      }
    ],
    "fixes_available": true
  }
}
```

#### Implementation Notes

- Wrap `npx expo-doctor` command
- Parse output to structured JSON
- Implement auto-fix logic for each issue type
- Cache results for 5 minutes
- Run automatically before builds (opt-in flag)

---

### `expo_validate_environment`

**Purpose:** Validate build environment (Java, Android SDK, ports, disk space)

**Priority:** P0 (Critical)

**Why Needed:** Builds fail 10 minutes in due to Java 24 incompatibility

#### Parameters

```typescript
interface ExpoValidateEnvironmentParams {
  platform: 'android' | 'ios' | 'all';
  strict?: boolean;          // Fail on warnings (default: false)
  fix_suggestions?: boolean; // Include fix commands (default: true)
}
```

#### Response

```typescript
interface EnvironmentValidation {
  valid: boolean;
  platform: string;
  environment: {
    java?: JavaValidation;
    android?: AndroidValidation;
    ios?: IosValidation;
    expo_cli: ExpoCliValidation;
    ports: PortValidation;
    disk_space: DiskSpaceValidation;
  };
  blockers: ValidationIssue[];
  warnings: ValidationIssue[];
}

interface JavaValidation {
  installed: boolean;
  version?: string;
  compatible: boolean;
  required: string;
  path?: string;
  fix?: string;
}

interface AndroidValidation {
  android_home: {
    set: boolean;
    path?: string;
    valid: boolean;
  };
  sdk_tools: {
    platform_tools: boolean;
    build_tools: string;
    ndk: string;
  };
  emulator: {
    available: boolean;
    devices: Array<{
      name: string;
      status: 'online' | 'offline' | 'unauthorized';
    }>;
  };
}

interface ValidationIssue {
  type: string;
  message: string;
  current?: string;
  required?: string;
  fix: string;
}
```

#### Example Usage

```typescript
// Validate for Android build
expo_validate_environment(platform: 'android')

// Strict mode (fail on warnings)
expo_validate_environment(platform: 'all', strict: true)

// Without fix suggestions
expo_validate_environment(platform: 'ios', fix_suggestions: false)
```

#### Example Response

```json
{
  "success": false,
  "message": "Environment validation failed with 2 blockers",
  "data": {
    "valid": false,
    "platform": "android",
    "environment": {
      "java": {
        "installed": true,
        "version": "24.0.0",
        "compatible": false,
        "required": "17.x - 21.x (LTS)",
        "path": "/usr/lib/jvm/java-24-openjdk",
        "fix": "Run 'jenv shell 17' or install Java 17 LTS"
      },
      "android": {
        "android_home": {
          "set": true,
          "path": "/home/user/Android/Sdk",
          "valid": true
        },
        "sdk_tools": {
          "platform_tools": true,
          "build_tools": "35.0.0",
          "ndk": "27.1.12297006"
        },
        "emulator": {
          "available": true,
          "devices": [
            {"name": "moto_g55_5G", "status": "online"}
          ]
        }
      },
      "expo_cli": {
        "installed": true,
        "version": "54.0.0",
        "compatible": true
      },
      "ports": {
        "8081": {
          "available": false,
          "process": {
            "pid": 12345,
            "name": "node metro-bundler",
            "uptime": "2h 15m"
          }
        },
        "19000": {
          "available": true
        }
      },
      "disk_space": {
        "free_gb": 15.3,
        "required_gb": 5.0,
        "sufficient": true
      }
    },
    "blockers": [
      {
        "type": "java_version",
        "message": "Java 24 not compatible with Gradle 8.13",
        "current": "24.0.0",
        "required": "17.x - 21.x",
        "fix": "jenv shell 17"
      },
      {
        "type": "port_conflict",
        "message": "Port 8081 already in use",
        "current": "PID 12345 (node metro-bundler)",
        "fix": "expo_kill_process --port 8081"
      }
    ],
    "warnings": []
  }
}
```

#### Implementation Notes

- Check Java version via `java -version`
- Check ANDROID_HOME and verify paths exist
- Check SDK tools via `sdkmanager --list`
- Check ports via `lsof` (Unix) or `netstat` (Windows)
- Check disk space via `df` (Unix) or `wmic` (Windows)
- Cache validation results for 5 minutes
- Auto-run before builds (opt-in flag in build tools)

---

### `expo_detect_polyfills`

**Purpose:** Detect missing polyfills in codebase (Buffer, EventTarget, etc.)

**Priority:** P1 (High)

**Why Needed:** Users manually discover polyfill errors at runtime (10+ minutes to fix)

#### Parameters

```typescript
interface ExpoDetectPolyfillsParams {
  scan_path?: string;        // Path to scan (default: current directory)
  include_packages?: boolean; // Scan node_modules too (default: false)
  polyfills?: string[];      // Check specific polyfills only (default: all)
}
```

#### Response

```typescript
interface PolyfillDetection {
  missing_polyfills: MissingPolyfill[];
  auto_fixable: boolean;
  scan_stats: {
    files_scanned: number;
    packages_scanned?: number;
    duration_ms: number;
  };
}

interface MissingPolyfill {
  name: string;              // e.g., "Buffer", "EventTarget"
  reason: string;            // Why it's needed
  locations: string[];       // File:line references
  solution: string;          // How to fix
  packages_needed?: string[]; // NPM packages to install
  auto_fix: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

#### Example Usage

```typescript
// Scan current directory
expo_detect_polyfills()

// Scan specific path
expo_detect_polyfills(scan_path: "./src")

// Check specific polyfills
expo_detect_polyfills(polyfills: ["Buffer", "EventTarget"])

// Include node_modules
expo_detect_polyfills(include_packages: true)
```

#### Example Response

```json
{
  "success": true,
  "message": "Found 2 missing polyfills",
  "data": {
    "missing_polyfills": [
      {
        "name": "Buffer",
        "reason": "Buffer.from() used in Hermes environment",
        "locations": [
          "services/muxService.ts:139: Buffer.from(`${this.tokenId}:${this.tokenSecret}`)"
        ],
        "solution": "Install @craftzdog/react-native-buffer or add minimal polyfill",
        "packages_needed": ["@craftzdog/react-native-buffer"],
        "auto_fix": true,
        "severity": "critical"
      },
      {
        "name": "EventTarget",
        "reason": "Required by @mux/mux-player-react package",
        "locations": [
          "components/video/MuxVideoPlayer.tsx:3: import MuxPlayer from '@mux/mux-player-react'"
        ],
        "solution": "Add EventTarget polyfill to app/_layout.tsx",
        "auto_fix": true,
        "severity": "critical"
      }
    ],
    "auto_fixable": true,
    "scan_stats": {
      "files_scanned": 45,
      "duration_ms": 523
    }
  }
}
```

#### Implementation Notes

- Use TypeScript AST parsing (ts-morph or @typescript-eslint/parser)
- Detect direct usage: `Buffer.from()`, `new EventTarget()`
- Detect indirect usage: packages that require polyfills
- Check `package.json` dependencies for known packages needing polyfills
- Scan for: Buffer, EventTarget, atob, btoa, URL, URLSearchParams, etc.

---

### `expo_setup_polyfills`

**Purpose:** Automatically setup required polyfills

**Priority:** P1 (High)

**Why Needed:** Users manually write 20+ lines of polyfill code

#### Parameters

```typescript
interface ExpoSetupPolyfillsParams {
  polyfills: string[] | "auto"; // Polyfills to setup or "auto" to detect
  install_packages?: boolean;    // Install required packages (default: true)
  layout_file?: string;          // Entry point file (default: auto-detect)
  backup?: boolean;              // Create backup before modifying (default: true)
  strategy?: 'minimal' | 'package'; // Use minimal polyfill or full package (default: 'minimal')
}
```

#### Response

```typescript
interface PolyfillSetupResponse {
  polyfills_added: string[];
  packages_installed: string[];
  files_modified: string[];
  backup_created?: string;
  warnings?: string[];
}
```

#### Example Usage

```typescript
// Auto-detect and setup
expo_setup_polyfills(polyfills: "auto")

// Setup specific polyfills
expo_setup_polyfills(polyfills: ["Buffer", "EventTarget"])

// Without package installation
expo_setup_polyfills(polyfills: "auto", install_packages: false)

// Use full packages instead of minimal polyfills
expo_setup_polyfills(polyfills: ["Buffer"], strategy: "package")

// Custom entry point
expo_setup_polyfills(
  polyfills: "auto",
  layout_file: "app/_layout.tsx",
  backup: true
)
```

#### Example Response

```json
{
  "success": true,
  "message": "Setup 2 polyfills successfully",
  "data": {
    "polyfills_added": ["Buffer", "EventTarget"],
    "packages_installed": [],
    "files_modified": ["app/_layout.tsx"],
    "backup_created": "app/_layout.tsx.backup.2025-11-10T14-23-18",
    "warnings": [
      "Buffer polyfill is minimal implementation. For full features, use @craftzdog/react-native-buffer"
    ]
  }
}
```

#### Polyfill Templates

```typescript
// Buffer - Minimal
const BUFFER_POLYFILL_MINIMAL = `
// Buffer polyfill for Hermes (minimal implementation)
if (typeof global.Buffer === 'undefined') {
  global.Buffer = {
    from: (data: any, encoding?: string) => {
      if (encoding === 'base64') {
        // Basic base64 encoding
        return btoa(String(data));
      }
      return String(data);
    },
    isBuffer: (obj: any) => false,
    concat: (list: any[]) => list.join(''),
  } as any;
}
`;

// Buffer - Full Package
const BUFFER_POLYFILL_PACKAGE = `
// Buffer polyfill for Hermes
import { Buffer } from '@craftzdog/react-native-buffer';
global.Buffer = Buffer;
`;

// EventTarget
const EVENTTARGET_POLYFILL = `
// EventTarget polyfill for Hermes
if (typeof global.EventTarget === 'undefined') {
  global.EventTarget = class EventTarget {
    private listeners: Map<string, Set<Function>> = new Map();

    addEventListener(type: string, listener: Function, options?: any) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set());
      }
      this.listeners.get(type)?.add(listener);
    }

    removeEventListener(type: string, listener: Function, options?: any) {
      this.listeners.get(type)?.delete(listener);
    }

    dispatchEvent(event: any): boolean {
      const listeners = this.listeners.get(event.type);
      if (listeners) {
        listeners.forEach(listener => {
          try {
            listener.call(this, event);
          } catch (error) {
            console.error('Error in event listener:', error);
          }
        });
      }
      return true;
    }
  } as any;
}
`;

// Additional polyfills
const ATOB_BTOA_POLYFILL = `
// atob/btoa polyfill for Hermes
if (typeof global.atob === 'undefined') {
  global.atob = (str: string) => {
    return Buffer.from(str, 'base64').toString('binary');
  };
}
if (typeof global.btoa === 'undefined') {
  global.btoa = (str: string) => {
    return Buffer.from(str, 'binary').toString('base64');
  };
}
`;
```

#### Implementation Notes

- Detect app entry point: `app/_layout.tsx`, `_app.tsx`, `App.tsx`, `index.js`
- Insert polyfills at top of file (after imports)
- Create backup before modification
- Install required packages via `yarn add` or `npm install`
- Validate polyfills work by running app

---

## Dependency Management Tools

### `expo_install_check`

**Purpose:** Check and auto-fix dependency issues

**Priority:** P0 (Critical)

**Why Needed:** Users manually run `npx expo install --check` multiple times

#### Parameters

```typescript
interface ExpoInstallCheckParams {
  auto_fix?: boolean;        // Automatically fix issues (default: false)
  fix_duplicates?: boolean;  // Fix duplicate dependencies (default: true)
  fix_versions?: boolean;    // Fix version mismatches (default: true)
  dry_run?: boolean;         // Show what would be fixed (default: false)
}
```

#### Response

```typescript
interface InstallCheckResponse {
  compatible: boolean;
  issues: DependencyIssue[];
  fixes_applied?: DependencyFix[];
  command_run?: string;
}

interface DependencyIssue {
  type: 'version_mismatch' | 'duplicate' | 'missing_peer';
  severity: 'major' | 'minor' | 'patch';
  package: string;
  current: string;
  expected: string;
  fixable: boolean;
}

interface DependencyFix {
  package: string;
  from: string;
  to: string;
  action: 'upgrade' | 'downgrade' | 'install' | 'remove';
}
```

#### Example Usage

```typescript
// Check only
expo_install_check()

// Auto-fix all issues
expo_install_check(auto_fix: true)

// Dry run
expo_install_check(auto_fix: true, dry_run: true)

// Fix only versions, not duplicates
expo_install_check(auto_fix: true, fix_duplicates: false)
```

#### Example Response

```json
{
  "success": true,
  "message": "Fixed 27 dependency issues",
  "data": {
    "compatible": true,
    "issues": [
      {
        "type": "version_mismatch",
        "severity": "major",
        "package": "react-native",
        "current": "0.79.6",
        "expected": "0.81.5",
        "fixable": true
      },
      {
        "type": "duplicate",
        "severity": "major",
        "package": "@expo/vector-icons",
        "current": "14.1.0, 15.0.3",
        "expected": "^15.0.3",
        "fixable": true
      }
    ],
    "fixes_applied": [
      {
        "package": "react-native",
        "from": "0.79.6",
        "to": "0.81.5",
        "action": "upgrade"
      },
      {
        "package": "@expo/vector-icons",
        "from": "14.1.0",
        "to": "^15.0.3",
        "action": "upgrade"
      }
    ],
    "command_run": "npx expo install --check --fix"
  }
}
```

---

## Help & Documentation Tools

### `expo_help`

**Purpose:** Interactive help system for all tools

**Priority:** P2 (Medium)

**Why Needed:** Users cannot discover tool parameters and usage

#### Parameters

```typescript
interface ExpoHelpParams {
  tool_name?: string;        // Specific tool (default: show all)
  show_examples?: boolean;   // Include usage examples (default: true)
  show_errors?: boolean;     // Include common errors (default: true)
}
```

#### Response

See IMPROVEMENT_ROADMAP.md Phase 5.1 for detailed spec.

---

### `expo_error_info`

**Purpose:** Get detailed information about error codes

**Priority:** P2 (Medium)

**Why Needed:** Users don't understand error messages or how to fix them

#### Parameters

```typescript
interface ExpoErrorInfoParams {
  error_code: string;        // Error code (e.g., "PORT_IN_USE")
}
```

#### Response

See IMPROVEMENT_ROADMAP.md Phase 5.3 for detailed spec.

---

## Enhanced Existing Tools

### `expo_build_local_read` (Enhanced)

**Additions:**
- `mode` parameter: "errors" | "warnings" | "progress" | "milestones" | "all"
- `grep` parameter: Regex filter
- `context_lines` parameter: Lines around errors
- Smart pagination to prevent token overflow

See IMPROVEMENT_ROADMAP.md Phase 4.1 for detailed spec.

---

### `expo_dev_start` (Enhanced)

**Additions:**
- `pre_flight_check` parameter: Run validation before starting
- Better timeout handling with diagnostics
- Automatic port conflict detection

See IMPROVEMENT_ROADMAP.md Phase 4.3 for detailed spec.

---

### `expo_build_local_start` (Enhanced)

**Additions:**
- `validate_env` parameter: Run environment checks before building
- Fail fast with actionable errors
- Java version validation

See IMPROVEMENT_ROADMAP.md Phase 4.3 for detailed spec.

---

### `expo_install` (Fixed)

**Current Issue:** Returns `undefined`

**Fixes:**
- Return standardized ToolResponse
- Add `check_compatibility` parameter
- Add `auto_fix_versions` parameter
- Show what was installed/fixed

See IMPROVEMENT_ROADMAP.md Phase 2.2 for detailed spec.

---

## Implementation Checklist

For each new tool:

- [ ] Define TypeScript interfaces
- [ ] Write unit tests (TDD)
- [ ] Implement tool with standardized ToolResponse
- [ ] Add integration tests
- [ ] Update EXPO_TOOLS_SPEC.md
- [ ] Generate help content for expo_help
- [ ] Add to README.md tool list
- [ ] Update changelog

---

## Testing Strategy

### Unit Tests
- Input validation
- Response format verification
- Error handling
- Edge cases

### Integration Tests
- Real Expo project scenarios
- End-to-end workflows
- Cross-platform compatibility
- Performance benchmarks

### Manual Testing
- User acceptance testing
- Documentation accuracy
- Error message clarity
- Fix suggestion effectiveness

---

## Documentation Requirements

Each tool must have:

1. **Tool specification** (this document)
2. **Implementation in EXPO_TOOLS_SPEC.md**
3. **Help content** (expo_help)
4. **Usage examples** (README.md)
5. **Error handling** (expo_error_info database)
6. **Troubleshooting** (TROUBLESHOOTING.md)

---

## Success Criteria

- ✅ All P0 tools implemented and tested
- ✅ Zero "no such tool available" errors
- ✅ Standardized response format across all tools
- ✅ Comprehensive help system
- ✅ <5 minutes manual intervention per workflow
- ✅ >95% tool call success rate

---

Last Updated: 2025-11-10
Next Review: After Phase 1 (v0.2.0) completion
