const Formatter = require("./formatter")

const Config = {
  usePrettierInCurrentFileDir: {
    order: 0,
    type: "boolean",
    default: true,
  },
  usePrettierInCurrentProject: {
    order: 1,
    type: "boolean",
    default: true,
  },
  usePrettierGloballyInstalled: {
    order: 2,
    type: "boolean",
    default: true,
  },
  usePrettierBundled: {
    order: 3,
    type: "boolean",
    default: true,
  },
  javascriptParser: {
    order: 4,
    type: "string",
    default: "babylon",
    enum: ["babylon", "flow"],
  },
  notificationMethodOnPrettierError: {
    order: 5,
    type: "string",
    default: "atom-notification",
    enum: ["atom-notification", "console"],
  },
  debug: {
    order: 6,
    type: "boolean",
    default: false,
  },
}

module.exports = {
  config: Config,
  activate() {
    this.disposable = atom.commands.add("atom-text-editor:not([mini])", "mprettier:format", function() {
      new Formatter(this.getModel()).format()
    })
  },

  deactivate() {
    this.disposable.dispose()
  },
}
