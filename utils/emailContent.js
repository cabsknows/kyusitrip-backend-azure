const emailContent = (subject, text, url, introduction, button, name, ending) => `
<html>
<head>
  <style>
    /* Add your custom styles here */
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
    }
    p {
      color: #555;
    }
    .anchor {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #880015;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
    }
    .anchor:hover {
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Hi ${name}</p>
    <p>
      ${introduction}
      Please click the button below to complete the ${text}.
    </p>
    <a class="anchor" href="${url}">${button}</a>
    <br>
    <br>
    <p> ${ending} </p>
    <br>
    <p> Thanks, </p>
    <p> The KyusiTrip team </p>
  </div>
</body>
</html>
`

export default emailContent