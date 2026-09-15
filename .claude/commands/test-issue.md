---
description: Verify that the current branch's changes satisfy a GitHub issue's acceptance criteria
argument-hint: "[issue-number] (optional — auto-detected from branch name if omitted)"
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Read, Grep, Glob
---

Issue number argument (may be empty): $ARGUMENTS

This is a read-only verification skill: it never edits files, commits, or runs any
mutating git/gh command. It only inspects the code and reports a verdict.

Do the following steps:

1. Determine the issue number:
   - If $ARGUMENTS is not empty, use that as the issue number.
   - Otherwise, run `git branch --show-current` and extract the issue number
     from the branch name. Branches follow the pattern `feature/<number>-<slug>`,
     so parse the number right after `feature/`.
   - If no number can be determined either way, stop and ask the user for it.

2. Fetch the issue: `gh issue view <issue-number> --json title,body,state,url`
   (if the issue doesn't exist, or `gh` isn't authenticated, stop and report it).

3. Extract the acceptance-criteria checklist from the issue body: every line
   matching `- [ ]` or `- [x]` under a `## Acceptance criteria` heading.
   If the issue has no such section, say so explicitly and instead do a looser
   completeness check based on the `## Goal` / `## Details` sections.

4. Gather what actually changed on this branch:
   - `git status` (staged, unstaged, and untracked files)
   - `git diff main...HEAD` (fall back to `git diff origin/main...HEAD` if
     `main` isn't available locally), plus `git diff` / `git diff --staged`
     for anything not yet committed.

5. If the project has `lint`/`build` scripts (check `package.json`), run them
   (`npm run lint`, `npm run build`). Treat a failure here as an automatic
   blocking issue regardless of what the acceptance criteria say — broken
   lint/build is never "ready", even if every checklist item looks satisfied.

6. For each acceptance criterion, actually verify it against the code — don't
   just assume it's done because a file with a plausible name exists:
   - Read/Grep the relevant files from the diff to confirm the described
     behavior is really implemented (e.g. "Toggle switches theme instantly"
     → find the toggle's click handler and the state/attribute it flips;
     "Copy exists in both hu and en" → open both locale files and confirm
     the same keys are present in both).
   - Classify each criterion as:
     - ✅ **Met** — clearly implemented, with a one-line pointer to where
       (file/function).
     - ❌ **Not met** — missing or contradicted by the code, with a one-line
       reason.
     - ⚠️ **Can't verify statically** — genuinely requires a running browser/
       manual check (visual QA, animation timing, Lighthouse score, etc.).
       Say so plainly rather than guessing.

7. Also skim the `## Details` bullets (not just the checklist) for obvious
   mismatches you notice while reading the diff (wrong color value, wrong
   breakpoint, missing locale key, etc.) and call those out even if no
   checklist item explicitly covers them.

8. Produce a clear, compact report:
   - Issue number, title, and URL.
   - One line per acceptance criterion with its verdict and reason.
   - Any extra mismatches found in step 7.
   - Lint/build result from step 5.
   - **Overall verdict**, exactly one of:
     - `READY` — every criterion is ✅, or the only exceptions are ⚠️ items
       that are inherently manual, and lint/build pass.
     - `NOT READY` — at least one ❌, or lint/build fails. List precisely
       what needs to change before this can ship.
