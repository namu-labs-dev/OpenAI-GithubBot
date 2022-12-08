const { Octokit } = require("@octokit/rest");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

// GitHub REST API 인스턴스 생성
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Github TEST 메소드

// Pull Request 감지
octokit.repos
  .get({
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
  })
  .then((result) => {
    const pullRequests = result.data.pull_requests;
    if (pullRequests.length > 0) {
      // OpenAI completion API 사용
      axios
        .post(
          "https://api.openai.com/v1/engines/davinci/completions",
          {
            prompt: pullRequests[0].body,
            max_tokens: 30,
          },
          {
            headers: {
              Authorization: process.env.OPENAI_TOKEN,
            },
          }
        )
        .then((response) => {
          // 개선 및 변경 사항 코멘트 제시
          octokit.issues.createComment({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            issue_number: pullRequests[0].number,
            body: response.data.choices[0].text,
          });
        });
    }
  });
