module.exports = {
  plugins: ["boundaries"],
  extends: ["plugin:boundaries/strict"],
  settings: {
    "boundaries/include": ["apps/**", "packages/**"],
    "boundaries/elements": [
      {
        type: "frontend",
        pattern: "apps/frontend/**"
      },
      {
        type: "server",
        pattern: "apps/server/**"
      },
      {
        type: "packages",
        pattern: "packages/**"
      }
    ]
  },
  rules: {
    "boundaries/element-types": [
      2,
      {
        default: "disallow",
        rules: [
          {
            from: "frontend",
            allow: ["packages"]
          },
          {
            from: "server",
            allow: ["packages"]
          },
          {
            from: "packages",
            allow: ["packages"]
          }
        ]
      }
    ]
  }
};
