module.exports = LinterFlint =
  config:
    executablePath:
      type: 'string'
      default: ''
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
    console.log 'activate linter-flint' if atom.inDevMode()
    unless atom.packages.getLoadedPackages 'linter-plus'
      @showError '[linter-flint] `linter-plus` package not found, please install it'

  showError: (message = '') ->
    atom.notifications.addError message

  provideLinter: ->
    {
      scopes: ['*']
      scope: 'project'
      lint: @lint
    }

  lint: (TextEditor, TextBuffer) ->
    CP = require 'child_process'
    path = require 'path'
    xregexp = require('xregexp').XRegExp

    regex = xregexp('\\[(?<type>\\w+)\\]\\s(?<message>.*)')

    executablePath = atom.config.get 'linter-flint.executablePath'
    cmd = 'flint'
    cmd = path.join(executablePath, cmd).normalize() if executablePath.trim
    cmd = "#{cmd} --skip-readme" if atom.config.get 'linter-flint.skipReadme'
    cmd = "#{cmd} --skip-contributing" if atom.config.get 'linter-flint.skipContributing'
    cmd = "#{cmd} --skip-license" if atom.config.get 'linter-flint.skipLicense'
    cmd = "#{cmd} --skip-bootstrap" if atom.config.get 'linter-flint.skipBootstrap'
    cmd = "#{cmd} --skip-test-script" if atom.config.get 'linter-flint.skipTestScript'
    cmd = "#{cmd} --skip-scripts" if atom.config.get 'linter-flint.skipScripts'
    cmd = "#{cmd} --no-color" unless atom.config.get 'linter-flint.colorOutput'
    console.log "linter-flint command: #{cmd}" if atom.inDevMode()

    return new Promise (Resolve) ->
      projectPath = atom.project.getPaths()[0]
      Data = []
      Process = CP.exec(cmd, {cwd: projectPath})
      Process.stderr.on 'data', (data) -> Data.push(data.toString())
      Process.on 'close', ->
        Content = []
        for line in Data
          l_regex = xregexp.exec(line, regex)
          Content.push l_regex
          console.log "linter-flint regex: #{l_regex}" if atom.inDevMode()
          console.log "linter-flint: #{line}" if atom.inDevMode()
        ToReturn = []
        Content.forEach (regex) ->
          console.log "linter-flint regex content:  #{regex}" if atom.inDevMode()
          if regex
            console.log "linter-flint type: #{regex.type}" if atom.inDevMode()
            console.log "linter-flint message: #{regex.message}" if atom.inDevMode()
            ToReturn.push(
              type: regex.type,
              message: regex.message
            )
        Resolve(ToReturn)
