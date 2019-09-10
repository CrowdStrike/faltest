# Prevent accidental check-in of `roles.only` (mocha-roles-only)


## Rule Details

Examples of **incorrect** code for this rule:

```js
roles.only('#role1 #role2', function() {
  // ...
});
```

Examples of **correct** code for this rule:

```js
roles('#role1 #role2', function() {
  // ...
});
```
