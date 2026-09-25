# Technical Specification: Detective Quest Website (Birthday Gift)

## 1. Concept

A companion website for a physical detective-themed quest. Three separate pages (one per stage), each opened via its own QR code placed at a corresponding physical location. Each page accepts a text answer to a riddle and, if correct, reveals one digit of a three-digit code for a locked gift case.

No backend is required — all logic runs client-side (static HTML + JS). Hosting: any static hosting on the user's own domain.

## 2. Site Structure

```
/
├── index.html          (optional: intro page "Case No. ...")
├── case1.html           (stage 1 — beach)
├── case2.html           (stage 2 — home)
├── case3.html           (stage 3 — final)
├── style.css             (shared styles, optional)
└── assets/
    ├── qr-case1.png
    ├── qr-case2.png
    └── qr-case3.png
```

Each `caseN.html` is a standalone page, reachable only via its QR code (the URL is never publicly announced), so no additional authentication is required.

## 3. Content Per Stage

| Stage | File | QR placement | Riddle text (printed on physical clue) | Correct answer |
|---|---|---|---|---|
| 1 | `case1.html` | Photo/postcard from the beach (Canary Islands) | *"Here, the waves whispered 'yes' before you said it out loud. The sand remembers the moment your life changed forever. This place isn't just a vacation. It's where it all began. In one word: where exactly was this?"* | `beach` (or native-language equivalent) |
| 2 | `case2.html` | The room currently under renovation | *"It still smells of paint here, and you can hear the drill. It's not always easy, but every nail is a step closer to the dream. We're no longer renting someone else's walls — we're building our own. In one word: what are we building here?"* | `home` |
| 3 | `case3.html` | A hiding spot somewhere at home | *"The beach was the beginning. Home is the path. And this is the one worth crossing waves and renovations — and everything still ahead — for. Without her, none of it would exist. And even if it did, it wouldn't mean anything. In one word: what do I call you when you're near?"* | `[wife's pet name]` |

After a correct answer, each page shows:
1. The digit of the code (`{{DIGIT_1}}`, `{{DIGIT_2}}`, `{{DIGIT_3}}` — to be filled in manually)
2. A text hint pointing to the next stage's QR location (on `case3.html`, a final message with no next step)

## 4. Answer Validation Logic

Requirements:
- Case-insensitive (`Beach` = `beach` = `BEACH`)
- Trims leading/trailing whitespace
- Typo tolerance (optional, recommended for mobile input): Levenshtein distance ≤ 1

Vanilla JS validation example (no external libraries):

```javascript
function normalize(str) {
  return str.trim().toLowerCase();
}

function levenshtein(a, b) {
  const dp = Array.from({length: a.length + 1}, (_, i) =>
    Array(b.length + 1).fill(0).map((_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function checkAnswer(input, correctAnswer, maxDistance = 1) {
  const a = normalize(input);
  const b = normalize(correctAnswer);
  return levenshtein(a, b) <= maxDistance;
}
```

## 5. Stage Page Template

Minimal working structure for one `caseN.html` (design-agnostic):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Case No. 1</title>
</head>
<body>
  <p id="riddle">Here, the waves whispered "yes" before you said it out loud...</p>

  <input type="text" id="answer" placeholder="Your answer">
  <button id="submit">Check</button>
  <p id="error" style="display:none; color:red;">Wrong trail. Try again.</p>

  <div id="result" style="display:none;">
    <p>Correct! The first digit of the code: <strong id="digit">X</strong></p>
    <p>Look for the next clue where...</p>
  </div>

  <script>
    const CORRECT_ANSWER = "beach";
    const DIGIT = "X"; // insert the real digit here

    document.getElementById("submit").addEventListener("click", () => {
      const input = document.getElementById("answer").value;
      if (checkAnswer(input, CORRECT_ANSWER)) {
        document.getElementById("digit").textContent = DIGIT;
        document.getElementById("result").style.display = "block";
        document.getElementById("error").style.display = "none";
      } else {
        document.getElementById("error").style.display = "block";
      }
    });

    // normalize / levenshtein / checkAnswer functions from section 4
  </script>
</body>
</html>
```

Same pattern for `case2.html` (`CORRECT_ANSWER = "home"`) and `case3.html` (`CORRECT_ANSWER = "[wife's pet name]"`).

## 6. QR Codes

- Each QR encodes the direct page URL, e.g. `https://yourdomain.com/case1.html`
- Generation: any free online QR generator (e.g. qr-code-generator.com) or the `qrcode.js` library if automated generation at build time is needed
- Print resolution: minimum 300×300 px so it scans reliably from paper
- QR codes are stored in `assets/` and printed/placed physically alongside the riddle text

## 7. Anti-Peeking Protection (Optional)

The answer and digit are currently visible in the page source (`view-source`). If this matters:
- Minimal protection: move `CORRECT_ANSWER` and `DIGIT` into a separate JS file and minify/obfuscate it (e.g. via `javascript-obfuscator`)
- For this use case (a gift for a close person), the base level is usually sufficient — deeper protection isn't necessary

## 8. Design

Recommended style: "noir case file" — dark background, monospace typewriter font, stamp-style elements (e.g. a CSS-bordered "CONFIDENTIAL" or "SOLVED" label appearing after a correct answer). Styles should live in a shared `style.css`, linked from all three pages.

## 9. Deployment

1. Gather all files into one folder following the structure in Section 2
2. Deploy to hosting on the user's own domain (any static host — Netlify, GitHub Pages, or standard shared hosting via FTP)
3. Test all three URLs from a phone before printing the final QR codes
4. Print the QR codes and place them at the physical locations per the table in Section 3

## 10. Pre-Delivery Checklist

- [ ] All three code digits are filled into `DIGIT` on the corresponding pages
- [ ] The `DIGIT` values match the actual lock code on the case
- [ ] QR codes tested from a phone (not just from a computer)
- [ ] Site loads correctly without a Wi-Fi connection (test on mobile data)
- [ ] Riddle texts are printed and placed at the physical locations
- [ ] The gift case is locked with the code
