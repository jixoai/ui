/**
 * Embedded tree-sitter highlight queries (lib/highlight/tree-sitter-queries.ts,
 * highlight-engine-matrix, 2026-09-06).
 *
 * VERBATIM COPIES of the MIT-licensed highlight queries that ship inside
 * the grammar npm packages this backend depends on:
 *
 *   - JAVASCRIPT_HIGHLIGHTS_QUERY      tree-sitter-javascript@0.23.1,
 *     queries/highlights.scm
 *   - JAVASCRIPT_JSX_HIGHLIGHTS_QUERY  tree-sitter-javascript@0.23.1,
 *     queries/highlights-jsx.scm
 *   - TYPESCRIPT_HIGHLIGHTS_QUERY      tree-sitter-typescript@0.23.2,
 *     queries/highlights.scm
 *
 * Upstream: https://github.com/tree-sitter/tree-sitter-javascript and
 * https://github.com/tree-sitter/tree-sitter-typescript — both MIT,
 * Copyright (c) 2014 / 2017 Max Brunsfeld. Same license, same authors as
 * the wasm grammars they accompany; embedding keeps the query pipeline's
 * supply chain identical to the grammar channel (lockfile'd npm).
 *
 * COMPOSITION LAW (probe-verified 2026-09-06, node 24, real wasm): a
 * tree-sitter-typescript package's highlights.scm is ONLY the TS-specific
 * supplement — types, parameters and TS keywords — while the javascript
 * package's highlights.scm is the shared base (strings, comments,
 * functions, literals, punctuation). And a query may only reference node
 * types its grammar knows: the JSX query against the plain typescript
 * grammar is a QueryError ("Bad node name 'jsx_opening_element'"), so
 * the backend composes per GRAMMAR, not per file:
 *
 *   typescript = JS + TS          tsx = JS + TS + JSX
 *   javascript = JS + JSX (the jsx lang alias shares this grammar)
 *
 * Fidelity is locked in the contract test (code-card-backend-tree-sitter.
 * spec.ts): it byte-compares these constants against the installed
 * packages' own query files, so an upstream drift surfaces there.
 */

export const JAVASCRIPT_HIGHLIGHTS_QUERY = `; Variables
;----------

(identifier) @variable

; Properties
;-----------

(property_identifier) @property

; Function and method definitions
;--------------------------------

(function_expression
  name: (identifier) @function)
(function_declaration
  name: (identifier) @function)
(method_definition
  name: (property_identifier) @function.method)

(pair
  key: (property_identifier) @function.method
  value: [(function_expression) (arrow_function)])

(assignment_expression
  left: (member_expression
    property: (property_identifier) @function.method)
  right: [(function_expression) (arrow_function)])

(variable_declarator
  name: (identifier) @function
  value: [(function_expression) (arrow_function)])

(assignment_expression
  left: (identifier) @function
  right: [(function_expression) (arrow_function)])

; Function and method calls
;--------------------------

(call_expression
  function: (identifier) @function)

(call_expression
  function: (member_expression
    property: (property_identifier) @function.method))

; Special identifiers
;--------------------

((identifier) @constructor
 (#match? @constructor "^[A-Z]"))

([
    (identifier)
    (shorthand_property_identifier)
    (shorthand_property_identifier_pattern)
 ] @constant
 (#match? @constant "^[A-Z_][A-Z\\\\d_]+$"))

((identifier) @variable.builtin
 (#match? @variable.builtin "^(arguments|module|console|window|document)$")
 (#is-not? local))

((identifier) @function.builtin
 (#eq? @function.builtin "require")
 (#is-not? local))

; Literals
;---------

(this) @variable.builtin
(super) @variable.builtin

[
  (true)
  (false)
  (null)
  (undefined)
] @constant.builtin

(comment) @comment

[
  (string)
  (template_string)
] @string

(regex) @string.special
(number) @number

; Tokens
;-------

[
  ";"
  (optional_chain)
  "."
  ","
] @punctuation.delimiter

[
  "-"
  "--"
  "-="
  "+"
  "++"
  "+="
  "*"
  "*="
  "**"
  "**="
  "/"
  "/="
  "%"
  "%="
  "<"
  "<="
  "<<"
  "<<="
  "="
  "=="
  "==="
  "!"
  "!="
  "!=="
  "=>"
  ">"
  ">="
  ">>"
  ">>="
  ">>>"
  ">>>="
  "~"
  "^"
  "&"
  "|"
  "^="
  "&="
  "|="
  "&&"
  "||"
  "??"
  "&&="
  "||="
  "??="
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket

(template_substitution
  "\${" @punctuation.special
  "}" @punctuation.special) @embedded

[
  "as"
  "async"
  "await"
  "break"
  "case"
  "catch"
  "class"
  "const"
  "continue"
  "debugger"
  "default"
  "delete"
  "do"
  "else"
  "export"
  "extends"
  "finally"
  "for"
  "from"
  "function"
  "get"
  "if"
  "import"
  "in"
  "instanceof"
  "let"
  "new"
  "of"
  "return"
  "set"
  "static"
  "switch"
  "target"
  "throw"
  "try"
  "typeof"
  "var"
  "void"
  "while"
  "with"
  "yield"
] @keyword
`;

export const JAVASCRIPT_JSX_HIGHLIGHTS_QUERY = `(jsx_opening_element (identifier) @tag (#match? @tag "^[a-z][^.]*$"))
(jsx_closing_element (identifier) @tag (#match? @tag "^[a-z][^.]*$"))
(jsx_self_closing_element (identifier) @tag (#match? @tag "^[a-z][^.]*$"))

(jsx_attribute (property_identifier) @attribute)
(jsx_opening_element (["<" ">"]) @punctuation.bracket)
(jsx_closing_element (["</" ">"]) @punctuation.bracket)
(jsx_self_closing_element (["<" "/>"]) @punctuation.bracket)
`;

export const TYPESCRIPT_HIGHLIGHTS_QUERY = `; Types

(type_identifier) @type
(predefined_type) @type.builtin

((identifier) @type
 (#match? @type "^[A-Z]"))

(type_arguments
  "<" @punctuation.bracket
  ">" @punctuation.bracket)

; Variables

(required_parameter (identifier) @variable.parameter)
(optional_parameter (identifier) @variable.parameter)

; Keywords

[ "abstract"
  "declare"
  "enum"
  "export"
  "implements"
  "interface"
  "keyof"
  "namespace"
  "private"
  "protected"
  "public"
  "type"
  "readonly"
  "override"
  "satisfies"
] @keyword
`;
