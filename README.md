# Pull Request Comment Trigger

Look for a "trigger word" in a pull-request description or comment, so that later steps can know whether or not to run.

## Example usage in a workflow

Your workflow needs to listen to the following events:
```
on:
  pull_request:
    types: [opened]
  issue_comment:
    types: [created]
```

And then you can use the action in your jobs like this:

```
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: smartlyio/pull-request-comment-trigger-action@v2
        id: check
        with:
          trigger: '@deploy'
          reaction: rocket
        env:
          GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
      - run: 'echo Found it!'
        if: steps.check.outputs.triggered == 'true'
```

Reaction must be one of the reactions here: https://developer.github.com/v3/reactions/#reaction-types
And if you specify a reaction, you have to provide the `GITHUB_TOKEN` env vbl.

## Inputs

| Input | Required? | Description |
| ----- | --------- | ----------- |
| trigger | Yes | The string to look for in pull-request descriptions and comments. For example "#build/android". |
| prefix_only | No (default 'false') | If 'true', the trigger must match the start of the comment. |
| reaction | No (default '') | If set, the specified emoji "reaction" is put on the comment to indicate that the trigger was detected. For example, "rocket". |


## Outputs

| Output | Description |
| ------ | ----------- |
| triggered | 'true' or 'false' depending on if the trigger phrase was found. |
| comment_body | The comment body. |
