# Contributing to VTS-Browser-JS

[Melown](http://melown.com) VTS-Browser-JS project openly welcomes
contributions (bug reports, bug fixes, code enhancements/features, etc.).  This
document will outline some guidelines on contributing to VTS-Browser-JS. 

VTS-Browser-JS has the following modes of contribution:

- GitHub Pull Requests (accepted and moderated by contributors with git write access)
- GitHub Commit Access (granted to long-term core developers)

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct
(see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)). By
participating in this project you agree to abide by its terms.


## Contributor License Agreement

Contributors are asked to expressly agree with [Melown Contributor License Agreement (CLA)](https://gist.github.com/melown-bookkeeping/400fcb29dae1042c7b36880986d939f8).

The purpose of the Melown CLA is to ensure that

- Melown secures copyright and any patent rights necessary to make your code part of the project
- your contribution does not infringe on other people's rights

You agree with the CLA by

 1. downloading a [CLA copy](https://melown.github.io/documents/melown-individual-cla-v1.pdf) and printing it,
 2. entering your name, your legal adress and current date,
 3. signing the document,
 4. scanning the signed document and emailing it to *community at melown.com*.

This is only required once for your contributions to [all Melown repositories](https://github.com/Melown).

## Development

### GitHub Commit Guidelines

- enhancements and bug fixes should be identified with a GitHub issue
- commits should be granular enough for other developers to understand the
  nature / implications of the change(s). You might be asked to merge commits,
  so that other developers are able to understand commit content.
- non-trivial Git commits shall be associated with a GitHub issue.  As
  documentation can always be improved, tickets need not be opened for improving
  the docs
- Git commits shall include a description of changes
- Git commits shall include the GitHub issue number (i.e. ``#1234``) in the Git
  commit log message

**Once test environment is set:**

- all enhancements or bug fixes must successfully pass all tests
  before they are committed


### Coding Guidelines

**NOTE:** There are no specific coding guidelines yet. ESLinter will be set
soon.

### Submitting a Pull Request

This section will guide you through steps of working on VTS-Browser-JS.  This
section assumes you have forked VTS-Browser-JS into your own GitHub repository.
Note that `master` is the main development branch in VTS-Browser-JS; 
```
  # clone the repository locally
  git clone https://github.com/melown/vts-browser-js.git
  cd vts-browser-js
  
  # add the main VTS-Browser-JS development branch to keep up to date with
  # upstream changes
  git remote add upstream https://github.com/melown/vts-browser-js.git
  git pull upstream master

  # create a local branch off master
  # The name of the branch should include the issue number if it exists
  git branch issue-72
  git checkout issue-72

   
  # make code/doc changes
  git commit -am 'fix xyz (#72)'
  git push origin issue-72

```

Your changes are now visible on your VTS-Browser-JS repository on GitHub.  You
are now ready to create a pull request.  A member of the Melown core team will
review the pull request and provide feedback / suggestions if required.  If
changes are required, make them against the same branch and push as per above
(all changes to the branch in the pull request apply).

The pull request will then be merged by the Melown team.  You can then delete
your local branch (on GitHub), and then update
your own repository to ensure your Melown repository is up to date with Melown
master:

```
  git checkout master
  git pull upstream master
```

## Documentation

**NOTE:** More detailed description of code structure is missing right now. We
are aware of this issue and will try to improve the documentation in the future. 

* Check the [Library user documentation](https://github.com/Melown/vts-browser-js/wiki)

## Bugs

The VTS-Browser-JS [issue tracker](https://github.com/melown/vts-browser-js/issues) is the
place to report bugs or request enhancements. To submit a bug be sure to specify
the VTS-Browser-JS version you are using, the appropriate component, a description of how
to reproduce the bug. Please note, that we are going to reproduce the bug on the
development server (see `README.md` for how to start dev server).

