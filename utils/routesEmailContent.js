import parse from 'html-react-parser'

const routesEmailContent = (email, origin, destination, duration, legs) => {

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    seconds %= 3600
    const minutes = Math.floor(seconds / 60)
  
    let formattedDuration = ''
  
    if (hours > 0) {
        formattedDuration += `${hours} hr`
        if (hours > 1) formattedDuration += 's'
    }
  
    if (minutes > 0) {
        if (formattedDuration !== '') formattedDuration += ' '
        formattedDuration += `${minutes} min`
        if (minutes > 1) formattedDuration += 's'
    }
    return formattedDuration;
  }

  // -------Distance Formatter---------
  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`
    } else if (distance > 1000) {
      return `${(distance/1000).toFixed(2)} km`
    }
  }

  const legDetails = legs.map((leg, index) => {
    return `
      <div>
        <p><span class="bold-text">Step ${index + 1}: ${leg.travel_mode} [${formatDuration(leg.duration.value)}] [${formatDistance(leg.distance.value)}]</span></p>
        ${leg.travel_mode !== "WALKING" ? `
          <div>
            <p>Take ${leg.transit_details.line.vehicle.name} with this route: ${leg.transit_details.line.name}</p>
            <p>Start: ${leg.transit_details.departure_stop.name}</p>
            <p>End: ${leg.transit_details.arrival_stop.name}</p>
          </div>
        ` : `
          <div>
            <p>Instruction: ${parse(leg.html_instructions)}</p>
          </div>
        `
        }
      </div>
    `;
  }).join('');

  return `
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
        .bold-text {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Your Public Transit Route Details</h1>
        <p><span class="bold-text">Your Origin</span>: ${origin}</p>
        <p><span class="bold-text">Your Destination</span>: ${destination}</p>
        <p><span class="bold-text">Duration of the trip</span>: ${formatDuration(duration)}</p>
        <br>
        <p>The instructions for your chosen route are the following:</p>
        ${legDetails}
        <p>Thank you for using KyusiTrip,</p>
        <p>The KyusiTrip team</p>
      </div>
    </body>
    </html>
  `;
};

export default routesEmailContent;