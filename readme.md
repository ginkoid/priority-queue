# priority queue

A super simple priority queue web app

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https%3A%2F%2Fgithub.com%2Fginkoid%2Fpriority-queue)

When you deploy to Netlify, make sure to turn off open registration, because anyone who can log in to the app can read and update the queue. You can then manually invite people.

The queue is stored in a GitHub gist, which is configured in environment variables.

* `GIST_ID`: The GitHub gist ID where the queue is stored
* `GH_SECRET`: GitHub secret with edit access to `GIST_ID`
