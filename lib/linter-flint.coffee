module.exports = LinterFlint =
  config:
    executablePath:
      type: 'string'
      default: 'flint'
    skipReadme:
      type: 'boolean'
      default: false
    skipContributing:
      type: 'boolean'
      default: false
    skipLicense:
      type: 'boolean'
      default: false
    skipBootstrap:
      type: 'boolean'
      default: false
    skipTestScript:
      type: 'boolean'
      default: false
    skipScripts:
      type: 'boolean'
      default: false
    colorOutput:
      type: 'boolean'
      default: false

  activate: ->
    # Show the user an error if they do not have an appropriate linter based
    #   package installed from Atom Package Manager. This will not be an issue
    #   after a base linter package is integrated into Atom, in the coming
    #   months.
    # TODO: Remove when Linter Base is integrated into Atom.
    atom.notifications.addError(
      'Linter package not found.',
      {
        detail: 'Please install the `linter` package in your Settings view'
      }
    ) unless atom.packages.getLoadedPackages 'linter'

  provideLinter: ->
    LinterProvider = require('./provider')
    @provider = new LinterProvider()
    return {
      grammarScopes: ['*']
      scope: 'project'
      lint: @provider.lint
      lintOnFly: true
    }
