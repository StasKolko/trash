### Constant Naming

**Format:** `UPPER_SNAKE_CASE`

Module-level values, declared outside functions. Arrays and objects must use `as const`.

**Naming rule:** general to specific, modifier always last.

```
{SCOPE}_{TOPIC}_{MODIFIER}
```

Use the minimum slots before modifier that remain unambiguous.

#### Singular vs Plural

| Form | When | Example |
|------|------|---------|
| Plural | List / set of values | `TASK_STATUSES`, `GLOBAL_ROLES`, `SORT_ORDERS` |
| Singular | Single value | `PAGINATION_LIMIT_MAX`, `BUTTON_ROOT_STYLE` |

Value lists (plural) typically have no modifier.

#### Known modifiers

| Modifier | Meaning | Examples |
|----------|---------|---------|
| `DEFAULT` | Fallback / initial value | `PAGINATION_PAGE_DEFAULT`, `DEBOUNCE_SEARCH_DEFAULT`, `THROTTLE_SCROLL_DEFAULT` |
| `MIN` | Lower bound | `PASSWORD_LENGTH_MIN`, `USERNAME_LENGTH_MIN` |
| `MAX` | Upper bound | `PAGINATION_LIMIT_MAX`, `UPLOAD_SIZE_MAX` |
| `TIMEOUT` | Fixed duration | `REQUEST_CONNECTION_TIMEOUT`, `SESSION_IDLE_TIMEOUT` |
| `MARKER` | Sentinel / tag value | `TEST_DATA_MARKER` |
| `PREFIX` | Prepended string | `STORAGE_KEY_PREFIX` |
| `SEPARATOR` | Delimiter | `PATH_SEGMENT_SEPARATOR` |
| `TEST_ID` | `data-testid` value | `BUTTON_TEST_ID`, `CARD_HEADER_TEST_ID` |
| `STYLE` | CSS class string or map | `CARD_HEADER_STYLE`, `BUTTON_VARIANT_STYLE`, `BUTTON_DISABLED_STYLE` |

#### Style constants

**Root element** — always `ROOT`. Not `WRAPPER`, `CONTAINER`, or `BASE`. `ROOT` means the component itself, not an auxiliary wrapper around it.

**Prefer short names.** Use `TEXT` over `DESCRIPTION`, `TITLE` over `HEADING`. Add middle slot only when ambiguous:

```ts
// Unambiguous — short
const CARD_TITLE_STYLE = 'text-lg font-semibold';
const CARD_TEXT_STYLE = 'text-sm text-muted';

// Ambiguous — title exists in both header and footer
const CARD_HEADER_TITLE_STYLE = 'text-lg font-semibold';
const CARD_FOOTER_TITLE_STYLE = 'text-sm font-medium';
```