---
description: Commit all changes referencing the issue, push the branch, open a PR, and switch back to main
argument-hint: "[issue-number] (optional — auto-detected from branch name if omitted)"
allowed-tools: Bash(git:*), Bash(gh:*), Skill
---

Issue number argument (may be empty): $ARGUMENTS

Do the following steps:

1. Determine the issue number:
   - If $ARGUMENTS is not empty, use that as the issue number.
   - Otherwise, run `git branch --show-current` and extract the issue number
     from the branch name. Branches follow the pattern `feature/<number>-<slug>`,
     so parse the number right after `feature/`.
   - If no number can be determined either way, stop and ask the user for it.

2. Run `git status` and `git diff` to see all staged and unstaged changes.
   If there are no changes at all, stop and report that there's nothing to commit.

3. Run `gh issue view <issue-number>` to get the issue title/context, so the
   commit message and PR description can reference it meaningfully.

4. Invoke the `test-issue` skill (Skill tool, `skill: "test-issue"`,
   `args: "<issue-number>"`) to verify the current changes actually satisfy
   the issue's acceptance criteria.
   - If it reports **NOT READY**, stop and show the user exactly which
     criteria failed and why. Ask whether to fix them now, proceed anyway
     (e.g. a criterion that's genuinely out of scope for this PR), or cancel.
     Do not silently continue to committing/opening a PR.
   - If it reports **READY**, continue to the next step.

5. Stage all relevant changes with `git add`.

6. Create a single commit with a clear, conventional-style message summarizing
   the changes, and reference the issue at the end, e.g.:
   `fix: correct mobile login redirect (refs #<issue-number>)`

   Don't just restate the issue title — describe what was actually changed,
   based on the diff.

7. Push the current branch: `git push -u origin HEAD`

8. Open a pull request against `main`:
   `gh pr create --fill --body "Closes #<issue-number>"`

   The PR title can reuse the commit message; the body should briefly explain
   the change, include a short summary of the acceptance-criteria verification
   from step 4, and include "Closes #<issue-number>" so the issue auto-closes
   on merge.

9. Print the PR URL returned by `gh pr create`.

10. Switch back to main:
    - `git checkout main`
    - `git pull`

11. At the end, clearly confirm: the PR URL, and that the working directory
    is now back on `main`, up to date.
