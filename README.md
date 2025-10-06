<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Animated README Preview</title>
  <style>
    @keyframes fadeIn {
      from {opacity: 0; transform: translateY(10px);}
      to {opacity: 1; transform: translateY(0);}
    }
    @keyframes float {
      0%,100% {transform: translateY(0);}
      50% {transform: translateY(-4px);}
    }
    @keyframes glow {
      0%,100% {filter: drop-shadow(0 0 0px #00ffe0);}
      50% {filter: drop-shadow(0 0 8px #00ffe0);}
    }
    @keyframes pulse {
      0%,100% {opacity: 1;}
      50% {opacity: 0.6;}
    }
    @keyframes gradientShift {
      0% {background-position: 0% 50%;}
      50% {background-position: 100% 50%;}
      100% {background-position: 0% 50%;}
    }

    body {
      margin: 0;
      padding: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      animation: fadeIn 1.2s ease-in-out;
      background: radial-gradient(circle at top, #0a0a0a, #000);
      color: #e0e0e0;
      font-family: "Poppins", sans-serif;
      text-align: center;
      overflow: hidden;
    }

    h1, h2, h3 {
      animation: fadeIn 1.4s ease-in-out, glow 4s infinite ease-in-out;
      background: linear-gradient(90deg, #6dd5fa, #2980b9, #6dd5fa);
      background-size: 300% 300%;
      -webkit-background-clip: text;
      color: transparent;
      animation: gradientShift 6s infinite ease-in-out, glow 4s infinite ease-in-out;
    }

    p, a, li {
      animation: fadeIn 1.4s ease-in-out;
    }

    a {
      color: #6dd5fa;
      text-decoration: none;
      transition: 0.3s;
    }

    a:hover {
      color: #00ffe0;
      text-shadow: 0 0 8px #00ffe0;
    }

    .badge {
      animation: float 3s infinite ease-in-out;
      display:inline-block;
      margin:3px;
      background: rgba(255,255,255,0.1);
      padding: 8px 16px;
      border-radius: 8px;
    }

    .emoji {
      animation: pulse 2s infinite ease-in-out;
      font-size: 1.5rem;
    }
  </style>
</head>
<body>
  <h1>✨ Welcome to My Animated README ✨</h1>
  <h3 class="badge">💻 MBI DARK</h3>
  <p>This is how your animated README would look if GitHub allowed CSS animations.</p>
  <p>Check out my projects → <a href="https://github.com/yourusername">GitHub Profile</a></p>
  <p class="emoji">🚀</p>
</body>
</html>
