'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';
import { exec } from 'atom-linter';
import { dirname } from 'path';
import escapeHTML from 'escape-html';

// Internal vars
// Example: https://regex101.com/r/OfS9w0/2/
const regex = /\[([A-Z]+)\] (.+)(?:\n\[INFO\] ([^\n.]+.)(?: (http:.+))?\n?)?/gm;

export default {
  activate() {
    require('atom-package-deps').install('linter-flint');

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.config.observe('linter-flint.executablePath', (value) => {
        this.executablePath = value;
      }),
    );
    this.subscriptions.add(
      atom.config.observe('linter-flint.skipReadme', (value) => {
        this.skipReadme = value;
      }),
    );
    this.subscriptions.add(
      atom.config.observe('linter-flint.skipContributing', (value) => {
        this.skipContributing = value;
      }),
    );
    this.subscriptions.add(
      atom.config.observe('linter-flint.skipLicense', (value) => {
        this.skipLicense = value;
      }),
    );
    this.subscriptions.add(
      atom.config.observe('linter-flint.skipBootstrap', (value) => {
        this.skipBootstrap = value;
      }),
    );
    this.subscriptions.add(
      atom.config.observe('linter-flint.skipTestScript', (value) => {
        this.skipTestScript = value;
      }),
    );
    this.subscriptions.add(
      atom.config.observe('linter-flint.skipScripts', (value) => {
        this.skipScripts = value;
      }),
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'Flint',
      grammarScopes: ['*'],
      scope: 'project',
      lintOnFly: false,
      lint: async (editor) => {
        const filePath = editor.getPath();
        let projectPath = atom.project.relativizePath(filePath)[0];
        if (projectPath === null) {
          projectPath = dirname(filePath);
        }

        const execArgs = ['--no-color'];
        if (this.skipReadme) {
          execArgs.push('--skip-readme');
        }
        if (this.skipContributing) {
          execArgs.push('--skip-contributing');
        }
        if (this.skipLicense) {
          execArgs.push('--skip-license');
        }
        if (this.skipBootstrap) {
          execArgs.push('--skip-bootstrap');
        }
        if (this.skipTestScript) {
          execArgs.push('--skip-test-script');
        }
        if (this.skipScripts) {
          execArgs.push('--skip-scripts');
        }

        const execOpts = {
          cwd: projectPath,
          stream: 'stderr',
        };

        const output = await exec(this.executablePath, execArgs, execOpts);

        const toReturn = [];

        let match = regex.exec(output);
        while (match !== null) {
          const [type, text, info, url] = match.slice(1);
          if (type !== 'OK') {
            const message = {
              type: type === 'WARNING' ? 'Warning' : 'Error',
              severity: type === 'WARNING' ? 'warning' : 'error',
              text,
            };
            if (info) {
              const trace = {
                type: 'Trace',
                severity: 'info',
              };
              if (url) {
                trace.html = `${escapeHTML(info)} (<a href="${url}">link</a>)`;
              } else {
                trace.text = info;
              }
              message.trace = [trace];
            }
            toReturn.push(message);
          }
          match = regex.exec(output);
        }
        return toReturn;
      },
    };
  },
};
