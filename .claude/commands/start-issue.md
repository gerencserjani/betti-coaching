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

6. Move the issue to "In Progress" on the project board (project "Betti
   Coaching Website", owner `gerencserjani`, project id
   `PVT_kwHOA_QCFM4Bjcit`, Status field id `PVTSSF_lAHOA_QCFM4BjcitzhiQzRE`,
   "In Progress" option id `47fc9ee4`):
   - Find this issue's project item id: run
     `gh project item-list 1 --owner gerencserjani --format json` and read
     the `id` of the entry whose `content.number` equals the issue number.
   - Run:
     `gh project item-edit --id <item-id> --field-id PVTSSF_lAHOA_QCFM4BjcitzhiQzRE --project-id PVT_kwHOA_QCFM4Bjcit --single-select-option-id 47fc9ee4`
   - If the IDs above no longer work (project recreated, field renamed) or
     the issue isn't on this board, look them up fresh with
     `gh project field-list 1 --owner gerencserjani --format json` and don't
     let a failure here block branch creation — just note it in the final
     report.

7. At the end, clearly report: which issue we're working on, which branch
   we're now on, a short description of the issue, and whether the board
   status update succeeded.
