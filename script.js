function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

document.addEventListener("DOMContentLoaded", function () {
    fetch('emptyStanding.json')
        .then(response => response.json())
        .then(data => {
            const dataDisplay = document.getElementById("dataDisplay");
            const numberSortFn = (team2, team1) => {
              if (team1.wins < team2.wins) {
                return -1;
              } else if (team2.wins < team1.wins) {
                return 1;
              } else if (team1.tie < team2.tie) {
                return -1;
              } else if (team2.tie < team1.tie) {
                return 1;
              } else if (team1.pf - team1.pa < team2.pf - team2.pa) {
                return -1;
              } else {
                return 1;
              }
            };

            const exampleSocket = new WebSocket("wss://gskball.playbookapi.com/programs/calendar/", []);

            const message = '{"csrf_token":"ks3Re21gc4m6OJ9GNkReS1Zvnc9y21RkZ0k1Gn8RvWgC5AQ6pmbuugLKVI2M5MAa","action":"get_site_calendar_events","start":"2024-07-20T07:00:00.000Z","end":"2024-10-31T07:00:00.000Z","types_from_filter":[],"resources_from_filter":[],"programs_from_filter":[],"seasons_from_filter":[],"categories_from_filter":[],"teams_from_filter":[""]}'
            exampleSocket.onmessage = (event) => {
                var teams = data.teams
                const data2 = JSON.parse(event.data)
                const events = data2.events
                for (event of events) {
                    const title = event.title
                    console.log(getWidth())
                    let start = new Date(event.start);
                    let realDateObject = new Date(start.value);
                    console.log(start.toLocaleString('en-US', { timeZone: 'PST' }))
                    if (title.includes("(")) {
                        let results = title.split(" vs ")
                        let team1_name = results[0].split("(")[0].slice(0,-1)
                        let team1_score = Number(results[0].split("(")[1].slice(0,-1))
                       

                        let team2_name = results[1].split("(")[0].slice(0,-1)
                        let team2_score = Number(results[1].split("(")[1].slice(0,-1))
                        for (team of teams) {
                            if (team.name === team1_name) {
                                team.pf = Number(team.pf) + Number(team1_score)
                                team.pa = Number(team.pa) + Number(team2_score)
                                if(team1_score > team2_score) {
                                    team.wins = Number(team.wins) + 1
                                } else if (team1_score === team2_score) {
                                    team.tie = Number(team.tie) + 1
                                } else {
                                    team.losses = Number(team.losses) + 1
                                }
                            } else if (team.name === team2_name) {
                                team.pf = Number(team.pf) + Number(team2_score)
                                team.pa = Number(team.pa) + Number(team1_score)
                                 if(team2_score > team1_score) {
                                    team.wins = Number(team.wins) + 1
                                } else if (team1_score === team2_score) {
                                    team.tie = Number(team.tie) + 1
                                } else {
                                    team.losses = Number(team.losses) + 1
                                }
                            }
                        }
                        console.log(team2_name)
                        console.log(team2_score)
                        console.log("end")
                    }

                    const nameElement = document.createElement("p");
                    nameElement.textContent = title + ": " + event.start;
                    // dataDisplay.appendChild(nameElement);
                }
                const sortedTeams = teams.sort(numberSortFn);

                const tableElement = document.createElement("table");
                tableElement.className = "standings"
                const tblBody = document.createElement("tbody");
                const ftSize = getWidth() > 500 ? "16px" : "12px"
                const headerRow = document.createElement("tr");
                const headers = ["TEAM", "WINS", "LOSSES", "TIES*", "POINT DIFF", "POINTS SCORED", "POINTS ALLOWED"]
                for (header of headers) {
                    const cell = document.createElement("td");
                    const bold = document.createElement('strong');
                    const cellText = document.createTextNode(header);
                    bold.appendChild(cellText)
                    cell.appendChild(bold);
                    cell.style.width ='200px';
                    cell.style.height ='50px';
                    headerRow.style.fontSize = ftSize
                    headerRow.appendChild(cell);
                    
                }
                tblBody.appendChild(headerRow);

                for (team of sortedTeams) {
                    const teamRow = document.createElement("tr");

                    const nameCell = document.createElement("td");
                    const nameCellText = document.createTextNode(team.name);
                    nameCell.style.height ='40px';
                    nameCell.appendChild(nameCellText);
                    teamRow.appendChild(nameCell);

                    const winCell = document.createElement("td");
                    const winCellText = document.createTextNode(team.wins);
                    winCell.appendChild(winCellText);
                    teamRow.appendChild(winCell);

                    const lossCell = document.createElement("td");
                    const lossesCellText = document.createTextNode(team.losses);
                    lossCell.appendChild(lossesCellText);
                    teamRow.appendChild(lossCell);

                    const tieCell = document.createElement("td");
                    const tieCellText = document.createTextNode(team.tie);
                    tieCell.appendChild(tieCellText);
                    teamRow.appendChild(tieCell);

                    const pdfCell = document.createElement("td");
                    const pdfCellText = document.createTextNode(team.pf - team.pa);
                    pdfCell.appendChild(pdfCellText);
                    teamRow.appendChild(pdfCell);
                    if (team.pf - team.pa > 0) {
                        pdfCell.className = "good"
                    } else if (team.pf - team.pa < 0) {
                        pdfCell.className = "bad"
                    }

                    const pfCell = document.createElement("td");
                    const pfCellText = document.createTextNode(team.pf);
                    pfCell.appendChild(pfCellText);
                    teamRow.appendChild(pfCell);

                    const paCell = document.createElement("td");
                    const paCellText = document.createTextNode(team.pa);
                    paCell.appendChild(paCellText);
                    teamRow.appendChild(paCell);
                    teamRow.style.fontSize = ftSize
                    tblBody.appendChild(teamRow);
                }
                // put the <tbody> in the <table>
                tableElement.appendChild(tblBody);
                // appends <table> into <body>
                dataDisplay.appendChild(tableElement);
                tableElement.setAttribute("border", "2");
                const discElement = document.createElement("strong");
                discElement.textContent = "* Note: immediatly after games are played they are listed as a 0-0 Tie until updated on the official site.";
                const loading = document.getElementById("loading");
                loading.remove()
                dataDisplay.appendChild(document.createElement("br"));
                dataDisplay.appendChild(document.createElement("br"));
                dataDisplay.appendChild(document.createElement("p").appendChild(discElement));
                dataDisplay.appendChild(document.createElement("br"));
                dataDisplay.appendChild(document.createElement("br"));
            };

            exampleSocket.onopen = (event) => {
                exampleSocket.send(message)
            };

           

            // Create HTML elements to display the JSON data
            
         
            

            // Append the elements to the "dataDisplay" div
            
        })
        .catch(error => console.error("Error fetching JSON data:", error));
});



