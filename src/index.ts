#!/usr/bin/env node

import core from '@actions/core'
import {context, getOctokit} from '@actions/github'

type ReactionType =
  | '+1'
  | '-1'
  | 'laugh'
  | 'confused'
  | 'heart'
  | 'hooray'
  | 'rocket'
  | 'eyes'

async function run(): Promise<void> {
  const trigger = core.getInput('trigger', {required: true})

  const reaction = core.getInput('reaction') as ReactionType
  const {GITHUB_TOKEN} = process.env
  if (reaction && GITHUB_TOKEN == null) {
    core.setFailed('If "reaction" is supplied, GITHUB_TOKEN is required')
    return
  }

  const body =
    (context.eventName === 'issue_comment'
      ? // For comments on pull requests
        context.payload.comment?.body
      : // For the initial pull request description
        context.payload.pull_request?.body) || ''
  core.setOutput('comment_body', body)

  if (
    context.eventName === 'issue_comment' &&
    !context.payload?.issue?.pull_request
  ) {
    // not a pull-request comment, aborting
    core.setOutput('triggered', 'false')
    return
  }

  const {owner, repo} = context.repo

  const prefixOnly = core.getInput('prefix_only') === 'true'
  if ((prefixOnly && !body.startsWith(trigger)) || !body.includes(trigger)) {
    core.setOutput('triggered', 'false')
    return
  }

  core.setOutput('triggered', 'true')

  if (!reaction) {
    return
  }
  if (GITHUB_TOKEN == null) return

  const client = getOctokit(GITHUB_TOKEN)
  if (context.eventName === 'issue_comment') {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const comment = context.payload.comment!
    await client.rest.reactions.createForIssueComment({
      owner,
      repo,
      comment_id: comment.id,
      content: reaction
    })
  } else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pr = context.payload.pull_request!
    await client.rest.reactions.createForIssue({
      owner,
      repo,
      issue_number: pr.number,
      content: reaction
    })
  }
}

async function main(): Promise<void> {
  try {
    await run()
  } catch (err) {
    core.setFailed(`Unexpected error: ${err}`)
  }
}

// noinspection JSIgnoredPromiseFromCall
main()
