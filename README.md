# lmc_carshare

https://suspicious-tesla-083dc4.netlify.com

Carsharing app running on Transposit with Google Calendar and Google Sheets as data stores.

The frontend was written with [create-react-app](https://github.com/facebook/create-react-app). The backend was written with [Transposit](https://transposit.com).

## Develop

On your local machine, run `npm run start` and quickly iterate on your frontend.

To iterate on the backend, edit code in Tranposit: https://console.transposit.com/t/daisie/lmc_carshare. Commit changes and pull them locally to merge them with your frontend.

## Deploy

Push to _master_ on GitHub to deploy your frontend changes. Netlify will automatically rebuild and deploy assets.

Push to _master_ on Transposit to deploy your backend changes. Transposit will automatically reference the latest commit.
