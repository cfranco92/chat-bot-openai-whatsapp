export default {
  testEnvironment: "node",
  verbose: true,
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  transform: {
    "^.+\\.js$": "babel-jest"
  }
};
