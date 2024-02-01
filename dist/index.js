const liveMatchContainers = document.getElementById('liveMatchContainers')
const COUNTRIES = document.getElementById('countries')
const NAVLIST =  document.getElementById('nav-list')

var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};


//Main API CALL - This CAlls the MatchDay Api that will return matchday IDS
async function CallMatchWeekApi(){

  const response = await fetch("https://www.legaseriea.it/api/season/157617/championship/A/matchday?lang=en", requestOptions);

  const result = await response.json();

  return result

}


async function SortMatchesThatAreLiveOrToBePlayed() {

  const matchWeeksArray =[];

  const matchDaysArray =[];

   const fetchedData = await CallMatchWeekApi();

   fetchedData.data.forEach(element => {
    
      if (element.category_status == "LIVE" || element.category_status == "TO BE PLAYED"){

        matchWeeksArray.push(element.id_category);
        
      }
  })

  for (i = 0; i < matchWeeksArray.length; i++) {  //loop through all match Days.
  
   const response = await fetch(`https://www.legaseriea.it/api/stats/live/match?extra_link=&order=oldest&lang=en&season_id=157617&page=1&limit=20&pag=&match_day_id=${matchWeeksArray[i]}`, requestOptions)
  
   const result = await response.json();

   matchDaysArray.push(result)

  }
  

  return matchDaysArray;

}


async function FilterEveryGameDate(){

  const response = await SortMatchesThatAreLiveOrToBePlayed();

  const arrMatchDates = []

  for (i = 0; i < response.length; i++) {  

    const matches = response[i].data.matches;
    
    
      for(j = 0 ; j < matches.length; j++){
        
        if (matches[j].match_status != 2){ // 2 means its been played
        
          const date_time = matches[j].date_time;

          const dateArray = date_time.split("T");

          const date = dateArray[0];

          const matchDateID = matches[j].match_day_id_category;
          
          const array = new Array(matchDateID, date);
          arrMatchDates.push(array);

        }
        
      }
  }

  //console.log(arrMatchDates)
  return arrMatchDates

}

 async function triggerGroupMatches(){

  const matchWeekDays = await FilterEveryGameDate();

  const groupedMatches = [];

  for (let i = 0; i < matchWeekDays.length; i++) {
     
    if (i + 1 < matchWeekDays.length && matchWeekDays[i][1] != matchWeekDays[i + 1][1]) {

      groupedMatches.push(matchWeekDays[i]);
    }


}

return groupedMatches;

}


async function CreateElementsForDateButtons(){

const date = await triggerGroupMatches();

  for (let i = 0; i < 5; i++) {

    let newUl = document.createElement('ul')

    let newLi = document.createElement('li')

    let newButton = document.createElement('button')
    
    newButton.id = date[i][0] //matchWeekValue. NEED TO PASS THE MATCH DAY ID.

    newButton.onclick = LoadGameSelectMenu

    newButton.textContent = date[i][1];

    newLi.appendChild(newButton);

    newUl.appendChild(newLi);

    NAVLIST.appendChild(newUl);
  
  }

}


CreateElementsForDateButtons()


function LoadGameSelectMenu(e){

  fetch(`https://www.legaseriea.it/api/stats/live/match?extra_link=&order=oldest&lang=en&season_id=157617&page=1&limit=20&pag=&match_day_id=${e.target.id}`, requestOptions)
  
  .then(res => res.json())
  
  .then(data => { 
    BuildAGameBlocks(data, e)
  })

}
 


  // COUNTRIES.addEventListener('onload', LoadGameNewSelectedGameWeek);

  // function LoadGameNewSelectedGameWeek(e){
  
  //   fetch(`https://www.legaseriea.it/api/stats/live/match?extra_link=&order=oldest&lang=en&season_id=157617&page=1&limit=20&pag=&match_day_id=${e.target.value}`, requestOptions)
    
  //   .then(res => res.json())
    
  //   .then(data => { 
  
  //     BuildAGameBlocks(data)
  
  //   })}


    
    
   function fixMatchTime(match){
    let gameStatus = match.match_day_category_status
    let gameTime = match.minutes_played;

    let  TIME  = ""

    if (gameStatus === "PLAYED"){

      TIME =  ""

    } else if (gameStatus === "LIVE" && gameTime != "" && match.match_status == 1){
   
        TIME = gameTime;
        
      } else if (gameStatus === "LIVE" && gameTime != "" && match.match_status == 2){
   
        TIME = "FINAL";
        
      } else if (gameStatus === "LIVE" && match.match_status == 0 || gameStatus === "TO BE PLAYED"){
   
        //The match hasnt started yet.

        const dateArray = match.date_time.split("T");

        let arrTime = dateArray[1]

        let timeSliceEndValue = arrTime.slice(0, -4)

        TIME = timeSliceEndValue
      }


      return TIME;
  } 
  



function fixMatchDate(match){

  let matchWeekStatus = match.match_day_category_status //This is LIVE, PLAYED, TO BE PLAYED

  let minutesPlayed = match.minutes_played;

  let gameStatus = match.match_status; // 0 not played, 1, live, 2 played.

  let matchDate = match.date_time; // 0 not played, 1, live, 2 played.

  let matchStatus = "FINAL"

  if (matchWeekStatus === "PLAYED"){

      matchStatus =  "FINAL"

  } 
    if(minutesPlayed != "" && gameStatus == 1 && matchWeekStatus === "LIVE"){
    
      matchStatus = "LIVE";
    }

      else if (minutesPlayed != "" && gameStatus == 2 && matchWeekStatus === "LIVE"){

        matchStatus = "FINAL";

      } 

      else if (gameStatus == 0){

        let dateArray = matchDate.split("T");

          let date = dateArray[0];

          matchStatus = date;
      }

 return matchStatus

}



function triggerNameChange(team_name){

  let name = team_name;

  let teamAbreviation = name.slice(0, 3); 
  
  return teamAbreviation;

}





function BuildAGameBlocks(e, event){

      const incomingMatchData = e.data.matches;

      
      let div = " "; // empty string to reset the menu everytime the select is changed.

      liveMatchContainers.innerHTML = div;

      incomingMatchData.forEach(match => {
        
        


        let matchTime =  fixMatchTime(match)
        let matchDate =  fixMatchDate(match)
        let homeTeamName = triggerNameChange(match.home_team_name)
        let awayTeamName = triggerNameChange(match.away_team_name)

        if(matchDate == event.target.innerHTML){

        
        div = `<div id='match-games'>

                    <div class="time-date-container">
                      <div id='date'>${matchDate}</div>
                      <div id='time'>${matchTime}</div>
                    </div>
                    

                    <div class="team-container">
                    <div>${awayTeamName}</div>
                    <div>${match.away_goal}</div>
                  </div>
                  <div class="team-container">
                      <div >${homeTeamName}</div>
                      <div >${match.home_goal}</div>
                  </div>
              </div>`;

      liveMatchContainers.innerHTML += div;
        }  
    })
  
}






