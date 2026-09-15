---
description: Create a feature branch from a GitHub issue and switch to it
argument-hint: [issue-number]
allowed-tools: Bash(git:*), Bash(gh:*)
---

Issue number: $ARGUMENTS

Do the following steps:

1. Fetch the issue details: `gh issue view $ARGUMENTS`
   (if the issue doesn't exist, or `gh` isn't authenticated, stop and report it)

2. From the issue title, generate a short kebab-case slug (max 4-5 words,
   lowercase, hyphen-separated), e.g. "Fix login bug on mobile" → "fix-login-bug-mobile"

3. Branch name should be: `feature/$ARGUMENTS-<slug>`

4. Check with `git status` whether there are uncommitted changes.
   If there are, stop and ask what to do with them (stash / commit / cancel).

5. If the working tree is clean:
   - `git pull`
   - `git checkout -b <branch-name>`

6. At the end, clearly report: which issue we're working on, which branch
   we're now on, and a short description of the issue.
