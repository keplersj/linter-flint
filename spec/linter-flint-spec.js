'use babel';

import * as path from 'path';

const { lint } = require('../lib/linter-flint.js').provideLinter();

const goodPath = path.join(__dirname, 'fixtures', 'goodProj', 'package.json');
const badPath = path.join(__dirname, 'fixtures', 'badProj', 'package.json');

describe('The Flint provider for Linter', () => {
  beforeEach(() => {
    // Close any open file
    atom.workspace.destroyActivePaneItem();
    // Close all project paths
    const projectPaths = atom.project.getPaths();
    projectPaths.forEach(projectPath => atom.project.removePath(projectPath));
    // Activate the linter
    waitsForPromise(() => atom.packages.activatePackage('linter-flint'));
  });

  it('checks a project with no issues and finds nothing wrong', () => {
    atom.project.addPath(path.dirname(goodPath));
    waitsForPromise(() => atom.workspace.open(goodPath).then(editor =>
      lint(editor).then(messages =>
        expect(messages.length).toBe(0))));
  });

  it('checks a project with issues and reports the found issues', () => {
    atom.project.addPath(path.dirname(badPath));
    waitsForPromise(() => atom.workspace.open(badPath).then(editor =>
      lint(editor).then((messages) => {
        expect(messages[0].type).toBe('Warning');
        expect(messages[0].severity).toBe('warning');
        expect(messages[0].html).not.toBeDefined();
        expect(messages[0].text).toBe('Bootstrap script not found');
        expect(messages[0].filePath).not.toBeDefined();
        expect(messages[0].range).not.toBeDefined();
        expect(messages[0].trace).toEqual([{
          type: 'Trace',
          severity: 'info',
          html: 'A bootstrap script makes setup a snap. (<a href="http://bit.ly/JZjVL6">link</a>)',
        }]);

        expect(messages[1].type).toBe('Warning');
        expect(messages[1].severity).toBe('warning');
        expect(messages[1].html).not.toBeDefined();
        expect(messages[1].text).toBe('Test script not found');
        expect(messages[1].filePath).not.toBeDefined();
        expect(messages[1].range).not.toBeDefined();
        expect(messages[1].trace).toEqual([{
          type: 'Trace',
          severity: 'info',
          html: 'Make it easy to run the test suite regardless of project type. (<a href="http://bit.ly/JZjVL6">link</a>)',
        }]);
      })));
  });
});
