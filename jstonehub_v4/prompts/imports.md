Keeping your import statements organized is crucial for code readability and maintainability. When working on larger projects, a consistent import order can make a world of difference. Biome V2 is a powerful formatter that helps achieve this, but sometimes configuring it to your exact preferences can be a bit tricky.

Recently, a user, Cac0, faced a common challenge with Biome V2's organizeImports feature: getting npm package imports to appear at the top, followed by project-specific imports, and then other general imports. Let's dive into the problem, the debugging process, and the solution that brought order to their imports. Conaclos, a core contributor to Biome, also provided valuable insights during this discussion.

The Problem: Imports Out of Order
Cac0's goal was clear:

npm packages (like react and react-scan) at the very top.
A blank line.
Project-specific imports (e.g., components from @components, utilities from @utils).
Another blank line.
Any other imports not covered by the above.
However, despite various attempts with Biome's groups configuration, their npm package imports were consistently appearing at the bottom, not the top. They were using pnpm, React 19, and Biome v2.

Initial Troubleshooting and Misconceptions
Initial discussions revolved around Biome's predefined groups. It was clarified that :npm: isn't a valid group, but :PACKAGE: is designed to match package imports. Cac0 tried using :PACKAGE:, but the issue persisted.

One key insight came from Daryl, suggesting that the pattern @lib/* might be incorrect and should instead be @lib/** for matching multiple levels within the directory. Cac0 then revised their groups configuration to:

"groups": [
    ":NODE:",
    "./node_modules/**",
    ":PACKAGE:",
    ":BLANK_LINE:",
    ["app", "@components/**", "@lib/**", "@utils/**"],
    ":BLANK_LINE:",
    ["./**"]
]
Still, the imports weren't behaving as expected. There was a brief thought that pnpm might be the culprit, but this was ruled out as import organization is a formatter concern, not a package manager one. Emanuele also pointed out that directly matching node_modules in the groups isn't standard practice for import organization.

The Breakthrough: Aliases and tsconfig.app.json
The turning point came when Cac0 realized the issue wasn't solely with Biome's configuration but also with how their TypeScript aliases were defined in tsconfig.app.json.

Initially, their paths in tsconfig.app.json looked like this:

// ...
"paths": {
    "@assets/*": ["assets/*"],
    "@common/*": ["components/common/*"],
    "@lib/*": ["components/lib/*"],
    "@api/*": ["api/*"],
    "@utils/*": ["utils/*"]
}
// ...
The crucial fix was to add a forward slash (/) after the @ in the aliases:

"paths": {
    "@/assets/*": ["assets/*"],
    "@/common/*": ["components/common/*"],
    "@/lib/*": ["components/lib/*"],
    "@/api/*": ["api/*"],
    "@/utils/*": ["utils/*"]
}
This seemingly minor change had a significant impact. By using "@/lib/*" instead of "@lib/*", Cac0 theorized (and correctly so) that this new pattern for project-specific imports no longer conflicted with how Biome identifies standard npm package imports (which typically don't have @/ in their names unless they are scoped packages like @scope/package).

The Final, Working Configuration
With the updated tsconfig.app.json aliases, Cac0's Biome groups configuration finally achieved the desired import order:

// biome.json
{
  // ...
  "organizeImports": {
    "enabled": true,
    "ignore": [],
    "groups": [
      ":PACKAGE:",
      ":BLANK_LINE:",
      ["@/assets/**"],
      ":BLANK_LINE:",
      ["@/common/**", "@/lib/**", "@/api/**", "@/utils/**"],
      ":BLANK_LINE:",
      ["./**"]
    ]
  }
  // ...
}
And here's an example of how a component's imports would now be formatted correctly:

// Example Component
import { scan } from "react-scan"; // :PACKAGE:
import Test from "@/lib/test"; // Project-specific (matched by "@/lib/**")

console.log(scan);

const TextComponent: React.FC = () => {
    return (
        <div>
            Text
            <Test />
        </div>
    );
};

export default TextComponent;
Understanding Group Matching and Shadowing
Conaclos further explained an important concept: groups are matched in order, and one group matcher can "shadow" succeeding groups. This means if a broad pattern like :PACKAGE: matches all @ prefixed imports, then subsequent groups attempting to match specific @lib or @components patterns might be rendered useless.

Cac0's final solution worked because the "@/..." pattern for aliases ensures that these project-specific imports are not matched by the generic :PACKAGE: group, allowing them to be caught by their dedicated groups later in the groups array.

Note that all other imports are placed at the end by Biome's organizer, thus you can omit the `"./"` part as it represents the fallback for any unmatched imports.**

Conaclos also suggested using the predefined group :ALIAS: which matches patterns like @/**, #*/**, and ~/**, offering a more concise way to categorize alias imports:

"groups": [
    ":PACKAGE_WITH_PROTOCOL:",
    ":PACKAGE:",
    ":BLANK_LINE:",
    "@/assets/**", // Or include in :ALIAS: if applicable
    ":BLANK_LINE:",
    ":ALIAS:",
    ":BLANK_LINE:"
]
Key Takeaways
Biome's organizeImports is powerful: It offers granular control over your import order.
Understand Predefined Groups: Familiarize yourself with groups like :PACKAGE:, :NODE:, and :ALIAS:.
Order Matters: The order of your groups array is crucial, as earlier groups can shadow later ones.
Alias Configuration is Key: Ensure your TypeScript or JavaScript aliases (e.g., in tsconfig.json) are defined in a way that allows Biome to distinguish between npm packages and your project-specific modules. Using a unique prefix like ~/ or @/ for project aliases can simplify Biome's matching.
Debug Incrementally: When facing issues, start with a minimal, working configuration (perhaps from documentation) and then add your customizations step by step to identify the breaking change.
Redundant Fallbacks: Biome automatically places unmatched imports at the end, so explicit catch-all patterns like "./**" in your last group might be unnecessary.

вот оф документация biome js

organizeImports
JavaScript (and super languages)
Summary
Rule available since: v1.0.0
Diagnostic Category: assist/source/organizeImports
This action is recommended.
Sources:
Inspired from sort-imports
Inspired from no-duplicate-imports
Inspired from import/order
How to enable in your editor
VS Code
Zed
Other editors
.vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "source.fixAll.biome": "explicit"
  }
}

How to configure
biome.json
{
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}

Description
Provides a code action to sort the imports and exports in the file using a built-in or custom order.

Imports and exports are first separated into chunks, before being sorted. Imports or exports of a chunk are then grouped according to the user-defined groups. Within a group, imports are sorted using a built-in order that depends on the import/export kind, whether the import/export has attributes and the source being imported from. source is also often called specifier in the JavaScript ecosystem.

import A from "@my/lib" with { "attribute1": "value" };
^^^^^^^^       ^^^^^^^         ^^^^^^^^^^^^^^^^^^^^^
  kind         source                attributes

export * from "@my/lib" with { "attribute1": "value" };
^^^^^^^^       ^^^^^^^         ^^^^^^^^^^^^^^^^^^^^^
  kind         source                attributes

Chunk of imports and chunk of exports
A chunk is a sequence of adjacent imports or exports. A chunk contains only imports or exports, not both at the same time. The following example includes two chunks. The first chunk consists of the three imports and the second chunk consists of the three exports.

// chunk 1
import A from "a";
import * as B from "b";
import { C } from "c";
// chunk 2
export * from "d";
export * as F from "e";
export { F } from "f";

Chunks also end as soon as a statement or a side-effect import (also called bare import) is encountered. Every side-effect import forms an independent chunk. The following example contains six chunks:

// chunk 1
import A from "a";
import * as B from "b";
// chunk 2
import "x";
// chunk 3
import "y";
// chunk 4
import { C } from "c";
// chunk 5
export * from "d";
function f() {}
// chunk 6
export * as E from "e";
export { F } from "f";

The first chunk contains the two first import and ends with the appearance of the first side-effect import import "x".
The second chunk contains only the side-effect import import "x".
The third chunk contains only the side-effect import import "y".
The fourth chunk contains a single import; The first export ends it.
The fifth chunk contains the first export; The function declaration ends it.
The sixth chunk contains the last two export.
Chunks are also delimited by detached comments. A detached comment is a comment followed by a blank line. Comments not followed by a blank line are attached comments. Note that blank lines alone are not taken into account when chunking imports and exports. The following example contains a detached comment that splits the imports into two chunks:

// Attached comment 1
import A from "a";

// Attached comment 2
import * as B from "b";
// Detached comment

import { C } from "c";

The line import { C } from "c" forms the second chunk. The blank line between the first two imports is ignored so they form a single chunk.

The sorter ensures that chunks are separated from each other with blank lines. Only side-effect imports adjacent to a chunk of imports are not separated by a blank line. The following code…

import A from "a";
import * as B from "b";
import "x";
import { C } from "c";
export * from "d";
// Detached comment

export * as F from "e";
// Attached comment
export { F } from "f";

is sorted as:

import A from "a";
import * as B from "b";
import "x";
import { C } from "c";

export * from "d";

// Detached comment

export * as F from "e";
// Attached comment
export { F } from "f";

Also, note that blank lines inside a chunk are ignored and preserved. They can be removed by explicitly defining groups as demonstrated in the next section.

Import and export sorting
Once chunks are formed, imports and exports of each chunk are sorted. Imports and exports are sorted by their source. Sources are ordered by “distance”. Sources that are “farther” from the current module are put on the top, sources “closer” to the user are put on the bottom. This leads to the following order:

URLs such as https://example.org.
Packages with a protocol such as node:path, bun:test, jsr:@my?lib, or npm:lib.
Packages such as mylib or @my/lib.
Aliases: sources starting with @/, #, ~, $, or %. They usually are Node.js subpath imports or TypeScript path aliases.
Absolute and relative paths.
Two imports/exports with the same source category are sorted using a natural sort order tailored to URLs, packages, and paths. Notably, the order ensures that A < a < B < b. The order takes also numbers into account, e.g. a9 < a10.

For example, the following code…

import sibling from "./file.js";
import internal from "#alias";
import fs from "fs";
import { test } from "node:test";
import path from "node:path";
import parent from "../parent.js";
import scopedLibUsingJsr from "jsr:@scoped/lib";
import data from "https://example.org";
import lib from "lib";
import scopedLib from "@scoped/lib";

…is sorted as follows:

import data from "https://example.org";
import scopedLibUsingJsr from "jsr:@scoped/lib";
import path from "node:path";
import { test } from "node:test";
import scopedLib from "@scoped/lib";
import fs from "fs";
import lib from "lib";
import internal from "#alias";
import parent from "../parent.js";
import sibling from "./file.js";

If two imports or exports share the same source and are in the same chunk, then they are ordered according to their kind as follows:

Namespace type import / Namespace type export
Default type import
Named type import / Named type export
Namespace import / Namespace export
Combined default and namespace import
Default import
Combined default and named import
Named import / Named export
Imports and exports with attributes are always placed first. For example, the following code…

import * as namespaceImport from "same-source";
import type * as namespaceTypeImport from "same-source";
import type { namedTypeImport } from "same-source";
import defaultNamespaceCombined, * as namespaceCombined from "same-source";
import defaultNamedCombined, { namedCombined } from "same-source";
import defaultImport from "same-source";
import type defaultTypeImport from "same-source";
import { importWithAttribute } from "same-source" with { "attribute": "value" } ;

is sorted as follows:

import { importWithAttribute } from "same-source" with { "attribute": "value" } ;
import type * as namespaceTypeImport from "same-source";
import type defaultTypeImport from "same-source";
import type { namedTypeImport } from "same-source";
import * as namespaceImport from "same-source";
import defaultNamespaceCombined, * as namespaceCombined from "same-source";
import defaultImport from "same-source";
import defaultNamedCombined, { namedCombined } from "same-source";

This default order cannot be changed. However, users can still customize how imports and exports are sorted using the concept of groups as explained in the following section.

Import and export groups
Imports or exports of a chunk are divided into groups before being sorted with the built-in order described in the previous section. By default every chunk consists of a single group. These default groups and their order may not be to your taste. The sorter provides a groups option that allows you to customize how the chunks are divided into groups. The groups option is a list of group matchers. A group matcher is:

A predefined group matcher, or
A glob pattern, or
An object matcher, or
A list of glob patterns, predefined group matchers, and object matchers.
Predefined group matchers are strings in CONSTANT_CASE prefixed and suffixed by :. The sorter provides several predefined group matchers:

:ALIAS:: sources starting with #, @/, ~, $, or %.
:BUN:: sources starting with the protocol bun: or that correspond to a built-in Bun module such as bun.
:NODE:: sources starting with the protocol node: or that correspond to a built-in Node.js module such as fs or path.
:PACKAGE:: scoped and bare packages.
:PACKAGE_WITH_PROTOCOL:: scoped and bare packages with a protocol.
:PATH:: absolute and relative paths.
:URL:: sources starting with https:// and http://.
Let’s take an example. In the default configuration, Node.js modules without the node: protocol are separated from those with a protocol. To group them together, you can use the predefined group :NODE:. Given the following configuration…

biome.json
{
  "assist": {
    "actions": {
      "source": {
        "organizeImports": {
          "level": "on",
          "options": {
            "groups": [
              ":URL:",
              ":NODE:"
            ]
          }
        }
      }
    }
  }
}

…and the following code…

import sibling from "./file.js";
import internal from "#alias";
import fs from "fs";
import { test } from "node:test";
import path from "node:path";
import parent from "../parent.js";
import scopedLibUsingJsr from "jsr:@scoped/lib";
import data from "https://example.org";
import lib from "lib";
import scopedLib from "@scoped/lib";

…we end up with the following sorted result where the imports of node:path and the fs Node.js module are grouped together:

import data from "https://example.org";
import fs from "fs";
import path from "node:path";
import { test } from "node:test";
import scopedLibUsingJsr from "jsr:@scoped/lib";
import scopedLib from "@scoped/lib";
import lib from "lib";
import internal from "#alias";
import parent from "../parent.js";
import sibling from "./file.js";

Note that all imports that don’t match a group matcher are always placed at the end.

Group matchers can also be glob patterns and list of glob patterns. Glob patterns select imports and exports with a source that matches the pattern. In the following example, we create two groups: one that gathers imports/exports with a source starting with @my/lib except @my/lib/special and the other that gathers imports/exports starting with @/.

{
    "options": {
        "groups": [
            ["@my/lib", "@my/lib/**", "!@my/lib/special", "!@my/lib/special/**"],
            "@/**"
        ]
    }
}

By applying this configuration to the following code…

import lib from "@my/lib";
import aliased from "@/alias";
import path from "@my/lib/special";
import test from "@my/lib/path";

…we obtain the following sorted result. Imports with the sources @my/lib and @my/lib/path form the first group. They match the glob patterns @my/lib and @my/lib/** respectively. The import with the source @my/lib/special is not placed in this first group because it is rejected by the exception !@my/lib/special. The import with the source @/alias is placed in a second group because it matches the glob pattern @/**. Finally, other imports are placed at the end.

import lib from "@my/lib";
import test from "@my/lib/path";
import aliased from "@/alias";
import path from "@my/lib/special";

Note that @my/lib matches @my/lib but not @my/lib/**. Conversely, @my/lib/subpath matches @my/lib/**, but not @my/lib. So, you have to specify both glob patterns if you want to accept all imports/exports that start with @my/lib. The prefix ! indicates an exception. You can create exceptions of exceptions by following an exception by a regular glob pattern. For example ["@my/lib", "@my/lib/**", "!@my/lib/special", "!@my/lib/special/**", "@my/lib/special/*/accepted/**"] allows you to accepts all sources matching @my/lib/special/*/accepted/**. Note that the predefined groups can also be negated. !:NODE: matches all sources that don’t match :NODE:. For more details on the supported glob patterns, see the dedicated section.

Finally, group matchers can be object matchers. An object matcher allows to match type-only imports and exports.

Given the following configuration:

{
    "options": {
        "groups": [
            { "type": false, "source": ["@my/lib", "@my/lib/**"] },
            ["@my/lib", "@my/lib/**"]
        ]
    }
}

The following code:

import type { T } from "@my/lib";
import { V } from "@my/lib";

is sorted as follows:

import { V } from "@my/lib";
import type { T } from "@my/lib";

The object matcher { "type": false, "source": ["@my/lib", "@my/lib/**"] } match against imports and exports without the type keyword with a source that matches one of the glob pattern of the list ["@my/lib", "@my/lib/**"].

The sorter allows the separation of two groups with a blank line using the predefined string :BLANK_LINE:. Given the following configuration…

{
    "options": {
        "groups": [
            [":BUN:", ":NODE:"],
            ":BLANK_LINE:",
            ["@my/lib", "@my/lib/**", "!@my/lib/special", "!@my/lib/special/**"],
            "@/**"
        ]
    }
}

…the following code…

import test from "bun:test";
import path from "node:path";
import lib from "@my/lib";
import libPath from "@my/lib/path";
import libSpecial from "@my/lib/special";
import aliased from "@/alias";

…is sorted as:

import path from "node:path";

import lib from "@my/lib";
import test from "@my/lib/path";
import aliased from "@/alias";
import path from "@my/lib/special";

Groups are matched in order. This means that one group matcher can shadow succeeding groups. For example, in the following configuration, the group matcher :URL: is never matched because all imports and exports match the first matcher **.

{
    "options": {
        "groups": [
            "**",
            ":URL:"
        ]
    }
}

Comment handling
When sorting imports and exports, attached comments are moved with their import or export, and detached comments (comments followed by a blank line) are left where they are.

However, there is an exception to the rule. If a comment appears at the top of the file, it is considered as detached even if no blank line follows. This ensures that copyright notice and file header comments stay at the top of the file.

For example, the following code…

// Copyright notice and file header comment
import F from "f";
// Attached comment for `e`
import E from "e";
// Attached comment for `d`
import D from "d";
// Detached comment (new chunk)

// Attached comment for `b`
import B from "b";
// Attached comment for `a`
import A from "a";

…is sorted as follows. A blank line is automatically added after the header comment to ensure that the attached comment doesn’t merge with the header comment.

// Copyright notice and file header comment

// Attached comment for `d`
import D from "d";
// Attached comment for `e`
import E from "e";
import F from "f";

// Detached comment (new chunk)

// Attached comment for `a`
import A from "a";
// Attached comment for `b`
import B from "b";

Import and export merging
The organizer also merges imports and exports that can be merged.

For example, the following code:

import type { T1 } from "package";
import type { T2 } from "package";
import * as ns from "package";
import D1 from "package";
import D2 from "package";
import { A } from "package";
import { B } from "package";
import { type T3 } from "package";

is merged as follows:

import type { T1, T2 } from "package";
import D1, * as ns from "package";
import D2, { A, B, type T3 } from "package";

You may want to merge the first and the last imports. To do this, you have to enable the linter rule useImportType and to set its option style to inlineType.

With the following configuration…

{
  "linter": {
    "enabled": true,
    "rules": {
      "style": {
        "useImportType": {
          "level": "on",
          "options": { "style": "inlineType" }
        }
      }
    }
  },
  "assist": {
    "enabled": true,
    "actions": { "source": { "organizeImports": "on" } }
  }
}

The previous imports are merged as follows:

import D1, * as ns from "package";
import D2, { A, B, type T1, type T2, type T3 } from "package";

Note that if you set style to separatedType you will get the following merge:

import type { T1, T2, T3 } from "package";
import { V1 } from "package";
import D1, * as ns from "package";
import D2, { A, B } from "package";

Named imports, named exports and attributes sorting
The sorter also sorts named imports, named exports, as well as attributes. It uses a natural sort order for comparing numbers.

The following code…

import { a, b, A, B, c10, c9 } from "a";

export { a, b, A, B, c10, c9 } from "a";

import special from  "special" with { "type": "ty", "metadata": "data" };

…is sorted as follows:

import { A, a, B, b, c9, c10 } from "a";

export { A, a, B, b, c9, c10 } from "a";

import special from  "special" with { "metadata": "data", "type": "ty" };

Supported glob patterns
You need to understand the structure of a source to understand which source matches a glob. A source is divided in source segments. Every source segment is delimited by the separator / or the start/end of the source. For instance src/file.js consists of two source segments: src and file.js.

star * that matches zero or more characters inside a source segment
file.js matches *.js. Conversely, src/file.js doesn’t match *.js

globstar ** that matches zero or more source segments ** must be enclosed by separators / or the start/end of the glob. For example, **a is not a valid glob. Also, ** must not be followed by another globstar. For example, **/** is not a valid glob.
file.js and src/file.js match ** and **/*.js Conversely, README.txt doesn’t match **/*.js because the source ends with .txt.

Use \* to escape *
\* matches the literal * character in a source.

?, [, ], {, and } must be escaped using \. These characters are reserved for possible future use.

Use ! as first character to negate a glob

file.js matches !*.test.js. src/file.js matches !*.js because the source contains several segments.

Common configurations
This section provides some examples of common configurations.

Placing import type and export type at the start of the chunks
{
    "options": {
        "groups": [
            { "type": true }
        ]
    }
}

Note that you may want to use the lint rule useImportType and its style to enforce the use of import type instead of import { type }.

Placing import type and export type at the end of the chunks
{
    "options": {
        "groups": [
            { "type": false }
        ]
    }
}

Change the sorting of import identifiers to lexicographic sorting
This only applies to the named import/exports and not the source itself.

biome.json
{
  "assist": {
    "actions": {
      "source": {
        "organizeImports": {
          "options": {
            "identifierOrder": "lexicographic"
          }
        }
      }
    }
  }
}

import { var1, var2, var21, var11, var12, var22 } from 'my-package'

code-block.js:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ℹ The imports and exports are not sorted.
  
  > 1 │ import { var1, var2, var21, var11, var12, var22 } from ‘my-package’
      │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    2 │ 
  
  ℹ Safe fix: Organize Imports (Biome)
  
    1   │ - import·{·var1,·var2,·var21,·var11,·var12,·var22·}·from·‘my-package’
      1 │ + import·{·var1,·var11,·var12,·var2,·var21,·var22·}·from·‘my-package’
    2 2 │   
  
Change the sorting of import identifiers to logical sorting
This is the default behavior in case you do not override. This only applies to the named import/exports and not the source itself.

biome.json
{
  "assist": {
    "actions": {
      "source": {
        "organizeImports": {
          "options": {
            "identifierOrder": "natural"
          }
        }
      }
    }
  }
}

import { var1, var2, var21, var11, var12, var22 } from 'my-package'

code-block.js:1:1 assist/source/organizeImports  FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ℹ The imports and exports are not sorted.
  
  > 1 │ import { var1, var2, var21, var11, var12, var22 } from ‘my-package’
      │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    2 │ 
  
  ℹ Safe fix: Organize Imports (Biome)
  
    1   │ - import·{·var1,·var2,·var21,·var11,·var12,·var22·}·from·‘my-package’
      1 │ + import·{·var1,·var2,·var11,·var12,·var21,·var22·}·from·‘my-package’
    2 2 │   
  


у меня должен быть такой подход:

1) Сначала идут все type импорты и только затем все обычные импорты
2) нельзя из одного местя делать импорт и типов и функций (констант). 

ПЛохо:
import { type JSX, creareSignal } from "solid-js"

Хорошо:
import type { JSX } from "solid-js";
import { creareSignal } from "solid-js";

Также ключевое слово type должно быть у импорта типов после import и до скобок {}

ПЛохо:
import { type JSX } from "solid-js";

Хорошо:
import type { JSX } from "solid-js";

3) У меня настроянны алиасы путей для всех app в apps воркспейсе на префикс #, так как @ и ~ вызывали разного рода проблемы с package.json, режимами билд , дев и старт.

Может ли # нормально биому js организовывать? (прочитай статью там вроде сказаны нюансы)

Если может то последоватьльность и сортировака такая:

type из node_modules
пустой пробел
type из воркспейсов : @configs, @packages, @scripts, @apps
пустой пробел
type из других apps: #api, #worker, #hub, #admin (если так можно, чтобы например в hub все кроме hub а hub ниже через пустой пробел)
пустой пробел
type из относительных путей
пустой пробел
node_modules
пустой пробел
из воркспейсов : @configs, @packages, @scripts, @apps
пустой пробел
из других apps: #api, #worker, #hub, #admin (если так можно, чтобы например в hub все кроме hub а hub ниже через пустой пробел)
пустой пробел
из относительных путей
пустой пробел

Все четко? Все учел? Правильно и логично?

Вот текущие настройки biome js 

D:/1_Projects/jstonehub/configs/biomejs/src/assist.json

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on",
        "noDuplicateClasses": "on",

        "useSortedAttributes": "off",
        "useSortedKeys": "off",
        "useSortedProperties": "off",
        "useSortedInterfaceMembers": "off"
      }
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/css.json

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "css": {
    "assist": { "enabled": true },
    "linter": { "enabled": true },
    "parser": {
      "cssModules": true,
      "tailwindDirectives": true,
      "allowWrongLineComments": false
    },
    "formatter": {
      "enabled": true,
      "quoteStyle": "double",
      "indentStyle": "space",
      "indentWidth": 2,
      "lineEnding": "lf",
      "lineWidth": 80
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/files.jsonc

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "files": {
    "ignoreUnknown": false,
    "maxSize": 1048576,
    "includes": [
      "**",

      // ROOT DIRS
      "!**/.husky/**",
      "!**/.qodo/**",
      "!**/prompts/**",
      "!**/docs/**",

      // DIRS
      "!**/.turbo/**",
      "!**/.tanstack/**",
      "!**/node_modules/**",
      "!**/coverage/**",
      "!**/dist/**",
      "!**/build/**",
      "!**/storage/**",
      "!**/drizzle/**",

      // ROOT FILES
      "!**/bun.lock",

      // FILES
      "!**/routeTree.gen.ts"
    ]
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/formatter.json

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "formatter": {
    "enabled": true,
    "formatWithErrors": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 80,
    "attributePosition": "auto",
    "bracketSpacing": true,
    "bracketSameLine": false,
    "expand": "auto",
    "useEditorconfig": false,
    "trailingNewline": true
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/graphql.json

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "graphql": {
    "assist": { "enabled": false },
    "formatter": { "enabled": false },
    "linter": { "enabled": false }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/grit.json

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "grit": {
    "assist": { "enabled": false },
    "formatter": { "enabled": false },
    "linter": { "enabled": false }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/html.jsonc

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "html": {
    "experimentalFullSupportEnabled": true,
    "parser": { "interpolation": false },
    "assist": { "enabled": true },
    "linter": { "enabled": true },
    "formatter": {
      "enabled": true,
      "indentStyle": "space",
      "indentWidth": 2,
      "lineEnding": "lf",
      "lineWidth": 80,
      "attributePosition": "auto",
      "bracketSameLine": false,
      "selfCloseVoidElements": "always",
      "whitespaceSensitivity": "css",
      "trailingNewline": true,
      // Domain: Vue and Svelte
      "indentScriptAndStyle": false
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/javascript.json

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "javascript": {
    "experimentalEmbeddedSnippetsEnabled": true,
    "jsxRuntime": "transparent",
    "assist": { "enabled": true },
    "linter": { "enabled": true },
    "globals": [
      "Bun",
      "describe",
      "it",
      "expect",
      "afterEach",
      "beforeEach",
      "vi",
      "afterAll",
      "beforeAll"
    ],
    "parser": {
      "gritMetavariables": false,
      "jsxEverywhere": false,
      "unsafeParameterDecoratorsEnabled": true
    },
    "formatter": {
      "enabled": true,
      "quoteStyle": "double",
      "arrowParentheses": "always",
      "attributePosition": "auto",
      "bracketSameLine": false,
      "bracketSpacing": true,
      "expand": "auto",
      "indentStyle": "space",
      "indentWidth": 2,
      "jsxQuoteStyle": "double",
      "lineEnding": "lf",
      "lineWidth": 80,
      "operatorLinebreak": "before",
      "quoteProperties": "asNeeded",
      "semicolons": "always",
      "trailingCommas": "all",
      "trailingNewline": true
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/json.json

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "json": {
    "assist": { "enabled": true },
    "linter": { "enabled": true },
    "parser": {
      "allowComments": true,
      "allowTrailingCommas": false
    },
    "formatter": {
      "enabled": true,
      "bracketSpacing": true,
      "expand": "auto",
      "indentStyle": "space",
      "indentWidth": 2,
      "lineEnding": "lf",
      "lineWidth": 80,
      "trailingCommas": "none",
      "trailingNewline": true
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/overrides.json

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "overrides": [
    {
      "includes": ["scripts/**"],
      "linter": {
        "rules": {
          "suspicious": { "noConsole": "off" }
        }
      }
    },
    {
      "includes": [
        "scripts/**",
        "configs/vite/**",
        "apps/api/**",
        "apps/worker/**"
      ],
      "linter": {
        "rules": {
          "correctness": { "noNodejsModules": "off" }
        }
      }
    },
    {
      "includes": [
        "**/vite.config.ts",
        "**/vitest.config.ts",
        "**/drizzle.config.ts"
      ],
      "linter": {
        "rules": {
          "style": { "noDefaultExport": "off" }
        }
      }
    },
    {
      "includes": ["**/*.tsx"],
      "linter": {
        "rules": {
          "complexity": {
            "noExcessiveLinesPerFunction": {
              "level": "error",
              "options": {
                "maxLines": 100,
                "skipBlankLines": true,
                "skipIifes": false
              }
            }
          }
        }
      }
    },
    {
      "includes": ["**/*.test.ts", "**/*.test.tsx"],
      "linter": {
        "rules": {
          "style": {
            "noMagicNumbers": "off",
            "useNumberNamespace": "off"
          },
          "suspicious": {
            "noEmptyBlockStatements": "off"
          },
          "correctness": {
            "noNodejsModules": "off"
          },
          "complexity": {
            "noExcessiveLinesPerFunction": "off"
          }
        }
      }
    },
    {
      "includes": ["**/routes/**"],
      "linter": {
        "rules": {
          "style": {
            "useFilenamingConvention": "off"
          }
        }
      }
    }
  ]
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/plugins.json

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "plugins": []
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/vcs.json

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "vcs": {
    "clientKind": "git",
    "defaultBranch": "main",
    "enabled": false,
    "useIgnoreFile": false
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/linter/a11y.jsonc

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "linter": {
    "rules": {
      "a11y": {
        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     KEYBOARD & FOCUS                           ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noAccessKey": "error",
        "noAutofocus": "error",
        "noPositiveTabindex": "error",
        "noNoninteractiveTabindex": "error",
        "useFocusableInteractive": "error",
        "useAriaActivedescendantWithTabindex": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                      ARIA ATTRIBUTES                           ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noAriaHiddenOnFocusable": "error",
        "noAriaUnsupportedElements": "error",
        "useValidAriaProps": "error",
        "useValidAriaRole": "error",
        "useValidAriaValues": "error",
        "useAriaPropsForRole": "error",
        "useAriaPropsSupportedByRole": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    ROLES & SEMANTICS                           ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noInteractiveElementToNoninteractiveRole": "error",
        "noNoninteractiveElementToInteractiveRole": "error",
        "noRedundantRoles": "error",
        "useSemanticElements": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                  INTERACTIVE ELEMENTS                          ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noNoninteractiveElementInteractions": "error",
        "noStaticElementInteractions": "error",
        "useKeyWithClickEvents": "error",
        "useKeyWithMouseEvents": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    IMAGES & MEDIA                              ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useAltText": "error",
        "noRedundantAlt": "error",
        "noSvgWithoutTitle": "error",
        "useMediaCaption": "error",
        "useIframeTitle": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                   LINKS & NAVIGATION                           ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useValidAnchor": "error",
        // warn: not recommended by default, many false positives
        "useAnchorContent": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    FORMS & LABELS                              ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noLabelWithoutControl": {
          "level": "error",
          "options": {
            "inputComponents": [],
            "labelComponents": [],
            "labelAttributes": ["for"]
          }
        },
        "useButtonType": "error",
        "useValidAutocomplete": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                   TABLES & STRUCTURE                           ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noHeaderScope": "error",
        "useHeadingContent": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                   DOCUMENT & LANGUAGE                          ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useHtmlLang": "error",
        "useValidLang": "error",
        "noDistractingElements": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           CSS                                  ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useGenericFontNames": "error"
      }
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/linter/complexity.jsonc

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "linter": {
    "rules": {
      "complexity": {
        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     IMPORTS & EXPORTS                          ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noUselessEmptyExport": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         TESTING                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noExcessiveNestedTestSuites": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                   USELESS CODE & PATTERNS                      ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noCommaOperator": "error",
        "noImplicitCoercions": "error",
        "noUselessCatch": "error",
        "noUselessCatchBinding": "error",
        "noUselessContinue": "error",
        "noUselessLabel": "error",
        "noUselessLoneBlockStatements": "error",
        "noUselessRename": "error",
        "noUselessSwitchCase": "error",
        "noUselessTernary": "error",
        "noUselessThisAlias": "error",
        "noUselessUndefined": "error",
        "noUselessUndefinedInitialization": "error",
        "noVoid": "error",
        "useWhile": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                       TYPESCRIPT                               ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noBannedTypes": "error",
        "noEmptyTypeParameters": "error",
        "noUselessTypeConstraint": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         NUMBERS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useNumericLiterals": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         STRINGS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noUselessStringConcat": "error",
        "noUselessStringRaw": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                        BOOLEANS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noExtraBooleanCast": "error",
        "useSimplifiedLogicExpression": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          REGEX                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noAdjacentSpacesInRegex": "error",
        "noUselessEscapeInRegex": "error",
        "useRegexLiterals": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           DATE                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useDateNow": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          ARRAYS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noFlatMapIdentity": "error",
        "noForEach": "error",
        "useFlatMap": "error",
        "useIndexOf": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         OBJECTS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useLiteralKeys": "error",
        "useOptionalChain": "error",
        "useSimpleNumberKeys": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                        FUNCTIONS                               ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noArguments": "error",
        "noExcessiveCognitiveComplexity": "error",
        "noExcessiveLinesPerFunction": {
          "level": "error",
          "options": {
            "maxLines": 50,
            "skipBlankLines": true,
            "skipIifes": false
          }
        },
        "useArrowFunction": "error",
        "useMaxParams": {
          "level": "error",
          "options": {
            "max": 3
          }
        },

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         CLASSES                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noStaticOnlyClass": "error",
        "noThisInStatic": "error",
        "noUselessConstructor": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           JSX                                  ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noUselessFragments": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           CSS                                  ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noImportantStyles": "error"
      }
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/linter/correctness.jsonc

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "linter": {
    "rules": {
      "correctness": {
        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     IMPORTS & EXPORTS                          ║
        // ╚════════════════════════════════════════════════════════════════╝

        // Modern bundlers (Vite, esbuild, Bun) resolve extensions automatically.
        "useImportExtensions": "off",
        "noPrivateImports": "error",
        "noUndeclaredDependencies": "error",
        "noUnusedImports": "error",
        "useJsonImportAttributes": "error",
        // Redundant with TypeScript — TS already handles unresolved imports.
        "noUnresolvedImports": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    ES MODULES & RUNTIME                        ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noGlobalDirnameFilename": "error",
        "noNodejsModules": "error",
        "noProcessGlobal": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     VARIABLES & SCOPE                          ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noConstAssign": "error",
        "noInvalidUseBeforeDeclaration": "error",
        "noInnerDeclarations": "error",
        "noUndeclaredVariables": {
          "level": "error",
          "options": {
            "checkTypes": true
          }
        },
        "noUnusedVariables": "error",
        "noUnusedFunctionParameters": "error",
        "noUnusedPrivateClassMembers": "error",
        "noUnusedLabels": "error",
        "noSelfAssign": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                      LOGIC ERRORS                              ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noConstantCondition": "error",
        "noConstantMathMinMaxClamp": "error",
        "noUnreachable": "error",
        "useValidForDirection": "error",
        "useValidTypeof": "error",
        "useIsNan": "error",
        "useParseIntRadix": "error",
        "noStringCaseMismatch": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         CLASSES                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noConstructorReturn": "error",
        "noInvalidConstructorSuper": "error",
        "noUnreachableSuper": "error",
        "noSetterReturn": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                      BUILT-INS & GLOBALS                       ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noGlobalObjectCalls": "error",
        "noInvalidBuiltinInstantiation": "error",
        "noPrecisionLoss": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     SYNTAX & PATTERNS                          ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noEmptyPattern": "error",
        "noSwitchDeclarations": "error",
        "noNonoctalDecimalEscape": "error",
        "noUnsafeFinally": "error",
        "noUnsafeOptionalChaining": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          REGEX                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noEmptyCharacterClassInRegex": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                       GENERATORS                               ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useYield": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                       TYPESCRIPT                               ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noVoidTypeReturn": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          JSDOC                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useSingleJsDocAsterisk": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           CSS                                  ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noInvalidDirectionInLinearGradient": "error",
        "noInvalidGridAreas": "error",
        "noInvalidPositionAtImportRule": "error",
        "noMissingVarFunction": "error",
        "noUnknownFunction": "error",
        "noUnknownMediaFeatureName": "error",
        "noUnknownProperty": "error",
        "noUnknownPseudoClass": "error",
        "noUnknownPseudoElement": "error",
        "noUnknownTypeSelector": "error",
        "noUnknownUnit": "error",
        "noUnmatchableAnbSelector": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                        HTML / A11Y                             ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useImageSize": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         GRAPHQL                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useGraphqlNamedOperations": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                       SOLID JS                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noSolidDestructuredProps": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     JSX (General)                              ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noNestedComponentDefinitions": "error",
        "noVoidElementsWithChildren": "error",
        "noRestrictedElements": {
          "level": "error",
          "options": { "elements": null }
        },

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          REACT                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noChildrenProp": "off",
        "noReactPropAssignments": "off",
        "noRenderReturnValue": "off",
        "useExhaustiveDependencies": "off",
        "useHookAtTopLevel": "off",
        "useUniqueElementIds": "off",
        "useJsxKeyInIterable": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         NEXT JS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noNextAsyncClientComponent": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           VUE                                  ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noVueDataObjectDeclaration": "off",
        "noVueDuplicateKeys": "off",
        "noVueReservedKeys": "off",
        "noVueReservedProps": "off",
        "noVueSetupPropsReactivityLoss": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           QWIK                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noQwikUseVisibleTask": "off",
        "useQwikClasslist": "off",
        "useQwikMethodUsage": "off",
        "useQwikValidLexicalScope": "off"
      }
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/linter/nursery.jsonc

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "linter": {
    "rules": {
      "nursery": "off"
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/linter/performance.jsonc

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "linter": {
    "rules": {
      "performance": {
        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     IMPORTS & EXPORTS                          ║
        // ╚════════════════════════════════════════════════════════════════╝

        // Barrel files define explicit public API for modules.
        // Only exports from index.ts are considered public — internal implementation stays hidden.
        // Enforces clear module boundaries and prevents importing private internals.
        "noBarrelFile": "off",
        "noDynamicNamespaceImportAccess": "error",
        "noNamespaceImport": "error",
        "noReExportAll": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    RUNTIME PERFORMANCE                         ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noAccumulatingSpread": "error",
        "noAwaitInLoops": "error",
        "noDelete": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          REGEX                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useTopLevelRegex": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                        SOLID JS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useSolidForComponent": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         NEXT JS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noImgElement": "off",
        "noUnwantedPolyfillio": "off",
        "useGoogleFontPreconnect": "off"
      }
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/linter/security.jsonc

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "linter": {
    "rules": {
      "security": {
        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    SECRETS & SENSITIVE DATA                    ║
        // ╚════════════════════════════════════════════════════════════════╝

        // OFF - too many false positives
        "noSecrets": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     GENERAL SECURITY                           ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noBlankTarget": "error",
        "noGlobalEval": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          REACT                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDangerouslySetInnerHtmlWithChildren": "off",
        "noDangerouslySetInnerHtml": "off"
      }
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/linter/style.jsonc

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "linter": {
    "rules": {
      "style": {
        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         GRAPHQL                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useGraphqlNamingConvention": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                        FILENAMES                               ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useFilenamingConvention": {
          "level": "error",
          "options": {
            "filenameCases": ["kebab-case"],
            "strictCase": true,
            "requireAscii": true
          }
        },

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         IMPORTS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noRestrictedImports": "error",
        "useImportType": "error",
        "useNodeAssertStrict": "error",
        "useNodejsImportProtocol": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         EXPORTS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noCommonJs": "error",
        "noDefaultExport": "error",
        "noExportedImports": "error",
        "useExportsLast": "error",
        "useExportType": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                   CODE STYLE & READABILITY                     ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noMagicNumbers": "error",
        "noNegationElse": "error",
        "noNestedTernary": "error",
        "noShoutyConstants": "error",
        "noSubstr": "error",
        "noUnusedTemplateLiteral": "error",
        "noUselessElse": "error",
        "noYodaExpression": "error",
        "useArrayLiterals": "error",
        "useAtIndex": "error",
        "useBlockStatements": "error",
        "useCollapsedElseIf": "error",
        "useCollapsedIf": "error",
        "useConsistentArrowReturn": "error",
        "useConsistentBuiltinInstantiation": "error",
        "useConsistentObjectDefinitions": "error",
        "useDefaultParameterLast": "error",
        "useConst": "error",
        "useDefaultSwitchClause": "error",
        "useDeprecatedReason": "error",
        "useExplicitLengthCheck": "error",
        "useExponentiationOperator": "error",
        "useForOf": "error",
        "useGroupedAccessorPairs": "error",
        "useNumberNamespace": "error",
        "useNumericSeparators": "error",
        "useObjectSpread": "error",
        "useShorthandAssign": "error",
        "useSingleVarDeclarator": "error",
        "useSymbolDescription": "error",
        "useTemplate": "error",
        "useThrowNewError": "error",
        "useThrowOnlyError": "error",
        "useTrimStartEnd": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    NAMING CONVENTIONS                          ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useNamingConvention": {
          "level": "error",
          "options": {
            "requireAscii": true,
            "strictCase": true,
            "conventions": [
              {
                "selector": {
                  "kind": "objectLiteralProperty"
                },
                "match": ".*"
              },
              {
                "selector": {
                  "kind": "typeProperty"
                },
                "match": ".*"
              }
            ]
          }
        },

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                  MUTABILITY & SIDE EFFECTS                     ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noParameterAssign": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                   ENVIRONMENT & GLOBALS                        ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noProcessEnv": "error",
        "noRestrictedGlobals": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                       TYPESCRIPT                               ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useConsistentTypeDefinitions": {
          "level": "error",
          "options": {
            "style": "type"
          }
        },
        "useConsistentArrayType": {
          "level": "error",
          "options": {
            "syntax": "shorthand"
          }
        },
        "useConsistentMemberAccessibility": {
          "level": "error",
          "options": {
            "accessibility": "explicit"
          }
        },
        "noEnum": "error",
        // Enums are banned — use `as const` objects instead.
        "useEnumInitializers": "off",
        "useLiteralEnumMembers": "off",
        "noInferrableTypes": "error",
        "noNamespace": "error",
        "noNonNullAssertion": "error",
        "noParameterProperties": "error",
        "noRestrictedTypes": "error",
        "useAsConstAssertion": "error",
        "useReadonlyClassProperties": "error",
        "useShorthandFunctionType": "error",
        "useUnifiedTypeSignatures": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         TESTING                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDoneCallback": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           JSX                                  ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useConsistentCurlyBraces": "error",
        "useSelfClosingElements": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           I18N                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        // i18n: Not using translation system — JSX string literals allowed.
        "noJsxLiterals": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          REACT                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useComponentExportOnlyModules": "off",
        "useReactFunctionComponents": "off",
        "useFragmentSyntax": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         NEXT JS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noHeadElement": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           HTML                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noImplicitBoolean": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           CSS                                  ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDescendingSpecificity": "error",
        "noValueAtRule": "error"
      }
    }
  }
}

```

D:/1_Projects/jstonehub/configs/biomejs/src/linter/suspicious.jsonc

```
{
  "$schema": "https://biomejs.dev/schemas/2.4.7/schema.json",
  "linter": {
    "rules": {
      "suspicious": {
        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    DEBUGGING & CONSOLE                         ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noConsole": "error",
        "noDebugger": "error",
        "noAlert": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                   ASSIGNMENTS & MUTATIONS                      ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noAssignInExpressions": "error",
        "noCatchAssign": "error",
        "noClassAssign": "error",
        "noFunctionAssign": "error",
        "noGlobalAssign": "error",
        "noImportAssign": "error",
        "noMisrefactoredShorthandAssign": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                      DUPLICATES                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDuplicateCase": "error",
        "noDuplicateClassMembers": "error",
        "noDuplicateElseIf": "error",
        "noDuplicateObjectKeys": "error",
        "noDuplicateParameters": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    VARIABLES & SCOPE                           ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noVar": "error",
        "noWith": "error",
        "noLabelVar": "error",
        "noRedeclare": "error",
        "noShadowRestrictedNames": "error",
        "noUnassignedVariables": "error",
        // ES modules are strict by default — no need to add "use strict"
        "useStrictMode": "off",
        "noRedundantUseStrict": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     COMPARISONS & LOGIC                        ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDoubleEquals": "error",
        "noCompareNegZero": "error",
        "noConstantBinaryExpressions": "error",
        "noSelfCompare": "error",
        "noUnsafeNegation": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    CONTROL FLOW & SWITCH                       ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noConfusingLabels": "error",
        "noFallthroughSwitchClause": "error",
        "useDefaultSwitchClauseLast": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                    EMPTY & USELESS CODE                        ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noEmptyBlockStatements": "error",
        "noSparseArray": "error",
        "noUnusedExpressions": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     ASYNC & PROMISES                           ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noAsyncPromiseExecutor": "error",
        "noThenProperty": "error",
        "useAwait": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         NUMBERS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noApproximativeNumericConstant": "error",
        "noGlobalIsFinite": "error",
        "noGlobalIsNan": "error",
        "useNumberToFixedDigitsArgument": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         STRINGS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noOctalEscape": "error",
        "noTemplateCurlyInString": "error",
        "noUselessEscapeInString": "error",
        "noIrregularWhitespace": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          REGEX                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noControlCharactersInRegex": "error",
        "noMisleadingCharacterClass": "error",
        "noUselessRegexBackrefs": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          ARRAYS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useIsArray": "error",
        "useIterableCallbackReturn": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         OBJECTS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noPrototypeBuiltins": "error",
        "useGuardForIn": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                        FUNCTIONS                               ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useGetterReturn": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         CLASSES                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noMisleadingInstantiator": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                        OPERATORS                               ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noBitwiseOperators": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                       TYPESCRIPT                               ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noConfusingVoidType": "error",
        "noConstEnum": "error",
        "noEmptyInterface": "error",
        "noEvolvingTypes": "error",
        "noExplicitAny": "error",
        "noExtraNonNullAssertion": "error",
        "noImplicitAnyLet": "error",
        "noNonNullAssertedOptionalChain": "error",
        "noTsIgnore": "error",
        "noUnsafeDeclarationMerging": "error",
        "useAdjacentOverloadSignatures": "error",
        "useNamespaceKeyword": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         TESTING                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDuplicateTestHooks": "error",
        "noExportsInTest": "error",
        "noFocusedTests": "error",
        "noMisplacedAssertion": "error",
        "noSkippedTests": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           JSX                                  ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noCommentText": "error",
        "noDuplicateJsxProps": "error",
        "noReactSpecificProps": "error",
        "noSuspiciousSemicolonInJsx": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                        BROWSER                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDocumentCookie": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          ERRORS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useErrorMessage": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                     IMPORTS & DEPENDENCIES                     ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDeprecatedImports": "error",
        "noDuplicateDependencies": "error",
        "noImportCycles": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                        GRAPHQL                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDuplicateFields": "off",
        "useDeprecatedDate": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                           CSS                                  ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDuplicateAtImportRules": "error",
        "noDuplicateCustomProperties": "error",
        "noDuplicateFontNames": "error",
        "noDuplicateProperties": "error",
        "noDuplicateSelectorsKeyframeBlock": "error",
        "noEmptyBlock": "error",
        "noEmptySource": "error",
        "noImportantInKeyframe": "error",
        "noShorthandPropertyOverrides": "error",
        "noUnknownAtRules": "error",
        "useGoogleFontDisplay": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                      BIOME-SPECIFIC                            ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noBiomeFirstException": "error",
        "noQuickfixBiome": "error",
        "useBiomeIgnoreFolder": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          HTTP                                  ║
        // ╚════════════════════════════════════════════════════════════════╝

        "useStaticResponseMethods": "error",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                          REACT                                 ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noArrayIndexKey": "off",
        "noReactForwardRef": "off",

        // ╔════════════════════════════════════════════════════════════════╗
        // ║                         NEXT JS                                ║
        // ╚════════════════════════════════════════════════════════════════╝

        "noDocumentImportInPage": "off",
        "noHeadImportInDocument": "off"
      }
    }
  }
}

```