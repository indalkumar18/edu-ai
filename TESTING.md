# EduXai test plan

## Run the checks

Run all automated suites from the repository root after installing dependencies:

```bash
npm run install:all
npm test
npm run check
```

`npm run check` runs backend tests, frontend tests, ESLint and the production frontend build. Run `npm run coverage:backend` to generate a focused coverage report for the independently tested backend validation and grading utilities. The GitHub Actions workflow repeats these checks for every push and pull request.

## Automated coverage areas

| Area | Checks |
|---|---|
| Quiz grading | Correct, incorrect and skipped answers; empty quizzes; percentage rounding; feedback thresholds |
| Authentication validation | Missing/wrong-type values, email format and normalization, name limits, password length and password byte limit, supported language |
| Assessment validation | MongoDB ObjectId format, duplicate IDs, maximum 20 answers, integer option indexes, skipped-answer sentinel, per-question option bounds |
| Backend HTTP integration | Health endpoints, AI input validation, missing Groq configuration, database-unavailable responses, approved/blocked CORS origins, malformed JSON, oversized bodies and 404 responses |
| Frontend quiz helpers | Timer formatting, option labels, difficulty labels and score thresholds |
| Frontend authentication helpers | Password strength and email format |
| Frontend API client | Bearer token, custom authorization, JSON body headers, API errors, offline errors and session save/clear |
| Tutor streaming | Split network chunks, LF/CRLF separators, final event flush, malformed events, API errors, network errors and aborts |
| Markdown safety | HTTP(S)-only links, no raw HTML insertion path, and safe link target attributes |

## Local verification performed for this update

- Frontend Node.js test suite: **28 tests passed**.
- Backend isolated unit tests: **16 tests passed**.
- Backend utility coverage for the tested unit modules: **99.31% lines, 98.92% branches and 100% functions** in the Node test coverage report.
- JavaScript syntax checks passed for the edited non-JSX source and test files.

The backend HTTP integration tests are included and run in CI, but they could not be executed in the editing environment because npm registry DNS resolution failed while installing the backend's external packages. They need a successful dependency installation to run; they do not require a live MongoDB instance or a Groq API key.

## Manual end-to-end checklist

After deploying with valid environment variables, verify each flow in a browser:

- Register a new account, log out, then log back in.
- Submit invalid email and short/oversized passwords and confirm validation messages are clear.
- Open the AI Tutor, submit a prompt, stop a stream, and start another prompt.
- Start an assessment, answer some questions, skip one, mark one for review, and submit.
- Confirm score, feedback, correct answers and explanations match the submitted answers.
- Open Progress and Dashboard and confirm the saved attempt appears.
- Log out and confirm protected pages redirect to the login flow.

Record screenshots or a short screen recording of the passing flows as Hack2Skill submission evidence. Do not include `.env` files, JWT secrets, MongoDB credentials or provider API keys in screenshots or repository commits.
