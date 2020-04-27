module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    "extends": [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    "ignorePatterns": ["src/generated/"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "react-hooks",
        "import",
        "jsx-a11y",
        "flowtype",
        "@typescript-eslint",
        "@typescript-eslint/tslint"
    ],
    "rules": {
        "array-callback-return": [
            "warn"
        ],
        "default-case": [
            "warn",
            {
                "commentPattern": "^no default$"
            }
        ],
        "dot-location": [
            "warn",
            "property"
        ],
        "eqeqeq": [
            "warn",
            "smart"
        ],
        "new-parens": "warn",
        "no-array-constructor": [
            "warn"
        ],
        "no-caller": "warn",
        "no-cond-assign": "warn",
        "no-const-assign": [
            "warn"
        ],
        "no-control-regex": [
            "warn"
        ],
        "no-delete-var": [
            "warn"
        ],
        "no-dupe-args": [
            "warn"
        ],
        "no-dupe-class-members": [
            "warn"
        ],
        "no-dupe-keys": [
            "warn"
        ],
        "no-duplicate-case": [
            "warn"
        ],
        "no-empty-character-class": [
            "warn"
        ],
        "no-empty-pattern": [
            "warn"
        ],
        "no-eval": "warn",
        "no-ex-assign": [
            "warn"
        ],
        "no-extend-native": [
            "warn"
        ],
        "no-extra-bind": [
            "warn"
        ],
        "no-extra-label": [
            "warn"
        ],
        "no-fallthrough": "off",
        "no-func-assign": [
            "warn"
        ],
        "no-implied-eval": [
            "warn"
        ],
        "no-invalid-regexp": [
            "warn"
        ],
        "no-iterator": [
            "warn"
        ],
        "no-label-var": [
            "warn"
        ],
        "no-labels": [
            "warn",
            {
                "allowLoop": true,
                "allowSwitch": false
            }
        ],
        "no-lone-blocks": [
            "warn"
        ],
        "no-loop-func": [
            "warn"
        ],
        "no-mixed-operators": [
            "warn",
            {
                "groups": [
                    [
                        "&",
                        "|",
                        "^",
                        "~",
                        "<<",
                        ">>",
                        ">>>"
                    ],
                    [
                        "==",
                        "!=",
                        "===",
                        "!==",
                        ">",
                        ">=",
                        "<",
                        "<="
                    ],
                    [
                        "&&",
                        "||"
                    ],
                    [
                        "in",
                        "instanceof"
                    ]
                ],
                "allowSamePrecedence": false
            }
        ],
        "no-multi-str": [
            "warn"
        ],
        "no-native-reassign": [
            "warn"
        ],
        "no-negated-in-lhs": [
            "warn"
        ],
        "no-new-func": [
            "warn"
        ],
        "no-new-object": [
            "warn"
        ],
        "no-new-symbol": [
            "warn"
        ],
        "no-new-wrappers": "warn",
        "no-obj-calls": [
            "warn"
        ],
        "no-octal": [
            "warn"
        ],
        "no-octal-escape": [
            "warn"
        ],
        "no-redeclare": [
            "warn",
            {
                "builtinGlobals": false
            }
        ],
        "no-regex-spaces": [
            "warn"
        ],
        "no-restricted-syntax": [
            "warn",
            "WithStatement"
        ],
        "no-script-url": [
            "warn"
        ],
        "no-self-assign": [
            "warn"
        ],
        "no-self-compare": [
            "warn"
        ],
        "no-sequences": [
            "warn"
        ],
        "no-shadow-restricted-names": [
            "warn"
        ],
        "no-sparse-arrays": [
            "warn"
        ],
        "no-template-curly-in-string": [
            "warn"
        ],
        "no-this-before-super": [
            "warn"
        ],
        "no-throw-literal": "warn",
        "no-undef": [
            "error"
        ],
        "no-restricted-globals": [
            "error",
            "addEventListener",
            "blur",
            "close",
            "closed",
            "confirm",
            "defaultStatus",
            "defaultstatus",
            "event",
            "external",
            "find",
            "focus",
            "frameElement",
            "frames",
            "history",
            "innerHeight",
            "innerWidth",
            "length",
            "location",
            "locationbar",
            "menubar",
            "moveBy",
            "moveTo",
            "name",
            "onblur",
            "onerror",
            "onfocus",
            "onload",
            "onresize",
            "onunload",
            "open",
            "opener",
            "opera",
            "outerHeight",
            "outerWidth",
            "pageXOffset",
            "pageYOffset",
            "parent",
            "print",
            "removeEventListener",
            "resizeBy",
            "resizeTo",
            "screen",
            "screenLeft",
            "screenTop",
            "screenX",
            "screenY",
            "scroll",
            "scrollbars",
            "scrollBy",
            "scrollTo",
            "scrollX",
            "scrollY",
            "self",
            "status",
            "statusbar",
            "stop",
            "toolbar",
            "top"
        ],
        "no-unreachable": [
            "warn"
        ],
        "no-unused-expressions": "warn",
        "no-unused-labels": "warn",
        "@typescript-eslint/no-unused-vars-experimental": "warn",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-use-before-define": [
            "warn",
            {
                "functions": false,
                "classes": false,
                "variables": false
            }
        ],
        "no-useless-computed-key": [
            "warn"
        ],
        "no-useless-concat": [
            "warn"
        ],
        "no-useless-constructor": [
            "warn"
        ],
        "no-useless-escape": [
            "warn"
        ],
        "no-useless-rename": [
            "warn",
            {
                "ignoreDestructuring": false,
                "ignoreImport": false,
                "ignoreExport": false
            }
        ],
        "no-with": [
            "warn"
        ],
        "no-whitespace-before-property": [
            "warn"
        ],
        "react-hooks/exhaustive-deps": [
            "warn"
        ],
        "require-yield": [
            "warn"
        ],
        "rest-spread-spacing": [
            "warn",
            "never"
        ],
        "strict": [
            "warn",
            "never"
        ],
        "unicode-bom": [
            "warn",
            "never"
        ],
        "use-isnan": "warn",
        "valid-typeof": "off",
        "no-restricted-properties": [
            "error",
            {
                "object": "require",
                "property": "ensure",
                "message": "Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting"
            },
            {
                "object": "System",
                "property": "import",
                "message": "Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting"
            }
        ],
        "getter-return": [
            "warn"
        ],
        "import/first": [
            "error"
        ],
        "import/no-amd": [
            "error"
        ],
        "import/no-webpack-loader-syntax": [
            "error"
        ],
        "react/forbid-foreign-prop-types": [
            "warn",
            {
                "allowInPropTypes": true
            }
        ],
        "react/jsx-no-comment-textnodes": [
            "warn"
        ],
        "react/jsx-no-duplicate-props": [
            "warn"
        ],
        "react/jsx-no-target-blank": [
            "warn"
        ],
        "react/jsx-no-undef": [
            "error"
        ],
        "react/jsx-pascal-case": [
            "warn",
            {
                "allowAllCaps": true,
                "ignore": []
            }
        ],
        "react/jsx-uses-react": [
            "warn"
        ],
        "react/jsx-uses-vars": [
            "warn"
        ],
        "react/no-danger-with-children": [
            "warn"
        ],
        "react/no-direct-mutation-state": [
            "warn"
        ],
        "react/no-is-mounted": [
            "warn"
        ],
        "react/no-typos": [
            "error"
        ],
        "react/react-in-jsx-scope": [
            "error"
        ],
        "react/require-render-return": [
            "error"
        ],
        "react/style-prop-object": [
            "warn"
        ],
        "jsx-a11y/accessible-emoji": [
            "warn"
        ],
        "jsx-a11y/alt-text": [
            "warn"
        ],
        "jsx-a11y/anchor-has-content": [
            "warn"
        ],
        "jsx-a11y/anchor-is-valid": [
            "warn",
            {
                "aspects": [
                    "noHref",
                    "invalidHref"
                ]
            }
        ],
        "jsx-a11y/aria-activedescendant-has-tabindex": [
            "warn"
        ],
        "jsx-a11y/aria-props": [
            "warn"
        ],
        "jsx-a11y/aria-proptypes": [
            "warn"
        ],
        "jsx-a11y/aria-role": [
            "warn",
            {
                "ignoreNonDOM": true
            }
        ],
        "jsx-a11y/aria-unsupported-elements": [
            "warn"
        ],
        "jsx-a11y/heading-has-content": [
            "warn"
        ],
        "jsx-a11y/iframe-has-title": [
            "warn"
        ],
        "jsx-a11y/img-redundant-alt": [
            "warn"
        ],
        "jsx-a11y/no-access-key": [
            "warn"
        ],
        "jsx-a11y/no-distracting-elements": [
            "warn"
        ],
        "jsx-a11y/no-redundant-roles": [
            "warn"
        ],
        "jsx-a11y/role-has-required-aria-props": [
            "warn"
        ],
        "jsx-a11y/role-supports-aria-props": [
            "warn"
        ],
        "jsx-a11y/scope": [
            "warn"
        ],
        "react-hooks/rules-of-hooks": [
            "error"
        ],
        "flowtype/define-flow-type": [
            "warn"
        ],
        "flowtype/require-valid-file-annotation": [
            "warn"
        ],
        "flowtype/use-flow-type": [
            "warn"
        ],
        "@typescript-eslint/adjacent-overload-signatures": "warn",
        "@typescript-eslint/array-type": "warn",
        "@typescript-eslint/ban-types": "warn",
        "@typescript-eslint/class-name-casing": "warn",
        "@typescript-eslint/consistent-type-assertions": "warn",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/member-delimiter-style": [
            "warn",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/no-empty-function": "warn",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-misused-new": "warn",
        "@typescript-eslint/no-namespace": "warn",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/prefer-for-of": "off",
        "@typescript-eslint/prefer-function-type": "warn",
        "@typescript-eslint/prefer-namespace-keyword": "warn",
        "@typescript-eslint/triple-slash-reference": "warn",
        "@typescript-eslint/unified-signatures": "warn",
        "arrow-parens": [
            "warn",
            "as-needed"
        ],
        "camelcase": "warn",
        "comma-dangle": "off",
        "complexity": "off",
        "constructor-super": "warn",
        "dot-notation": "off",
        "eol-last": "off",
        "guard-for-in": "warn",
        "id-blacklist": [
            "warn",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined"
        ],
        "id-match": "warn",
        "import/order": "off",
        "max-classes-per-file": [
            "warn",
            1
        ],
        "max-len": [
            "warn",
            {
                "code": 160
            }
        ],
        "no-bitwise": "warn",
        "no-console": "off",
        "no-debugger": "warn",
        "no-empty": "warn",
        "no-invalid-this": "off",
        "no-shadow": [
            "warn",
            {
                "hoist": "all"
            }
        ],
        "no-trailing-spaces": "off",
        "no-undef-init": "warn",
        "no-underscore-dangle": "warn",
        "no-unsafe-finally": "warn",
        "no-var": "warn",
        "object-shorthand": "off",
        "one-var": [
            "warn",
            "never"
        ],
        "prefer-const": "warn",
        "radix": "warn",
        "spaced-comment": "warn",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "rules": {
                    "jsdoc-format": true,
                    "no-reference-import": true
                }
            }
        ],
        "@typescript-eslint/explicit-function-return-type": "off"
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
};