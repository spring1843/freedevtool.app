Your task is to "onboard" this repository to Copilot coding agent by adding a .github/copilot-instructions.md file in the repository that contains information describing how a coding agent seeing it for the first time can work most efficiently.

<Goals>
- We want to reuse, and have a clean and simple code and architecture
- Reduce the likelihood of a coding agent pull request getting rejected by the user due to generating code that fails the continuous integration build, fails a validation pipeline by making sure `make ci` passes.
- We don't want to introduce bugs
- Stay faithful to the Style Guides that can be found in Style.md file
- Not have bash commands or other linux commands in workflow, they should be in Makefile
</Goals>

<Limitations>
- Instructions must be no longer than 2 pages.
- Instructions must not be task specific.
</Limitations>

<WhatToAdd>

<HighLevelDetails>
FreeDevTool.App is a comprehensive web-based collection of open source developer and productivity utilities. It is a stand-alone app that does not send or receive anything to the Internet after it is loaded which makes it useful for sensitive information such as corporate data. There is no back-end other than what `vite` does for SEO purposes. More info in README.md
</HighLevelDetails>

<BuildInstructions>
Run `make build`
Might need to do `make deps` on a fresh setup to install needed dependencies
</BuildInstructions>

<ProjectLayout>
- Makefile contains all the instructions you need to do things such as install dependencies, run tests, and run all the CI checks that will eventually run in Github Workflows
- This application is built using `make build` which prepares a package for production
- There are many checks for production readiness they all run with `make ci` it's a good idea to run this to find regression bugs
</ProjectLayout>

</WhatToAdd>

<StepsToFollow>
- Perform a comprehensive inventory of the codebase. Search for and view:
- README.md, CONTRIBUTING.md, STYLE.md, Makefile and all other documentation files.
</StepsToFollow>
