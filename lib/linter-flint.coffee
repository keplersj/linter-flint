module.exports = LinterFlint =
  config:
    executablePath:
      type: 'string'
      default: ''

  activate: ->
    console.log 'activate linter-flint' if atom.inDevMode()
    unless atom.packages.getLoadedPackages 'linter-plus'
      @showError '[linter-flint] `linter-plus` package not found,
       please install it'

  showError: (message = '') ->
    atom.notifications.addError message

  provideLinter: ->
    {
      scopes: []
      scope: 'project'
      lint: @lint
    }

  lint: (TextEditor, TextBuffer) ->
    CP = require 'child_process'
    Path = require 'path'
    XRegExp = require('xregexp').XRegExp

    regex = XRegExp('\\[(?<type>\w+)\\] (?<message>.*)')

    executablePath = atom.config.get 'linter-flint.executablePath'
    if executablePath.trim
      cmd = Path(executablePath).join('flint').normalize
    else
      cmd = 'flint'

    return new Promise (Resolve) ->
      projectPath = atom.project.getPaths()[0]
      Data = []
      Process = CP.exec(cmd, {cwd: Path.dirname(projectPath)})
      Process.stdout.on 'data', (data) -> Data.push(data.toString())
      Process.on 'close', ->
        Content = []
        for line in Data
          Content.push XRegExp.exec(line, regex)
          console.log "linter-flint: #{line}" if atom.inDevMode()
        ToReturn = []
        Content.forEach (regex) ->
          if regex
            ToReturn.push(
              type: regex.type,
              message: regex.message
            )
        Resolve(ToReturn)
