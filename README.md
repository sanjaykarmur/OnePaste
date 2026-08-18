# OnePaste

OnePaste is a simple, fast online clipboard that lets you share text between devices using a 4 digit code. No account or login is required.

## Features

* Share text instantly with a 4 digit code
* No account required
* Copy received text with one tap
* Live character counter
* Mobile friendly interface
* 60 minute code expiry
* Automatic server cleanup after expiry
* GitHub Pages + Supabase Free backend

## How It Works

1. Type or paste text.
2. Press **Send**.
3. A unique 4 digit code is generated.
4. Open OnePaste on another device.
5. Enter the code.
6. Press **Get Text** to receive and copy the text.

## Tech Stack

* HTML
* CSS
* JavaScript
* Supabase
* GitHub Pages

## Security

* No user accounts
* Row Level Security (RLS) enabled
* Temporary clipboard storage
* Codes expire after **60 minutes**
* Expired entries are automatically deleted

## Project Structure

```text
OnePaste/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Roadmap

* Improve accessibility
* Better loading animations
* Rate limiting for abuse prevention
* Custom domain support

## License

MIT License
